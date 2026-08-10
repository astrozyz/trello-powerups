(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const icon = "https://astrozyz.github.io/trello-powerups/assets/payment.svg";
  const buildVersion = "202608100235";

  function configured() {
    return Boolean(config && config.appKey && config.appName && config.appAuthor);
  }

  function cardBackSection(t) {
    if (!configured() || !t.memberCanWriteToModel("card")) {
      return null;
    }

    return {
      title: "Payment Status",
      icon: icon,
      content: {
        type: "iframe",
        url: t.signUrl("./section.html?v=" + buildVersion),
        height: 194,
      },
    };
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
      "card-back-section": cardBackSection,
      "card-badges": cardBadges,
    },
    config
  );
})();
