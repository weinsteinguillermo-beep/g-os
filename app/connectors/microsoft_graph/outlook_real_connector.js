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

  const PROJECT_TERMS = [
    { project: "Mercado Forestal", terms: ["brasil", "master", "florestal", "mercado forestal", "ponsse"] },
    { project: "GB Sudamerica", terms: ["gb", "gb sudamerica"] },
    { project: "Outdoor Import", terms: ["outdoor"] },
    { project: "URUFOREST", terms: ["uruforest"] },
    { project: "Mantenimiento Mental", terms: ["mantenimiento mental"] },
    { project: "Guia Express", terms: ["guia express", "guía express"] },
    { project: "Caseritas", terms: ["caseritas"] },
    { project: "Quantum", terms: ["quantum"] }
  ];

  const HIGH_SIGNALS = [
    "master florestal",
    "ponsse",
    "gb",
    "quantum",
    "oregon",
    "log max",
    "ecolog",
    "cliente",
    "proveedor",
    "precio",
    "margen",
    "cotizacion",
    "cotización",
    "contrato",
    "decision",
    "decisión",
    "urgente"
  ];

  const MEDIUM_SIGNALS = [
    "seguimiento",
    "propuesta",
    "reunion",
    "reunión",
    "oportunidad",
    "consulta",
    "pendiente"
  ];

  function normalizeText(value) {
    return String(value || "").toLowerCase();
  }

  function sender(email) {
    const from = email.from && email.from.emailAddress ? email.from.emailAddress : {};
    const senderValue = email.sender && email.sender.emailAddress ? email.sender.emailAddress : {};
    return {
      name: from.name || senderValue.name || "",
      address: from.address || senderValue.address || ""
    };
  }

  function emailText(email) {
    const from = sender(email);
    return `${from.name} ${from.address} ${email.subject || ""} ${email.bodyPreview || ""}`;
  }

  function detectProject(email) {
    const text = normalizeText(emailText(email));
    const match = PROJECT_TERMS.find((rule) => rule.terms.some((term) => text.includes(term)));
    return match ? match.project : "General";
  }

  function detectPriority(email) {
    const text = normalizeText(emailText(email));
    if (email.importance === "high") return "HIGH";
    if (HIGH_SIGNALS.some((signal) => text.includes(signal))) return "HIGH";
    if (MEDIUM_SIGNALS.some((signal) => text.includes(signal))) return "MEDIUM";
    if (email.importance === "low") return "LOW";
    return "LOW";
  }

  async function graphRequest(path) {
    const token = await window.GOSMicrosoftGraphAuth.getAccessToken();
    const response = await fetch(`${GRAPH_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        Prefer: 'outlook.body-content-type="text"'
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Microsoft Graph error ${response.status}: ${detail}`);
    }

    return response.json();
  }

  async function readLatestEmails(limit = 10) {
    const top = Math.max(1, Math.min(Number(limit) || 10, 25));
    const query = new URLSearchParams({
      $top: String(top),
      $orderby: "receivedDateTime desc",
      $select: MESSAGE_SELECT
    });
    const result = await graphRequest(`/me/messages?${query.toString()}`);
    return result.value || [];
  }

  function normalizeOutlookEmail(email) {
    const from = sender(email);
    const relatedProject = detectProject(email);
    const priority = detectPriority(email);

    return {
      id: `outlook-real-${email.id}`,
      source: "outlook_graph",
      type: "email",
      entity: relatedProject,
      title: email.subject || "(sin asunto)",
      description: email.bodyPreview || "",
      priority,
      timestamp: email.receivedDateTime || email.sentDateTime || new Date().toISOString(),
      metadata: {
        from,
        relatedProject,
        importance: email.importance || "normal",
        categories: email.categories || [],
        hasAttachments: Boolean(email.hasAttachments),
        conversationId: email.conversationId || "",
        webLink: email.webLink || "",
        shouldAppearInBriefing: priority === "HIGH" || priority === "MEDIUM",
        readOnly: true
      }
    };
  }

  function emitObservationFromEmail(email) {
    return normalizeOutlookEmail(email);
  }

  function initialize() {
    return { source: "outlook_graph", status: "real", mode: "read-only" };
  }

  function checkUpdates() {
    return [];
  }

  function normalize(update) {
    return normalizeOutlookEmail(update);
  }

  function emitObservation(observation) {
    return observation;
  }

  window.GOSOutlookRealConnector = {
    initialize,
    checkUpdates,
    readLatestEmails,
    normalizeOutlookEmail,
    emitObservationFromEmail,
    normalize,
    emitObservation
  };

  window.GOSOutlookObserver = window.GOSOutlookObserver || {
    initialize,
    checkUpdates,
    normalize,
    emitObservation,
    normalizeEmail: normalizeOutlookEmail,
    readInbox: (options) => readLatestEmails(options && options.top ? options.top : 10),
    authenticate: () => window.GOSMicrosoftGraphAuth.loginOutlook(),
    refreshToken: async () => null
  };

  window.readLatestEmails = readLatestEmails;
  window.normalizeOutlookEmail = normalizeOutlookEmail;
  window.emitObservationFromEmail = emitObservationFromEmail;
})();
