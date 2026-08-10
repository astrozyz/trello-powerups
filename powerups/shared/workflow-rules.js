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
    Blocked: Object.freeze([
      { destination: "In Progress", label: "Resume Work" },
      { destination: "Completed", label: "Mark Completed" },
    ]),
  });

  function movesForList(listName) {
    return transitions[listName] || [];
  }

  function isAllowedMove(sourceName, destinationName) {
    return movesForList(sourceName).some(function (move) {
      return move.destination === destinationName;
    });
  }

  function cardUpdateForDestination(destinationName, movedAt) {
    const moveTime = new Date(movedAt);

    if (Number.isNaN(moveTime.getTime())) {
      throw new Error("A valid move time is required.");
    }

    if (destinationName === "Assigned") {
      const due = new Date(moveTime);
      due.setDate(due.getDate() + 7);
      return { due: due.toISOString(), dueComplete: false };
    }

    if (destinationName === "Completed") {
      return { due: moveTime.toISOString(), dueComplete: true };
    }

    if (destinationName === "Blocked") {
      return { dueComplete: false };
    }

    return {};
  }

  return Object.freeze({
    movesForList: movesForList,
    isAllowedMove: isAllowedMove,
    cardUpdateForDestination: cardUpdateForDestination,
  });
});
