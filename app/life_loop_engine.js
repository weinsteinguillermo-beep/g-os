(function () {
  const LOOP_KEY = "gos:lifeLoop";
  const HISTORY_LIMIT = 20;
  const DEFAULT_INTERVAL = 15000;

  const STATES = {
    REPOSO: { label: "REPOSO", message: "❤️ Todo bajo control." },
    ATENCION: { label: "ATENCION", message: "❤️ Analizando novedades..." },
    ACCION: { label: "ACCION", message: "❤️ Preparando recomendaciones..." },
    EMERGENCIA: { label: "EMERGENCIA", message: "❤️ Detecté algo importante." }
  };

  let timer = null;
  let running = false;

  function now() {
    return new Date().toISOString();
  }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(LOOP_KEY)) || { history: [] };
    } catch (error) {
      return { history: [] };
    }
  }

  function write(state) {
    localStorage.setItem(LOOP_KEY, JSON.stringify(state));
    return state;
  }

  function secondsAgo(iso) {
    if (!iso) return "sin latidos";
    const diff = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (diff < 3) return "ahora";
    if (diff === 1) return "hace 1 segundo";
    return `hace ${diff} segundos`;
  }

  function tranquilityLabel(score) {
    if (score >= 80) return { level: "verde", text: "🟢 Todo bajo control." };
    if (score >= 50) return { level: "naranja", text: "🟠 Existen temas importantes." };
    return { level: "rojo", text: "🔴 Conviene reorganizar el día." };
  }

  function isHigh(value) {
    return value === "HIGH" || value === "Alta";
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function tomorrowKey() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  function dueFollowups(followups) {
    const today = todayKey();
    const tomorrow = tomorrowKey();
    return (followups || []).filter((followup) => {
      if (followup.estado === "Realizado" || followup.estado === "Archivado") return false;
      const due = followup.fechaSugerida || "";
      return isHigh(followup.prioridad || followup.priority) || (Boolean(due) && due <= tomorrow) || (Boolean(due) && due < today);
    });
  }

  function overdueFollowups(followups) {
    const today = todayKey();
    return (followups || []).filter((followup) => {
      return followup.estado !== "Realizado" && followup.estado !== "Archivado" && Boolean(followup.fechaSugerida) && followup.fechaSugerida < today;
    });
  }

  function recentHighObservations(observations) {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return (observations || []).filter((observation) => {
      const time = Date.parse(observation.timestamp || "");
      return isHigh(observation.priority) && (!Number.isNaN(time) ? time >= cutoff : true);
    });
  }

  function pendingDecisions(decisions) {
    return (decisions || []).filter((decision) => decision.state === "Pendiente" || decision.state === "En analisis");
  }

  function calculateTranquility(input, agenda, briefing) {
    const followups = input.seguimientos || input.followups || [];
    const observations = input.observaciones || input.observations || [];
    const decisions = input.decisiones || input.decisions || [];
    const learnings = input.aprendizajes || input.learnings || [];
    const criticalCount = (agenda || []).filter((item) => item.level === "CRITICO").length;
    const highEvents = recentHighObservations(observations).length;
    const pending = pendingDecisions(decisions).length;
    const overdue = overdueFollowups(followups).length;
    const due = dueFollowups(followups).length;
    const agendaPressure = (agenda || []).filter((item) => item.level === "ALTO" || item.level === "CRITICO").length;
    const learningPenalty = learnings.length ? 0 : 4;
    const briefingBonus = briefing && briefing.recomendacion ? 4 : 0;

    const penalty = overdue * 18 + criticalCount * 16 + highEvents * 10 + due * 7 + pending * 5 + agendaPressure * 3 + learningPenalty;
    return Math.max(0, Math.min(100, 100 - penalty + briefingBonus));
  }

  function detectState(input, agenda) {
    const followups = input.seguimientos || input.followups || [];
    const observations = input.observaciones || input.observations || [];
    const critical = (agenda || []).some((item) => item.level === "CRITICO");
    const high = recentHighObservations(observations).length > 0;
    const overdue = overdueFollowups(followups).length > 0;
    const due = dueFollowups(followups).length > 0;

    if (critical) return STATES.EMERGENCIA;
    if (high || overdue) return STATES.ACCION;
    if (due || observations.length > 0) return STATES.ATENCION;
    return STATES.REPOSO;
  }

  function summarizeFindings(input, agenda) {
    const followups = input.seguimientos || input.followups || [];
    const observations = input.observaciones || input.observations || [];
    return {
      observaciones: observations.length,
      eventosHigh: recentHighObservations(observations).length,
      seguimientosVencidos: overdueFollowups(followups).length,
      seguimientosRelevantes: dueFollowups(followups).length,
      agendaMaxima: agenda && agenda[0] ? `${agenda[0].title} (${agenda[0].level})` : "Sin agenda prioritaria"
    };
  }

  function topTitle(value) {
    if (!value) return "Sin prioridad anterior";
    return String(value).split("|")[0] || "Sin prioridad anterior";
  }

  function agendaSignature(agenda) {
    return (agenda || []).slice(0, 5).map((item) => `${item.title}:${item.decisionScore}:${item.level}`).join(">");
  }

  function countChanged(current, previous) {
    return current - (previous || 0);
  }

  function buildChange(previous, currentTop, tranquility, input, agenda) {
    const followups = input.seguimientos || input.followups || [];
    const observations = input.observaciones || input.observations || [];
    const previousFindings = previous.lastFindings || {};
    const currentFindings = summarizeFindings(input, agenda);
    const previousAgendaSignature = previous.lastAgendaSignature || "";
    const currentAgendaSignature = agendaSignature(agenda);
    const tranquilityPrevious = previous.tranquility;
    const tranquilityDelta = typeof tranquilityPrevious === "number" ? tranquility - tranquilityPrevious : 0;

    return {
      prioridadAnterior: topTitle(previous.lastTopPriority),
      prioridadNueva: topTitle(currentTop),
      prioridadCambio: Boolean(previous.lastTopPriority && previous.lastTopPriority !== currentTop),
      tranquilidadAnterior: typeof tranquilityPrevious === "number" ? tranquilityPrevious : null,
      tranquilidadNueva: tranquility,
      tranquilidadDelta: tranquilityDelta,
      nuevosSeguimientos: countChanged(dueFollowups(followups).length, previousFindings.seguimientosRelevantes),
      nuevasObservaciones: countChanged(observations.length, previousFindings.observaciones),
      agendaCambio: Boolean(previousAgendaSignature && previousAgendaSignature !== currentAgendaSignature),
      agendaFirma: currentAgendaSignature
    };
  }

  function suggestedAction(stateInfo, change) {
    if (stateInfo.label === "EMERGENCIA") return `Actuar sobre ${change.prioridadNueva}.`;
    if (change.nuevosSeguimientos > 0) return "Responder seguimiento pendiente.";
    if (change.tranquilidadDelta < 0) return "Revisar agenda y cerrar un pendiente.";
    if (change.agendaCambio) return "Revisar cambio de prioridad.";
    return "Mantener seguimiento normal.";
  }

  function executiveSummary(stateInfo, tranquility, change) {
    const deltaText = change.tranquilidadAnterior === null
      ? `Tranquilidad inicial: ${tranquility}%.`
      : change.tranquilidadDelta === 0
        ? `Tranquilidad se mantuvo en ${change.tranquilidadNueva}%.`
        : `Tranquilidad ${change.tranquilidadDelta > 0 ? "subio" : "bajo"} de ${change.tranquilidadAnterior}% a ${change.tranquilidadNueva}%.`;
    const priorityText = change.prioridadCambio
      ? `La prioridad cambio de ${change.prioridadAnterior} a ${change.prioridadNueva}.`
      : `La prioridad principal sigue siendo ${change.prioridadNueva}.`;

    return {
      estado: stateInfo.label,
      tranquilidad: `${tranquility}%`,
      temaPrincipal: change.prioridadNueva,
      cambioDetectado: `${priorityText} ${deltaText}`,
      accionSugerida: suggestedAction(stateInfo, change),
      texto: `Latido completado. ${priorityText} ${deltaText} Accion sugerida: ${suggestedAction(stateInfo, change)}`
    };
  }

  function beat(context) {
    if (running) return getState();
    running = true;
    try {
      const started = performance.now();
      const previous = read();
      const observed = context.observe ? context.observe() : [];
      const input = context.getInput();
      const triggerEvent = context.getLastEvent ? context.getLastEvent() : null;
      const graph = context.buildContext(input);
      input.contextGraph = graph;
      const agenda = context.prioritize(input);
      const briefing = context.brief(input);
      const stateInfo = detectState(input, agenda);
      const tranquility = calculateTranquility(input, agenda, briefing);
      const label = tranquilityLabel(tranquility);
      const previousTop = previous.lastTopPriority || "";
      const currentTop = agenda && agenda[0] ? `${agenda[0].title}|${agenda[0].decisionScore}|${agenda[0].level}` : "";
      const priorityChanged = Boolean(previousTop && currentTop && previousTop !== currentTop);
      const change = buildChange(previous, currentTop, tranquility, input, agenda);
      const summary = executiveSummary(stateInfo, tranquility, change);
      const duration = Math.round(performance.now() - started);
      const heartbeat = {
        id: `beat-${Date.now()}`,
        hora: now(),
        estado: stateInfo.label,
        mensaje: stateInfo.message,
        tranquilidad: tranquility,
        tranquilidadTexto: label.text,
        reviso: ["Observer Bus", "Context Engine", "Decision Engine", "Chief of Staff", "ADN Operativo"],
        disparadoPor: triggerEvent ? triggerEvent.type : "Ciclo automatico",
        encontro: summarizeFindings(input, agenda),
        cambio: change,
        resumenEjecutivo: summary,
        modifico: priorityChanged ? "Agenda Ejecutiva y Daily Briefing" : observed.length ? "Observaciones locales" : "Sin cambios relevantes",
        duracionMs: duration,
        prioridadCambio: priorityChanged
      };

      const next = {
        lastBeat: heartbeat.hora,
        state: heartbeat.estado,
        message: heartbeat.mensaje,
        tranquility,
        tranquilityText: label.text,
        tranquilityLevel: label.level,
        lastTopPriority: currentTop,
        lastChange: change,
        lastExecutiveSummary: summary,
        lastFindings: heartbeat.encontro,
        lastAgendaSignature: change.agendaFirma,
        lastBriefing: briefing,
        lastAgenda: (agenda || []).slice(0, 5),
        lastTriggerEvent: triggerEvent,
        history: [heartbeat, ...(previous.history || [])].slice(0, HISTORY_LIMIT)
      };

      write(next);
      if (context.update) context.update(next, { priorityChanged, agenda, briefing });
      return next;
    } finally {
      running = false;
    }
  }

  function start(context, options) {
    stop();
    const interval = (options && options.interval) || DEFAULT_INTERVAL;
    const first = beat(context);
    timer = window.setInterval(() => beat(context), interval);
    return first;
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function getState() {
    return read();
  }

  window.GOSLifeLoopEngine = {
    start,
    stop,
    beat,
    getState,
    secondsAgo,
    tranquilityLabel,
    states: STATES
  };
})();
