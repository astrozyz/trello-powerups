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

test("terminal lists and unknown lists have no actions", function () {
  assert.deepEqual(rules.movesForList("Completed"), []);
  assert.deepEqual(rules.movesForList("Blocked"), []);
  assert.deepEqual(rules.movesForList("Review"), []);
});

test("only specified transitions are allowed", function () {
  assert.equal(rules.isAllowedMove("Assigned", "In Progress"), true);
  assert.equal(rules.isAllowedMove("Assigned", "Completed"), false);
});
