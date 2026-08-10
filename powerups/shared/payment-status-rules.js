(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }
  root.PaymentStatusRules = rules;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const statuses = Object.freeze({
    UNPAID: "unpaid",
    PAID: "paid",
  });

  const badgeDetails = Object.freeze({
    [statuses.UNPAID]: Object.freeze({ text: "Payment Due", color: "red" }),
    [statuses.PAID]: Object.freeze({ text: "Paid", color: "green" }),
  });

  function normalize(status) {
    return Object.prototype.hasOwnProperty.call(badgeDetails, status) ? status : null;
  }

  function detailsFor(status) {
    const normalized = normalize(status);
    return normalized ? badgeDetails[normalized] : null;
  }

  function labelFor(status) {
    const details = detailsFor(status);
    return details ? details.text : "No payment tracked";
  }

  return Object.freeze({
    statuses: statuses,
    normalize: normalize,
    detailsFor: detailsFor,
    labelFor: labelFor,
  });
});
