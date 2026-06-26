(function () {
  const PRIORITY_SCORE = {
    Alta: 40,
    HIGH: 40,
    Media: 22,
    MEDIUM: 22,
    LOW: 8,
    Baja: 8
  };

  const STATUS_BLOCKERS = [
    "pendiente",
    "falta",
    "bloque",
    "tranc",
    "riesgo",
    "sin definir"
  ];

  function normalizeText(value) {
    return String(value || "").toLowerCase();
  }

  function manualPriorityScore(priority) {
    return PRIORITY_SCORE[priority] || 10;
  }

  function urgencyScore(item) {
    const text = normalizeText([
      item.context,
      item.recommendation,
      item.status,
      item.lastActivity,
      item.text
    ].join(" "));

    if (text.includes("urgente") || text.includes("hoy")) return 35;
    if (text.includes("pendiente") || text.includes("falta")) return 24;
    if (text.includes("incubadora")) return 8;
    return 14;
  }

  function economicImpactScore(item) {
    const text = normalizeText([
      item.name,
      item.context,
      item.recommendation,
      item.status,
      item.lastActivity,
      item.text
    ].join(" "));

    const signals = [
      "comercial",
      "venta",
      "cliente",
      "margen",
      "stock",
      "mercado",
      "forestal",
      "gb",
      "uruforest",
      "outdoor"
    ];

    return signals.reduce((score, signal) => {
      return score + (text.includes(signal) ? 8 : 0);
    }, 0);
  }

  function blockerCount(item) {
    const text = normalizeText([
      item.context,
      item.recommendation,
      item.status,
      item.lastActivity,
      item.text
    ].join(" "));

    return STATUS_BLOCKERS.reduce((count, signal) => {
      return count + (text.includes(signal) ? 1 : 0);
    }, 0);
  }

  function movementScore(item) {
    const text = normalizeText([
      item.status,
      item.lastActivity,
      item.updatedAt,
      item.createdAt
    ].join(" "));

    if (text.includes("pendiente") || text.includes("incubadora")) return 18;
    if (!item.updatedAt && !item.createdAtIso) return 12;
    return 5;
  }

  function scoreItem(item) {
    const blocks = blockerCount(item);
    return (
      urgencyScore(item) +
      economicImpactScore(item) +
      movementScore(item) +
      blocks * 14 +
      manualPriorityScore(item.priority)
    );
  }

  function rank(items) {
    return items
      .map((item) => ({ ...item, chiefScore: scoreItem(item) }))
      .sort((a, b) => b.chiefScore - a.chiefScore);
  }

  function relationBoost(item, graph) {
    if (!graph || !graph.links || !graph.nodes) return 0;
    const id = item.id || item.name || item.context || item.text;
    const node = graph.nodes.find((candidate) => {
      return candidate.id === id || candidate.title === item.name || candidate.title === item.context || candidate.title === item.text;
    });
    if (!node) return 0;

    const connectionCount = graph.links.filter((link) => link.from === node.id || link.to === node.id).length;
    return Math.min(connectionCount * 4, 24);
  }

  function rankWithContext(items, graph) {
    return items
      .map((item) => ({
        ...item,
        chiefScore: scoreItem(item) + relationBoost(item, graph)
      }))
      .sort((a, b) => b.chiefScore - a.chiefScore);
  }

  function buildRisk(item) {
    if (item.risk) return item.risk;

    const name = item.name || item.context || item.text || "Tema sin nombre";
    const text = normalizeText(name);

    if (text.includes("automat")) return "Automatizar antes de cerrar el flujo operativo.";
    if (text.includes("outdoor")) return "Avanzar con producto sin validar margen, demanda y proveedor.";
    if (text.includes("uruforest")) return "Abrir plan comercial sin prioridad ni responsable claro.";
    if (text.includes("mercado forestal")) return "Demorar la definicion del primer modulo operativo.";
    return "Mantener el tema pendiente puede frenar una decision importante.";
  }

  function buildOpportunity(ideas, projects) {
    const rankedIdeas = rank(ideas.filter((idea) => idea.status !== "Archivada"));
    const rankedProjects = rank(projects);
    const bestIdea = rankedIdeas[0];
    const bestProject = rankedProjects[0];

    if (bestIdea) return `Convertir idea en proximo paso: ${bestIdea.text}`;
    if (bestProject) return `Desbloquear avance en ${bestProject.name}.`;
    return "Usar el briefing para elegir un foco ejecutivo unico.";
  }

  function buildRecommendation(decisions, projects) {
    const mainDecision = decisions[0];
    const mainProject = projects[0];

    if (mainDecision) {
      return `Recomiendo resolver primero: ${mainDecision.context}`;
    }

    if (mainProject) {
      return `Recomiendo poner foco en ${mainProject.name} y definir su proximo paso.`;
    }

    return "Recomiendo mantener el dia simple: una decision, una idea y un proximo paso.";
  }

  function buildRecommendationFromAgenda(agenda) {
    const first = agenda && agenda[0];
    if (!first) return null;
    return `Recomiendo atender primero: ${first.title}. ${first.recommendedAction}`;
  }

  function buildRecommendationFromCases(cases) {
    const first = cases && cases[0];
    if (!first) return null;
    return `Recomiendo resolver primero el caso ${first.titulo}: ${first.recommendation}`;
  }

  function observationScore(observation) {
    return scoreItem({
      context: observation.title,
      recommendation: observation.description,
      priority: observation.priority,
      status: observation.type,
      lastActivity: observation.entity
    });
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("es-UY", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date || new Date());
  }

  function generateDailyBriefing(input) {
    const ideas = input.ideas || [];
    const projects = input.proyectos || input.projects || [];
    const decisions = input.decisiones || input.decisions || [];
    const aprendizajes = input.aprendizajes || input.learnings || [];
    const observations = input.observaciones || input.observations || [];
    const cases = input.casos || input.cases || [];
    const eventBus = window.GOSEventBus ? window.GOSEventBus.getState() : null;
    const contextGraph = input.contextGraph || null;
    const executiveAgenda = window.GOSDecisionEngine
      ? window.GOSDecisionEngine.buildExecutiveAgenda(input)
      : [];

    const visibleCases = cases.slice(0, 3);

    const agendaDecisions = executiveAgenda
      .filter((item) => item.type === "decision" || item.type === "caso")
      .slice(0, 3)
      .map((item) => ({
        ...item.source,
        chiefScore: item.decisionScore,
        decisionScore: item.decisionScore,
        level: item.level,
        reason: item.reason,
        recommendedAction: item.recommendedAction
      }));

    const visibleDecisions = visibleCases.length ? visibleCases.map((caso) => ({
      id: caso.id,
      context: `${caso.titulo}: ${caso.lastMovement || caso.tipo}`,
      priority: caso.prioridad,
      recommendation: caso.recommendation,
      state: caso.estado,
      decisionScore: caso.score,
      level: caso.level
    })) : agendaDecisions.length ? agendaDecisions : rankWithContext(
      decisions.filter((decision) => decision.state !== "Archivada"),
      contextGraph
    ).slice(0, 3);

    const visibleProjects = rankWithContext(projects, contextGraph).slice(0, 3);
    const visibleObservations = observations
      .map((observation) => ({ ...observation, chiefScore: observationScore(observation) }))
      .sort((a, b) => b.chiefScore - a.chiefScore)
      .slice(0, 3);
    const riskSource = visibleCases.length ? visibleCases.filter((caso) => (caso.riesgos || []).length).slice(0, 2) : rankWithContext([...visibleDecisions, ...visibleProjects, ...visibleObservations], contextGraph).slice(0, 2);
    const risks = visibleCases.length ? riskSource.flatMap((caso) => (caso.riesgos || []).slice(0, 1)).slice(0, 2) : riskSource.map(buildRisk).slice(0, 2);
    const opportunities = visibleCases.length
      ? visibleCases.flatMap((caso) => (caso.oportunidades || []).slice(0, 1)).slice(0, 1)
      : [buildOpportunity(ideas, projects)].filter(Boolean).slice(0, 1);
    const recomendacion = buildRecommendationFromCases(visibleCases) || buildRecommendationFromAgenda(executiveAgenda) || buildRecommendation(visibleDecisions, visibleProjects);

    return {
      fecha: formatDate(),
      saludo: "Buenos dias Guillermo.",
      resumen: visibleCases.length
        ? `Hoy encontre ${visibleCases.length} casos importantes, ${risks.length} riesgos y ${opportunities.length} oportunidad.`
        : `Hoy encontre ${visibleDecisions.length} decisiones, ${risks.length} riesgos y ${opportunities.length} oportunidad.`,
      decisionPrincipal: visibleDecisions[0] || null,
      decisiones: visibleDecisions,
      casos: visibleCases,
      riesgos: risks,
      oportunidades: opportunities,
      proyectos: visibleProjects,
      observaciones: visibleObservations,
      agendaEjecutiva: executiveAgenda.slice(0, 5),
      aprendizajes: aprendizajes.slice(-3),
      pipeline: eventBus ? {
        ultimoEvento: eventBus.lastEvent || null,
        ultimoProcesado: eventBus.lastProcessedId || null,
        totalEventos: (eventBus.events || []).length
      } : null,
      recomendacion
    };
  }

  window.GOSChiefOfStaff = {
    generateDailyBriefing,
    scoreItem
  };
})();
