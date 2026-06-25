(function () {
  const LIFE_KEY = "gos:lifeEngine";

  function readLife() {
    try {
      return JSON.parse(localStorage.getItem(LIFE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function writeLife(state) {
    localStorage.setItem(LIFE_KEY, JSON.stringify(state));
    return state;
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function detectForgottenProjects(projects) {
    return (projects || [])
      .filter((project) => {
        const text = `${project.status || ""} ${project.lastActivity || ""}`.toLowerCase();
        return text.includes("pendiente") || text.includes("falta") || text.includes("incubadora");
      })
      .slice(0, 3);
  }

  function detectOldDecisions(decisions) {
    return (decisions || [])
      .filter((decision) => decision.state === "Pendiente" || decision.state === "En analisis")
      .slice(0, 3);
  }

  function messageOfTheDay(briefing) {
    const decision = briefing.decisionPrincipal;
    if (decision) return `Hoy conviene resolver: ${decision.context}`;
    if (briefing.proyectos && briefing.proyectos[0]) return `Hoy conviene mover: ${briefing.proyectos[0].name}`;
    return "Hoy conviene mantener G-OS simple: una decision, una idea y un proximo paso.";
  }

  function MorningRoutine(input) {
    const clock = window.GOSSystemClock.markOpen();
    const briefing = window.GOSChiefOfStaff.generateDailyBriefing(input);
    const forgottenProjects = detectForgottenProjects(input.proyectos || input.projects || []);
    const oldDecisions = detectOldDecisions(input.decisiones || input.decisions || []);
    const state = readLife();

    state.today = todayKey();
    state.lastRoutine = "morning";
    state.lastBriefing = briefing;
    state.forgottenProjects = forgottenProjects;
    state.oldDecisions = oldDecisions;
    state.messageOfTheDay = messageOfTheDay(briefing);
    state.lastSync = clock.lastSync;
    writeLife(state);

    return {
      briefing,
      forgottenProjects,
      oldDecisions,
      messageOfTheDay: state.messageOfTheDay,
      clock
    };
  }

  function DayRoutine(event) {
    const state = readLife();
    state.today = todayKey();
    state.lastRoutine = "day";
    state.lastEvent = {
      type: event.type,
      at: new Date().toISOString()
    };
    state.lastSync = state.lastEvent.at;
    writeLife(state);
    return state;
  }

  function NightRoutine(input) {
    const clock = window.GOSSystemClock.markClose();
    const decisions = input.decisiones || input.decisions || [];
    const ideas = input.ideas || [];
    const aprendizajes = input.aprendizajes || input.learnings || [];
    const approved = decisions.filter((decision) => decision.state === "Aprobada").slice(0, 3);
    const pending = decisions
      .filter((decision) => decision.state === "Pendiente" || decision.state === "En analisis")
      .slice(0, 3);
    const captured = ideas.filter((idea) => idea.status !== "Archivada").slice(-3);

    const summary = {
      decisionesTomadas: approved,
      ideasCapturadas: captured,
      pendientesManana: pending,
      aprendizaje: aprendizajes[aprendizajes.length - 1] || "",
      prepararManana: pending[0]
        ? `Retomar decision: ${pending[0].context}`
        : "Abrir briefing y elegir foco ejecutivo."
    };

    const state = readLife();
    state.today = todayKey();
    state.lastRoutine = "night";
    state.nightSummary = summary;
    state.lastSync = clock.lastSync;
    writeLife(state);

    return {
      summary,
      clock
    };
  }

  function getState() {
    return readLife();
  }

  window.GOSLifeEngine = {
    MorningRoutine,
    DayRoutine,
    NightRoutine,
    getState
  };
})();

