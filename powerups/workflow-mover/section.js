(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const status = document.getElementById("status");
  const actions = document.getElementById("actions");
  const t = window.TrelloPowerUp.iframe(config);

  function showStatus(message, className) {
    status.textContent = message;
    status.className = className || "";
  }

  async function moveCard(destinationName, button) {
    button.disabled = true;
    button.textContent = "Moving…";

    try {
      const restApi = await t.getRestApi();
      if (!(await restApi.isAuthorized())) {
        button.textContent = "Connect Trello…";
        await restApi.authorize({ scope: "read,write" });
      }

      await window.TrelloWorkflowApi.moveCard(t, config, destinationName);
      actions.replaceChildren();
      showStatus("Moved to " + destinationName + ".", "");
      await t.alert({
        message: "Card moved to " + destinationName + ".",
        display: "success",
        duration: 5,
      });
    } catch (error) {
      button.disabled = false;
      button.textContent = "Try again";
      showStatus(error.message || "The card could not be moved.", "error");
    }
  }

  async function render() {
    try {
      if (!t.memberCanWriteToModel("card")) {
        actions.replaceChildren();
        showStatus("You do not have permission to move this card.", "empty");
        return;
      }

      const currentList = await t.list("name");
      const moves = window.WorkflowRules.movesForList(currentList.name);
      actions.replaceChildren();

      if (moves.length === 0) {
        showStatus("No workflow action is available for " + currentList.name + ".", "empty");
        return;
      }

      showStatus("Current stage: " + currentList.name);
      moves.forEach(function (move) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = move.label;
        button.addEventListener("click", function () {
          moveCard(move.destination, button);
        });
        actions.appendChild(button);
      });
    } catch (error) {
      actions.replaceChildren();
      showStatus(error.message || "Workflow actions could not be loaded.", "error");
    }
  }

  t.render(render);
})();
