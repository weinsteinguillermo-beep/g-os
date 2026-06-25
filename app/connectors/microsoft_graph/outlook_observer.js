(function () {
  const STRATEGIC_SENDERS = [
    "master florestal",
    "gb",
    "quantum",
    "oregon",
    "log max",
    "ecolog",
    "clientes estrategicos",
    "cliente estrategico"
  ];

  function initialize() {
    return { source: "outlook", status: "alpha" };
  }

  async function authenticate(config) {
    return window.GOSGraphAuth.authenticate(config);
  }

  async function refreshToken() {
    return window.GOSGraphAuth.refreshToken();
  }

  async function readInbox(options) {
    return window.GOSGraphClient.readInbox(options);
  }

  async function readFolder(folderId, options) {
    return window.GOSGraphClient.readFolder(folderId, options);
  }

  async function checkUpdates() {
    return readInbox({ top: 10 });
  }

  function senderText(email) {
    const address = email.from && email.from.emailAddress;
    const sender = email.sender && email.sender.emailAddress;
    return [
      address && address.name,
      address && address.address,
      sender && sender.name,
      sender && sender.address
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function detectPriority(email) {
    const text = `${senderText(email)} ${email.subject || ""}`.toLowerCase();
    const strategic = STRATEGIC_SENDERS.some((sender) => text.includes(sender));
    if (strategic) return "Alta";
    if (email.importance === "high") return "Alta";
    if (email.importance === "low") return "Baja";
    return "Media";
  }

  function normalizeEmail(email) {
    const from = email.from && email.from.emailAddress ? email.from.emailAddress : {};
    const sender = email.sender && email.sender.emailAddress ? email.sender.emailAddress : {};

    return {
      id: `outlook-${email.id}`,
      source: "outlook",
      type: "email",
      entity: from.name || from.address || sender.name || sender.address || "Outlook",
      title: email.subject || "(sin asunto)",
      description: email.bodyPreview || "",
      priority: detectPriority(email),
      timestamp: email.receivedDateTime || email.sentDateTime || new Date().toISOString(),
      metadata: {
        from: {
          name: from.name || "",
          address: from.address || ""
        },
        sender: {
          name: sender.name || "",
          address: sender.address || ""
        },
        importance: email.importance || "normal",
        categories: email.categories || [],
        hasAttachments: Boolean(email.hasAttachments),
        conversationId: email.conversationId || "",
        webLink: email.webLink || ""
      }
    };
  }

  function normalize(update) {
    return normalizeEmail(update);
  }

  function emitObservation(observation) {
    return observation;
  }

  window.GOSOutlookObserver = {
    initialize,
    authenticate,
    refreshToken,
    readInbox,
    readFolder,
    checkUpdates,
    normalizeEmail,
    normalize,
    emitObservation
  };
})();

