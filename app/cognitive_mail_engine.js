(function () {
  const CATEGORIES = [
    { name: "Pedido", terms: ["pedido", "solicito", "necesito", "requiero", "favor enviar", "cotizar", "cotización", "cotizacion"] },
    { name: "Cliente", terms: ["cliente", "comprador", "venta", "consulta comercial"] },
    { name: "Proveedor", terms: ["proveedor", "suministro", "supplier", "fabricante", "distribuidor"] },
    { name: "Producción", terms: ["produccion", "producción", "planta", "fabricacion", "fabricación", "operacion", "operación"] },
    { name: "Logística", terms: ["logistica", "logística", "carga", "aerea", "aérea", "maritima", "marítima", "embarque", "aduana", "flete", "transporte", "shipping", "arrival", "eta", "delay", "congestion"] },
    { name: "Cobranza", terms: ["cobranza", "pago pendiente", "vencido", "deuda", "saldo"] },
    { name: "Factura", terms: ["factura", "invoice", "recibo", "comprobante"] },
    { name: "Oportunidad", terms: ["oportunidad", "interesado", "nuevo negocio", "propuesta", "licitacion", "licitación", "potencial"] },
    { name: "Problema", terms: ["problema", "reclamo", "error", "demora", "bloqueo", "urgente", "riesgo", "incidente", "delay", "delayed", "congestion", "retraso"] },
    { name: "Idea", terms: ["idea", "podriamos", "podríamos", "sugerencia", "alternativa"] },
    { name: "Seguimiento", terms: ["seguimiento", "pendiente", "recordatorio", "retomar", "respuesta pendiente"] },
    { name: "Agenda", terms: ["reunion", "reunión", "llamada", "agenda", "coordinar", "calendario", "mañana", "manana"] },
    { name: "General", terms: [] }
  ];

  const INTENTS = [
    { name: "Solicita acción", terms: ["solicito", "necesito", "requiero", "favor", "por favor", "enviar", "cotizar", "confirmar", "llamar"] },
    { name: "Espera respuesta", terms: ["quedo atento", "aguardo", "espero respuesta", "confirmame", "confirmar", "responder"] },
    { name: "Confirma", terms: ["confirmo", "confirmamos", "aprobado", "ok", "de acuerdo", "recibido"] },
    { name: "Cancela", terms: ["cancelar", "cancelado", "suspender", "anular"] },
    { name: "Riesgo", terms: ["riesgo", "urgente", "problema", "demora", "bloqueo", "reclamo", "vencido", "delay", "delayed", "congestion", "retraso"] },
    { name: "Oportunidad", terms: ["oportunidad", "interesado", "propuesta", "nuevo negocio", "potencial"] },
    { name: "Informa", terms: ["informo", "informamos", "adjunto", "envio", "envío", "comparto"] }
  ];

  const PROJECT_RULES = [
    { project: "Mercado Forestal", terms: ["brasil", "master", "florestal", "mercado forestal", "ponsse", "klabin"] },
    { project: "GB Sudamerica", terms: ["gb", "gb sudamerica", "gb sudamérica"] },
    { project: "Outdoor Import", terms: ["outdoor", "importacion outdoor", "importación outdoor"] },
    { project: "URUFOREST", terms: ["uruforest"] },
    { project: "Mantenimiento Mental", terms: ["mantenimiento mental"] },
    { project: "Guia Express", terms: ["guia express", "guía express"] },
    { project: "Caseritas", terms: ["caseritas"] },
    { project: "Quantum", terms: ["quantum"] }
  ];

  const COMPANY_TERMS = [
    "Ponsse",
    "Master Florestal",
    "GB",
    "Quantum",
    "Oregon",
    "Log Max",
    "EcoLog",
    "Market Support",
    "Klabin",
    "URUFOREST",
    "Mercado Forestal",
    "Outdoor Import"
  ];

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function sourceText(email) {
    const metadata = email.metadata || {};
    const from = metadata.from || {};
    return [
      email.title,
      email.subject,
      email.description,
      email.bodyPreview,
      email.sender,
      email.senderEmail,
      metadata.senderName,
      metadata.senderEmail,
      from.name,
      from.address
    ].filter(Boolean).join(" ");
  }

  function hasAny(text, terms) {
    return terms.some((term) => text.includes(normalize(term)));
  }

  function classifyEmail(email) {
    const text = normalize(sourceText(email));
    const matches = CATEGORIES.filter((category) => category.name !== "General" && hasAny(text, category.terms)).map((category) => category.name);
    return matches.length ? matches : ["General"];
  }

  function detectIntent(email) {
    const text = normalize(sourceText(email));
    const found = INTENTS.filter((intent) => hasAny(text, intent.terms)).map((intent) => intent.name);
    return found.length ? found : ["Informa"];
  }

  function detectProject(email) {
    const text = normalize(sourceText(email));
    const match = PROJECT_RULES.find((rule) => hasAny(text, rule.terms));
    return match ? match.project : email.entity || "General";
  }

  function detectCompany(email) {
    const text = normalize(sourceText(email));
    const explicit = COMPANY_TERMS.find((company) => text.includes(normalize(company)));
    if (explicit) return explicit;
    const metadata = email.metadata || {};
    const from = metadata.from || {};
    const sender = email.sender || metadata.senderName || from.name || "";
    return sender || email.entity || "General";
  }

  function detectPerson(email) {
    const metadata = email.metadata || {};
    const from = metadata.from || {};
    return email.sender || metadata.senderName || from.name || "";
  }

  function detectPriority(email, categories, intents) {
    const text = normalize(sourceText(email));
    if (email.priority === "HIGH" || email.priority === "Alta") return "HIGH";
    if (intents.includes("Riesgo") || categories.includes("Problema")) return "HIGH";
    if (intents.includes("Oportunidad") || categories.includes("Oportunidad")) return "HIGH";
    if (hasAny(text, ["urgente", "precio", "margen", "contrato", "cliente", "proveedor", "pago vencido", "delay", "congestion", "retraso"])) return "HIGH";
    if (intents.includes("Solicita acción") || intents.includes("Espera respuesta") || categories.includes("Seguimiento")) return "MEDIUM";
    return email.priority || "LOW";
  }

  function detectDate(email) {
    const text = sourceText(email);
    const iso = text.match(/\b20\d{2}-\d{2}-\d{2}\b/);
    if (iso) return iso[0];
    const slash = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
    if (slash) return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
    if (normalize(text).includes("mañana") || normalize(text).includes("manana")) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    }
    if (normalize(text).includes("hoy")) return new Date().toISOString().slice(0, 10);
    return "";
  }

  function actionRequired(categories, intents) {
    if (intents.includes("Riesgo") && categories.includes("Logística")) return "Revisar impacto del nuevo ETA y confirmar si afecta compromisos comerciales.";
    if (intents.includes("Riesgo")) return "Revisar riesgo y definir respuesta.";
    if (intents.includes("Oportunidad")) return "Evaluar oportunidad comercial y proximo paso.";
    if (intents.includes("Solicita acción")) return "Responder o delegar accion requerida.";
    if (intents.includes("Espera respuesta")) return "Preparar respuesta ejecutiva.";
    if (categories.includes("Factura") || categories.includes("Cobranza")) return "Revisar administracion y estado de pago.";
    if (categories.includes("Agenda")) return "Confirmar agenda o disponibilidad.";
    return "Guardar como contexto.";
  }

  function executiveAction(categories, intents, priority) {
    const action = actionRequired(categories, intents);
    if (priority === "HIGH" && action === "Guardar como contexto.") {
      return "Revisar correo prioritario y definir proximo paso.";
    }
    return action;
  }

  function mainTopic(email, categories, project) {
    const title = email.title || email.subject || "Correo sin asunto";
    return `${categories[0]}: ${title}`.slice(0, 140) || project;
  }

  function extractEntities(email, categories, intents) {
    const company = detectCompany(email);
    const person = detectPerson(email);
    const project = detectProject(email);
    const priority = detectPriority(email, categories, intents);
    const date = detectDate(email);
    const topic = mainTopic(email, categories, project);
    const entities = Array.from(new Set([company, person, project, ...(categories || [])].filter(Boolean)));

    return {
      empresa: company,
      persona: person,
      proyecto: project,
      temaPrincipal: topic,
      prioridad: priority,
      fechaDetectada: date,
      accionRequerida: executiveAction(categories, intents, priority),
      estado: intents.includes("Espera respuesta") || intents.includes("Solicita acción") ? "Pendiente" : "Contexto",
      entidadesRelacionadas: entities
    };
  }

  function enrichObservation(email, analysis) {
    return {
      ...email,
      entity: analysis.extract.proyecto,
      priority: analysis.extract.prioridad,
      type: "email",
      metadata: {
        ...(email.metadata || {}),
        cognitive: analysis,
        relatedProject: analysis.extract.proyecto,
        shouldAppearInBriefing: analysis.extract.prioridad === "HIGH" || analysis.extract.prioridad === "MEDIUM"
      }
    };
  }

  function makeFollowup(observation, analysis) {
    const needsFollowup = analysis.intent.some((intent) => ["Solicita acción", "Espera respuesta", "Riesgo", "Oportunidad"].includes(intent)) || analysis.categories.includes("Seguimiento");
    if (!needsFollowup) return null;
    return {
      id: `mail-followup-${observation.id}`,
      personaEmpresa: analysis.extract.persona || analysis.extract.empresa,
      motivo: analysis.extract.accionRequerida,
      fechaSugerida: analysis.extract.fechaDetectada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      proyectoRelacionado: analysis.extract.proyecto,
      prioridad: analysis.extract.prioridad,
      estado: "Pendiente",
      origen: "Cognitive Mail Engine",
      sourceObservationId: observation.id,
      createdAt: new Date().toISOString()
    };
  }

  function makeDecision(observation, analysis) {
    const needsDecision = analysis.intent.includes("Riesgo") || analysis.intent.includes("Oportunidad") || analysis.extract.prioridad === "HIGH";
    if (!needsDecision) return null;
    return {
      id: `mail-decision-${observation.id}`,
      priority: analysis.extract.prioridad === "HIGH" ? "Alta" : "Media",
      context: `${analysis.extract.temaPrincipal}. ${observation.description || ""}`.slice(0, 900),
      recommendation: analysis.extract.accionRequerida,
      state: "Pendiente",
      title: analysis.extract.temaPrincipal,
      project: analysis.extract.proyecto,
      origin: "Cognitive Mail Engine",
      sourceObservationId: observation.id,
      createdAt: new Date().toISOString()
    };
  }

  function analyzeEmail(email) {
    const categories = classifyEmail(email);
    const intent = detectIntent(email);
    const extract = extractEntities(email, categories, intent);
    return {
      categories,
      intent,
      extract,
      executiveSummary: `${extract.prioridad}: ${extract.temaPrincipal}. ${extract.accionRequerida}`,
      lifeLoopEvent: {
        type: "cognitive_mail",
        priority: extract.prioridad,
        project: extract.proyecto,
        topic: extract.temaPrincipal
      }
    };
  }

  function processEmail(email) {
    const analysis = analyzeEmail(email);
    const observation = enrichObservation(email, analysis);
    return {
      analysis,
      observation,
      followup: makeFollowup(observation, analysis),
      decision: makeDecision(observation, analysis)
    };
  }

  function summarize(results) {
    const grouped = {};
    (results || []).forEach((result) => {
      (result.analysis.categories || ["General"]).forEach((category) => {
        grouped[category] = (grouped[category] || 0) + 1;
      });
    });
    const risks = (results || []).filter((result) => result.analysis.intent.includes("Riesgo")).length;
    const opportunities = (results || []).filter((result) => result.analysis.intent.includes("Oportunidad") || result.analysis.categories.includes("Oportunidad")).length;
    const followups = (results || []).filter((result) => result.followup).length;
    const top = (results || []).find((result) => result.analysis.extract.prioridad === "HIGH") || (results || [])[0] || null;
    const recommendation = top
      ? `Recomiendo empezar por ${top.analysis.extract.persona || top.analysis.extract.empresa}: ${top.analysis.extract.accionRequerida}`
      : "Sin correos nuevos para priorizar.";

    return {
      grouped,
      risks,
      opportunities,
      followups,
      topDecision: top ? top.analysis.extract.temaPrincipal : "",
      recommendation,
      text: `Detecte ${opportunities} oportunidades comerciales, ${risks} riesgos, ${followups} seguimientos pendientes. ${recommendation}`
    };
  }

  window.GOSCognitiveMailEngine = {
    classifyEmail,
    detectIntent,
    extractEntities,
    analyzeEmail,
    processEmail,
    summarize
  };
})();
