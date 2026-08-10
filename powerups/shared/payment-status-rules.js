(function (root, factory) {
  const rules = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = rules;
  }
  root.PaymentStatusRules = rules;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  function isWholeDollarAmount(amountUsd) {
    return Number.isSafeInteger(amountUsd) && amountUsd > 0;
  }

  function parseWholeDollarAmount(value) {
    const text = String(value || "").trim();
    if (!/^[1-9]\d*$/.test(text)) {
      return null;
    }

    const amountUsd = Number(text);
    return isWholeDollarAmount(amountUsd) ? amountUsd : null;
  }

  function normalize(payment) {
    if (!payment || typeof payment !== "object" || !isWholeDollarAmount(payment.amountUsd)) {
      return null;
    }

    return Object.freeze({
      amountUsd: payment.amountUsd,
      paid: payment.paid === true,
    });
  }

  function formatUsd(amountUsd) {
    return currencyFormatter.format(amountUsd);
  }

  function detailsFor(payment) {
    const normalized = normalize(payment);
    if (!normalized) {
      return null;
    }

    return normalized.paid
      ? Object.freeze({ text: "Paid", color: "green" })
      : Object.freeze({ text: formatUsd(normalized.amountUsd), color: "red" });
  }

  function panelLabelFor(payment) {
    const normalized = normalize(payment);
    if (!normalized) {
      return "No payment listed";
    }

    return normalized.paid ? "Paid" : formatUsd(normalized.amountUsd) + " unpaid";
  }

  return Object.freeze({
    detailsFor: detailsFor,
    formatUsd: formatUsd,
    normalize: normalize,
    panelLabelFor: panelLabelFor,
    parseWholeDollarAmount: parseWholeDollarAmount,
  });
});
