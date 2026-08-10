(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const icon = "https://astrozyz.github.io/trello-powerups/assets/workflow.svg";
  const buildVersion = "202608101300";

  function configured() {
    return Boolean(config && config.appKey && config.appName && config.appAuthor);
  }

  function cardBackSection(t) {
    if (!configured() || !t.memberCanWriteToModel("card")) {
      return null;
    }

    return {
      title: "Workflow Mover",
      icon: icon,
      content: {
        type: "iframe",
        url: t.signUrl("./section.html?v=" + buildVersion),
        height: 1,
      },
    };
  }

  async function cardBadges(t) {
    if (!configured()) {
      return [];
    }

    const currentList = await t.list("name");
    const colors = {
      Backlog: "light-gray",
      Assigned: "blue",
      "In Progress": "yellow",
      Completed: "green",
      Blocked: "red",
    };

    if (!Object.prototype.hasOwnProperty.call(colors, currentList.name)) {
      return [];
    }

    return [{
      text: currentList.name,
      icon: icon,
      color: colors[currentList.name],
    }];
  }

  window.TrelloPowerUp.initialize(
    {
      "card-back-section": cardBackSection,
      "card-badges": cardBadges,
    },
    config
  );
})();
