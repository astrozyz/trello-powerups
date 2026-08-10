(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }
  root.WorkflowRules = rules;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const transitions = Object.freeze({
    Backlog: Object.freeze([{ destination: "Assigned", label: "Move to Assigned" }]),
    Assigned: Object.freeze([{ destination: "In Progress", label: "Start Work" }]),
    "In Progress": Object.freeze([
      { destination: "Completed", label: "Mark Completed" },
      { destination: "Blocked", label: "Mark Blocked" },
    ]),
    Completed: Object.freeze([]),
    Blocked: Object.freeze([]),
  });

  function movesForList(listName) {
    return transitions[listName] || [];
  }

  function isAllowedMove(sourceName, destinationName) {
    return movesForList(sourceName).some(function (move) {
      return move.destination === destinationName;
    });
  }

  return Object.freeze({
    movesForList: movesForList,
    isAllowedMove: isAllowedMove,
  });
});

