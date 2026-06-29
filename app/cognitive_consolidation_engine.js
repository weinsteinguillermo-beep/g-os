(function () {
  const STATE_KEY = "gos:cognitiveCases";
  const CASE_LIMIT = 80;
  const MATCH_THRESHOLD = 58;
  const STOPWORDS = new Set([
    "para", "con", "sin", "por", "del", "las", "los", "una", "uno", "que", "este", "esta",
    "correo", "email", "seguimiento", "decision", "pendiente", "general", "cliente", "proveedor"
  ]);

  function now() {
    return new Date().toISOString();
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) || { cases: {}, processedSourceIds: [] };
    } catch (error) {
      return { cases: {}, processedSourceIds: [] };
    }
  }

  function writeState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return state;
  }

  function text(value) {
    return String(value || "").toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function unique(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function tokens(value) {
    return unique(text(value).split(" ").filter((token) => token.length > 2 && !STOPWORDS.has(token))).slice(0, 12);
  }

  function sourceId(source, prefix) {
    return source.id || source.sourceObservationId || `${prefix}-${text(source.title || source.context || source.name || source.motivo).slice(0, 50)}`;
  }

  function priorityValue(priority) {
    if (priority === "CRITICO") return 100;
    if (priority === "HIGH" || priority === "Alta" || priority === "ALTO") return 82;
    if (priority === "MEDIUM" || priority === "Media" || priority === "MEDIO") return 55;
    return 25;
  }

  function priorityLabel(score) {
    if (score >= 85) return "Critica";
    if (score >= 70) return "Alta";
    if (score >= 40) return "Media";
    return "Baja";
  }

  function levelLabel(score) {
    if (score >= 90) return "CRITICO";
    if (score >= 70) return "ALTO";
    if (score >= 40) return "MEDIO";
    return "BAJO";
  }

  function cognitiveOf(observation) {
    return observation && observation.metadata ? observation.metadata.cognitive : null;
  }

  function mailIntelligenceOf(observation, cognitive) {
    if (cognitive && cognitive.mailIntelligence) return cognitive.mailIntelligence;
    return observation && observation.metadata ? observation.metadata.mailIntelligence : null;
  }

  function meaningfulInsight(value, emptyPrefix) {
    const textValue = String(value || "");
    if (!textValue) return "";
    return textValue.toLowerCase().indexOf(String(emptyPrefix || "").toLowerCase()) === 0 ? "" : textValue;
  }

  function extractFromObservation(observation) {
    const cognitive = cognitiveOf(observation);
    const extract = cognitive && cognitive.extract ? cognitive.extract : {};
    const categories = cognitive && cognitive.categories ? cognitive.categories : [];
    const intents = cognitive && cognitive.intent ? cognitive.intent : [];
    const intelligence = mailIntelligenceOf(observation, cognitive);
    const title = (intelligence && intelligence.casoSugerido) || extract.temaPrincipal || observation.title || "Situacion sin titulo";
    return {
      sourceId: sourceId(observation, "obs"),
      sourceType: "observacion",
      title,
      description: (intelligence && intelligence.resumen) || observation.description || observation.bodyPreview || "",
      empresa: (intelligence && intelligence.empresaPersonaRelacionada) || extract.empresa || observation.entity || "",
      persona: extract.persona || observation.sender || "",
      proyecto: extract.proyecto || observation.entity || "",
      priority: extract.prioridad || observation.priority || "LOW",
      timestamp: observation.timestamp || now(),
      sourceName: observation.source || "system",
      categories,
      intents,
      action: (intelligence && intelligence.proximoPasoRecomendado) || extract.accionRequerida || "",
      mailIntelligence: intelligence,
      raw: observation
    };
  }

  function extractFromDecision(decision) {
    return {
      sourceId: sourceId(decision, "decision"),
      sourceType: "decision",
      title: decision.title || decision.context || "Decision pendiente",
      description: decision.context || decision.recommendation || "",
      empresa: decision.company || decision.project || decision.entity || "",
      persona: "",
      proyecto: decision.project || decision.entity || "",
      priority: decision.priority || "Media",
      timestamp: decision.updatedAt || decision.createdAt || decision.timestamp || now(),
      sourceName: decision.origin || decision.origen || "manual",
      categories: ["Decision"],
      intents: decision.state === "Aprobada" ? ["Confirma"] : ["Solicita accion"],
      action: decision.recommendation || "Definir decision.",
      raw: decision
    };
  }

  function extractFromFollowup(followup) {
    return {
      sourceId: sourceId(followup, "followup"),
      sourceType: "seguimiento",
      title: followup.motivo || followup.personaEmpresa || "Seguimiento pendiente",
      description: followup.motivo || "",
      empresa: followup.personaEmpresa || "",
      persona: followup.personaEmpresa || "",
      proyecto: followup.proyectoRelacionado || "",
      priority: followup.prioridad || followup.priority || "MEDIUM",
      timestamp: followup.updatedAt || followup.createdAt || followup.fechaSugerida || now(),
      sourceName: followup.origen || "manual",
      categories: ["Seguimiento"],
      intents: ["Espera respuesta"],
      action: "Resolver o reprogramar seguimiento.",
      raw: followup
    };
  }

  function extractFromProject(project) {
    return {
      sourceId: sourceId(project, "project"),
      sourceType: "proyecto",
      title: project.name || project.title || "Proyecto",
      description: project.status || project.lastActivity || "",
      empresa: project.name || "",
      persona: "",
      proyecto: project.name || "",
      priority: project.priority || "Media",
      timestamp: project.updatedAt || project.createdAt || now(),
      sourceName: "system",
      categories: ["Proyecto"],
      intents: ["Informa"],
      action: project.lastActivity || "Mantener seguimiento.",
      raw: project
    };
  }

  function extractFromIdea(idea) {
    return {
      sourceId: sourceId(idea, "idea"),
      sourceType: "idea",
      title: idea.text || "Idea",
      description: idea.text || "",
      empresa: "",
      persona: "",
      proyecto: "",
      priority: idea.priority || "LOW",
      timestamp: idea.updatedAt || idea.createdAtIso || idea.createdAt || now(),
      sourceName: "manual",
      categories: ["Idea"],
      intents: ["Oportunidad"],
      action: "Evaluar si pasa a proyecto o incubadora.",
      raw: idea
    };
  }

  function candidateSignature(candidate) {
    return [
      candidate.empresa,
      candidate.persona,
      candidate.proyecto,
      candidate.title,
      candidate.description,
      (candidate.categories || []).join(" "),
      (candidate.intents || []).join(" ")
    ].join(" ");
  }

  function caseKeywordSet(caso) {
    return new Set([...(caso.keywords || []), ...tokens(caso.titulo), ...tokens(caso.empresa), ...tokens((caso.proyectos || []).join(" "))]);
  }

  function semanticScore(caso, candidate) {
    let score = 0;
    if (caso.empresa && candidate.empresa && text(caso.empresa) === text(candidate.empresa)) score += 26;
    if ((caso.personas || []).some((person) => text(person) === text(candidate.persona))) score += 18;
    if ((caso.proyectos || []).some((project) => text(project) === text(candidate.proyecto))) score += 22;

    const caseTokens = caseKeywordSet(caso);
    const candidateTokens = tokens(candidateSignature(candidate));
    const overlap = candidateTokens.filter((token) => caseTokens.has(token)).length;
    score += Math.min(overlap * 7, 35);

    if ((caso.riesgos || []).length && (candidate.intents || []).includes("Riesgo")) score += 10;
    if ((caso.oportunidades || []).length && (candidate.intents || []).includes("Oportunidad")) score += 10;
    return score;
  }

  function caseIdFromCandidate(candidate) {
    const base = candidate.proyecto || candidate.empresa || candidate.persona || candidate.title || "caso";
    return `case-${text(base).replace(/\s+/g, "-").slice(0, 60)}-${Math.random().toString(16).slice(2, 7)}`;
  }

  function titleFromCandidate(candidate) {
    if (candidate.proyecto && candidate.proyecto !== "General") return candidate.proyecto;
    if (candidate.empresa && candidate.empresa !== "General") return candidate.empresa;
    return String(candidate.title || "Caso sin titulo").replace(/^(pedido|problema|oportunidad|logistica|factura|seguimiento):\s*/i, "").slice(0, 90);
  }

  function typeFrom(caseData) {
    if ((caseData.riesgos || []).length) return "Riesgo";
    if ((caseData.oportunidades || []).length) return "Oportunidad";
    if ((caseData.proyectos || []).length) return "Proyecto";
    return "Situacion";
  }

  function emptyCase(candidate) {
    const created = now();
    return {
      id: caseIdFromCandidate(candidate),
      titulo: titleFromCandidate(candidate),
      tipo: "Situacion",
      estado: "Activo",
      prioridad: "Media",
      empresa: candidate.empresa || "",
      personas: [],
      proyectos: [],
      documentos: [],
      riesgos: [],
      oportunidades: [],
      seguimientos: [],
      decisiones: [],
      aprendizajes: [],
      timeline: [],
      origenes: [],
      keywords: [],
      sourceIds: [],
      ultimaActualizacion: candidate.timestamp || created,
      score: 0,
      recommendation: "",
      lastMovement: "",
      evidence: [],
      mailInsights: [],
      queEntendi: null
    };
  }

  function insightSnapshot(intelligence, candidate) {
    if (!intelligence) return null;
    return {
      sourceId: candidate.sourceId,
      timestamp: candidate.timestamp || now(),
      resumen: intelligence.resumen || candidate.description || "",
      queEstaPasando: intelligence.queEstaPasando || "",
      quienEscribe: intelligence.quienEscribe || candidate.persona || "",
      empresaPersonaRelacionada: intelligence.empresaPersonaRelacionada || candidate.empresa || "",
      queEsperaDeGuillermo: intelligence.queEsperaDeGuillermo || "",
      requiereRespuesta: Boolean(intelligence.requiereRespuesta),
      urgencia: intelligence.urgencia || "",
      impacto: intelligence.impacto || "",
      riesgo: meaningfulInsight(intelligence.riesgoDetectado, "No detecto"),
      oportunidad: meaningfulInsight(intelligence.oportunidadDetectada, "No detecto"),
      proximoPaso: intelligence.proximoPasoRecomendado || candidate.action || "",
      queHariaYo: intelligence.queHariaYo || intelligence.proximoPasoRecomendado || candidate.action || "",
      porqueImporta: intelligence.porqueImporta || "",
      puedeEsperarPorque: intelligence.puedeEsperarPorque || ""
    };
  }

  function updateCase(caso, candidate) {
    const timestamp = candidate.timestamp || now();
    const categories = candidate.categories || [];
    const intents = candidate.intents || [];
    const evidence = candidate.title || candidate.description || candidate.sourceType;
    const insight = insightSnapshot(candidate.mailIntelligence, candidate);

    caso.empresa = caso.empresa || candidate.empresa || "";
    caso.personas = unique([...(caso.personas || []), candidate.persona]);
    caso.proyectos = unique([...(caso.proyectos || []), candidate.proyecto]);
    caso.origenes = unique([...(caso.origenes || []), candidate.sourceName]);
    caso.keywords = unique([...(caso.keywords || []), ...tokens(candidateSignature(candidate))]).slice(0, 24);
    caso.sourceIds = unique([...(caso.sourceIds || []), candidate.sourceId]);
    caso.timeline = [
      ...(caso.timeline || []),
      {
        fecha: timestamp,
        tipo: candidate.sourceType,
        titulo: candidate.title,
        detalle: candidate.description,
        origen: candidate.sourceName
      }
    ].slice(-20);
    caso.evidence = unique([evidence, ...(caso.evidence || [])]).slice(0, 6);

    if (insight) {
      caso.mailInsights = [
        insight,
        ...(caso.mailInsights || []).filter((item) => item.sourceId !== insight.sourceId)
      ].slice(0, 8);
      caso.queEntendi = insight;
      if (insight.riesgo) caso.riesgos = unique([insight.riesgo, ...(caso.riesgos || [])]).slice(0, 5);
      if (insight.oportunidad) caso.oportunidades = unique([insight.oportunidad, ...(caso.oportunidades || [])]).slice(0, 5);
    }

    if (candidate.sourceType === "seguimiento") caso.seguimientos = unique([...(caso.seguimientos || []), candidate.sourceId]);
    if (candidate.sourceType === "decision") caso.decisiones = unique([...(caso.decisiones || []), candidate.sourceId]);
    if (candidate.sourceType === "aprendizaje") caso.aprendizajes = unique([...(caso.aprendizajes || []), candidate.description || candidate.title]);
    if (categories.includes("Factura") || categories.includes("Logistica") || text(candidate.title).includes("invoice")) {
      caso.documentos = unique([...(caso.documentos || []), candidate.title]).slice(0, 8);
    }
    if (categories.includes("Problema") || intents.includes("Riesgo")) {
      caso.riesgos = unique([candidate.action || candidate.title, ...(caso.riesgos || [])]).slice(0, 5);
    }
    if (categories.includes("Oportunidad") || intents.includes("Oportunidad")) {
      caso.oportunidades = unique([candidate.action || candidate.title, ...(caso.oportunidades || [])]).slice(0, 5);
    }

    const priorityScore = Math.max(priorityValue(caso.prioridad), priorityValue(candidate.priority));
    const relationScore = Math.min((caso.timeline || []).length * 4, 24);
    const riskScore = (caso.riesgos || []).length ? 18 : 0;
    const followupScore = (caso.seguimientos || []).length ? 12 : 0;
    caso.score = Math.min(100, Math.round(priorityScore + relationScore + riskScore + followupScore));
    caso.prioridad = priorityLabel(caso.score);
    caso.level = levelLabel(caso.score);
    caso.tipo = typeFrom(caso);
    caso.ultimaActualizacion = timestamp > (caso.ultimaActualizacion || "") ? timestamp : caso.ultimaActualizacion;
    caso.lastMovement = insight && insight.resumen ? insight.resumen : candidate.title || evidence;
    caso.recommendation = recommendationFor(caso);
    return caso;
  }

  function recommendationFor(caso) {
    if (caso.queEntendi && caso.queEntendi.queHariaYo) return caso.queEntendi.queHariaYo;
    if ((caso.riesgos || []).length) return "Resolver riesgo y definir comunicacion antes de avanzar.";
    if ((caso.seguimientos || []).length) return "Cerrar o reprogramar los seguimientos pendientes.";
    if ((caso.oportunidades || []).length) return "Evaluar oportunidad y decidir proximo paso comercial.";
    if ((caso.decisiones || []).length) return "Tomar decision o seguir analizando con contexto.";
    return "Mantener como contexto activo sin interrumpir.";
  }

  function findCase(cases, candidate) {
    let best = null;
    let bestScore = 0;
    Object.values(cases).forEach((caso) => {
      const score = semanticScore(caso, candidate);
      if (score > bestScore) {
        best = caso;
        bestScore = score;
      }
    });
    return best && bestScore >= MATCH_THRESHOLD ? best : null;
  }

  function candidatesFromInput(input) {
    return [
      ...(input.observaciones || input.observations || []).map(extractFromObservation),
      ...(input.decisiones || input.decisions || []).map(extractFromDecision),
      ...(input.seguimientos || input.followups || []).filter((item) => item.estado !== "Archivado").map(extractFromFollowup),
      ...(input.proyectos || input.projects || []).map(extractFromProject),
      ...(input.ideas || []).filter((item) => item.status !== "Archivada").map(extractFromIdea)
    ].filter((candidate) => candidate && candidate.sourceId);
  }

  function buildCases(input, options) {
    const state = readState();
    const cases = state.cases || {};
    const processed = new Set(state.processedSourceIds || []);
    const force = options && options.force;
    const affected = [];

    candidatesFromInput(input || {}).forEach((candidate) => {
      if (!force && processed.has(candidate.sourceId)) return;
      const existing = findCase(cases, candidate);
      const target = existing || emptyCase(candidate);
      cases[target.id] = updateCase(target, candidate);
      processed.add(candidate.sourceId);
      affected.push(target.id);
    });

    const ordered = Object.values(cases)
      .filter((caso) => caso.estado !== "Archivado")
      .sort((a, b) => {
        if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
        return Date.parse(b.ultimaActualizacion || "") - Date.parse(a.ultimaActualizacion || "");
      })
      .slice(0, CASE_LIMIT);

    writeState({
      cases: Object.fromEntries(ordered.map((caso) => [caso.id, caso])),
      processedSourceIds: Array.from(processed).slice(-1000),
      lastBuildAt: now(),
      lastAffectedCases: unique(affected)
    });

    return ordered;
  }

  function reset() {
    return writeState({ cases: {}, processedSourceIds: [], lastBuildAt: now(), lastAffectedCases: [] });
  }

  window.GOSCognitiveConsolidationEngine = {
    buildCases,
    readState,
    reset,
    stateKey: STATE_KEY
  };
})();
