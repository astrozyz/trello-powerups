(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const icon = "https://trello.com/favicon.ico";

  function configured() {
    return Boolean(config && config.appKey && config.appName && config.appAuthor);
  }

  async function moveAndNotify(t, destinationName) {
    try {
      await window.TrelloWorkflowApi.moveCard(t, config, destinationName);
      await t.alert({
        message: "Card moved to " + destinationName + ".",
        display: "success",
        duration: 5,
      });
    } catch (error) {
      await t.alert({
        message: error.message || "The card could not be moved.",
        display: "error",
        duration: 8,
      });
    }
  }

  async function onMoveButton(t, options) {
    const destinationName = options.destinationName;
    const restApi = await t.getRestApi();

    if (!(await restApi.isAuthorized())) {
      return t.popup({
        title: "Connect Trello to move cards",
        url: "./authorize.html",
        height: 120,
        args: { destinationName: destinationName },
      });
    }

    return moveAndNotify(t, destinationName);
  }

  async function cardButtons(t) {
    if (!configured() || !t.memberCanWriteToModel("card")) {
      return [];
    }

    const currentList = await t.list("name");
    return window.WorkflowRules.movesForList(currentList.name).map(function (move) {
      return {
        icon: icon,
        text: move.label,
        condition: "edit",
        callback: function (buttonT) {
          return onMoveButton(buttonT, { destinationName: move.destination });
        },
      };
    });
  }

  window.TrelloPowerUp.initialize(
    {
      "card-buttons": cardButtons,
    },
    config
  );
})();

