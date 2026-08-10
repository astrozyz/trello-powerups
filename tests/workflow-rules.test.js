const test = require("node:test");
const assert = require("node:assert/strict");
const rules = require("../powerups/shared/workflow-rules.js");

test("workflow exposes the Backlog to Assigned transition", function () {
  assert.deepEqual(rules.movesForList("Backlog"), [
    { destination: "Assigned", label: "Move to Assigned" },
  ]);
});

test("workflow exposes both In Progress outcomes", function () {
  assert.deepEqual(rules.movesForList("In Progress"), [
    { destination: "Completed", label: "Mark Completed" },
    { destination: "Blocked", label: "Mark Blocked" },
  ]);
});

test("Completed and unknown lists have no actions", function () {
  assert.deepEqual(rules.movesForList("Completed"), []);
  assert.deepEqual(rules.movesForList("Review"), []);
});

test("Blocked cards can resume work or be completed", function () {
  assert.deepEqual(rules.movesForList("Blocked"), [
    { destination: "In Progress", label: "Resume Work" },
    { destination: "Completed", label: "Mark Completed" },
  ]);
});

test("only specified transitions are allowed", function () {
  assert.equal(rules.isAllowedMove("Assigned", "In Progress"), true);
  assert.equal(rules.isAllowedMove("Assigned", "Completed"), false);
});

test("Assigned cards are due one week after the move and are incomplete", function () {
  assert.deepEqual(
    rules.cardUpdateForDestination("Assigned", "2026-08-09T18:30:00.000Z"),
    { due: "2026-08-16T18:30:00.000Z", dueComplete: false }
  );
});

test("Completed cards are due at the move time and complete", function () {
  assert.deepEqual(
    rules.cardUpdateForDestination("Completed", "2026-08-09T18:30:00.000Z"),
    { due: "2026-08-09T18:30:00.000Z", dueComplete: true }
  );
});

test("Blocked cards keep their due date and become incomplete", function () {
  assert.deepEqual(
    rules.cardUpdateForDestination("Blocked", "2026-08-09T18:30:00.000Z"),
    { dueComplete: false }
  );
});
