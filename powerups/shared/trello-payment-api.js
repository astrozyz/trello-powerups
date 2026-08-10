(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.TrelloPaymentApi = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function asApiError(response, fallbackMessage) {
    return response.text().then(function (body) {
      return new Error(body || fallbackMessage);
    });
  }

  function request(url, fallbackMessage) {
    return fetch(url).then(function (response) {
      if (!response.ok) {
        return asApiError(response, fallbackMessage).then(function (error) {
          throw error;
        });
      }
      return response.json();
    });
  }

  function withCredentials(url, appKey, token) {
    const endpoint = new URL(url);
    endpoint.searchParams.set("key", appKey);
    endpoint.searchParams.set("token", token);
    return endpoint.toString();
  }

  function isWorkspaceAdminMembership(membership) {
    return Boolean(membership && membership.memberType === "admin");
  }

  async function workspaceAccessForCurrentMember(t, config) {
    const context = await Promise.all([t.board("idOrganization"), t.member("id")]);
    const board = context[0];
    const member = context[1];

    if (!board.idOrganization) {
      return "not-workspace-board";
    }

    const restApi = await t.getRestApi();
    const token = await restApi.getToken();

    if (!token) {
      return "not-connected";
    }

    const memberships = await request(
      withCredentials(
        "https://api.trello.com/1/organizations/" + encodeURIComponent(board.idOrganization) + "/memberships?fields=idMember,memberType",
        config.appKey,
        token
      ),
      "Trello could not check Workspace access."
    );
    const membership = memberships.find(function (candidate) {
      return candidate.idMember === member.id;
    });

    return isWorkspaceAdminMembership(membership) ? "admin" : "not-admin";
  }

  return Object.freeze({
    isWorkspaceAdminMembership: isWorkspaceAdminMembership,
    workspaceAccessForCurrentMember: workspaceAccessForCurrentMember,
  });
});
