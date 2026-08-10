(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const icon = "https://astrozyz.github.io/trello-powerups/assets/payment.svg";
  const buildVersion = "202608100430";

  function configured() {
    return Boolean(config && config.appKey && config.appName && config.appAuthor);
  }

  function cardButtons(t) {
    if (!configured() || !t.memberCanWriteToModel("card")) {
      return [];
    }

    return [{
      icon: icon,
      text: "Payment Status",
      callback: function (t) {
        return t.popup({
          title: "Payment Status",
          url: t.signUrl("./section.html?v=" + buildVersion),
        });
      },
    }];
  }

  async function cardBadges(t) {
    if (!configured()) {
      return [];
    }

    const payment = await t.get("card", "shared", "payment", null);
    const details = window.PaymentStatusRules.detailsFor(payment);

    if (!details) {
      return [];
    }

    return [{
      text: details.text,
      icon: icon,
      color: details.color,
    }];
  }

  window.TrelloPowerUp.initialize(
    {
      "card-buttons": cardButtons,
      "card-badges": cardBadges,
    },
    config
  );
})();
