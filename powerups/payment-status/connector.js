(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const icon = "https://astrozyz.github.io/trello-powerups/assets/payment.svg";
  const buildVersion = "202608100225";

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
        height: 142,
      },
    };
  }

  async function cardBadges(t) {
    if (!configured()) {
      return [];
    }

    const paymentStatus = await t.get("card", "shared", "paymentStatus", null);
    const details = window.PaymentStatusRules.detailsFor(paymentStatus);

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
