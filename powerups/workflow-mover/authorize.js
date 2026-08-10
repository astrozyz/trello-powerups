(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const button = document.getElementById("authorize");
  const t = window.TrelloPowerUp.iframe(config);

  function showError(message) {
    button.disabled = false;
    button.textContent = message;
  }

  t.render(async function () {
    const destinationName = await t.arg("destinationName");

    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "Connecting…";

      try {
        const restApi = await t.getRestApi();
        await restApi.authorize({ scope: "read,write" });
        button.textContent = "Moving card…";
        await window.TrelloWorkflowApi.moveCard(t, config, destinationName);
        await t.alert({
          message: "Card moved to " + destinationName + ".",
          display: "success",
          duration: 5,
        });
        await t.closePopup();
      } catch (error) {
        showError(error.message || "Authorization was cancelled. Try again.");
      }
    });
  });
})();

