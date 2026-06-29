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
  const executiveWelcome = document.getElementById("executiveWelcome");
  const welcomeEvents = document.getElementById("welcomeEvents");
  const welcomeCases = document.getElementById("welcomeCases");
  const welcomeFeeling = document.getElementById("welcomeFeeling");
  const welcomeReasons = document.getElementById("welcomeReasons");
  const welcomeFocus = document.getElementById("welcomeFocus");
  const welcomeTime = document.getElementById("welcomeTime");
  const startDay = document.getElementById("startDay");
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
  const pipelineStatus = document.getElementById("pipelineStatus");
  const pipelineState = document.getElementById("pipelineState");
  const pipelineLastEvent = document.getElementById("pipelineLastEvent");
  const pipelineLastMail = document.getElementById("pipelineLastMail");
  const pipelineLastUnderstood = document.getElementById("pipelineLastUnderstood");
  const pipelineLastModule = document.getElementById("pipelineLastModule");
  const pipelineLastRecalc = document.getElementById("pipelineLastRecalc");
  const pipelineLastHeart = document.getElementById("pipelineLastHeart");
  const pipelineProcessedCount = document.getElementById("pipelineProcessedCount");
  const pipelinePendingCount = document.getElementById("pipelinePendingCount");
  const pipelineDebug = document.getElementById("pipelineDebug");
  const pipelineError = document.getElementById("pipelineError");
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
  const cognitiveMailSummary = document.getElementById("cognitiveMailSummary");
  const cognitiveMailGrid = document.getElementById("cognitiveMailGrid");
  const executiveCenterSummary = document.getElementById("executiveCenterSummary");
  const executiveSnapshot = document.getElementById("executiveSnapshot");
  const executiveKpis = document.getElementById("executiveKpis");
  const executiveDecisionCenterList = document.getElementById("executiveDecisionCenterList");
  const companiesGrid = document.getElementById("companiesGrid");
  const peopleGrid = document.getElementById("peopleGrid");
  const memoryJournal = document.getElementById("memoryJournal");
  const systemGrid = document.getElementById("systemGrid");
  const desktopObserverStatus = document.getElementById("desktopObserverStatus");
  const desktopObserverLastReview = document.getElementById("desktopObserverLastReview");
  const desktopObserverLastEmail = document.getElementById("desktopObserverLastEmail");
  const desktopObserverCount = document.getElementById("desktopObserverCount");
  const desktopObserverInterval = document.getElementById("desktopObserverInterval");
  const desktopObserverNote = document.getElementById("desktopObserverNote");
  const desktopObserverResult = document.getElementById("desktopObserverResult");
  const outlookIdentityAccount = document.getElementById("outlookIdentityAccount");
  const outlookIdentityInbox = document.getElementById("outlookIdentityInbox");
  const outlookIdentityCalibration = document.getElementById("outlookIdentityCalibration");
  const outlookIdentityState = document.getElementById("outlookIdentityState");
  const outlookIdentityNote = document.getElementById("outlookIdentityNote");
  const desktopObserverKey = "gos:outlookDesktopObserver";
  const desktopProcessedKey = "gos:outlookDesktopObserver:processed";
  const outlookIdentityKey = "gos:outlookIdentity";
  const fixedOutlookAccount = "guillermo.weinstein@mercadoforestal.com.uy";
  const pipelineKey = "gos:pipelineStatus";
  const localBridgeUrl = "http://localhost:17829/outlook/queue";
  const validSources = {
    liveInput: "live_input",
    demo: "demo",
    outlookDesktop: "outlook_desktop",
    outlookGraph: "outlook_graph",
    manual: "manual",
    system: "system"
  };
  let desktopObserverTimer = null;
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

  function isGitHubPages() {
    return window.location.hostname.endsWith("github.io");
  }

  function isRealOutlookSource(source) {
    return source === validSources.outlookDesktop || source === validSources.outlookGraph || source === "outlook";
  }

  function itemSource(item) {
    if (!item) return validSources.manual;
    if (item.source) return item.source;
    if (item.origin === "Cognitive Mail Engine" || item.origen === "Cognitive Mail Engine") return validSources.outlookDesktop;
    if (item.origin === "ADN" || item.origen === "ADN") return validSources.manual;
    if (item.demo || item.demoId) return validSources.demo;
    return validSources.manual;
  }

  function hasRealOutlookSource(item) {
    const source = itemSource(item);
    return isRealOutlookSource(source);
  }

  function isOperationalNoise(item) {
    const source = itemSource(item);
    const text = JSON.stringify(item || {}).toLowerCase();
    return (
      isDemo(item) ||
      (item.metadata && item.metadata.simulated === true) ||
      source === validSources.demo ||
      source === validSources.liveInput ||
      source === validSources.manual ||
      (source === validSources.system && item.metadata && item.metadata.simulated === true) ||
      text.includes("correo de ponsse brasil") ||
      text.includes("demo-gos-v01") ||
      text.includes("debug pipeline")
    );
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
    const input = {
      ideas: getIdeas(),
      proyectos: data.projects,
      decisiones: getDecisions(),
      aprendizajes: getLearnings(),
      seguimientos: getFollowups(),
      observaciones: observerBus.getObservations(),
      adn: window.GOSOperationalDNA ? window.GOSOperationalDNA.buildSnapshot() : null
    };
    input.casos = window.GOSCognitiveConsolidationEngine
      ? window.GOSCognitiveConsolidationEngine.buildCases(input)
      : [];
    return input;
  }

  function getContextGraph() {
    return window.GOSContextEngine.buildGraph(getEngineInput());
  }

  function getExecutiveAgenda() {
    const input = getEngineInput();
    input.contextGraph = getContextGraph();
    return window.GOSDecisionEngine.buildExecutiveAgenda(input);
  }

  function getExecutiveDecisionCenter() {
    const input = getEngineInput();
    input.contextGraph = getContextGraph();
    input.agenda = window.GOSDecisionEngine.buildExecutiveAgenda(input);
    input.desktopObserver = getDesktopObserverState();
    return window.GOSExecutiveDecisionCenter.build(input);
  }

  function getLoopContext() {
    return {
      observe: () => observerBus.checkUpdates(),
      getInput: getEngineInput,
      getLastEvent: () => window.GOSEventBus.getState().lastEvent || null,
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

  function minutesSince(iso) {
    const time = Date.parse(iso || "");
    if (Number.isNaN(time)) return "Sin fecha";
    const diff = Math.max(0, Math.round((Date.now() - time) / 60000));
    if (diff < 2) return "Ahora";
    if (diff < 60) return `Hace ${diff} minutos`;
    const hours = Math.round(diff / 60);
    if (hours < 24) return `Hace ${hours} horas`;
    return `Hace ${Math.round(hours / 24)} dias`;
  }

  function tranquilityReasons(loopState, cases) {
    const tranquility = loopState.tranquility !== undefined ? loopState.tranquility : 100;
    const importantCases = (cases || []).filter((caso) => caso.level === "CRITICO" || caso.level === "ALTO");
    const openFollowups = getRelevantFollowups().length;
    const reasons = [];

    if (tranquility >= 80) reasons.push("No hay situaciones criticas acumuladas.");
    if (importantCases.length) reasons.push(`Hay ${importantCases.length} casos que merecen atencion.`);
    if (openFollowups) reasons.push(`Hay ${openFollowups} seguimientos abiertos.`);
    if ((cases || []).some((caso) => (caso.riesgos || []).length)) reasons.push("Existe al menos un riesgo identificado y contenido.");
    if (!reasons.length) reasons.push("El contexto esta ordenado y no hay urgencias visibles.");
    return reasons.slice(0, 4);
  }

  function renderExecutiveWelcome() {
    const input = getEngineInput();
    const cases = (input.casos || []).slice(0, 3);
    const loopState = window.GOSLifeLoopEngine.getState();
    const eventCount = (input.observaciones || []).length + (input.seguimientos || []).length + (input.decisiones || []).length;
    const tranquility = loopState.tranquility !== undefined ? loopState.tranquility : 100;
    const topCase = cases[0];
    const feeling = tranquility >= 80
      ? "🟢 Tranquilo"
      : tranquility >= 50
        ? "🟠 Atento"
        : "🔴 Requiere foco";

    welcomeEvents.textContent = `${eventCount} acontecimientos`;
    welcomeCases.textContent = `SOLO ${cases.length || 0} Casos importantes.`;
    welcomeFeeling.textContent = feeling;
    welcomeFocus.textContent = topCase ? `🎯 Caso ${topCase.titulo}` : "🎯 Mantener el dia simple";
    welcomeTime.textContent = topCase && topCase.level === "CRITICO" ? "20 minutos" : "15 minutos";
    welcomeReasons.innerHTML = "";
    tranquilityReasons(loopState, cases).forEach((reason) => {
      welcomeReasons.appendChild(makeElement("li", null, reason));
    });
  }

  function startExecutiveDay() {
    document.body.dataset.dayStarted = "true";
    executiveWelcome.hidden = true;
    activatePanel("executiveCenter");
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

  function upsertCreatedDecision(decision) {
    if (!decision) return false;
    const decisions = loadJson(createdDecisionKey, []);
    if (decisions.some((item) => item.id === decision.id || item.sourceObservationId === decision.sourceObservationId)) return false;
    decisions.unshift(decision);
    saveJson(createdDecisionKey, decisions);
    return true;
  }

  function upsertFollowup(followup) {
    if (!followup) return false;
    const followups = getFollowups();
    if (followups.some((item) => item.id === followup.id || item.sourceObservationId === followup.sourceObservationId)) return false;
    followups.unshift(followup);
    saveFollowups(followups);
    return true;
  }

  function processCognitiveMailObservation(rawObservation) {
    const observationId = rawObservation && rawObservation.id ? rawObservation.id : "sin-id";
    if (!window.GOSCognitiveMailEngine) {
      const error = new Error(`CognitiveMailEngine: motor no disponible para observation ${observationId}`);
      markStageError("Cognitive", error, { observationId });
      throw error;
    }

    let result;
    let observation;
    let followupCreated = false;
    let decisionCreated = false;

    try {
      result = window.GOSCognitiveMailEngine.processEmail(rawObservation);
      observation = observerBus.recordObservation(result.observation);
      markStageOk("Cognitive", {
        observationId,
        message: `Clasificado: ${(result.analysis.categories || []).join(", ")}`
      });
    } catch (error) {
      markStageError("Cognitive", error, { observationId });
      throw error;
    }

    try {
      followupCreated = upsertFollowup(result.followup);
      decisionCreated = upsertCreatedDecision(result.decision);
      markStageOk("Decision", {
        observationId,
        message: decisionCreated ? "Decision creada/actualizada" : followupCreated ? "Seguimiento creado" : "Sin decision nueva"
      });
    } catch (error) {
      markStageError("Decision", error, { observationId });
      throw error;
    }

    if (result.analysis && window.GOSKnowledgeRegistry) {
      try {
        const extract = result.analysis.extract;
        const intelligence = result.analysis.mailIntelligence || {};
        window.GOSKnowledgeRegistry.upsert("empresas", extract.empresa, {
          nombre: extract.empresa,
          relacion: extract.prioridad === "HIGH" ? "Estrategica" : "Operativa",
          proyectos: [extract.proyecto],
          oportunidades: result.analysis.categories.includes("Oportunidad") ? [extract.temaPrincipal] : [],
          problemas: result.analysis.categories.includes("Problema") ? [extract.temaPrincipal] : [],
          historialEntrada: {
            id: observation.id,
            title: extract.temaPrincipal,
            description: observation.description,
            resumenEjecutivo: intelligence.resumen,
            proximoPaso: intelligence.proximoPasoRecomendado,
            requiereRespuesta: intelligence.requiereRespuesta,
            type: result.analysis.categories.join(", "),
            timestamp: observation.timestamp
          }
        }, `Cognitive Mail actualizo empresa: ${extract.empresa}`);
        if (extract.persona) {
          window.GOSKnowledgeRegistry.upsert("personas", extract.persona, {
            nombre: extract.persona,
            empresa: extract.empresa,
            ultimoContacto: observation.timestamp,
            nivelEstrategico: extract.prioridad === "HIGH" ? "Alto" : "Medio",
            compromisos: result.followup ? [result.followup.motivo] : [],
            historialEntrada: {
              id: observation.id,
              title: extract.temaPrincipal,
              description: observation.description,
              resumenEjecutivo: intelligence.resumen,
              queEsperaDeGuillermo: intelligence.queEsperaDeGuillermo,
              proximoPaso: intelligence.proximoPasoRecomendado,
              timestamp: observation.timestamp
            }
          }, `Cognitive Mail actualizo persona: ${extract.persona}`);
        }
        markStageOk("Cognitive", {
          observationId,
          message: "ADN actualizado"
        });
        emitPipeline(window.GOSEventBus.EVENTS.DNA_UPDATED, {
          observationId: observation.id,
          empresa: extract.empresa,
          persona: extract.persona,
          proyecto: extract.proyecto
        }, {
          lastModule: "ADN Operativo",
          lastUnderstood: `${observation.title} | ${extract.proyecto}`
        });
      } catch (error) {
        markStageError("Cognitive", error, { observationId });
        throw error;
      }
    }

    emitPipeline(window.GOSEventBus.EVENTS.MAIL_UNDERSTOOD, {
      observationId: observation.id,
      title: observation.title,
      analysis: result.analysis
    }, {
      lastModule: "Cognitive Mail Engine",
      lastUnderstood: `${observation.title} | ${result.analysis.extract.proyecto}`
    });

    if (followupCreated || decisionCreated) {
      emitPipeline(window.GOSEventBus.EVENTS.DECISION_UPDATED, {
        observationId: observation.id,
        followupCreated,
        decisionCreated
      }, {
        lastModule: decisionCreated ? "Decision Engine" : "Seguimientos"
      });
    }

    return {
      observation,
      analysis: result.analysis,
      followupCreated,
      decisionCreated,
      followup: result.followup,
      decision: result.decision
    };
  }

  function renderCognitiveMailSummary(results) {
    const processed = (results || []).filter((result) => result.analysis);
    const summary = window.GOSCognitiveMailEngine ? window.GOSCognitiveMailEngine.summarize(processed) : null;
    cognitiveMailGrid.innerHTML = "";

    if (!summary) {
      cognitiveMailSummary.textContent = "Sin motor cognitivo disponible.";
      return;
    }

    cognitiveMailSummary.textContent = summary.text;
    const topResult = processed.find((result) => result.analysis.extract.prioridad === "HIGH") || processed[0] || null;
    const insight = topResult && topResult.analysis ? topResult.analysis.mailIntelligence : null;
    [
      ["Categorias", Object.entries(summary.grouped).map(([key, value]) => `${key}: ${value}`).join(" · ") || "Sin categorias"],
      ["Oportunidades", String(summary.opportunities)],
      ["Riesgos", String(summary.risks)],
      ["Seguimientos", String(summary.followups)],
      ["Decision clave", summary.topDecision || "Sin decision sugerida"],
      ["Este correo importa porque", insight ? insight.porqueImporta : "Sin correo entendido cognitivamente"],
      ["Yo haria", insight ? insight.queHariaYo : "Esperar nuevo contexto"],
      ["Respuesta", insight ? (insight.requiereRespuesta ? "Requiere respuesta" : "Puede esperar") : "Sin evaluar"]
    ].forEach(([label, value]) => {
      const card = makeElement("article", "brief-card");
      card.appendChild(makeElement("h3", null, label));
      card.appendChild(makeElement("p", null, value));
      cognitiveMailGrid.appendChild(card);
    });
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
        emitPipeline(window.GOSEventBus.EVENTS.MAIL_RECEIVED, {
          observation
        }, {
          lastMail: `${observation.title} | ${observation.entity}`,
          pendingCount: 1
        });
        return processCognitiveMailObservation(observation);
      });
      renderOutlookResult(emails, observations.map((result) => result.observation));
      renderCognitiveMailSummary(observations);
      renderOutlookStatus(`${observations.length} correos comprendidos por G-OS.`);
      runDayRoutine("outlook");
      const loopState = window.GOSLifeLoopEngine.beat(getLoopContext());
      renderAll();
      updateHeartStatus(loopState);
      emitPipeline(window.GOSEventBus.EVENTS.HEART_STATUS_UPDATED, {
        state: loopState.state,
        tranquility: loopState.tranquility
      }, {
        lastModule: "Life Loop",
        lastRecalc: timestamp(),
        lastHeart: loopState.lastBeat,
        processedCount: (window.GOSEventBus.getState().processedIds || []).length,
        pendingCount: 0
      });
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

  function getDesktopObserverState() {
    return loadJson(desktopObserverKey, {
      active: false,
      lastReview: null,
      status: "Esperando",
      processedCount: 0,
      lastEmail: null
    });
  }

  function saveDesktopObserverState(state) {
    saveJson(desktopObserverKey, state);
  }

  function getOutlookIdentityState() {
    return loadJson(outlookIdentityKey, {
      principalStore: "",
      principalInbox: "",
      principalAccount: fixedOutlookAccount,
      observedAccount: fixedOutlookAccount,
      observedInbox: "Bandeja de entrada",
      status: "Esperando",
      lastCalibration: "",
      error: ""
    });
  }

  function saveOutlookIdentityState(identity) {
    if (!identity) return getOutlookIdentityState();
    const normalized = {
      ...getOutlookIdentityState(),
      ...identity
    };
    saveJson(outlookIdentityKey, normalized);
    return normalized;
  }

  function renderOutlookIdentity(identity) {
    const current = identity || getOutlookIdentityState();
    const accountMatches = current.principalAccount === fixedOutlookAccount || current.principalStore === fixedOutlookAccount;
    const found = Boolean(accountMatches && current.principalInbox && !current.error);
    outlookIdentityAccount.textContent = fixedOutlookAccount;
    outlookIdentityInbox.textContent = found ? "Bandeja de entrada" : "Sin acceso";
    outlookIdentityCalibration.textContent = found && current.lastCalibration ? window.GOSSystemClock.formatSync(current.lastCalibration) : "Sin lectura";
    outlookIdentityState.textContent = found ? "Conectado" : "Cuenta principal no encontrada.";
    outlookIdentityNote.textContent = found
      ? "G-OS observa exclusivamente la cuenta principal configurada."
      : "Cuenta principal no encontrada.";
    document.body.dataset.identityState = found ? "conectado" : "error";
  }

  async function readOutlookIdentity(options) {
    const silent = options && options.silent;
    try {
      const identity = await fetchJsonWithTimeout(`./desktop_observer/outlook_identity.json?ts=${Date.now()}`, 1200);
      saveOutlookIdentityState(identity);
      renderOutlookIdentity(identity);
      if (!silent && !(identity && identity.error)) outlookIdentityNote.textContent = "Cuenta principal verificada desde runtime local.";
      return identity;
    } catch (error) {
      renderOutlookIdentity();
      if (!silent) {
        outlookIdentityNote.textContent = "No encontre identidad local. Ejecutar desktop_observers/START_OUTLOOK_IDENTITY_ENGINE.cmd para verificar la cuenta principal.";
      }
      return null;
    }
  }

  function getDesktopProcessedIds() {
    return loadJson(desktopProcessedKey, []);
  }

  function saveDesktopProcessedIds(ids) {
    saveJson(desktopProcessedKey, ids.slice(-500));
  }

  function getPipelineStatus() {
    return loadJson(pipelineKey, {
      status: "Esperando",
      lastEvent: "",
      lastMail: "",
      lastUnderstood: "",
      lastModule: "",
      lastRecalc: "",
      lastHeart: "",
      processedCount: 0,
      pendingCount: 0
    });
  }

  function savePipelineStatus(patch) {
    const next = {
      ...getPipelineStatus(),
      ...patch,
      updatedAt: timestamp()
    };
    saveJson(pipelineKey, next);
    renderPipelineStatus(next);
    return next;
  }

  function renderPipelineStatus(state) {
    const current = state || getPipelineStatus();
    const busState = window.GOSEventBus ? window.GOSEventBus.getState() : { stages: {}, errors: [] };
    const hasActiveError = Object.values(busState.stages || {}).some((stage) => stage.status === "error");
    const lastError = hasActiveError ? ((busState.errors || [])[0] || current.lastError || null) : null;
    pipelineStatus.textContent = current.status || "Esperando";
    pipelineState.textContent = current.status || "Esperando";
    pipelineLastEvent.textContent = current.lastEvent || "Sin eventos";
    pipelineLastMail.textContent = current.lastMail || "Sin correo";
    pipelineLastUnderstood.textContent = current.lastUnderstood || "Sin correo entendido";
    pipelineLastModule.textContent = current.lastModule || "Sin actualizaciones";
    pipelineLastRecalc.textContent = current.lastRecalc ? window.GOSSystemClock.formatSync(current.lastRecalc) : "Sin recalculo";
    pipelineLastHeart.textContent = current.lastHeart ? window.GOSSystemClock.formatSync(current.lastHeart) : "Sin latido";
    pipelineProcessedCount.textContent = current.processedCount || 0;
    pipelinePendingCount.textContent = current.pendingCount || 0;
    document.body.dataset.pipelineState = String(current.status || "Esperando").toLowerCase();

    Array.from(pipelineDebug.querySelectorAll(".pipeline-stage")).forEach((node) => {
      const stageName = node.dataset.stage;
      const stage = (busState.stages || {})[stageName] || {};
      const icon = stage.status === "ok" ? "🟢" : stage.status === "error" ? "🔴" : "⚪";
      node.dataset.status = stage.status || "pending";
      node.querySelector("span").textContent = icon;
      node.querySelector("small").textContent = stage.message || "Esperando";
      node.title = stage.error
        ? `${stage.error.module}\n${stage.error.message}\n${stage.error.observationId}\n${stage.error.timestamp}\n${stage.error.stack || ""}`
        : (stage.message || "Esperando");
    });

    if (lastError) {
      pipelineError.hidden = false;
      pipelineError.textContent = [
        `${lastError.module}: ${lastError.message}`,
        `Correo: ${lastError.observationId || "sin id"}`,
        `Timestamp: ${lastError.timestamp}`,
        lastError.stack ? `Stack:\n${lastError.stack}` : ""
      ].filter(Boolean).join("\n");
    } else {
      pipelineError.hidden = true;
      pipelineError.textContent = "";
    }
  }

  function emitPipeline(type, payload, patch) {
    const event = window.GOSEventBus.emit(type, payload || {});
    savePipelineStatus({
      status: "Activo",
      lastEvent: type,
      ...(patch || {})
    });
    return event;
  }

  function markStageOk(module, context) {
    if (window.GOSEventBus) window.GOSEventBus.stageOk(module, context || {});
    renderPipelineStatus();
  }

  function markStageError(module, error, context) {
    const stage = window.GOSEventBus
      ? window.GOSEventBus.stageError(module, error, context || {})
      : null;
    savePipelineStatus({
      status: "Error",
      lastEvent: `${module.toUpperCase()}_ERROR`,
      lastModule: module,
      lastError: stage ? stage.error : {
        module,
        observationId: context && context.observationId ? context.observationId : "",
        message: error && error.message ? error.message : String(error || "Error desconocido"),
        stack: error && error.stack ? error.stack : "",
        timestamp: timestamp()
      }
    });
    return stage;
  }

  function syncLegacyProcessedIds() {
    getDesktopProcessedIds().forEach((id) => window.GOSEventBus.markProcessed(id));
  }

  async function fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs || 1500);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function readOutlookQueue() {
    try {
      const queue = await fetchJsonWithTimeout(`${localBridgeUrl}?ts=${Date.now()}`, 1200);
      markStageOk("Queue", { message: "Cola leida desde Local Bridge" });
      return { queue, mode: "bridge" };
    } catch (bridgeError) {
      if (isGitHubPages()) {
        const message = "Cola local no disponible desde GitHub Pages. Ejecutar G-OS en modo local o iniciar puente local.";
        const queue = {
          status: "Esperando",
          lastReview: timestamp(),
          lastEmail: null,
          processedCount: (window.GOSEventBus.getState().processedIds || []).length,
          intervalSeconds: Number(desktopObserverInterval.value) || 30,
          observations: [],
          bridgeUnavailable: true,
          bridgeError: bridgeError.message
        };
        markStageOk("Queue", { message });
        return { queue, mode: "github-pages-no-bridge", message };
      }

      const queue = await fetchJsonWithTimeout(`./desktop_observer/outlook_desktop_queue.json?ts=${Date.now()}`, 1500);
      markStageOk("Queue", { message: `Cola local leida. Nuevos: ${queue.newObservationCount || 0}` });
      return { queue, mode: "local-file" };
    }
  }

  function renderDesktopObserver(state, imported) {
    const current = state || getDesktopObserverState();
    desktopObserverStatus.textContent = current.status || (current.active ? "Activo" : "Esperando");
    desktopObserverLastReview.textContent = current.lastReview ? window.GOSSystemClock.formatSync(current.lastReview) : "Sin revisar";
    desktopObserverLastEmail.textContent = current.lastEmail ? `${current.lastEmail.title || "Correo"} | ${current.lastEmail.entity || "General"}` : "Sin correos detectados";
    desktopObserverCount.textContent = current.processedCount || 0;

    if (imported !== undefined) {
      desktopObserverResult.innerHTML = "";
      const card = makeElement("article", "row-card");
      card.appendChild(makeElement("p", "section-label", "Observaciones locales"));
      card.appendChild(makeElement("p", null, imported ? `${imported} correos nuevos incorporados a G-OS.` : "Sin correos nuevos en la cola local."));
      desktopObserverResult.appendChild(card);
    }
  }

  async function pollOutlookDesktopQueue(options) {
    const silent = options && options.silent;
    let queue = null;
    let observations = [];
    let newObservations = [];
    let known = new Set();
    let latestMailLabel = "";

    try {
      const queueResult = await readOutlookQueue();
      queue = queueResult.queue;
      if (queueResult.message) {
        savePipelineStatus({
          status: "Esperando",
          lastEvent: "LOCAL_BRIDGE_UNAVAILABLE",
          lastModule: "Queue",
          pendingCount: 0
        });
        desktopObserverNote.textContent = queueResult.message;
      }
    } catch (error) {
      const state = {
        ...getDesktopObserverState(),
        status: "Esperando",
        lastReview: timestamp(),
        error: error.message
      };
      saveDesktopObserverState(state);
      renderDesktopObserver(state, silent ? undefined : 0);
      markStageError("Queue", error, { observationId: "" });
      savePipelineStatus({
        status: "Error",
        lastEvent: "QUEUE_READ_FAILED",
        lastModule: "Queue",
        pendingCount: 0
      });
      desktopObserverNote.textContent = `Queue: ${error.message}`;
      return;
    }

    syncLegacyProcessedIds();
    const processedIds = getDesktopProcessedIds();
    const eventBusState = window.GOSEventBus.getState();
    known = new Set([...(processedIds || []), ...((eventBusState && eventBusState.processedIds) || [])]);
    observations = Array.isArray(queue.observations) ? queue.observations : [];
    newObservations = observations.filter((observation) => observation && observation.id && !known.has(observation.id));
    latestMailLabel = queue.lastEmail ? `${queue.lastEmail.title || "Correo"} | ${queue.lastEmail.sender || queue.lastEmail.entity || "General"}` : "";
    const cognitiveResults = [];

    const state = {
      active: getDesktopObserverState().active,
      status: queue.error ? "Error" : queue.status || "Activo",
      lastReview: queue.lastReview || timestamp(),
      lastEmail: queue.lastEmail || null,
      processedCount: queue.processedCount || processedIds.length,
      intervalSeconds: queue.intervalSeconds || Number(desktopObserverInterval.value) || 30,
      error: queue.error || "",
      identity: queue.identity || queue.debug && queue.debug.identity || null
    };
    saveDesktopObserverState(state);
    renderDesktopObserver(state, silent ? undefined : newObservations.length);
    if (state.identity) {
      renderOutlookIdentity(saveOutlookIdentityState(state.identity));
    }

    if (queue.bridgeUnavailable) {
      savePipelineStatus({
        status: "Esperando",
        lastEvent: "LOCAL_BRIDGE_UNAVAILABLE",
        lastModule: "Queue",
        lastMail: getPipelineStatus().lastMail,
        processedCount: known.size,
        pendingCount: 0
      });
      desktopObserverNote.textContent = "Cola local no disponible desde GitHub Pages. Ejecutar G-OS en modo local o iniciar puente local.";
      return;
    }

    if (queue.error) {
      const error = new Error(queue.error);
      markStageError("Observer", error, {
        observationId: queue.latestObservationId || (queue.lastEmail && queue.lastEmail.id) || ""
      });
      desktopObserverNote.textContent = `Observer: ${queue.error}`;
      return;
    }

    markStageOk("Observer", {
      observationId: queue.latestObservationId || (queue.lastEmail && queue.lastEmail.id) || "",
      message: queue.lastEmail ? `Detecto: ${queue.lastEmail.title || "Correo"}` : "Sin correo nuevo"
    });

    if (queue.lastEmail) {
      emitPipeline(window.GOSEventBus.EVENTS.MAIL_RECEIVED, {
        observation: queue.lastEmail
      }, {
        status: "Activo",
        lastMail: latestMailLabel,
        pendingCount: newObservations.length
      });
    }

    for (const observation of newObservations) {
      const observationId = observation.id || "sin-id";
      try {
        emitPipeline(window.GOSEventBus.EVENTS.MAIL_RECEIVED, {
          observation
        }, {
          status: "Activo",
          lastMail: `${observation.title || "Correo"} | ${observation.sender || observation.entity || "General"}`,
          pendingCount: Math.max(0, newObservations.length - cognitiveResults.length)
        });
        cognitiveResults.push(processCognitiveMailObservation(observation));
        known.add(observationId);
        window.GOSEventBus.markProcessed(observationId);
      } catch (error) {
        desktopObserverNote.textContent = `Pipeline: fallo procesando ${observationId}. ${error.message}`;
      }
    }

    saveDesktopProcessedIds(Array.from(known));

    if (newObservations.length && cognitiveResults.length) {
      try {
        renderCognitiveMailSummary(cognitiveResults);
        markStageOk("Cognitive", {
          message: `Resumen actualizado: ${cognitiveResults.length} correos`
        });
      } catch (error) {
        markStageError("Cognitive", error, {
          observationId: cognitiveResults[0] && cognitiveResults[0].observation ? cognitiveResults[0].observation.id : ""
        });
      }

      try {
        renderBriefing();
        renderExecutiveAgenda();
        emitPipeline(window.GOSEventBus.EVENTS.BRIEFING_UPDATED, {
          count: cognitiveResults.length
        }, {
          lastModule: "Daily Briefing",
          lastRecalc: timestamp(),
          processedCount: known.size,
          pendingCount: Math.max(0, newObservations.length - cognitiveResults.length)
        });
      } catch (error) {
        markStageError("Decision", error, {
          observationId: cognitiveResults[0] && cognitiveResults[0].observation ? cognitiveResults[0].observation.id : ""
        });
      }

      try {
        renderExecutiveDecisionCenter();
        markStageOk("Executive", {
          message: "Tarjetas actualizadas"
        });
        emitPipeline(window.GOSEventBus.EVENTS.EXECUTIVE_CENTER_UPDATED, {
          count: cognitiveResults.length
        }, {
          lastModule: "Centro Ejecutivo",
          lastRecalc: timestamp(),
          processedCount: known.size,
          pendingCount: Math.max(0, newObservations.length - cognitiveResults.length)
        });
      } catch (error) {
        markStageError("Executive", error, {
          observationId: cognitiveResults[0] && cognitiveResults[0].observation ? cognitiveResults[0].observation.id : ""
        });
      }

      try {
        runDayRoutine("outlook_desktop");
        const loopState = window.GOSLifeLoopEngine.beat(getLoopContext());
        updateHeartStatus(loopState);
        renderHeartHistory();
        markStageOk("LifeLoop", {
          message: `Latido ${loopState.state}`
        });
        emitPipeline(window.GOSEventBus.EVENTS.HEART_STATUS_UPDATED, {
          state: loopState.state,
          tranquility: loopState.tranquility
        }, {
          lastModule: "Life Loop",
          lastHeart: loopState.lastBeat,
          lastRecalc: timestamp(),
          processedCount: known.size,
          pendingCount: 0
        });
      } catch (error) {
        markStageError("LifeLoop", error, {
          observationId: cognitiveResults[0] && cognitiveResults[0].observation ? cognitiveResults[0].observation.id : ""
        });
      }

      desktopObserverNote.textContent = "Correo detectado. Pipeline auditado y dashboard actualizado.";
    } else if (newObservations.length && !cognitiveResults.length) {
      savePipelineStatus({
        status: "Error",
        lastModule: "Cognitive",
        processedCount: known.size,
        pendingCount: newObservations.length
      });
    } else {
      savePipelineStatus({
        status: "Esperando",
        lastMail: latestMailLabel || getPipelineStatus().lastMail,
        processedCount: known.size,
        pendingCount: window.GOSEventBus.pendingCount(observations)
      });
      desktopObserverNote.textContent = "Observer activo. Esperando nuevos correos de Outlook Desktop.";
    }
  }

  function startDesktopObserverPolling() {
    const interval = Math.max(5, Math.min(Number(desktopObserverInterval.value) || 30, 300));
    const state = {
      ...getDesktopObserverState(),
      active: true,
      status: "Activo",
      intervalSeconds: interval
    };
    saveDesktopObserverState(state);
    renderDesktopObserver(state);
    desktopObserverNote.textContent = "G-OS esta escuchando la cola local de Outlook Desktop.";
    if (desktopObserverTimer) window.clearInterval(desktopObserverTimer);
    pollOutlookDesktopQueue();
    desktopObserverTimer = window.setInterval(() => pollOutlookDesktopQueue({ silent: true }), interval * 1000);
  }

  function stopDesktopObserverPolling() {
    if (desktopObserverTimer) window.clearInterval(desktopObserverTimer);
    desktopObserverTimer = null;
    const state = {
      ...getDesktopObserverState(),
      active: false,
      status: "Esperando"
    };
    saveDesktopObserverState(state);
    renderDesktopObserver(state);
    desktopObserverNote.textContent = "Observer detenido en G-OS. Si el script PowerShell sigue abierto, cerrarlo manualmente.";
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
        title: briefing.casos && briefing.casos.length ? "Casos importantes" : "Decisiones",
        items: briefing.casos && briefing.casos.length
          ? briefing.casos.map((caso) => `${caso.prioridad}: ${caso.titulo} - ${caso.recommendation}`)
          : briefing.decisiones.map((decision) => `${decision.priority}: ${decision.context}`)
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
        title: briefing.casos && briefing.casos.length ? "Contexto" : "Observaciones",
        items: briefing.casos && briefing.casos.length
          ? briefing.casos.map((caso) => `${caso.titulo}: ${(caso.evidence || []).slice(0, 3).join(" | ") || caso.lastMovement}`)
          : (briefing.observaciones || []).map((observation) => `${observation.source}: ${observation.title}`)
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

  function formatExecutiveDate(value) {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function renderExecutiveSnapshot(center) {
    executiveSnapshot.innerHTML = "";
    const last = center.last || {};
    const groups = center.groups || {};
    const topCase = (groups.cases || [])[0];
    const items = (groups.cases || []).length
      ? [
        ["Caso principal", topCase ? topCase.title : "Sin caso principal"],
        ["Situacion", topCase ? topCase.motivo : "Sin situacion abierta"],
        ["Contexto reciente", topCase && topCase.raw ? (topCase.raw.lastMovement || (topCase.raw.evidence || [])[0] || "Contexto consolidado") : "Sin movimiento reciente"],
        ["Recomendacion", topCase ? topCase.accionSugerida : "Mantener seguimiento normal."]
      ]
      : [
        ["Ultimo correo recibido", last.receivedEmail ? `${last.receivedEmail.title || "Correo"} | ${last.receivedEmail.sender || last.receivedEmail.entity || "Sin remitente"}` : "Sin correo recibido"],
        ["Ultimo correo entendido", last.cognitiveEmail ? `${last.cognitiveEmail.title} | ${last.cognitiveEmail.entity}` : "Sin correo procesado cognitivamente"],
        ["Ultima decision generada", last.generatedDecision ? `${last.generatedDecision.title || last.generatedDecision.context}` : "Sin decision generada"],
        ["Ultima accion sugerida", last.suggestedAction || "Mantener seguimiento normal."]
      ];

    items.forEach(([label, value]) => {
      const card = makeElement("article", "brief-card");
      card.appendChild(makeElement("h3", null, label));
      card.appendChild(makeElement("p", null, value));
      executiveSnapshot.appendChild(card);
    });
  }

  function renderExecutiveKpis(center) {
    executiveKpis.innerHTML = "";
    const groups = center.groups || {};
    const rows = (groups.cases || []).length
      ? [
        ["Casos activos", (groups.cases || []).length],
        ["Casos criticos", (groups.cases || []).filter((item) => item.nivel === "CRITICO").length],
        ["Situaciones altas", (groups.cases || []).filter((item) => item.nivel === "ALTO").length],
        ["Empresas con movimiento", (groups.companies || []).length]
      ]
      : [
        ["Decisiones criticas", (groups.criticalDecisions || []).length],
        ["Riesgos", (groups.risks || []).length],
        ["Oportunidades", (groups.opportunities || []).length],
        ["Seguimientos", (groups.pendingFollowups || []).length],
        ["Empresas con movimiento", (groups.companies || []).length]
      ];
    rows.forEach(([label, value]) => {
      const card = makeElement("article", "brief-card");
      card.appendChild(makeElement("h3", null, label));
      card.appendChild(makeElement("p", null, String(value)));
      executiveKpis.appendChild(card);
    });
  }

  function executiveActionCompleted(message) {
    runDayRoutine("executive_center");
    const loopState = window.GOSLifeLoopEngine.beat(getLoopContext());
    renderAll();
    updateHeartStatus(loopState);
    executiveCenterSummary.textContent = message;
  }

  function resolveExecutiveItem(item) {
    window.GOSExecutiveDecisionCenter.updateItem(item.id, { status: "Resuelto" });
    if (item.kind === "seguimiento") {
      updateFollowup(item.sourceId, () => ({ estado: "Realizado", completedAt: timestamp() }));
      return;
    }
    if (item.kind === "decision" && item.raw) {
      saveDecision({ ...item.raw, state: "Aprobada", updatedAt: timestamp() });
    }
    executiveActionCompleted("Tema resuelto. G-OS recalculo briefing y tranquilidad.");
  }

  function postponeExecutiveItem(item) {
    const nextDate = window.prompt("Nueva fecha sugerida YYYY-MM-DD", tomorrowKey());
    if (!nextDate) return;
    window.GOSExecutiveDecisionCenter.updateItem(item.id, { status: "Pospuesto", postponedTo: nextDate });
    if (item.kind === "seguimiento") {
      updateFollowup(item.sourceId, () => ({ fechaSugerida: nextDate, estado: "Pendiente" }));
      return;
    }
    executiveActionCompleted("Tema pospuesto. G-OS recalculo prioridades.");
  }

  function delegateExecutiveItem(item) {
    window.GOSExecutiveDecisionCenter.updateItem(item.id, { status: "Delegado", delegatedAt: timestamp() });
    executiveActionCompleted("Tema delegado. G-OS lo mantiene en seguimiento.");
  }

  function archiveExecutiveItem(item) {
    window.GOSExecutiveDecisionCenter.updateItem(item.id, { status: "Archivado", archivedAt: timestamp() });
    if (item.kind === "seguimiento") {
      updateFollowup(item.sourceId, () => ({ estado: "Archivado" }));
      return;
    }
    if (item.kind === "decision" && item.raw) {
      saveDecision({ ...item.raw, state: "Archivada", updatedAt: timestamp() });
    }
    executiveActionCompleted("Tema archivado. G-OS recalculo briefing y agenda.");
  }

  function createCodexFromExecutiveItem(item) {
    const prompt = [
      "MISION PARA CODEX - CENTRO EJECUTIVO",
      "",
      "Contexto recuperado:",
      `${item.title}`,
      `${item.empresaPersona} | ${item.proyecto}`,
      `Origen: ${item.origen}`,
      `Motivo: ${item.motivo}`,
      "",
      "Objetivo:",
      item.accionSugerida,
      "",
      "Entregables:",
      "- Resumen ejecutivo.",
      "- Opciones de accion.",
      "- Recomendacion concreta.",
      "- Proximo paso listo para Guillermo.",
      "",
      "Restricciones:",
      "- No inventar datos.",
      "- Mantenerlo accionable desde iPhone.",
      "- No modificar correos ni sistemas externos.",
      "",
      "Criterio de aprobacion:",
      "Guillermo debe poder decidir o delegar en menos de 2 minutos."
    ].join("\n");
    localStorage.setItem(missionKey, prompt);
    missionPrompt.textContent = prompt;
    missionStatus.textContent = "Mision Codex creada desde Centro Ejecutivo.";
    window.GOSExecutiveDecisionCenter.updateItem(item.id, { status: "Delegado a Codex", missionCreatedAt: timestamp() });
    runDayRoutine("executive_codex");
    renderAll();
    activatePanel("codex");
  }

  function renderExecutiveItem(item) {
    const card = makeElement("article", "row-card executive-card");
    card.dataset.level = item.nivel;
    card.dataset.kind = item.kind;
    const isCase = item.kind === "caso" || item.origen === "Caso consolidado";

    if (isCase) {
      const raw = item.raw || {};
      const understood = raw.queEntendi || (raw.mailInsights || [])[0] || null;
      card.classList.add("case-card");
      card.appendChild(makeElement("p", "section-label", "Caso"));
      card.appendChild(makeElement("h3", null, item.title));
      card.appendChild(makeElement("p", null, understood && understood.resumen ? understood.resumen : raw.lastMovement || item.motivo || "Situacion consolidada."));
      card.appendChild(makeElement("p", "muted", `Ultima actividad: ${minutesSince(item.fechaHora)}`));
      card.appendChild(makeElement("p", "muted", `Estado: ${item.nivel === "CRITICO" ? "🔴 Requiere foco" : item.nivel === "ALTO" ? "🟠 Requiere atencion" : "🟢 En seguimiento"}.`));
      card.appendChild(makeElement("p", "muted", `Mi recomendacion: ${item.accionSugerida}`));

      const details = makeElement("div", "case-details");
      details.hidden = true;
      if (understood) {
        details.appendChild(makeElement("p", "section-label", "Que entendi"));
        const understoodList = makeElement("ul");
        [
          ["Resumen", understood.resumen],
          ["Riesgo", understood.riesgo || "No detecto un riesgo concreto."],
          ["Oportunidad", understood.oportunidad || "No detecto una oportunidad directa."],
          ["Que haria yo", understood.queHariaYo],
          ["Proximo paso", understood.proximoPaso]
        ].forEach(([label, value]) => {
          if (value) understoodList.appendChild(makeElement("li", null, `${label}: ${value}`));
        });
        details.appendChild(understoodList);
      }
      [
        ["Timeline", (raw.timeline || []).slice(-5).map((entry) => `${minutesSince(entry.fecha)}: ${entry.titulo}`)],
        ["Correos relacionados", (raw.origenes || []).filter((origin) => String(origin).includes("outlook")).length ? raw.evidence || [] : []],
        ["Decisiones", [`${(raw.decisiones || []).length} decisiones vinculadas.`]],
        ["Seguimientos", [`${(raw.seguimientos || []).length} seguimientos vinculados.`]],
        ["Aprendizajes", raw.aprendizajes || []],
        ["Empresas", [raw.empresa].filter(Boolean)],
        ["Personas", raw.personas || []],
        ["Documentos", raw.documentos || []]
      ].forEach(([label, values]) => {
        details.appendChild(makeElement("p", "section-label", label));
        const list = makeElement("ul");
        const visible = (values || []).filter(Boolean);
        if (!visible.length) list.appendChild(makeElement("li", null, "Sin contexto especifico todavia."));
        visible.slice(0, 5).forEach((value) => list.appendChild(makeElement("li", null, value)));
        details.appendChild(list);
      });

      card.appendChild(makeAction("Ver detalles", "secondary-button compact", () => {
        details.hidden = !details.hidden;
      }));
      card.appendChild(details);
      return card;
    }

    const header = makeElement("div", "row-header compact-header");
    header.appendChild(makeElement("span", `level-chip level-${item.nivel.toLowerCase()}`, item.nivel));
    header.appendChild(makeElement("span", "state-chip", item.status || "Pendiente"));
    card.appendChild(header);
    card.appendChild(makeElement("h3", null, item.title));
    card.appendChild(makeElement("p", null, item.empresaPersona));
    card.appendChild(makeElement("p", "muted", `${item.proyecto} | ${item.origen}`));
    card.appendChild(makeElement("p", "muted", `Motivo: ${item.motivo}`));
    card.appendChild(makeElement("p", "muted", `Accion sugerida: ${item.accionSugerida}`));
    if (item.kind === "caso" || item.origen === "Caso consolidado") {
      const raw = item.raw || {};
      card.appendChild(makeElement("p", "muted", `Evidencias: ${(raw.evidence || []).slice(0, 3).join(" | ") || "Contexto consolidado"}`));
      card.appendChild(makeElement("p", "muted", `Decisiones: ${(raw.decisiones || []).length} | Seguimientos: ${(raw.seguimientos || []).length}`));
    }
    card.appendChild(makeElement("p", "muted", `Fecha/hora: ${formatExecutiveDate(item.fechaHora)}`));

    const actions = makeElement("div", "button-row executive-card-actions");
    actions.appendChild(makeAction("Resolver", "primary-button compact", () => resolveExecutiveItem(item)));
    actions.appendChild(makeAction("Posponer", "secondary-button compact", () => postponeExecutiveItem(item)));
    actions.appendChild(makeAction("Delegar", "secondary-button compact", () => delegateExecutiveItem(item)));
    actions.appendChild(makeAction("Crear mision Codex", "secondary-button compact", () => createCodexFromExecutiveItem(item)));
    actions.appendChild(makeAction("Archivar", "ghost-button compact", () => archiveExecutiveItem(item)));
    card.appendChild(actions);
    return card;
  }

  function renderExecutiveDecisionCenter() {
    const center = getExecutiveDecisionCenter();
    const groups = center.groups || {};
    executiveCenterSummary.textContent = center.summary.text;
    executiveDecisionCenterList.innerHTML = "";
    renderExecutiveSnapshot(center);
    renderExecutiveKpis(center);
    const hasCases = Boolean(groups.cases && groups.cases.length);
    executiveSnapshot.hidden = hasCases;
    executiveKpis.hidden = hasCases;

    const sections = hasCases
      ? [["Casos importantes", groups.cases || []]]
      : [
        ["Decisiones criticas", groups.criticalDecisions || []],
        ["Riesgos", groups.risks || []],
        ["Oportunidades", groups.opportunities || []],
        ["Seguimientos pendientes", groups.pendingFollowups || []]
      ];

    sections.forEach(([title, items]) => {
      const sectionCard = makeElement("article", "row-card");
      sectionCard.appendChild(makeElement("p", "section-label", title));
      if (!items.length) {
        sectionCard.appendChild(makeElement("p", "status-note", "Sin temas relevantes."));
      }
      items.slice(0, hasCases ? 3 : 6).forEach((item) => sectionCard.appendChild(renderExecutiveItem(item)));
      executiveDecisionCenterList.appendChild(sectionCard);
    });

    if (!hasCases) {
      const companyCard = makeElement("article", "row-card");
      companyCard.appendChild(makeElement("p", "section-label", "Empresas con movimiento"));
      const companies = groups.companies || [];
    companyCard.appendChild(makeElement("p", null, companies.length ? companies.join(" · ") : "Sin empresas con movimiento."));
      executiveDecisionCenterList.appendChild(companyCard);
    }
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

  function starRating(value) {
    const normalized = String(value || "").toLowerCase();
    if (normalized.includes("alta") || normalized.includes("muy buena") || normalized.includes("estrategica")) return "★★★★★";
    if (normalized.includes("media") || normalized.includes("seguimiento")) return "★★★★☆";
    if (normalized.includes("baja")) return "★★★☆☆";
    return "★★★★☆";
  }

  function renderRelationshipCard(title, subtitle, details) {
    const card = makeElement("article", "row-card relationship-card");
    card.appendChild(makeElement("p", "section-label", subtitle));
    card.appendChild(makeElement("h3", null, title));
    details.forEach(([label, value]) => {
      const row = makeElement("p", "relationship-line");
      row.appendChild(makeElement("strong", null, label));
      row.appendChild(document.createTextNode(value || "Sin contexto aun."));
      card.appendChild(row);
    });
    return card;
  }

  function renderCompaniesExperience() {
    const snapshot = window.GOSOperationalDNA.buildSnapshot();
    const cases = window.GOSCognitiveConsolidationEngine ? window.GOSCognitiveConsolidationEngine.buildCases(getEngineInput()).slice(0, 20) : [];
    companiesGrid.innerHTML = "";

    if (!snapshot.empresasEstrategicas.length) {
      companiesGrid.appendChild(makeElement("p", "status-note", "Aun no hay relaciones empresariales consolidadas."));
      return;
    }

    snapshot.empresasEstrategicas.slice(0, 6).forEach((company) => {
      const activeCases = cases.filter((caso) => caso.empresa === company.nombre || (caso.proyectos || []).includes(company.nombre));
      const lastHistory = (company.historial || []).slice(-1)[0];
      companiesGrid.appendChild(renderRelationshipCard(company.nombre, starRating(company.confianza || company.relacion), [
        ["Relacion: ", company.relacion || company.estado || "En construccion."],
        ["Ultimo contacto: ", lastHistory && lastHistory.timestamp ? minutesSince(lastHistory.timestamp) : "Sin fecha clara."],
        ["Casos activos: ", String(activeCases.length)],
        ["Aprendizaje: ", (company.aprendizajes || company.oportunidades || ["Conviene mantener contexto antes de decidir."])[0]],
        ["Mi recomendacion: ", activeCases[0] ? activeCases[0].recommendation : "Esperar nueva senal antes de interrumpir."]
      ]));
    });
  }

  function renderPeopleExperience() {
    const snapshot = window.GOSOperationalDNA.buildSnapshot();
    peopleGrid.innerHTML = "";

    if (!snapshot.personasImportantes.length) {
      peopleGrid.appendChild(makeElement("p", "status-note", "Aun no hay personas consolidadas en la memoria ejecutiva."));
      return;
    }

    snapshot.personasImportantes.slice(0, 6).forEach((person) => {
      peopleGrid.appendChild(renderRelationshipCard(person.nombre, person.empresa || "Relacion", [
        ["Empresa: ", person.empresa || "Sin empresa asociada."],
        ["Ultimo contacto: ", person.ultimoContacto ? minutesSince(person.ultimoContacto) : "Sin fecha clara."],
        ["Confianza: ", person.confianza || "Sin evaluar."],
        ["Compromisos: ", (person.compromisos || ["Sin compromisos abiertos."])[0]],
        ["Mi recomendacion: ", person.notas || "Mantener contexto y evitar mensajes sin decision clara."]
      ]));
    });
  }

  function renderMemoryExperience() {
    const snapshot = window.GOSOperationalDNA.buildSnapshot();
    memoryJournal.innerHTML = "";
    const learnings = snapshot.aprendizajes || [];
    const changes = snapshot.ultimosCambios || [];
    const entries = [
      ...learnings.map((item) => ({
        date: item.fecha || item.timestamp || "",
        text: `Aprendimos que ${item.queAprendimos || item.nombre || "hay contexto nuevo para reutilizar"}.`
      })),
      ...changes.slice(0, 6).map((item) => ({
        date: item.timestamp || "",
        text: `Se actualizo ${item.type || "memoria"}: ${item.title || item.detail || "nuevo contexto"}.`
      }))
    ].slice(0, 8);

    if (!entries.length) {
      memoryJournal.appendChild(makeElement("p", "status-note", "La memoria todavia esta empezando a escribir su diario."));
      return;
    }

    entries.forEach((entry) => {
      const card = makeElement("article", "row-card memory-entry");
      card.appendChild(makeElement("p", "section-label", entry.date ? minutesSince(entry.date) : "Memoria"));
      card.appendChild(makeElement("p", null, entry.text));
      memoryJournal.appendChild(card);
    });
  }

  function renderSystemExperience() {
    systemGrid.innerHTML = "";
    [
      ["Capturar informacion", "Agregar una nota, correo o conversacion manual.", "liveInput"],
      ["Nueva idea", "Guardar una idea rapida sin clasificar.", "idea"],
      ["Herramientas Codex", "Preparar misiones y revisar prompts.", "codex"],
      ["Outlook y observadores", "Conexiones y estado tecnico.", "outlook"],
      ["Proyectos y decisiones", "Ver listas completas heredadas.", "projects"],
      ["ADN completo", "Consultar y editar memoria detallada.", "operationalDna"]
    ].forEach(([title, description, target]) => {
      const card = makeElement("article", "brief-card system-card");
      card.appendChild(makeElement("h3", null, title));
      card.appendChild(makeElement("p", null, description));
      card.appendChild(makeAction("Abrir", "secondary-button compact", () => activatePanel(target)));
      systemGrid.appendChild(card);
    });
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
      lifeLoop: window.GOSLifeLoopEngine.getState(),
      executiveDecisionCenter: window.GOSExecutiveDecisionCenter.readState()
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
    const executiveState = window.GOSExecutiveDecisionCenter.readState();
    executiveState.items = Object.fromEntries(Object.entries(executiveState.items || {}).filter(([id]) => !id.includes("demo-")));
    saveJson(window.GOSExecutiveDecisionCenter.stateKey, executiveState);
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

  function clearOperationalMemory() {
    const confirmed = window.confirm([
      "Limpiar memoria operativa de pruebas?",
      "",
      "Se eliminaran eventos manuales/demo/live input, decisiones generadas de prueba, prioridades historicas falsas y estado viejo del pipeline.",
      "No se borrara la configuracion ni el ADN real."
    ].join("\n"));

    if (!confirmed) {
      setDataStatus("Limpieza cancelada.");
      return;
    }

    const preservedEvents = window.GOSEventLog.read().filter((event) => hasRealOutlookSource(event));
    window.GOSEventLog.clear();
    preservedEvents.forEach((event) => window.GOSEventLog.append(event));

    saveJson(createdDecisionKey, loadJson(createdDecisionKey, []).filter((decision) => {
      return hasRealOutlookSource(decision) || (decision.sourceObservationId && String(decision.sourceObservationId).includes("outlook"));
    }));

    saveFollowups(getFollowups().filter((followup) => {
      return hasRealOutlookSource(followup) || (followup.sourceObservationId && String(followup.sourceObservationId).includes("outlook"));
    }));

    const decisionState = loadJson(decisionKey, {});
    Object.keys(decisionState).forEach((id) => {
      if (isOperationalNoise(decisionState[id]) || String(id).includes("demo") || String(id).includes("mail-decision-demo")) {
        delete decisionState[id];
      }
    });
    saveJson(decisionKey, decisionState);

    const executiveState = window.GOSExecutiveDecisionCenter.readState();
    executiveState.items = Object.fromEntries(Object.entries(executiveState.items || {}).filter(([id, item]) => {
      return hasRealOutlookSource(item) || String(id).includes("outlook");
    }));
    saveJson(window.GOSExecutiveDecisionCenter.stateKey, executiveState);

    const desktopIds = getDesktopProcessedIds();
    saveJson(window.GOSEventBus.stateKey, {
      events: [],
      processedIds: desktopIds,
      stages: {},
      errors: [],
      lastProcessedAt: timestamp()
    });

    localStorage.removeItem(pipelineKey);
    localStorage.removeItem("gos:lifeLoop");
    if (window.GOSCognitiveConsolidationEngine) {
      window.GOSCognitiveConsolidationEngine.reset();
    }

    if (isOperationalNoise({ source: validSources.manual, text: localStorage.getItem(missionKey) || "" })) {
      localStorage.removeItem(missionKey);
    }
    if ((localStorage.getItem(learningKey) || "").toLowerCase().includes("demo")) {
      localStorage.removeItem(learningKey);
    }

    clearDemo({ silent: true });
    markStageOk("Queue", { message: "Memoria operativa limpia. Esperando Outlook real o Local Bridge." });
    runDayRoutine("clear_operational_memory");
    renderAll();
    setDataStatus(`Memoria operativa limpia. Se conservaron ${preservedEvents.length} eventos reales de Outlook.`);
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
        if (payload.executiveDecisionCenter && typeof payload.executiveDecisionCenter === "object") saveJson(window.GOSExecutiveDecisionCenter.stateKey, payload.executiveDecisionCenter);
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

  function setupEventBus() {
    Object.values(window.GOSEventBus.EVENTS).forEach((eventName) => {
      window.GOSEventBus.on(eventName, () => renderPipelineStatus());
    });
  }

  function renderAll() {
    renderExecutiveWelcome();
    renderBriefing();
    renderProjects();
    renderDecisions();
    renderExecutiveAgenda();
    renderExecutiveDecisionCenter();
    renderCompaniesExperience();
    renderPeopleExperience();
    renderMemoryExperience();
    renderSystemExperience();
    renderCodex();
    renderIdeas();
    renderContextSelector();
    renderContext();
    renderDna();
    renderCloseDay();
    updateSystemStatus();
    updateHeartStatus();
    renderDesktopObserver();
    renderOutlookIdentity();
    renderPipelineStatus();
  }

  document.getElementById("focusIdea").addEventListener("click", () => ideaInput.focus());
  document.getElementById("saveIdea").addEventListener("click", saveIdea);
  document.getElementById("processLiveEvent").addEventListener("click", processLiveEvent);
  document.getElementById("saveOutlookConfig").addEventListener("click", saveOutlookConfig);
  document.getElementById("connectOutlook").addEventListener("click", connectOutlook);
  document.getElementById("disconnectOutlook").addEventListener("click", disconnectOutlook);
  document.getElementById("readOutlookEmails").addEventListener("click", readOutlookEmails);
  document.getElementById("startDesktopObserver").addEventListener("click", startDesktopObserverPolling);
  document.getElementById("stopDesktopObserver").addEventListener("click", stopDesktopObserverPolling);
  document.getElementById("recalibrateOutlookIdentity").addEventListener("click", () => readOutlookIdentity());
  startDay.addEventListener("click", startExecutiveDay);
  beatNow.addEventListener("click", beatNowAction);
  document.getElementById("loadDemo").addEventListener("click", loadDemo);
  document.getElementById("clearDemo").addEventListener("click", () => clearDemo());
  document.getElementById("clearOperationalMemory").addEventListener("click", clearOperationalMemory);
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
  setupEventBus();
  loadOutlookConfig();
  renderOutlookStatus();
  renderDesktopObserver();
  readOutlookIdentity({ silent: true });
  handleOutlookRedirect();
  observerBus.initialize();
  observerBus.checkUpdates();
  updateSystemStatus(window.GOSLifeEngine.MorningRoutine(getEngineInput()).clock);
  document.body.dataset.dayStarted = "false";
  executiveWelcome.hidden = document.body.dataset.dayStarted === "true";
  renderAll();
  window.GOSLifeLoopEngine.start(getLoopContext());
  window.setInterval(updateHeartStatus, 1000);
  if (getDesktopObserverState().active) startDesktopObserverPolling();
})();
