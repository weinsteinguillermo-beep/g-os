(function () {
  const data = window.GOS_DATA;
  const ideaKey = "gos:mvp:ideas";
  const decisionKey = "gos:mvp:decisions";
  const createdDecisionKey = "gos:mvp:createdDecisions";
  const followupKey = "gos:mvp:followups";
  const missionKey = "gos:mvp:lastMission";
  const learningKey = "gos:mvp:dailyLearning";
  const demoFlag = "demo-gos-v01";

  const todayLabel = document.getElementById("todayLabel");
  const dailyRecommendation = document.getElementById("dailyRecommendation");
  const dailyQuestion = document.getElementById("dailyQuestion");
  const briefingGrid = document.getElementById("briefingGrid");
  const heartStateLabel = document.getElementById("heartStateLabel");
  const heartBeatLabel = document.getElementById("heartBeatLabel");
  const heartMessage = document.getElementById("heartMessage");
  const tranquilityLabel = document.getElementById("tranquilityLabel");
  const tranquilityScore = document.getElementById("tranquilityScore");
  const heartSummary = document.getElementById("heartSummary");
  const beatNow = document.getElementById("beatNow");
  const beatStatus = document.getElementById("beatStatus");
  const heartChangeGrid = document.getElementById("heartChangeGrid");
  const heartHistoryList = document.getElementById("heartHistoryList");
  const projectsList = document.getElementById("projectsList");
  const decisionsList = document.getElementById("decisionsList");
  const executiveAgendaList = document.getElementById("executiveAgendaList");
  const codexList = document.getElementById("codexList");
  const ideaInput = document.getElementById("ideaInput");
  const ideaStatus = document.getElementById("ideaStatus");
  const ideasList = document.getElementById("ideasList");
  const missionStatus = document.getElementById("missionStatus");
  const missionPrompt = document.getElementById("missionPrompt");
  const closeDayGrid = document.getElementById("closeDayGrid");
  const dataStatus = document.getElementById("dataStatus");
  const importFile = document.getElementById("importFile");
  const dailyLearning = document.getElementById("dailyLearning");
  const closeStatus = document.getElementById("closeStatus");
  const lastSyncLabel = document.getElementById("lastSyncLabel");
  const contextSelect = document.getElementById("contextSelect");
  const contextGrid = document.getElementById("contextGrid");
  const contextSummary = document.getElementById("contextSummary");
  const dnaGrid = document.getElementById("dnaGrid");
  const dnaSearch = document.getElementById("dnaSearch");
  const dnaSearchResult = document.getElementById("dnaSearchResult");
  const companyTimeline = document.getElementById("companyTimeline");
  const liveType = document.getElementById("liveType");
  const liveTitle = document.getElementById("liveTitle");
  const liveText = document.getElementById("liveText");
  const liveResult = document.getElementById("liveResult");
  const outlookStatus = document.getElementById("outlookStatus");
  const outlookClientId = document.getElementById("outlookClientId");
  const outlookTenantId = document.getElementById("outlookTenantId");
  const outlookRedirectUri = document.getElementById("outlookRedirectUri");
  const outlookResult = document.getElementById("outlookResult");
  let lastDnaAnswer = null;
  const observerBus = window.GOSObserverBus.create([
    window.GOSGmailConnector,
    window.GOSCalendarConnector,
    window.GOSAirtableConnector,
    window.GOSWhatsAppConnector,
    window.GOSDriveConnector
  ]);

  function getOutlookModules() {
    return {
      config: window.GOSMicrosoftGraphConfig || null,
      auth: window.GOSMicrosoftGraphAuth || null,
      connector: window.GOSOutlookRealConnector || null
    };
  }

  function isOutlookAvailable() {
    const modules = getOutlookModules();
    return Boolean(modules.config && modules.auth && modules.connector);
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("es-UY", {
      weekday: "short",
      day: "numeric",
      month: "short"
    }).format(date || new Date());
  }

  function timestamp() {
    return new Date().toISOString();
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function isDemo(item) {
    return item && (item.demo === true || item.demoId === demoFlag || (item.metadata && item.metadata.demoId === demoFlag));
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  function getIdeas() {
    const ideas = loadJson(ideaKey, []);
    let changed = false;
    const normalized = ideas.map((idea, index) => {
      if (idea.id) return idea;
      changed = true;
      return {
        ...idea,
        id: "idea-migrated-" + index + "-" + Date.now()
      };
    });
    if (changed) saveIdeas(normalized);
    return normalized;
  }

  function saveIdeas(ideas) {
    saveJson(ideaKey, ideas);
  }

  function getDecisions() {
    const stored = loadJson(decisionKey, {});
    const baseDecisions = data.decisions.map((decision) => ({
      ...decision,
      state: "Pendiente",
      ...stored[decision.id]
    }));
    const created = loadJson(createdDecisionKey, []).map((decision) => ({
      ...decision,
      state: decision.state || "Pendiente",
      ...stored[decision.id]
    }));
    return [...created, ...baseDecisions];
  }

  function saveDecision(decision) {
    const stored = loadJson(decisionKey, {});
    stored[decision.id] = {
      context: decision.context,
      recommendation: decision.recommendation,
      priority: decision.priority,
      state: decision.state,
      updatedAt: timestamp()
    };
    saveJson(decisionKey, stored);
  }

  function getLearnings() {
    const learning = localStorage.getItem(learningKey);
    return learning ? [learning] : [];
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function tomorrowKey() {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  function getFollowups() {
    return loadJson(followupKey, []).map((followup) => ({
      prioridad: followup.prioridad || followup.priority || "MEDIUM",
      estado: followup.estado || "Pendiente",
      notas: followup.notas || [],
      ...followup
    }));
  }

  function saveFollowups(followups) {
    saveJson(followupKey, followups);
  }

  function getRelevantFollowups() {
    const today = todayKey();
    const tomorrow = tomorrowKey();
    return getFollowups()
      .filter((followup) => followup.estado !== "Realizado" && followup.estado !== "Archivado")
      .filter((followup) => {
        const due = followup.fechaSugerida || "";
        const high = followup.prioridad === "HIGH" || followup.priority === "HIGH" || followup.prioridad === "Alta";
        return high || (Boolean(due) && due <= tomorrow) || (Boolean(due) && due < today);
      })
      .sort((a, b) => {
        const highA = a.prioridad === "HIGH" || a.priority === "HIGH" ? 1 : 0;
        const highB = b.prioridad === "HIGH" || b.priority === "HIGH" ? 1 : 0;
        if (highA !== highB) return highB - highA;
        return String(a.fechaSugerida || "").localeCompare(String(b.fechaSugerida || ""));
      })
      .slice(0, 4);
  }

  function getEngineInput() {
    return {
      ideas: getIdeas(),
      proyectos: data.projects,
      decisiones: getDecisions(),
      aprendizajes: getLearnings(),
      seguimientos: getFollowups(),
      observaciones: observerBus.getObservations(),
      adn: window.GOSOperationalDNA ? window.GOSOperationalDNA.buildSnapshot() : null
    };
  }

  function getContextGraph() {
    return window.GOSContextEngine.buildGraph(getEngineInput());
  }

  function getExecutiveAgenda() {
    const input = getEngineInput();
    input.contextGraph = getContextGraph();
    return window.GOSDecisionEngine.buildExecutiveAgenda(input);
  }

  function getLoopContext() {
    return {
      observe: () => observerBus.checkUpdates(),
      getInput: getEngineInput,
      buildContext: (input) => window.GOSContextEngine.buildGraph(input),
      prioritize: (input) => window.GOSDecisionEngine.buildExecutiveAgenda(input),
      brief: (input) => window.GOSChiefOfStaff.generateDailyBriefing(input),
      update: (state, result) => {
        updateHeartStatus(state);
        renderHeartHistory();
        if (result.priorityChanged) {
          renderBriefing();
          renderExecutiveAgenda();
        }
      }
    };
  }

  function updateSystemStatus(clockState) {
    const state = clockState || window.GOSSystemClock.read();
    lastSyncLabel.textContent = window.GOSSystemClock.formatSync(state.lastSync);
  }

  function updateHeartStatus(loopState) {
    const state = loopState || window.GOSLifeLoopEngine.getState();
    heartStateLabel.textContent = "❤️ G-OS ACTIVO";
    heartBeatLabel.textContent = window.GOSLifeLoopEngine.secondsAgo(state.lastBeat);
    heartMessage.textContent = state.message || "❤️ Todo bajo control.";
    tranquilityScore.textContent = state.tranquility !== undefined ? state.tranquility : 100;
    tranquilityLabel.textContent = state.tranquilityText || "🟢 Todo bajo control.";
    heartSummary.textContent = state.lastExecutiveSummary ? state.lastExecutiveSummary.texto : "Latido listo.";
    renderHeartChange(state);
    document.body.dataset.heartState = String(state.state || "REPOSO").toLowerCase();
  }

  function renderHeartChange(loopState) {
    const state = loopState || window.GOSLifeLoopEngine.getState();
    const change = state.lastChange || {};
    const summary = state.lastExecutiveSummary || {};
    const rows = [
      ["Estado", summary.estado || state.state || "REPOSO"],
      ["Tranquilidad", summary.tranquilidad || `${state.tranquility !== undefined ? state.tranquility : 100}%`],
      ["Tema principal", summary.temaPrincipal || change.prioridadNueva || "Sin prioridad"],
      ["Cambio detectado", summary.cambioDetectado || "Sin cambios registrados."],
      ["Accion sugerida", summary.accionSugerida || "Mantener seguimiento normal."]
    ];

    heartChangeGrid.innerHTML = "";
    rows.forEach(([label, value]) => {
      const card = makeElement("article", "brief-card heart-change-card");
      card.appendChild(makeElement("h3", null, label));
      card.appendChild(makeElement("p", null, value));
      heartChangeGrid.appendChild(card);
    });
  }

  function beatNowAction() {
    beatStatus.textContent = "Latido en curso...";
    delete beatStatus.dataset.error;
    try {
      const state = window.GOSLifeLoopEngine.beat(getLoopContext());
      renderBriefing();
      renderExecutiveAgenda();
      renderDna();
      updateHeartStatus(state);
      renderHeartHistory();
      beatStatus.textContent = state.lastExecutiveSummary ? state.lastExecutiveSummary.texto : "Latido completado.";
      window.setTimeout(() => {
        if (beatStatus.textContent) beatStatus.textContent = "";
      }, 3500);
    } catch (error) {
      beatStatus.textContent = "No pude completar el latido. Revisar datos locales.";
      beatStatus.dataset.error = error && error.message ? error.message : "Error desconocido";
      console.error(error);
    }
  }

  function runDayRoutine(type) {
    const state = window.GOSLifeEngine.DayRoutine({ type });
    updateSystemStatus({ lastSync: state.lastSync });
  }

  function renderLiveResult(detected, briefing) {
    liveResult.innerHTML = "";
    const card = makeElement("article", "row-card");
    const items = [
      ["Que detecto G-OS", `${detected.type}: ${liveTitle.value || "Evento sin titulo"}`],
      ["Proyecto relacionado", detected.project],
      ["Prioridad", detected.priority],
      ["Recomendacion Chief of Staff", detected.recommendation],
      ["Aparece en briefing", detected.shouldAppearInBriefing ? "Si" : "No"]
    ];

    items.forEach(([label, value]) => {
      card.appendChild(makeElement("p", "section-label", label));
      card.appendChild(makeElement("p", null, value));
    });

    if (briefing && briefing.recomendacion) {
      card.appendChild(makeElement("p", "section-label", "Briefing actualizado"));
      card.appendChild(makeElement("p", null, briefing.recomendacion));
    }

    liveResult.appendChild(card);
  }

  function loadOutlookConfig() {
    const modules = getOutlookModules();
    if (!modules.config) {
      if (outlookStatus) outlookStatus.textContent = "Outlook no configurado. G-OS sigue activo.";
      return;
    }

    const config = modules.config.getConfig();
    outlookClientId.value = config.clientId || "";
    outlookTenantId.value = config.tenantId || "organizations";
    outlookRedirectUri.value = config.redirectUri || modules.config.defaultRedirectUri();
  }

  function saveOutlookConfig() {
    const modules = getOutlookModules();
    if (!modules.config) {
      renderOutlookStatus("Modulo Outlook no disponible. G-OS sigue activo.");
      return null;
    }

    const config = modules.config.saveConfig({
      clientId: outlookClientId.value,
      tenantId: outlookTenantId.value,
      redirectUri: outlookRedirectUri.value
    });
    renderOutlookStatus("Configuracion Outlook guardada.");
    return config;
  }

  function renderOutlookStatus(message) {
    const modules = getOutlookModules();
    const connected = Boolean(modules.auth && modules.auth.isConnected());
    const configured = Boolean(modules.config && modules.config.isConfigured());
    const base = connected ? "Outlook conectado." : configured ? "Outlook configurado, pendiente de conexion." : "Outlook desconectado.";
    outlookStatus.textContent = message || base;
    document.body.dataset.outlook = connected ? "connected" : "disconnected";
  }

  function renderOutlookResult(emails, observations) {
    outlookResult.innerHTML = "";
    const card = makeElement("article", "row-card");
    card.appendChild(makeElement("p", "section-label", "Correos detectados"));
    card.appendChild(makeElement("p", null, `${emails.length} correos leidos. ${observations.length} observaciones generadas.`));

    const list = makeElement("ul");
    observations.slice(0, 10).forEach((observation) => {
      const from = observation.metadata && observation.metadata.from ? observation.metadata.from : {};
      list.appendChild(makeElement("li", null, `${observation.priority}: ${observation.entity} | ${observation.title} | ${from.name || from.address || "sin remitente"}`));
    });
    if (!observations.length) list.appendChild(makeElement("li", null, "Sin correos nuevos para convertir en observaciones."));
    card.appendChild(list);
    outlookResult.appendChild(card);
  }

  async function connectOutlook() {
    const modules = getOutlookModules();
    if (!modules.auth || !modules.config) {
      renderOutlookStatus("Modulo Outlook no disponible. G-OS sigue activo.");
      return;
    }

    try {
      saveOutlookConfig();
      outlookStatus.textContent = "Redirigiendo a Microsoft para autorizar Mail.Read...";
      await modules.auth.loginOutlook();
    } catch (error) {
      outlookStatus.textContent = error.message || "No se pudo iniciar conexion Outlook.";
    }
  }

  function disconnectOutlook() {
    const modules = getOutlookModules();
    if (modules.auth) modules.auth.logoutOutlook();
    renderOutlookStatus("Outlook desconectado. No se conservaron tokens de sesion.");
  }

  async function readOutlookEmails() {
    const modules = getOutlookModules();
    if (!modules.auth || !modules.connector) {
      renderOutlookStatus("Modulo Outlook no disponible. G-OS sigue activo.");
      return;
    }

    if (!modules.auth.isConnected()) {
      renderOutlookStatus("Outlook no esta conectado. Primero autorizar Mail.Read.");
      return;
    }

    outlookStatus.textContent = "Leyendo ultimos correos...";
    try {
      const emails = await modules.connector.readLatestEmails(10);
      const observations = emails.map((email) => {
        const observation = modules.connector.emitObservationFromEmail(email);
        return observerBus.recordObservation(observation);
      });
      renderOutlookResult(emails, observations);
      renderOutlookStatus(`${observations.length} observaciones Outlook generadas.`);
      runDayRoutine("outlook");
      const loopState = window.GOSLifeLoopEngine.beat(getLoopContext());
      renderAll();
      updateHeartStatus(loopState);
    } catch (error) {
      outlookStatus.textContent = error.message || "No se pudieron leer correos Outlook.";
    }
  }

  function handleOutlookRedirect() {
    const modules = getOutlookModules();
    if (!modules.auth) return;

    modules.auth.handleRedirectCallback()
      .then((token) => {
        if (!token) return;
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        url.searchParams.delete("session_state");
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
        renderOutlookStatus("Outlook conectado. Ya podes leer ultimos correos.");
      })
      .catch((error) => {
        outlookStatus.textContent = error.message || "No se pudo completar login Outlook.";
      });
  }

  function renderDnaSearchResult(answer) {
    lastDnaAnswer = answer;
    dnaSearchResult.innerHTML = "";
    const card = makeElement("article", "row-card");
    [
      ["Resultado encontrado", answer.resultadoEncontrado],
      ["Contexto", answer.contexto],
      ["Ultimo movimiento", answer.ultimoMovimiento],
      ["Recomendacion", answer.recomendacion],
      ["Proximo paso", answer.proximoPaso]
    ].forEach(([label, value]) => {
      card.appendChild(makeElement("p", "section-label", label));
      card.appendChild(makeElement("p", null, value));
    });

    const actions = makeElement("div", "button-row dna-actions");
    actions.appendChild(makeAction("Crear decision", "primary-button compact", () => createDecisionFromDna(answer)));
    actions.appendChild(makeAction("Preparar Codex", "secondary-button compact", () => prepareCodexFromDna(answer)));
    actions.appendChild(makeAction("Agregar al briefing", "secondary-button compact", () => addDnaToBriefing(answer)));
    actions.appendChild(makeAction("Crear seguimiento", "secondary-button compact", () => createFollowupFromDna(answer)));
    actions.appendChild(makeAction("Archivar", "ghost-button compact", () => archiveDnaAnswer()));
    card.appendChild(actions);

    dnaSearchResult.appendChild(card);
  }

  function createDecisionFromDna(answer) {
    const decisions = loadJson(createdDecisionKey, []);
    const decision = {
      id: "dna-decision-" + Date.now(),
      priority: answer.prioridadSugerida || "Media",
      context: `${answer.titulo || answer.resultadoEncontrado}. ${answer.contexto}`,
      recommendation: answer.recomendacion,
      state: "Pendiente",
      title: answer.titulo || answer.resultadoEncontrado,
      project: answer.proyectoRelacionado || "General",
      origin: "ADN",
      createdAt: timestamp()
    };
    decisions.unshift(decision);
    saveJson(createdDecisionKey, decisions);
    window.GOSSystemClock.markDecision();
    runDayRoutine("dna_decision");
    renderAll();
    renderDnaSearchResult(answer);
    setDataStatus("Decision creada desde ADN.");
  }

  function prepareCodexFromDna(answer) {
    const prompt = [
      "MISION PARA CODEX - ORIGEN ADN",
      "",
      "Contexto recuperado:",
      `${answer.resultadoEncontrado}. ${answer.contexto}`,
      "",
      "Objetivo:",
      answer.proximoPaso,
      "",
      "Entregables:",
      "- Analisis breve del contexto.",
      "- Recomendacion ejecutiva.",
      "- Proximo paso accionable.",
      "",
      "Restricciones:",
      "- Sin APIs nuevas.",
      "- Sin backend.",
      "- Mantener la solucion simple y usable desde iPhone.",
      "- No inventar datos fuera del contexto disponible.",
      "",
      "Criterio de aprobacion:",
      "Guillermo debe poder decidir o redirigir la accion en menos de 2 minutos."
    ].join("\n");
    localStorage.setItem(missionKey, prompt);
    missionPrompt.textContent = prompt;
    missionStatus.textContent = "Mision Codex preparada desde ADN.";
    activatePanel("codex");
  }

  function addDnaToBriefing(answer) {
    observerBus.recordObservation({
      id: "dna-briefing-" + Date.now(),
      source: "adn",
      type: "briefing",
      entity: answer.proyectoRelacionado || "General",
      title: answer.titulo || answer.resultadoEncontrado,
      description: `${answer.contexto} Proximo paso: ${answer.proximoPaso}`,
      priority: answer.prioridadSugerida === "Alta" ? "HIGH" : "MEDIUM",
      timestamp: timestamp(),
      metadata: {
        origin: "ADN",
        shouldAppearInBriefing: true
      }
    });
    runDayRoutine("dna_briefing");
    renderAll();
    renderDnaSearchResult(answer);
    setDataStatus("Tema agregado al briefing.");
  }

  function createFollowupFromDna(answer) {
    const followups = loadJson(followupKey, []);
    followups.unshift({
      id: "followup-" + Date.now(),
      personaEmpresa: answer.titulo || answer.resultadoEncontrado,
      motivo: answer.proximoPaso,
      fechaSugerida: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      proyectoRelacionado: answer.proyectoRelacionado || "General",
      prioridad: answer.prioridadSugerida === "Alta" ? "HIGH" : "MEDIUM",
      estado: "Pendiente",
      origen: "ADN",
      createdAt: timestamp()
    });
    saveJson(followupKey, followups);
    runDayRoutine("dna_followup");
    renderAll();
    renderDnaSearchResult(answer);
    setDataStatus("Seguimiento creado.");
  }

  function archiveDnaAnswer() {
    lastDnaAnswer = null;
    dnaSearchResult.innerHTML = "";
    setDataStatus("Respuesta archivada.");
  }

  function processLiveEvent() {
    const title = liveTitle.value.trim();
    const description = liveText.value.trim();

    if (!title && !description) {
      liveText.focus();
      return;
    }

    const processed = window.GOSLiveInput.processEvent({
      type: liveType.value,
      title,
      description
    });

    observerBus.recordObservation(processed.observation);
    runDayRoutine("live_input");
    renderAll();

    const input = getEngineInput();
    input.contextGraph = getContextGraph();
    const briefing = window.GOSChiefOfStaff.generateDailyBriefing(input);
    renderLiveResult(processed.detected, briefing);

    liveTitle.value = "";
    liveText.value = "";
  }

  function renderBriefing() {
    const input = getEngineInput();
    input.contextGraph = getContextGraph();
    const briefing = window.GOSChiefOfStaff.generateDailyBriefing(input);

    dailyRecommendation.textContent = briefing.recomendacion;
    dailyQuestion.textContent = briefing.resumen;
    todayLabel.textContent = briefing.fecha;
    briefingGrid.innerHTML = "";

    [
      {
        title: "Decisiones",
        items: briefing.decisiones.map((decision) => `${decision.priority}: ${decision.context}`)
      },
      {
        title: "Agenda ejecutiva",
        items: (briefing.agendaEjecutiva || []).map((item) => `${item.position}. ${item.project}: ${item.level}`)
      },
      {
        title: "Seguimientos de hoy",
        custom: true,
        items: getRelevantFollowups()
      },
      {
        title: "Proyectos importantes",
        items: briefing.proyectos.map((project) => `${project.name}: ${project.status}`)
      },
      { title: "Riesgos", items: briefing.riesgos },
      { title: "Oportunidades", items: briefing.oportunidades },
      {
        title: "Observaciones",
        items: (briefing.observaciones || []).map((observation) => `${observation.source}: ${observation.title}`)
      }
    ].forEach((section) => {
      if (section.custom && section.title === "Seguimientos de hoy") {
        renderFollowupsBriefCard(section.items);
        return;
      }
      renderBriefCard(section);
    });
    renderHeartHistory();
  }

  function renderHeartHistory() {
    const state = window.GOSLifeLoopEngine.getState();
    const history = state.history || [];
    heartHistoryList.innerHTML = "";

    if (!history.length) {
      heartHistoryList.appendChild(makeElement("p", "status-note", "Sin latidos registrados todavia."));
      return;
    }

    history.slice(0, 20).forEach((beat) => {
      const item = makeElement("article", "row-card heartbeat-row");
      item.appendChild(makeElement("p", "section-label", `${beat.estado} | ${window.GOSSystemClock.formatSync(beat.hora)}`));
      item.appendChild(makeElement("p", null, beat.mensaje));
      item.appendChild(makeElement("p", "muted", `${beat.tranquilidadTexto} Indice: ${beat.tranquilidad}`));
      item.appendChild(makeElement("p", "muted", `Reviso: ${beat.reviso.join(", ")}`));
      item.appendChild(makeElement("p", "muted", `Encontro: ${beat.encontro.agendaMaxima}`));
      item.appendChild(makeElement("p", "muted", `Modifico: ${beat.modifico}. Duracion: ${beat.duracionMs}ms`));
      heartHistoryList.appendChild(item);
    });
  }

  function renderFollowupsBriefCard(followups) {
    const card = makeElement("article", "brief-card followup-card");
    card.appendChild(makeElement("h3", null, "Seguimientos de hoy"));

    if (!followups.length) {
      const list = makeElement("ul");
      list.appendChild(makeElement("li", null, "Sin seguimientos relevantes."));
      card.appendChild(list);
      briefingGrid.appendChild(card);
      return;
    }

    followups.forEach((followup) => {
      const item = makeElement("div", "followup-item");
      item.appendChild(makeElement("p", null, `${followup.personaEmpresa} | ${followup.prioridad || "MEDIUM"}`));
      item.appendChild(makeElement("p", "muted", `${followup.motivo} · ${followup.proyectoRelacionado} · ${followup.fechaSugerida}`));
      const actions = makeElement("div", "button-row followup-actions");
      actions.appendChild(makeAction("Realizado", "primary-button compact", () => markFollowupDone(followup.id)));
      actions.appendChild(makeAction("Reprogramar", "secondary-button compact", () => reprogramFollowup(followup.id)));
      actions.appendChild(makeAction("Codex", "secondary-button compact", () => createCodexFromFollowup(followup)));
      actions.appendChild(makeAction("Nota", "ghost-button compact", () => addNoteToFollowup(followup.id)));
      item.appendChild(actions);
      card.appendChild(item);
    });

    briefingGrid.appendChild(card);
  }

  function updateFollowup(id, updater) {
    const followups = getFollowups().map((followup) => {
      if (followup.id !== id) return followup;
      return {
        ...followup,
        ...updater(followup),
        updatedAt: timestamp()
      };
    });
    saveFollowups(followups);
    runDayRoutine("followup");
    renderAll();
  }

  function markFollowupDone(id) {
    updateFollowup(id, () => ({
      estado: "Realizado",
      completedAt: timestamp()
    }));
  }

  function reprogramFollowup(id) {
    const nextDate = window.prompt("Nueva fecha sugerida YYYY-MM-DD", tomorrowKey());
    if (!nextDate) return;
    updateFollowup(id, () => ({
      fechaSugerida: nextDate,
      estado: "Pendiente"
    }));
  }

  function createCodexFromFollowup(followup) {
    const prompt = [
      "MISION PARA CODEX - SEGUIMIENTO",
      "",
      "Contexto:",
      `${followup.personaEmpresa}: ${followup.motivo}`,
      "",
      "Proyecto relacionado:",
      followup.proyectoRelacionado || "General",
      "",
      "Objetivo:",
      "Preparar el proximo paso para resolver este seguimiento.",
      "",
      "Entregables:",
      "- Resumen ejecutivo.",
      "- Opciones de accion.",
      "- Recomendacion concreta.",
      "",
      "Restricciones:",
      "- Sin APIs.",
      "- Sin backend.",
      "- No inventar datos.",
      "- Mantenerlo accionable desde iPhone.",
      "",
      "Criterio de aprobacion:",
      "Guillermo debe poder decidir el siguiente paso en menos de 2 minutos."
    ].join("\n");
    localStorage.setItem(missionKey, prompt);
    missionPrompt.textContent = prompt;
    missionStatus.textContent = "Mision Codex creada desde seguimiento.";
    activatePanel("codex");
  }

  function addNoteToFollowup(id) {
    const note = window.prompt("Nota del seguimiento");
    if (!note) return;
    updateFollowup(id, (followup) => ({
      notas: [...(followup.notas || []), { text: note, createdAt: timestamp() }]
    }));
  }

  function renderExecutiveAgenda() {
    executiveAgendaList.innerHTML = "";
    const agenda = getExecutiveAgenda();

    if (!agenda.length) {
      executiveAgendaList.appendChild(makeElement("p", "status-note", "Sin decisiones ejecutivas relevantes todavia."));
      return;
    }

    agenda.slice(0, 8).forEach((item) => {
      const card = makeElement("article", "row-card agenda-card");
      const header = makeElement("div", "row-header compact-header");
      header.appendChild(makeElement("span", "score-badge", `#${item.position} | ${item.decisionScore}`));
      header.appendChild(makeElement("span", `level-chip level-${item.level.toLowerCase()}`, item.level));
      card.appendChild(header);
      card.appendChild(makeElement("h3", null, item.project));
      card.appendChild(makeElement("p", null, item.title));
      card.appendChild(makeElement("p", "muted", `Motivo: ${item.reason}`));
      card.appendChild(makeElement("p", "muted", `Accion recomendada: ${item.recommendedAction}`));
      executiveAgendaList.appendChild(card);
    });
  }

  function findBriefingItems(title) {
    const section = data.briefing.find((item) => item.title === title);
    return section ? section.items : [];
  }

  function renderBriefCard(section) {
    const card = makeElement("article", "brief-card");
    card.appendChild(makeElement("h3", null, section.title));
    const list = makeElement("ul");
    section.items.slice(0, 3).forEach((item) => {
      list.appendChild(makeElement("li", null, item));
    });
    if (!section.items.length) {
      list.appendChild(makeElement("li", null, "Sin pendientes relevantes."));
    }
    card.appendChild(list);
    briefingGrid.appendChild(card);
  }

  function renderProjects() {
    projectsList.innerHTML = "";
    data.projects.forEach((project) => {
      const item = makeElement("article", "row-card");
      const header = makeElement("div", "row-header");
      header.appendChild(makeElement("h3", null, project.name));
      header.appendChild(makeElement("span", "priority priority-" + project.priority.toLowerCase(), project.priority));
      item.appendChild(header);
      item.appendChild(makeElement("p", "muted", project.status));
      item.appendChild(makeElement("p", null, project.lastActivity));
      item.appendChild(makeAction("Ver contexto", "secondary-button compact", () => {
        contextSelect.value = project.name;
        renderContext();
        activatePanel("context");
      }));
      projectsList.appendChild(item);
    });
  }

  function renderContextSelector() {
    contextSelect.innerHTML = "";
    data.projects.forEach((project) => {
      const option = makeElement("option", null, project.name);
      option.value = project.name;
      contextSelect.appendChild(option);
    });
  }

  function renderContext() {
    const query = contextSelect.value || (data.projects[0] && data.projects[0].name) || "";
    const context = window.GOSContextEngine.findRelatedContext(query, getEngineInput());
    const groups = [
      ["proyectos", "Proyectos"],
      ["decisions", "Decisiones"],
      ["ideas", "Ideas"],
      ["aprendizajes", "Aprendizajes"],
      ["observaciones", "Observaciones"]
    ];

    contextSummary.innerHTML = "";
    contextGrid.innerHTML = "";
    contextSummary.appendChild(makeElement("p", "status-note", `${context.related.length} elementos relacionados encontrados.`));

    groups.forEach(([key, label]) => {
      const items = (context.grouped[key] || []).slice(0, 4);
      const card = makeElement("article", "brief-card");
      card.appendChild(makeElement("h3", null, label));
      const list = makeElement("ul");

      if (!items.length) {
        list.appendChild(makeElement("li", null, "Sin relaciones todavia."));
      }

      items.forEach((item) => {
        list.appendChild(makeElement("li", null, `${item.title} (${item.state})`));
      });

      card.appendChild(list);
      contextGrid.appendChild(card);
    });

    const tagCard = makeElement("article", "brief-card");
    tagCard.appendChild(makeElement("h3", null, "Etiquetas"));
    const tagList = makeElement("ul");
    const tags = Array.from(new Set(context.related.flatMap((item) => item.tags))).slice(0, 8);
    if (!tags.length) tagList.appendChild(makeElement("li", null, "Sin etiquetas todavia."));
    tags.forEach((tag) => tagList.appendChild(makeElement("li", null, tag)));
    tagCard.appendChild(tagList);
    contextGrid.appendChild(tagCard);
  }

  function renderDna() {
    const snapshot = window.GOSOperationalDNA.buildSnapshot();
    dnaGrid.innerHTML = "";
    companyTimeline.innerHTML = "";

    dnaGrid.appendChild(renderDnaPeople(snapshot.personasImportantes));
    dnaGrid.appendChild(renderDnaCompanies(snapshot.empresasEstrategicas));
    dnaGrid.appendChild(renderSimpleDnaCard("Proyectos", snapshot.proyectosHistoricos.map((item) => `${item.nombre}: ${item.estado || "Activo"}`)));
    dnaGrid.appendChild(renderSimpleDnaCard("Aprendizajes", snapshot.aprendizajes.map((item) => item.queAprendimos || item.nombre)));
    dnaGrid.appendChild(renderSimpleDnaCard("Seguimientos", loadJson(followupKey, []).map((item) => `${item.personaEmpresa}: ${item.fechaSugerida}`)));
    dnaGrid.appendChild(renderSimpleDnaCard("Ultimos cambios", snapshot.ultimosCambios.map((item) => `${item.type}: ${item.title}`)));
  }

  function renderSimpleDnaCard(title, items) {
    const card = makeElement("article", "brief-card");
    card.appendChild(makeElement("h3", null, title));
    const list = makeElement("ul");
    if (!items.length) list.appendChild(makeElement("li", null, "Sin memoria registrada todavia."));
    items.slice(0, 6).forEach((item) => list.appendChild(makeElement("li", null, item)));
    card.appendChild(list);
    return card;
  }

  function renderDnaPeople(people) {
    const card = makeElement("article", "brief-card dna-editor-card");
    card.appendChild(makeElement("h3", null, "Personas"));
    if (!people.length) {
      card.appendChild(makeElement("p", "status-note", "Sin personas registradas todavia."));
      return card;
    }
    people.slice(0, 5).forEach((person) => {
      card.appendChild(makeElement("p", null, `${person.nombre}: ${person.empresa || "Sin empresa"}`));
      card.appendChild(renderDnaEditor("persona", person));
    });
    return card;
  }

  function renderDnaCompanies(companies) {
    const card = makeElement("article", "brief-card dna-editor-card");
    card.appendChild(makeElement("h3", null, "Empresas"));
    if (!companies.length) {
      card.appendChild(makeElement("p", "status-note", "Sin empresas registradas todavia."));
      return card;
    }
    companies.slice(0, 5).forEach((company) => {
      const button = makeAction(`${company.nombre} (${(company.historial || []).length} eventos)`, "secondary-button compact dna-company-button", () => {
        renderCompanyTimeline(company.nombre);
      });
      card.appendChild(button);
      card.appendChild(renderDnaEditor("empresa", company));
    });
    return card;
  }

  function renderDnaEditor(type, record) {
    const wrapper = makeElement("div", "dna-editor");
    const level = makeSelect(["Sin definir", "Alto", "Medio", "Bajo"], record.nivelEstrategico || "Sin definir");
    const trust = makeSelect(["Sin evaluar", "Alta", "Media", "Baja"], record.confianza || "Sin evaluar");
    const state = makeSelect(["Activo", "Seguimiento", "Congelado", "Archivado"], record.estado || "Activo");
    const notes = makeElement("textarea", "edit-field");
    notes.rows = 2;
    notes.value = record.notas || "";

    wrapper.appendChild(makeElement("label", "input-label", "Nivel estrategico"));
    wrapper.appendChild(level);
    wrapper.appendChild(makeElement("label", "input-label", "Confianza"));
    wrapper.appendChild(trust);
    wrapper.appendChild(makeElement("label", "input-label", "Estado"));
    wrapper.appendChild(state);
    wrapper.appendChild(makeElement("label", "input-label", "Notas"));
    wrapper.appendChild(notes);
    wrapper.appendChild(makeAction("Guardar", "primary-button compact", () => {
      window.GOSOperationalDNA.updateRecord(type, record.id, {
        nivelEstrategico: level.value,
        confianza: trust.value,
        estado: state.value,
        notas: notes.value.trim()
      });
      renderDna();
    }));
    return wrapper;
  }

  function renderCompanyTimeline(companyName) {
    const timeline = window.GOSOperationalDNA.timeline(companyName);
    companyTimeline.innerHTML = "";
    const card = makeElement("article", "row-card");
    if (!timeline) {
      card.appendChild(makeElement("h3", null, "Empresa no encontrada"));
      companyTimeline.appendChild(card);
      return;
    }

    card.appendChild(makeElement("p", "section-label", "Timeline empresa"));
    card.appendChild(makeElement("h3", null, timeline.company.nombre));
    card.appendChild(makeElement("p", "muted", `Ultima actividad: ${timeline.ultimaActividad}`));
    [
      ["Eventos", timeline.eventos.map((event) => `${event.title} | ${event.timestamp || "Sin fecha"}`)],
      ["Personas", timeline.personas.map((person) => person.nombre)],
      ["Decisiones", timeline.decisiones.map((decision) => decision.nombre || decision.queSeDecidio)],
      ["Aprendizajes", timeline.aprendizajes.map((learning) => learning.queAprendimos || learning.nombre)],
      ["Proyectos relacionados", timeline.proyectos.map((project) => project.nombre)]
    ].forEach(([title, items]) => {
      card.appendChild(makeElement("p", "section-label", title));
      const list = makeElement("ul");
      if (!items.length) list.appendChild(makeElement("li", null, "Sin registro todavia."));
      items.slice(0, 6).forEach((item) => list.appendChild(makeElement("li", null, item)));
      card.appendChild(list);
    });
    companyTimeline.appendChild(card);
  }

  function renderDecisions() {
    decisionsList.innerHTML = "";
    getDecisions().forEach((decision) => {
      const item = makeElement("article", "row-card decision-card");
      const meta = makeElement("div", "row-header compact-header");
      meta.appendChild(makeElement("span", "priority priority-" + decision.priority.toLowerCase(), decision.priority));
      meta.appendChild(makeElement("span", "state-chip", decision.state));
      item.appendChild(meta);

      const contextLabel = makeElement("label", "input-label", "Contexto");
      const contextInput = makeElement("textarea", "edit-field");
      contextInput.rows = 3;
      contextInput.value = decision.context;

      const recommendationLabel = makeElement("label", "input-label", "Recomendacion");
      const recommendationInput = makeElement("textarea", "edit-field");
      recommendationInput.rows = 3;
      recommendationInput.value = decision.recommendation;

      const priorityLabel = makeElement("label", "input-label", "Prioridad");
      const prioritySelect = makeSelect(["Alta", "Media", "Baja"], decision.priority);

      item.appendChild(contextLabel);
      item.appendChild(contextInput);
      item.appendChild(recommendationLabel);
      item.appendChild(recommendationInput);
      item.appendChild(priorityLabel);
      item.appendChild(prioritySelect);

      const actions = makeElement("div", "button-row");
      actions.appendChild(makeAction("Aprobar", "primary-button compact", () => {
        updateDecision(decision, contextInput.value, recommendationInput.value, prioritySelect.value, "Aprobada");
      }));
      actions.appendChild(makeAction("Seguir analizando", "secondary-button compact", () => {
        updateDecision(decision, contextInput.value, recommendationInput.value, prioritySelect.value, "En analisis");
      }));
      actions.appendChild(makeAction("Archivar", "ghost-button compact", () => {
        updateDecision(decision, contextInput.value, recommendationInput.value, prioritySelect.value, "Archivada");
      }));
      item.appendChild(actions);
      decisionsList.appendChild(item);
    });
  }

  function makeSelect(options, selected) {
    const select = makeElement("select", "status-select");
    options.forEach((option) => {
      const element = makeElement("option", null, option);
      element.value = option;
      element.selected = option === selected;
      select.appendChild(element);
    });
    return select;
  }

  function makeAction(label, className, handler) {
    const button = makeElement("button", className, label);
    button.type = "button";
    button.addEventListener("click", handler);
    return button;
  }

  function updateDecision(decision, context, recommendation, priority, state) {
    saveDecision({
      ...decision,
      context: context.trim() || decision.context,
      recommendation: recommendation.trim() || decision.recommendation,
      priority,
      state
    });
    window.GOSSystemClock.markDecision();
    runDayRoutine("decision");
    renderAll();
  }

  function renderCodex() {
    codexList.innerHTML = "";
    data.codex.forEach((job) => {
      const item = makeElement("article", "row-card");
      const header = makeElement("div", "row-header");
      header.appendChild(makeElement("h3", null, job.title));
      header.appendChild(makeElement("span", "priority", job.status));
      item.appendChild(header);
      item.appendChild(makeElement("p", null, job.lastRun));
      codexList.appendChild(item);
    });

    const lastMission = localStorage.getItem(missionKey);
    if (lastMission) {
      missionPrompt.textContent = lastMission;
      missionStatus.textContent = "Ultima mision lista para copiar.";
    } else {
      missionPrompt.textContent = "";
      missionStatus.textContent = "";
    }
  }

  function renderIdeas() {
    const ideas = getIdeas();
    ideasList.innerHTML = "";

    if (!ideas.length) {
      ideasList.appendChild(makeElement("p", "status-note", "Todavia no hay ideas capturadas en este navegador."));
      return;
    }

    ideas.slice().reverse().slice(0, 8).forEach((idea) => {
      const item = makeElement("article", "idea-item");
      const header = makeElement("div", "row-header compact-header");
      header.appendChild(makeElement("span", "state-chip", idea.status || "Nueva"));
      header.appendChild(makeElement("span", "muted small-text", idea.createdAt));
      item.appendChild(header);

      const input = makeElement("textarea", "edit-field");
      input.rows = 3;
      input.value = idea.text;
      const status = makeSelect(["Nueva", "Incubadora", "Proyecto", "Archivada"], idea.status || "Nueva");
      const actions = makeElement("div", "button-row two-actions");
      actions.appendChild(makeAction("Guardar cambios", "primary-button compact", () => {
        updateIdea(idea.id, input.value, status.value);
      }));
      actions.appendChild(makeAction("Archivar", "ghost-button compact", () => {
        updateIdea(idea.id, input.value, "Archivada");
      }));

      item.appendChild(input);
      item.appendChild(status);
      item.appendChild(actions);
      ideasList.appendChild(item);
    });
  }

  function saveIdea() {
    const text = ideaInput.value.trim();
    if (!text) {
      ideaInput.focus();
      return;
    }

    const ideas = getIdeas();
    ideas.push({
      id: "idea-" + Date.now(),
      text,
      status: ideaStatus.value,
      createdAt: formatDate(),
      createdAtIso: timestamp()
    });
    saveIdeas(ideas);
    window.GOSSystemClock.markIdea();
    runDayRoutine("idea");
    ideaInput.value = "";
    ideaStatus.value = "Nueva";
    renderAll();
  }

  function updateIdea(id, text, status) {
    const ideas = getIdeas().map((idea) => {
      if (idea.id !== id) return idea;
      return {
        ...idea,
        text: text.trim() || idea.text,
        status,
        updatedAt: timestamp()
      };
    });
    saveIdeas(ideas);
    runDayRoutine("idea");
    renderAll();
  }

  function buildMissionPrompt() {
    return [
      "MISION PARA CODEX",
      "",
      "Contexto:",
      "G-OS se usa como panel ejecutivo movil para Guillermo. Debe abrir rapido, mostrar foco del dia y permitir decisiones simples.",
      "",
      "Objetivo:",
      "Preparar una mejora concreta del MVP manteniendo la experiencia simple y usable desde iPhone.",
      "",
      "Entregables:",
      "- Cambio puntual en app o documentacion.",
      "- Datos claros para validar uso real.",
      "- Resumen de que quedo funcionando y que falta.",
      "",
      "Restricciones:",
      "- Sin backend.",
      "- Sin APIs.",
      "- Sin dependencias.",
      "- No complejizar la interfaz.",
      "- Mantener lectura diaria en menos de 2 minutos.",
      "",
      "Criterio de aprobacion:",
      "Guillermo debe poder abrir G-OS por la manana, entender que decidir y terminar con un proximo paso claro."
    ].join("\n");
  }

  function renderCloseDay() {
    const decisions = getDecisions();
    const ideas = getIdeas();
    const approved = decisions
      .filter((decision) => decision.state === "Aprobada")
      .slice(0, 3)
      .map((decision) => decision.context);
    const captured = ideas
      .filter((idea) => idea.status !== "Archivada")
      .slice(-3)
      .map((idea) => `${idea.status}: ${idea.text}`);
    const pending = decisions
      .filter((decision) => decision.state === "Pendiente" || decision.state === "En analisis")
      .slice(0, 3)
      .map((decision) => decision.context);
    const codex = [
      "Preparar la proxima mision con contexto, entregables, restricciones y criterio de aprobacion."
    ];
    const learning = localStorage.getItem(learningKey) || "";

    dailyLearning.value = learning;
    closeDayGrid.innerHTML = "";
    [
      { title: "Que decidi hoy", items: approved },
      { title: "Que ideas capture", items: captured },
      { title: "Pendiente para manana", items: pending },
      { title: "Aprendizaje del dia", items: learning ? [learning] : [] },
      { title: "Que debe preparar Codex", items: codex }
    ].forEach((section) => {
      const card = makeElement("article", "brief-card");
      card.appendChild(makeElement("h3", null, section.title));
      const list = makeElement("ul");
      if (!section.items.length) {
        list.appendChild(makeElement("li", null, "Sin registro todavia."));
      }
      section.items.forEach((item) => list.appendChild(makeElement("li", null, item)));
      card.appendChild(list);
      closeDayGrid.appendChild(card);
    });
  }

  function exportData() {
    const payload = {
      exportedAt: timestamp(),
      ideas: getIdeas(),
      decisions: loadJson(decisionKey, {}),
      createdDecisions: loadJson(createdDecisionKey, []),
      followups: loadJson(followupKey, []),
      lastMission: localStorage.getItem(missionKey) || "",
      dailyLearning: localStorage.getItem(learningKey) || "",
      operationalDna: window.GOSKnowledgeRegistry.read(),
      lifeLoop: window.GOSLifeLoopEngine.getState()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "g-os-datos-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDataStatus("Datos exportados.");
  }

  function loadDemo() {
    clearDemo({ silent: true });
    const nowIso = timestamp();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const tomorrow = tomorrowKey();

    const demoObservations = [
      {
        id: "demo-event-ponsse-brasil",
        source: "demo",
        type: "correo",
        entity: "Mercado Forestal",
        title: "Correo de Ponsse Brasil con Rafael Moraes",
        description: "Ponsse Brasil pide definir precio, margen y volumen. Rafael Moraes espera respuesta comercial.",
        priority: "HIGH",
        timestamp: nowIso,
        metadata: { demoId: demoFlag, relatedProject: "Mercado Forestal", shouldAppearInBriefing: true }
      },
      {
        id: "demo-event-outdoor",
        source: "demo",
        type: "idea",
        entity: "Outdoor Import",
        title: "Outdoor Import: producto simple para evaluar",
        description: "Producto fisico con potencial comercial. Falta validar proveedor, margen y demanda.",
        priority: "MEDIUM",
        timestamp: nowIso,
        metadata: { demoId: demoFlag, relatedProject: "Outdoor Import" }
      },
      {
        id: "demo-event-uruforest",
        source: "demo",
        type: "seguimiento",
        entity: "URUFOREST",
        title: "URUFOREST: plan comercial pendiente",
        description: "Definir foco comercial, clientes objetivo y responsable.",
        priority: "MEDIUM",
        timestamp: nowIso,
        metadata: { demoId: demoFlag, relatedProject: "URUFOREST" }
      }
    ];

    demoObservations.forEach((observation) => observerBus.recordObservation(observation));

    const decisions = loadJson(createdDecisionKey, []);
    decisions.unshift({
      id: "demo-decision-ponsse-brasil",
      title: "Definir respuesta comercial a Ponsse Brasil",
      context: "Ponsse Brasil y Rafael Moraes esperan definicion de precio, margen y volumen.",
      recommendation: "Responder con propuesta condicionada a volumen y proteger margen.",
      priority: "Alta",
      project: "Mercado Forestal",
      origin: "ADN",
      state: "Pendiente",
      createdAt: nowIso,
      demo: true,
      demoId: demoFlag
    });
    saveJson(createdDecisionKey, decisions);

    const followups = getFollowups();
    followups.unshift(
      {
        id: "demo-followup-atrasado-ponsse",
        personaEmpresa: "Ponsse / Rafael Moraes",
        motivo: "Responder definicion comercial de Brasil.",
        fechaSugerida: yesterday,
        proyectoRelacionado: "Mercado Forestal",
        prioridad: "HIGH",
        estado: "Pendiente",
        origen: "ADN",
        createdAt: nowIso,
        demo: true,
        demoId: demoFlag
      },
      {
        id: "demo-followup-manana-outdoor",
        personaEmpresa: "Outdoor Import",
        motivo: "Validar proveedor, margen y demanda.",
        fechaSugerida: tomorrow,
        proyectoRelacionado: "Outdoor Import",
        prioridad: "MEDIUM",
        estado: "Pendiente",
        origen: "ADN",
        createdAt: nowIso,
        demo: true,
        demoId: demoFlag
      }
    );
    saveFollowups(followups);

    window.GOSKnowledgeRegistry.rememberLearning({
      queAprendimos: "Brasil sube de prioridad cuando combina cliente estrategico, precio, volumen y seguimiento atrasado.",
      queFunciono: "Relacionar Ponsse, Rafael Moraes y Mercado Forestal en un solo flujo.",
      queNoFunciono: "Dejar seguimiento comercial sin fecha clara.",
      queRepetir: "Crear seguimiento con prioridad HIGH cuando hay cliente estrategico.",
      queEvitar: "Responder precio sin entender volumen.",
      fecha: nowIso,
      proyectoRelacionado: "Mercado Forestal",
      demo: true,
      demoId: demoFlag
    });

    window.GOSKnowledgeRegistry.upsert("empresas", "Ponsse", {
      nombre: "Ponsse",
      relacion: "Estrategica",
      proyectos: ["Mercado Forestal"],
      negociaciones: ["Definir precio, margen y volumen para Brasil"],
      oportunidades: ["Relacion comercial Brasil"],
      demo: true,
      demoId: demoFlag,
      historialEntrada: {
        id: "demo-timeline-ponsse",
        title: "Correo de Ponsse Brasil con Rafael Moraes",
        description: "Rafael Moraes espera respuesta comercial sobre precio y volumen.",
        type: "correo",
        timestamp: nowIso,
        demo: true,
        demoId: demoFlag
      }
    }, "Empresa demo actualizada: Ponsse");

    window.GOSKnowledgeRegistry.upsert("personas", "Rafael Moraes", {
      nombre: "Rafael Moraes",
      empresa: "Ponsse",
      ultimoContacto: nowIso,
      nivelEstrategico: "Alto",
      confianza: "Sin evaluar",
      compromisos: ["Responder definicion comercial de Brasil"],
      demo: true,
      demoId: demoFlag,
      historialEntrada: {
        id: "demo-persona-rafael",
        title: "Contacto comercial Ponsse Brasil",
        description: "Seguimiento pendiente por precio y volumen.",
        timestamp: nowIso,
        demo: true,
        demoId: demoFlag
      }
    }, "Persona demo actualizada: Rafael Moraes");

    [
      ["empresas", "Ponsse"],
      ["empresas", "Mercado Forestal"],
      ["empresas", "Outdoor Import"],
      ["empresas", "URUFOREST"],
      ["personas", "Rafael Moraes"],
      ["proyectos", "Mercado Forestal"],
      ["proyectos", "Outdoor Import"],
      ["proyectos", "URUFOREST"]
    ].forEach(([collection, name]) => {
      const id = window.GOSKnowledgeRegistry.slug(name);
      window.GOSKnowledgeRegistry.updateFields(collection, id, { demo: true, demoId: demoFlag });
    });

    localStorage.setItem(learningKey, "Brasil requiere responder con precio condicionado a volumen y seguimiento claro.");
    prepareDemoCodexPrompt();
    runDayRoutine("demo");
    renderAll();
    setDataStatus("Demo cargada: Ponsse/Brasil queda como prioridad critica.");
    activatePanel("briefing");
  }

  function prepareDemoCodexPrompt() {
    const prompt = [
      "MISION PARA CODEX - DEMO G-OS",
      "",
      "Contexto recuperado:",
      "Ponsse Brasil / Rafael Moraes aparece como prioridad critica por precio, margen, volumen y seguimiento atrasado.",
      "",
      "Objetivo:",
      "Preparar respuesta comercial ejecutiva para Ponsse Brasil.",
      "",
      "Entregables:",
      "- Resumen del contexto.",
      "- Opciones de respuesta comercial.",
      "- Recomendacion con proximo paso.",
      "",
      "Restricciones:",
      "- No inventar datos.",
      "- Proteger margen.",
      "- Condicionar precio a volumen.",
      "",
      "Criterio de aprobacion:",
      "Guillermo debe poder aprobar o corregir la respuesta desde el celular."
    ].join("\n");
    localStorage.setItem(missionKey, prompt);
    missionPrompt.textContent = prompt;
    missionStatus.textContent = "Prompt demo listo.";
  }

  function clearDemo(options) {
    const silent = options && options.silent;
    const events = window.GOSEventLog.read().filter((event) => !isDemo(event));
    window.GOSEventLog.clear();
    events.forEach((event) => window.GOSEventLog.append(event));

    saveJson(createdDecisionKey, loadJson(createdDecisionKey, []).filter((decision) => !isDemo(decision)));
    saveFollowups(getFollowups().filter((followup) => !isDemo(followup)));
    clearDemoDna();

    if ((localStorage.getItem(missionKey) || "").includes("MISION PARA CODEX - DEMO G-OS")) {
      localStorage.removeItem(missionKey);
    }
    if ((localStorage.getItem(learningKey) || "").includes("Brasil requiere responder")) {
      localStorage.removeItem(learningKey);
    }

    if (!silent) {
      renderAll();
      setDataStatus("Datos demo eliminados.");
    }
  }

  function clearDemoDna() {
    const registry = window.GOSKnowledgeRegistry.read();
    ["personas", "empresas", "proyectos", "decisiones", "aprendizajes"].forEach((collection) => {
      Object.keys(registry[collection]).forEach((key) => {
        if (isDemo(registry[collection][key])) {
          delete registry[collection][key];
        }
      });
    });
    registry.cambios = registry.cambios.filter((change) => {
      return !isDemo(change) && !String(change.detail || "").includes(demoFlag);
    });
    window.GOSKnowledgeRegistry.write(registry);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const payload = JSON.parse(reader.result);
        if (Array.isArray(payload.ideas)) saveJson(ideaKey, payload.ideas);
        if (payload.decisions && typeof payload.decisions === "object") saveJson(decisionKey, payload.decisions);
        if (Array.isArray(payload.createdDecisions)) saveJson(createdDecisionKey, payload.createdDecisions);
        if (Array.isArray(payload.followups)) saveJson(followupKey, payload.followups);
        if (typeof payload.lastMission === "string") localStorage.setItem(missionKey, payload.lastMission);
        if (typeof payload.dailyLearning === "string") localStorage.setItem(learningKey, payload.dailyLearning);
        if (payload.operationalDna && typeof payload.operationalDna === "object") window.GOSKnowledgeRegistry.write(payload.operationalDna);
        if (payload.lifeLoop && typeof payload.lifeLoop === "object") saveJson("gos:lifeLoop", payload.lifeLoop);
        setDataStatus("Datos importados.");
        renderAll();
      } catch (error) {
        setDataStatus("No pude importar ese JSON.");
      }
    });
    reader.readAsText(file);
  }

  function setDataStatus(message) {
    dataStatus.textContent = message;
    window.setTimeout(() => {
      if (dataStatus.textContent === message) dataStatus.textContent = "";
    }, 2500);
  }

  async function copyMission() {
    const text = missionPrompt.textContent || buildMissionPrompt();
    missionPrompt.textContent = text;
    localStorage.setItem(missionKey, text);
    try {
      await navigator.clipboard.writeText(text);
      missionStatus.textContent = "Mision copiada";
    } catch (error) {
      missionStatus.textContent = "No se pudo copiar automaticamente. El prompt quedo visible.";
    }
  }

  function buildCloseDayText() {
    const decisions = getDecisions();
    const ideas = getIdeas();
    const learning = localStorage.getItem(learningKey) || "Sin aprendizaje registrado.";
    const approved = decisions
      .filter((decision) => decision.state === "Aprobada")
      .slice(0, 3)
      .map((decision) => "- " + decision.context);
    const captured = ideas
      .filter((idea) => idea.status !== "Archivada")
      .slice(-3)
      .map((idea) => `- ${idea.status}: ${idea.text}`);
    const pending = decisions
      .filter((decision) => decision.state === "Pendiente" || decision.state === "En analisis")
      .slice(0, 3)
      .map((decision) => "- " + decision.context);

    return [
      "CIERRE DEL DIA - G-OS",
      "",
      "Que decidi hoy:",
      approved.length ? approved.join("\n") : "- Sin decisiones aprobadas.",
      "",
      "Que ideas capture:",
      captured.length ? captured.join("\n") : "- Sin ideas nuevas.",
      "",
      "Pendiente para manana:",
      pending.length ? pending.join("\n") : "- Sin pendientes principales.",
      "",
      "Aprendizaje del dia:",
      "- " + learning,
      "",
      "Que debe preparar Codex:",
      "- Preparar la proxima mision con contexto, entregables, restricciones y criterio de aprobacion."
    ].join("\n");
  }

  async function copyCloseDay() {
    const text = buildCloseDayText();
    try {
      await navigator.clipboard.writeText(text);
      closeStatus.textContent = "Cierre copiado";
    } catch (error) {
      closeStatus.textContent = "No se pudo copiar automaticamente.";
    }
  }

  function saveLearning() {
    localStorage.setItem(learningKey, dailyLearning.value.trim());
    window.GOSOperationalDNA.recordDailyClose(getEngineInput(), {
      aprendizaje: dailyLearning.value.trim()
    });
    window.GOSSystemClock.markLearning();
    runDayRoutine("learning");
    closeStatus.textContent = "Aprendizaje guardado";
    renderCloseDay();
  }

  function activatePanel(targetId) {
    const buttons = document.querySelectorAll(".nav-button");
    const panels = document.querySelectorAll(".module-panel");
    buttons.forEach((item) => item.classList.toggle("active", item.dataset.target === targetId));
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === targetId));
  }

  function setMode(mode) {
    document.body.dataset.mode = mode;
    document.getElementById("morningMode").classList.toggle("active-mode", mode === "morning");
    document.getElementById("closeMode").classList.toggle("active-mode", mode === "close");
    if (mode === "close") {
      const result = window.GOSLifeEngine.NightRoutine(getEngineInput());
      updateSystemStatus(result.clock);
    }
    activatePanel(mode === "close" ? "closeDay" : "briefing");
  }

  function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-button");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activatePanel(button.dataset.target);
      });
    });
  }

  function renderAll() {
    renderBriefing();
    renderProjects();
    renderDecisions();
    renderExecutiveAgenda();
    renderCodex();
    renderIdeas();
    renderContextSelector();
    renderContext();
    renderDna();
    renderCloseDay();
    updateSystemStatus();
    updateHeartStatus();
  }

  document.getElementById("focusIdea").addEventListener("click", () => ideaInput.focus());
  document.getElementById("saveIdea").addEventListener("click", saveIdea);
  document.getElementById("processLiveEvent").addEventListener("click", processLiveEvent);
  document.getElementById("saveOutlookConfig").addEventListener("click", saveOutlookConfig);
  document.getElementById("connectOutlook").addEventListener("click", connectOutlook);
  document.getElementById("disconnectOutlook").addEventListener("click", disconnectOutlook);
  document.getElementById("readOutlookEmails").addEventListener("click", readOutlookEmails);
  beatNow.addEventListener("click", beatNowAction);
  document.getElementById("loadDemo").addEventListener("click", loadDemo);
  document.getElementById("clearDemo").addEventListener("click", () => clearDemo());
  document.getElementById("newMission").addEventListener("click", () => {
    const prompt = buildMissionPrompt();
    localStorage.setItem(missionKey, prompt);
    missionPrompt.textContent = prompt;
    missionStatus.textContent = "Prompt generado. Listo para copiar.";
  });
  document.getElementById("copyMission").addEventListener("click", copyMission);
  document.getElementById("saveLearning").addEventListener("click", saveLearning);
  document.getElementById("copyCloseDay").addEventListener("click", copyCloseDay);
  document.getElementById("runDnaSearch").addEventListener("click", () => {
    renderDnaSearchResult(window.GOSOperationalDNA.executiveQuery(dnaSearch.value));
  });
  document.getElementById("morningMode").addEventListener("click", () => setMode("morning"));
  document.getElementById("closeMode").addEventListener("click", () => setMode("close"));
  contextSelect.addEventListener("change", renderContext);
  document.getElementById("exportData").addEventListener("click", exportData);
  document.getElementById("importData").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", () => {
    const file = importFile.files[0];
    if (file) importData(file);
    importFile.value = "";
  });

  setupNavigation();
  loadOutlookConfig();
  renderOutlookStatus();
  handleOutlookRedirect();
  observerBus.initialize();
  observerBus.checkUpdates();
  updateSystemStatus(window.GOSLifeEngine.MorningRoutine(getEngineInput()).clock);
  renderAll();
  window.GOSLifeLoopEngine.start(getLoopContext());
  window.setInterval(updateHeartStatus, 1000);
})();
