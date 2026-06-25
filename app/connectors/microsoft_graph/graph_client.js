(function () {
  const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
  const MESSAGE_SELECT = [
    "id",
    "receivedDateTime",
    "sentDateTime",
    "subject",
    "bodyPreview",
    "importance",
    "categories",
    "hasAttachments",
    "conversationId",
    "from",
    "sender",
    "webLink"
  ].join(",");

  async function graphRequest(path) {
    const token = await window.GOSGraphAuth.getAccessToken();
    const response = await fetch(`${GRAPH_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Microsoft Graph error ${response.status}: ${detail}`);
    }

    return response.json();
  }

  async function readInbox(options) {
    const top = (options && options.top) || 10;
    const path = `/me/mailFolders/inbox/messages?$top=${top}&$orderby=receivedDateTime desc&$select=${MESSAGE_SELECT}`;
    const result = await graphRequest(path);
    return result.value || [];
  }

  async function readFolder(folderId, options) {
    const top = (options && options.top) || 10;
    const encodedFolder = encodeURIComponent(folderId);
    const path = `/me/mailFolders/${encodedFolder}/messages?$top=${top}&$orderby=receivedDateTime desc&$select=${MESSAGE_SELECT}`;
    const result = await graphRequest(path);
    return result.value || [];
  }

  window.GOSGraphClient = {
    readInbox,
    readFolder,
    graphRequest
  };
})();

