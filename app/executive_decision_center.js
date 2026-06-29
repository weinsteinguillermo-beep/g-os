(function () {
  const STATE_KEY = "gos:executiveDecisionCenter";
  const ARCHIVED = "Archivado";

  function now() {
    return new Date().toISOString();
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) || { items: {} };
    } catch (error) {
      return { items: {} };
    }
  }

  function writeState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return state;
  }

  function itemState(id) {
    const state = readState();
    return state.items && state.items[id] ? state.items[id] : {};
  }

  function updateItem(id, patch) {
    const state = readState();
    state.items = state.items || {};
    state.items[id] = {
      ...(state.items[id] || {}),
      ...patch,
      updatedAt: now()
    };
    writeState(state);
    return state.items[id];
  }

  function isClosed(status) {
    return status === "Resuelto" || status === ARCHIVED;
  }

  function cognitiveOf(observation) {
    return observation && observation.metadata ? observation.metadata.cognitive : null;
  }

  function timeOf(item) {
    const value = item.fechaHora || item.timestamp || item.createdAt || item.updatedAt || "";
    const time = Date.parse(value);
    return Number.isNaN(time) ? 0 : time;
  }

  function sourceWeight(item) {
    const raw = item.raw || item;
    const source = item.origen || raw.source || raw.origin || raw.origen || "";
    if (source === "case") return 5;
    if (source === "outlook_desktop") return 4;
    if (source === "outlook_graph" || source === "outlook") return 3;
    if (source === "live_input") return 1;
    if (source === "demo" || raw.demo || raw.demoId) return -5;
    if (source === "manual" || source === "ADN") return -2;
    if (source === "system") return -1;
    return 0;
  }

  function recencyWeight(item) {
    const time = timeOf(item);
    if (!time) return 0;
    const ageHours = (Date.now() - time) / (60 * 60 * 1000);
    if (ageHours <= 24) return 3;
    if (ageHours <= 72) return 1;
    return 0;
  }

  function levelFromPriority(priority) {
    if (priority === "HIGH" || priority === "Alta") return "ALTO";
    if (priority === "MEDIUM" || priority === "Media") return "MEDIO";
    return "BAJO";
  }

  function levelFromScore(score, fallback) {
    if (score >= 90) return "CRITICO";
    if (score >= 70) return "ALTO";
    if (score >= 40) return "MEDIO";
    return fallback || "BAJO";
  }

  function normalizeFromObservation(observation) {
    const cognitive = cognitiveOf(observation);
    if (!cognitive) return null;
    const extract = cognitive.extract || {};
    const categories = cognitive.categories || [];
    const intents = cognitive.intent || [];
    const sourceState = itemState(`obs-${observation.id}`);

    return {
      id: `obs-${observation.id}`,
      sourceId: observation.id,
      kind: categories.includes("Problema") || intents.includes("Riesgo")
        ? "riesgo"
        : categories.includes("Oportunidad") || intents.includes("Oportunidad")
          ? "oportunidad"
          : "decision",
      title: extract.temaPrincipal || observation.title,
      empresaPersona: extract.persona || extract.empresa || observation.entity || "General",
      empresa: extract.empresa || observation.entity || "General",
      persona: extract.persona || "",
      proyecto: extract.proyecto || observation.entity || "General",
      origen: observation.source || "correo",
      nivel: levelFromPriority(extract.prioridad || observation.priority),
      motivo: categories.concat(intents).join(", ") || "Correo procesado cognitivamente",
      accionSugerida: extract.accionRequerida || "Definir proximo paso.",
      fechaHora: observation.timestamp,
      status: sourceState.status || "Pendiente",
      raw: observation
    };
  }

  function normalizeFromDecision(decision, agendaMatch) {
    const sourceState = itemState(`decision-${decision.id}`);
    return {
      id: `decision-${decision.id}`,
      sourceId: decision.id,
      kind: "decision",
      title: decision.title || decision.context || "Decision pendiente",
      empresaPersona: decision.project || decision.entity || "General",
      empresa: decision.project || decision.entity || "General",
      persona: "",
      proyecto: decision.project || decision.entity || "General",
      origen: decision.origin || decision.origen || "Decision Engine",
      nivel: levelFromScore(agendaMatch ? agendaMatch.decisionScore : 0, levelFromPriority(decision.priority)),
      motivo: agendaMatch ? agendaMatch.reason : decision.context || "Decision pendiente",
      accionSugerida: decision.recommendation || (agendaMatch ? agendaMatch.recommendedAction : "Preparar recomendacion."),
      fechaHora: decision.updatedAt || decision.createdAt || decision.timestamp || "",
      status: sourceState.status || decision.state || "Pendiente",
      raw: decision
    };
  }

  function normalizeFromFollowup(followup, agendaMatch) {
    const sourceState = itemState(`followup-${followup.id}`);
    return {
      id: `followup-${followup.id}`,
      sourceId: followup.id,
      kind: "seguimiento",
      title: followup.motivo || "Seguimiento pendiente",
      empresaPersona: followup.personaEmpresa || "General",
      empresa: followup.personaEmpresa || "General",
      persona: "",
      proyecto: followup.proyectoRelacionado || "General",
      origen: followup.origen || "Seguimiento",
      nivel: levelFromScore(agendaMatch ? agendaMatch.decisionScore : 0, levelFromPriority(followup.prioridad || followup.priority)),
      motivo: followup.fechaSugerida ? `Fecha sugerida: ${followup.fechaSugerida}` : "Seguimiento pendiente",
      accionSugerida: "Resolver o reprogramar seguimiento.",
      fechaHora: followup.updatedAt || followup.createdAt || followup.fechaSugerida || "",
      status: sourceState.status || followup.estado || "Pendiente",
      raw: followup
    };
  }

  function latestCognitive(observations) {
    return (observations || [])
      .filter((observation) => cognitiveOf(observation))
      .sort((a, b) => timeOf({ fechaHora: b.timestamp }) - timeOf({ fechaHora: a.timestamp }))[0] || null;
  }

  function latestDecision(decisions) {
    return (decisions || [])
      .sort((a, b) => timeOf({ fechaHora: b.updatedAt || b.createdAt || b.timestamp }) - timeOf({ fechaHora: a.updatedAt || a.createdAt || a.timestamp }))[0] || null;
  }

  function normalizeFromCase(caso) {
    const sourceState = itemState(`case-${caso.id}`);
    const riskCount = (caso.riesgos || []).length;
    const opportunityCount = (caso.oportunidades || []).length;
    const understood = caso.queEntendi || (caso.mailInsights || [])[0] || {};
    return {
      id: `case-${caso.id}`,
      sourceId: caso.id,
      kind: riskCount ? "riesgo" : opportunityCount ? "oportunidad" : "caso",
      title: caso.titulo || "Caso sin titulo",
      empresaPersona: caso.empresa || (caso.personas || [])[0] || "General",
      empresa: caso.empresa || "General",
      persona: (caso.personas || [])[0] || "",
      proyecto: (caso.proyectos || [])[0] || caso.empresa || "General",
      origen: "Caso consolidado",
      nivel: caso.level || levelFromScore(caso.score || 0, levelFromPriority(caso.prioridad)),
      motivo: understood.resumen || [
        caso.tipo,
        `${(caso.evidence || []).length} evidencias`,
        `${(caso.decisiones || []).length} decisiones`,
        `${(caso.seguimientos || []).length} seguimientos`
      ].filter(Boolean).join(" | "),
      accionSugerida: understood.queHariaYo || understood.proximoPaso || caso.recommendation || "Definir proximo paso.",
      fechaHora: caso.ultimaActualizacion || "",
      status: sourceState.status || caso.estado || "Activo",
      raw: {
        ...caso,
        source: "case"
      }
    };
  }

  function build(input) {
    const observations = input.observaciones || input.observations || [];
    const decisions = input.decisiones || input.decisions || [];
    const followups = input.seguimientos || input.followups || [];
    const cases = input.casos || input.cases || [];
    const agenda = input.agenda || [];
    const desktop = input.desktopObserver || {};
    const eventBus = window.GOSEventBus ? window.GOSEventBus.getState() : {};
    const agendaBySource = new Map();
    agenda.forEach((item) => {
      if (item.source && item.source.id) agendaBySource.set(item.source.id, item);
      if (item.id) agendaBySource.set(item.id, item);
    });

    const caseItems = cases.map(normalizeFromCase);
    const cognitiveItems = cases.length ? [] : observations.map(normalizeFromObservation).filter(Boolean);
    const decisionItems = cases.length ? [] : decisions
      .filter((decision) => decision.state !== ARCHIVED)
      .map((decision) => normalizeFromDecision(decision, agendaBySource.get(decision.id)));
    const followupItems = cases.length ? [] : followups
      .filter((followup) => followup.estado !== "Realizado" && followup.estado !== ARCHIVED)
      .map((followup) => normalizeFromFollowup(followup, agendaBySource.get(followup.id)));

    const allItems = [...caseItems, ...cognitiveItems, ...decisionItems, ...followupItems]
      .filter((item) => !isClosed(item.status))
      .sort((a, b) => {
        const levelWeight = { CRITICO: 4, ALTO: 3, MEDIO: 2, BAJO: 1 };
        const scoreA = (levelWeight[a.nivel] || 0) + sourceWeight(a) + recencyWeight(a);
        const scoreB = (levelWeight[b.nivel] || 0) + sourceWeight(b) + recencyWeight(b);
        const diff = scoreB - scoreA;
        return diff || timeOf(b) - timeOf(a);
      });

    const risks = allItems.filter((item) => item.kind === "riesgo");
    const opportunities = allItems.filter((item) => item.kind === "oportunidad");
    const pendingFollowups = allItems.filter((item) => item.kind === "seguimiento");
    const criticalDecisions = allItems.filter((item) => item.kind === "decision" && (item.nivel === "CRITICO" || item.nivel === "ALTO"));
    const companies = Array.from(new Set(allItems.map((item) => item.empresa).filter(Boolean))).slice(0, 8);
    const top = allItems[0] || null;
    const lastCognitive = latestCognitive(observations);
    const lastDecision = latestDecision(decisions);

    return {
      summary: {
        text: cases.length
          ? `Hoy hay ${allItems.length} casos activos. ${top ? `Recomiendo empezar por ${top.title}.` : "No hay foco ejecutivo urgente."}`
          : `Hoy detecte ${opportunities.length} oportunidades, ${risks.length} riesgos, ${pendingFollowups.length} seguimientos y ${criticalDecisions.length} decisiones importantes. ${top ? `Recomiendo empezar por ${top.empresaPersona}.` : "No hay foco ejecutivo urgente."}`,
        top
      },
      last: {
        receivedEmail: desktop.lastEmail || null,
        cognitiveEmail: lastCognitive,
        processedEvent: eventBus.lastEvent || null,
        generatedDecision: lastDecision,
        suggestedAction: top ? top.accionSugerida : "Mantener seguimiento normal."
      },
      groups: {
        criticalDecisions,
        risks,
        opportunities,
        pendingFollowups,
        cases: caseItems,
        companies,
        allItems
      }
    };
  }

  window.GOSExecutiveDecisionCenter = {
    build,
    updateItem,
    readState,
    stateKey: STATE_KEY
  };
})();
