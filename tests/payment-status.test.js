const test = require("node:test");
const assert = require("node:assert/strict");
const rules = require("../powerups/shared/payment-status-rules.js");
const paymentApi = require("../powerups/shared/trello-payment-api.js");

test("payment amounts accept positive whole US dollars only", function () {
  assert.equal(rules.parseWholeDollarAmount("125"), 125);
  assert.equal(rules.parseWholeDollarAmount(" 2500 "), 2500);
  assert.equal(rules.parseWholeDollarAmount("125.50"), null);
  assert.equal(rules.parseWholeDollarAmount("0"), null);
  assert.equal(rules.parseWholeDollarAmount("-125"), null);
  assert.equal(rules.parseWholeDollarAmount("$125"), null);
});

test("payment badges are absent until an amount exists", function () {
  assert.equal(rules.normalize(null), null);
  assert.equal(rules.normalize({ paid: false }), null);
  assert.equal(rules.detailsFor(null), null);
});

test("unpaid payments show only a red whole-dollar price", function () {
  const payment = rules.normalize({ amountUsd: 1250, paid: false });
  assert.deepEqual(rules.detailsFor(payment), { text: "$1,250", color: "red" });
  assert.equal(rules.panelLabelFor(payment), "$1,250 unpaid");
});

test("paid payments show only a green Paid badge", function () {
  const payment = rules.normalize({ amountUsd: 1250, paid: true });
  assert.deepEqual(rules.detailsFor(payment), { text: "Paid", color: "green" });
  assert.equal(rules.panelLabelFor(payment), "Paid");
});

test("only a Workspace membership with the admin role can manage payments", function () {
  assert.equal(paymentApi.isWorkspaceAdminMembership({ memberType: "admin" }), true);
  assert.equal(paymentApi.isWorkspaceAdminMembership({ memberType: "normal" }), false);
  assert.equal(paymentApi.isWorkspaceAdminMembership({}), false);
  assert.equal(paymentApi.isWorkspaceAdminMembership(null), false);
});

test("payment access checks the current member's role in the board's Workspace", async function () {
  const originalFetch = global.fetch;
  let requestedUrl;
  global.fetch = async function (url) {
    requestedUrl = url;
    return new Response(JSON.stringify([{ idMember: "member-1", memberType: "admin" }]), { status: 200 });
  };

  try {
    const access = await paymentApi.workspaceAccessForCurrentMember(
      {
        board: async function () { return { idOrganization: "workspace-1" }; },
        member: async function () { return { id: "member-1" }; },
        getRestApi: async function () {
          return { getToken: async function () { return "token-1"; } };
        },
      },
      { appKey: "key-1" }
    );

    assert.equal(access, "admin");
    const url = new URL(requestedUrl);
    assert.equal(url.pathname, "/1/organizations/workspace-1/memberships");
    assert.equal(url.searchParams.get("fields"), "idMember,memberType");
    assert.equal(url.searchParams.get("key"), "key-1");
    assert.equal(url.searchParams.get("token"), "token-1");
  } finally {
    global.fetch = originalFetch;
  }
});

test("payment access rejects boards that do not belong to a Workspace", async function () {
  const access = await paymentApi.workspaceAccessForCurrentMember(
    {
      board: async function () { return { idOrganization: null }; },
      member: async function () { return { id: "member-1" }; },
    },
    { appKey: "key-1" }
  );

  assert.equal(access, "not-workspace-board");
});
