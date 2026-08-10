(function () {
  "use strict";

  const config = window.POWER_UP_CONFIG;
  const rules = window.PaymentStatusRules;
  const status = document.getElementById("status");
  const actions = document.getElementById("actions");
  const t = window.TrelloPowerUp.iframe(config);

  function showStatus(message, className) {
    status.textContent = message;
    status.className = className || "";
  }

  function configured() {
    return Boolean(config && config.appKey && config.appName && config.appAuthor);
  }

  function button(label, className, onClick) {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    element.className = className || "";
    element.addEventListener("click", onClick);
    actions.appendChild(element);
    return element;
  }

  function amountInput(payment) {
    const element = document.createElement("input");
    element.type = "text";
    element.inputMode = "numeric";
    element.autocomplete = "off";
    element.placeholder = "USD amount";
    element.setAttribute("aria-label", "Payment amount in whole US dollars");
    element.pattern = "[0-9]*";
    element.value = payment ? String(payment.amountUsd) : "";
    actions.appendChild(element);
    return element;
  }

  function disableControls() {
    actions.querySelectorAll("button, input").forEach(function (element) {
      element.disabled = true;
    });
  }

  async function connect(buttonElement) {
    buttonElement.disabled = true;
    buttonElement.textContent = "Connecting…";

    try {
      const restApi = await t.getRestApi();
      await restApi.authorize({ scope: "read" });
      await render();
    } catch (error) {
      buttonElement.disabled = false;
      buttonElement.textContent = "Connect Trello";
      showStatus(error.message || "Trello access could not be connected.", "error");
    }
  }

  async function savePayment(payment, buttonElement, successMessage) {
    disableControls();
    buttonElement.textContent = "Saving…";

    try {
      await t.set("card", "shared", "payment", payment);
      await t.alert({
        message: successMessage,
        display: "success",
        duration: 5,
      });
      await render();
    } catch (error) {
      showStatus(error.message || "The payment could not be saved.", "error");
      await render();
    }
  }

  function saveAmount(payment, input, buttonElement) {
    const amountUsd = rules.parseWholeDollarAmount(input.value);
    if (!amountUsd) {
      showStatus("Enter a whole USD amount, such as 125.", "error");
      input.focus();
      return;
    }

    const nextPayment = {
      amountUsd: amountUsd,
      paid: Boolean(payment && payment.paid),
    };
    savePayment(nextPayment, buttonElement, payment ? "Payment amount updated." : "Payment added as unpaid.");
  }

  function removePayment(buttonElement) {
    savePayment(null, buttonElement, "Payment removed from this card.");
  }

  async function resizeToContent() {
    try {
      await t.sizeTo("#payment-status");
    } catch (error) {
      // The panel remains usable if Trello closes its popup while it is resizing.
    }
  }

  function renderAdminActions(payment) {
    const input = amountInput(payment);
    button(payment ? "Update Amount" : "Set Payment", "", function (event) {
      saveAmount(payment, input, event.currentTarget);
    });

    if (payment && !payment.paid) {
      button("Mark Paid", "", function (event) {
        savePayment({ amountUsd: payment.amountUsd, paid: true }, event.currentTarget, "Payment marked as paid.");
      });
    }

    if (payment) {
      button("Remove Payment", "secondary", function (event) {
        removePayment(event.currentTarget);
      });
    }
  }

  async function render() {
    try {
      actions.replaceChildren();
      const payment = rules.normalize(await t.get("card", "shared", "payment", null));
      showStatus(rules.panelLabelFor(payment) + ".", payment ? "" : "empty");

      if (!t.memberCanWriteToModel("card")) {
        return;
      }

      if (!configured()) {
        showStatus("Payment Status has not been configured by its administrator.", "error");
        return;
      }

      const access = await window.TrelloPaymentApi.workspaceAccessForCurrentMember(t, config);
      if (access === "not-connected") {
        showStatus("Connect Trello to verify Workspace-admin access.", "empty");
        button("Connect Trello", "", function (event) {
          connect(event.currentTarget);
        });
        return;
      }

      if (access === "not-workspace-board") {
        showStatus("Payment Status needs a board that belongs to a Workspace.", "empty");
        return;
      }

      if (access !== "admin") {
        showStatus("Only Workspace admins can change payment status.", "empty");
        return;
      }

      renderAdminActions(payment);
    } catch (error) {
      actions.replaceChildren();
      showStatus(error.message || "Payment status could not be loaded.", "error");
    } finally {
      await resizeToContent();
    }
  }

  t.render(render);
})();
