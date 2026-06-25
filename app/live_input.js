(function () {
  const PROJECT_RULES = [
    { project: "Mercado Forestal", terms: ["brasil", "master", "florestal", "mercado forestal"] },
    { project: "GB Sudamerica", terms: ["gb"] },
    { project: "Outdoor Import", terms: ["outdoor"] },
    { project: "URUFOREST", terms: ["uruforest"] },
    { project: "Mantenimiento Mental", terms: ["mantenimiento mental"] },
    { project: "Guia Express", terms: ["guia express", "guía express"] },
    { project: "Caseritas", terms: ["caseritas"] },
    { project: "Quantum", terms: ["quantum"] }
  ];

  const HIGH_SIGNALS = [
    "cliente",
    "proveedor",
    "precio",
    "margen",
    "venta",
    "compra",
    "decision",
    "decisión",
    "contrato",
    "master",
    "florestal",
    "quantum",
    "log max",
    "ecolog"
  ];

  const MEDIUM_SIGNALS = [
    "seguimiento",
    "idea",
    "revisar",
    "pendiente",
    "propuesta",
    "oportunidad"
  ];

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function detectProject(text) {
    const value = normalize(text);
    const match = PROJECT_RULES.find((rule) => {
      return rule.terms.some((term) => value.includes(term));
    });
    return match ? match.project : "General";
  }

  function detectPriority(text) {
    const value = normalize(text);
    if (HIGH_SIGNALS.some((signal) => value.includes(signal))) return "HIGH";
    if (MEDIUM_SIGNALS.some((signal) => value.includes(signal))) return "MEDIUM";
    return "LOW";
  }

  function shouldAppearInBriefing(priority) {
    return priority === "HIGH" || priority === "MEDIUM";
  }

  function buildRecommendation(project, priority) {
    if (priority === "HIGH") {
      return `Revisar ${project} en el briefing y decidir proximo paso comercial.`;
    }
    if (priority === "MEDIUM") {
      return `Dejar ${project} en seguimiento y conectar con decisiones pendientes.`;
    }
    return `Guardar como contexto de ${project} sin interrumpir a Guillermo.`;
  }

  function processEvent(event) {
    const text = `${event.title || ""} ${event.description || ""}`;
    const project = detectProject(text);
    const priority = detectPriority(text);
    const recommendation = buildRecommendation(project, priority);

    const observation = {
      id: `live-${Date.now()}`,
      source: "live_input",
      type: event.type || "nota",
      entity: project,
      title: event.title || "Evento sin titulo",
      description: event.description || "",
      priority,
      timestamp: new Date().toISOString(),
      metadata: {
        manual: true,
        relatedProject: project,
        shouldAppearInBriefing: shouldAppearInBriefing(priority)
      }
    };

    return {
      observation,
      detected: {
        type: observation.type,
        project,
        priority,
        recommendation,
        shouldAppearInBriefing: observation.metadata.shouldAppearInBriefing
      }
    };
  }

  window.GOSLiveInput = {
    processEvent,
    detectProject,
    detectPriority
  };
})();
