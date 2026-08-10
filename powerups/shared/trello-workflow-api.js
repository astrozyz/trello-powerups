(function (root, factory) {
  root.TrelloWorkflowApi = factory(root.WorkflowRules);
})(typeof window !== "undefined" ? window : globalThis, function (WorkflowRules) {
  "use strict";

  if (!WorkflowRules) {
    throw new Error("WorkflowRules must load before TrelloWorkflowApi.");
  }

  function asApiError(response, fallbackMessage) {
    return response.text().then(function (body) {
      return new Error(body || fallbackMessage);
    });
  }

  function request(url, options, fallbackMessage) {
    return fetch(url, options).then(function (response) {
      if (!response.ok) {
        return asApiError(response, fallbackMessage).then(function (error) {
          throw error;
        });
      }
      return response.json();
    });
  }

  function withCredentials(url, appKey, token) {
    const endpoint = new URL(url);
    endpoint.searchParams.set("key", appKey);
    endpoint.searchParams.set("token", token);
    return endpoint.toString();
  }

  function findExactlyOneList(lists, listName) {
    const matches = lists.filter(function (list) {
      return list.name === listName;
    });

    if (matches.length !== 1) {
      throw new Error('This board must contain exactly one open list named "' + listName + '".');
    }

    return matches[0];
  }

  async function moveCard(t, config, destinationName) {
    const context = await Promise.all([t.card("id"), t.list("name"), t.lists("id", "name")]);
    const card = context[0];
    const currentList = context[1];
    const lists = context[2];

    if (!WorkflowRules.isAllowedMove(currentList.name, destinationName)) {
      throw new Error("This card is no longer in a list that can move to " + destinationName + ".");
    }

    const sourceList = findExactlyOneList(lists, currentList.name);
    const destinationList = findExactlyOneList(lists, destinationName);
    const restApi = await t.getRestApi();
    const token = await restApi.getToken();

    if (!token) {
      throw new Error("Connect your Trello account before moving a card.");
    }

    const liveCard = await request(
      withCredentials("https://api.trello.com/1/cards/" + encodeURIComponent(card.id) + "?fields=idList", config.appKey, token),
      { method: "GET" },
      "Trello could not check the card's current list."
    );

    if (liveCard.idList !== sourceList.id) {
      throw new Error("This card was moved before the update could be applied. Try again.");
    }

    return request(
      withCredentials(
        "https://api.trello.com/1/cards/" + encodeURIComponent(card.id) + "?idList=" + encodeURIComponent(destinationList.id),
        config.appKey,
        token
      ),
      { method: "PUT" },
      "Trello could not move this card."
    );
  }

  return Object.freeze({
    moveCard: moveCard,
  });
});

