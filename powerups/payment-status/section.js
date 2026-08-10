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

  function disableButtons() {
    actions.querySelectorAll("button").forEach(function (element) {
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

  async function setPaymentStatus(nextStatus, buttonElement) {
    disableButtons();
    buttonElement.textContent = "Saving…";

    try {
      await t.set("card", "shared", "paymentStatus", nextStatus);
      showStatus(nextStatus ? "Payment status: " + rules.labelFor(nextStatus) + "." : "No payment tracked.");
      actions.replaceChildren();
      await t.alert({
        message: nextStatus ? "Payment status set to " + rules.labelFor(nextStatus) + "." : "Payment flag removed.",
        display: "success",
        duration: 5,
      });
    } catch (error) {
      showStatus(error.message || "The payment status could not be saved.", "error");
      await render();
    }
  }

  function renderAdminActions(paymentStatus) {
    if (paymentStatus !== rules.statuses.UNPAID) {
      button("Mark Payment Due", "", function (event) {
        setPaymentStatus(rules.statuses.UNPAID, event.currentTarget);
      });
    }

    if (paymentStatus !== rules.statuses.PAID) {
      button("Mark Paid", "", function (event) {
        setPaymentStatus(rules.statuses.PAID, event.currentTarget);
      });
    }

    if (paymentStatus) {
      button("Remove Payment Flag", "secondary", function (event) {
        setPaymentStatus(null, event.currentTarget);
      });
    }
  }

  async function render() {
    try {
      actions.replaceChildren();
      const paymentStatus = rules.normalize(await t.get("card", "shared", "paymentStatus", null));
      showStatus("Payment status: " + rules.labelFor(paymentStatus) + ".", paymentStatus ? "" : "empty");

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

      if (access !== "admin") {
        showStatus("Only Workspace admins can change payment status.", "empty");
        return;
      }

      renderAdminActions(paymentStatus);
    } catch (error) {
      actions.replaceChildren();
      showStatus(error.message || "Payment status could not be loaded.", "error");
    }
  }

  t.render(render);
})();
