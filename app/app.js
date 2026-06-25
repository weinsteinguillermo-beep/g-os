(function () {
  const data = window.GOS_DATA;
  const ideaKey = "gos:mvp:ideas";
  const decisionKey = "gos:mvp:decisions";
  const missionKey = "gos:mvp:lastMission";
  const learningKey = "gos:mvp:dailyLearning";

  const todayLabel = document.getElementById("todayLabel");
  const dailyRecommendation = document.getElementById("dailyRecommendation");
  const dailyQuestion = document.getElementById("dailyQuestion");
  const briefingGrid = document.getElementById("briefingGrid");
  const projectsList = document.getElementById("projectsList");
  const decisionsList = document.getElementById("decisionsList");
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
    return data.decisions.map((decision) => ({
      ...decision,
      state: "Pendiente",
      ...stored[decision.id]
    }));
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

  function renderBriefing() {
    const decisions = getDecisions()
      .filter((decision) => decision.state !== "Archivada")
      .slice(0, 3)
      .map((decision) => `${decision.priority}: ${decision.context}`);
    const projects = data.projects
      .filter((project) => project.priority === "Alta")
      .slice(0, 3)
      .map((project) => `${project.name}: ${project.status}`);
    const risks = findBriefingItems("Riesgos").slice(0, 3);
    const opportunities = findBriefingItems("Oportunidades").slice(0, 3);

    dailyRecommendation.textContent = data.recommendation;
    dailyQuestion.textContent = data.question;
    todayLabel.textContent = formatDate();
    briefingGrid.innerHTML = "";

    [
      { title: "Decisiones", items: decisions },
      { title: "Proyectos importantes", items: projects },
      { title: "Riesgos", items: risks },
      { title: "Oportunidades", items: opportunities }
    ].forEach(renderBriefCard);
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
      projectsList.appendChild(item);
    });
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
      lastMission: localStorage.getItem(missionKey) || "",
      dailyLearning: localStorage.getItem(learningKey) || ""
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

  function importData(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const payload = JSON.parse(reader.result);
        if (Array.isArray(payload.ideas)) saveJson(ideaKey, payload.ideas);
        if (payload.decisions && typeof payload.decisions === "object") saveJson(decisionKey, payload.decisions);
        if (typeof payload.lastMission === "string") localStorage.setItem(missionKey, payload.lastMission);
        if (typeof payload.dailyLearning === "string") localStorage.setItem(learningKey, payload.dailyLearning);
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
    renderCodex();
    renderIdeas();
    renderCloseDay();
  }

  document.getElementById("focusIdea").addEventListener("click", () => ideaInput.focus());
  document.getElementById("saveIdea").addEventListener("click", saveIdea);
  document.getElementById("newMission").addEventListener("click", () => {
    const prompt = buildMissionPrompt();
    localStorage.setItem(missionKey, prompt);
    missionPrompt.textContent = prompt;
    missionStatus.textContent = "Prompt generado. Listo para copiar.";
  });
  document.getElementById("copyMission").addEventListener("click", copyMission);
  document.getElementById("saveLearning").addEventListener("click", saveLearning);
  document.getElementById("copyCloseDay").addEventListener("click", copyCloseDay);
  document.getElementById("morningMode").addEventListener("click", () => setMode("morning"));
  document.getElementById("closeMode").addEventListener("click", () => setMode("close"));
  document.getElementById("exportData").addEventListener("click", exportData);
  document.getElementById("importData").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", () => {
    const file = importFile.files[0];
    if (file) importData(file);
    importFile.value = "";
  });

  setupNavigation();
  renderAll();
})();
