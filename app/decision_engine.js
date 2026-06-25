(function () {
  const ECONOMIC_TERMS = ["precio", "margen", "venta", "compra", "stock", "cliente", "proveedor", "contrato", "comercial"];
  const URGENCY_TERMS = ["urgente", "hoy", "ahora", "pendiente", "falta", "bloqueado", "trancado"];
  const STRATEGIC_CLIENTS = ["ponsse", "master", "florestal", "gb", "quantum", "oregon", "log max", "ecolog"];
  const STRATEGIC_PROJECTS = ["brasil", "mercado forestal", "uruforest", "gb", "outdoor"];
  const GENERIC_TOKENS = ["cliente", "proveedor", "precio", "margen", "venta", "compra", "stock", "contrato", "comercial", "decision", "urgente", "pendiente"];

  const PRIORITY_POINTS = {
    HIGH: 10,
    Alta: 10,
    MEDIUM: 6,
    Media: 6,
    LOW: 2,
    Baja: 2
  };

  const STATE_POINTS = {
    Pendiente: 8,
    "En analisis": 6,
    Aprobada: 2,
    Archivada: -20,
    Observado: 5,
    Activo: 5
  };

  function textOf(item) {
    return [
      item.title,
      item.name,
      item.context,
      item.description,
      item.recommendation,
      item.lastActivity,
      item.entity,
      item.text
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function hasAny(text, terms) {
    return terms.some((term) => text.includes(term));
  }

  function clamp(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function relationCount(item, contextGraph) {
    if (!contextGraph || !contextGraph.nodes || !contextGraph.links) return 0;
    const id = item.id || item.name || item.context || item.title;
    const node = contextGraph.nodes.find((candidate) => {
      return candidate.id === id || candidate.title === item.name || candidate.title === item.context || candidate.title === item.title;
    });
    if (!node) return 0;
    return contextGraph.links.filter((link) => link.from === node.id || link.to === node.id).length;
  }

  function recentObservationCount(item, observations) {
    const text = textOf(item);
    return (observations || []).filter((observation) => {
      const obsText = textOf(observation);
      const tokens = text
        .split(" ")
        .filter((token) => token.length > 3 && !GENERIC_TOKENS.includes(token));
      if (observation.priority === "HIGH" || observation.priority === "Alta") {
        return tokens.some((token) => obsText.includes(token));
      }
      return false;
    }).length;
  }

  function scoreBreakdown(item, contextGraph, observations) {
    const text = textOf(item);
    const relations = relationCount(item, contextGraph);
    const recentObservations = recentObservationCount(item, observations);
    const stopped = !item.updatedAt && !item.createdAtIso && !item.timestamp;
    const followup = followupBoost(item);

    return {
      economicImpact: hasAny(text, ECONOMIC_TERMS) ? 30 : 8,
      urgency: followup.urgent ? 20 : (hasAny(text, URGENCY_TERMS) ? 20 : 6),
      strategicClient: hasAny(text, STRATEGIC_CLIENTS) ? 15 : 0,
      strategicProject: hasAny(text, STRATEGIC_PROJECTS) ? 10 : 0,
      stalledTime: followup.overdue ? 10 : (followup.isFollowup ? 2 : (stopped || text.includes("pendiente") ? 10 : 2)),
      relations: Math.min(relations * 2, 10),
      observations: Math.min(recentObservations * 3, 9),
      manualPriority: followup.high ? 10 : (PRIORITY_POINTS[item.priority] || 2),
      state: STATE_POINTS[item.state] || STATE_POINTS[item.status] || 4
    };
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function tomorrowKey() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  function followupBoost(item) {
    const source = item.source || item;
    const isFollowup = item.type === "seguimiento" || source.origen === "ADN" || Boolean(source.fechaSugerida);
    if (!isFollowup) return { isFollowup: false, urgent: false, overdue: false, high: false };
    const due = source.fechaSugerida || "";
    const high = source.prioridad === "HIGH" || source.priority === "HIGH" || source.prioridad === "Alta";
    return {
      isFollowup,
      urgent: high || (Boolean(due) && due <= tomorrowKey()),
      overdue: Boolean(due) && due < todayKey(),
      high
    };
  }

  function timestampValue(item) {
    const source = item.source || item;
    const value = source.timestamp || source.updatedAt || source.createdAtIso || item.timestamp || "";
    const time = Date.parse(value);
    return Number.isNaN(time) ? 0 : time;
  }

  function classify(score) {
    if (score >= 90) return "CRITICO";
    if (score >= 70) return "ALTO";
    if (score >= 40) return "MEDIO";
    return "BAJO";
  }

  function calculateDecisionScore(item, options) {
    const contextGraph = options && options.contextGraph;
    const observations = options && options.observations;
    const breakdown = scoreBreakdown(item, contextGraph, observations);
    const total = clamp(Object.values(breakdown).reduce((sum, value) => sum + value, 0));

    return {
      score: total,
      level: classify(total),
      breakdown
    };
  }

  function actionFor(item, score) {
    if (score.level === "CRITICO") return "Resolver hoy y pedir decision de Guillermo.";
    if (score.level === "ALTO") return "Preparar opciones y recomendacion concreta.";
    if (score.level === "MEDIO") return "Mantener en seguimiento con proximo paso.";
    return "Guardar como contexto sin interrumpir.";
  }

  function reasonFor(item, result) {
    const parts = [];
    if (result.breakdown.economicImpact >= 30) parts.push("impacto economico");
    if (result.breakdown.urgency >= 20) parts.push("urgencia");
    if (result.breakdown.strategicClient > 0) parts.push("cliente estrategico");
    if (result.breakdown.strategicProject > 0) parts.push("proyecto estrategico");
    if ((item.type === "seguimiento" || (item.source && item.source.fechaSugerida)) && result.breakdown.urgency >= 20) parts.push("seguimiento critico");
    if ((item.type === "seguimiento" || (item.source && item.source.fechaSugerida)) && result.breakdown.stalledTime >= 10) parts.push("seguimiento atrasado");
    if (result.breakdown.relations > 0) parts.push("relaciones activas");
    if (result.breakdown.observations > 0) parts.push("observaciones recientes");
    return parts.length ? parts.join(", ") : "prioridad operativa baja";
  }

  function normalizeDecisionCandidate(item, type) {
    return {
      id: item.id || `${type}-${Date.now()}`,
      type,
      project: item.entity || item.project || item.name || item.title || "General",
      title: item.title || item.context || item.name || "Decision sin titulo",
      description: item.description || item.recommendation || item.lastActivity || item.context || "",
      priority: item.priority || "Media",
      state: item.state || item.status || "Pendiente",
      source: item
    };
  }

  function buildExecutiveAgenda(input) {
    const observations = input.observaciones || input.observations || [];
    const followups = input.seguimientos || input.followups || [];
    const contextGraph = input.contextGraph;
    const candidates = [
      ...(input.decisiones || input.decisions || []).map((item) => normalizeDecisionCandidate(item, "decision")),
      ...observations.map((item) => normalizeDecisionCandidate(item, "observacion")),
      ...followups
        .filter((item) => item.estado !== "Realizado" && item.estado !== "Archivado")
        .map((item) => normalizeDecisionCandidate({
          ...item,
          title: item.personaEmpresa,
          description: item.motivo,
          entity: item.proyectoRelacionado,
          priority: item.prioridad || item.priority || "MEDIUM",
          state: item.estado || "Pendiente"
        }, "seguimiento"))
    ];

    return candidates
      .filter((item) => item.state !== "Archivada")
      .map((item) => {
        const result = calculateDecisionScore(item, { contextGraph, observations });
        return {
          ...item,
          decisionScore: result.score,
          level: result.level,
          breakdown: result.breakdown,
          reason: reasonFor(item, result),
          recommendedAction: actionFor(item, result)
        };
      })
      .sort((a, b) => {
        if (b.decisionScore !== a.decisionScore) return b.decisionScore - a.decisionScore;
        return timestampValue(b) - timestampValue(a);
      })
      .map((item, index) => ({ ...item, position: index + 1 }));
  }

  window.GOSDecisionEngine = {
    calculateDecisionScore,
    buildExecutiveAgenda,
    classify
  };
})();
