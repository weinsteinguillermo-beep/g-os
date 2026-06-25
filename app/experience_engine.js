(function () {
  const COMPANY_RULES = [
    { name: "Ponsse", terms: ["ponsse"] },
    { name: "Master Florestal", terms: ["master florestal", "master", "florestal"] },
    { name: "GB Sudamerica", terms: ["gb sudamerica", "gb sudamérica", "gb"] },
    { name: "Quantum", terms: ["quantum"] },
    { name: "Oregon", terms: ["oregon"] },
    { name: "Log Max", terms: ["log max", "logmax"] },
    { name: "EcoLog", terms: ["ecolog", "eco log"] },
    { name: "Klabin", terms: ["klabin"] },
    { name: "URUFOREST", terms: ["uruforest"] },
    { name: "Outdoor Import", terms: ["outdoor import", "outdoor"] },
    { name: "Mercado Forestal", terms: ["mercado forestal", "brasil"] },
    { name: "Guia Express", terms: ["guia express", "guía express"] },
    { name: "Mantenimiento Mental", terms: ["mantenimiento mental"] },
    { name: "Caseritas", terms: ["caseritas"] }
  ];

  const PEOPLE_RULES = [
    { name: "Rafael Moraes", terms: ["rafael moraes", "rafael"] },
    { name: "Guillermo Weinstein", terms: ["guillermo", "weinstein"] }
  ];

  const DECISION_TERMS = ["decidir", "decision", "decisión", "aprobar", "rechazar", "definir", "confirmar"];
  const PROBLEM_TERMS = ["problema", "bloqueo", "bloqueado", "error", "demora", "riesgo", "trancado"];
  const OPPORTUNITY_TERMS = ["oportunidad", "potencial", "venta", "cliente", "margen", "volumen", "cotizacion", "cotización"];
  const COMMITMENT_TERMS = ["pendiente", "compromiso", "responder", "enviar", "preparar", "llamar", "reunion", "reunión"];

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function includesAny(text, terms) {
    return terms.some((term) => text.includes(term));
  }

  function detectByRules(text, rules) {
    return rules.filter((rule) => rule.terms.some((term) => text.includes(term))).map((rule) => rule.name);
  }

  function detectPeople(text) {
    const people = detectByRules(normalize(text), PEOPLE_RULES);
    const match = String(text).match(/(?:con|de|para)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/);
    if (match && !people.includes(match[1]) && !isCompanyLike(match[1])) people.push(match[1]);
    return people;
  }

  function isCompanyLike(value) {
    const text = normalize(value);
    return COMPANY_RULES.some((rule) => {
      return rule.name.toLowerCase() === text || rule.terms.some((term) => text.includes(term));
    });
  }

  function eventText(observation) {
    return `${observation.title || ""} ${observation.description || ""} ${observation.entity || ""}`.trim();
  }

  function classify(text, observation) {
    const value = normalize(text);
    const types = [];
    if (includesAny(value, DECISION_TERMS)) types.push("decision");
    if (includesAny(value, PROBLEM_TERMS)) types.push("problema");
    if (includesAny(value, OPPORTUNITY_TERMS)) types.push("oportunidad");
    if (includesAny(value, COMMITMENT_TERMS)) types.push("compromiso");
    if (observation.type === "idea") types.push("idea");
    if (!types.length) types.push("contexto");
    return types;
  }

  function buildLearning(types, observation) {
    if (types.includes("problema")) {
      return {
        queAprendimos: `Hay friccion o riesgo en ${observation.entity || "General"}.`,
        queNoFunciono: observation.title || "Evento con problema detectado",
        queEvitar: "Dejar el bloqueo sin responsable ni proximo paso."
      };
    }
    if (types.includes("oportunidad")) {
      return {
        queAprendimos: `${observation.entity || "General"} puede abrir valor comercial.`,
        queFunciono: "Capturar la oportunidad como evento antes de perder contexto.",
        queRepetir: "Relacionar oportunidad con proyecto y decision concreta."
      };
    }
    return {
      queAprendimos: `Nuevo contexto registrado para ${observation.entity || "General"}.`
    };
  }

  function createExperience(observation, registry) {
    const text = eventText(observation);
    const normalized = normalize(text);
    const companies = detectByRules(normalized, COMPANY_RULES);
    const people = detectPeople(text);
    const project = observation.metadata && observation.metadata.relatedProject
      ? observation.metadata.relatedProject
      : observation.entity || companies[0] || "General";
    const types = classify(text, observation);
    const knownCompanies = companies.filter((company) => registry.empresas[window.GOSKnowledgeRegistry.slug(company)]);
    const knownPeople = people.filter((person) => registry.personas[window.GOSKnowledgeRegistry.slug(person)]);
    const modifiesKnown = knownCompanies.length > 0 || knownPeople.length > 0 || registry.proyectos[window.GOSKnowledgeRegistry.slug(project)];

    return {
      id: `experience-${observation.id || Date.now()}`,
      sourceObservationId: observation.id,
      title: observation.title || "Experiencia sin titulo",
      description: observation.description || "",
      type: types,
      project,
      companies,
      people,
      priority: observation.priority || "Media",
      timestamp: observation.timestamp || new Date().toISOString(),
      demo: observation.demo || (observation.metadata && observation.metadata.demoId),
      demoId: observation.metadata && observation.metadata.demoId,
      modifiesKnown,
      action: modifiesKnown ? "actualizar_memoria" : "crear_conocimiento",
      learning: buildLearning(types, observation)
    };
  }

  function summarizeExperience(experience) {
    const company = experience.companies[0] || experience.project;
    const action = experience.modifiesKnown ? "actualizo memoria" : "creo conocimiento nuevo";
    return `${company}: ${action} por ${experience.type.join(", ")}.`;
  }

  window.GOSExperienceEngine = {
    createExperience,
    summarizeExperience,
    detectByRules,
    detectPeople
  };
})();
