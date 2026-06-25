(function () {
  function registry() {
    return window.GOSKnowledgeRegistry.read();
  }

  function upsertCompany(experience) {
    const companies = experience.companies.length ? experience.companies : [experience.project];
    return companies.map((company) => {
      const data = {
        nombre: company,
        relacion: experience.priority === "HIGH" ? "Estrategica" : "Operativa",
        demo: Boolean(experience.demo),
        demoId: experience.demoId,
        proyectos: [experience.project],
        oportunidades: experience.type.includes("oportunidad") ? [experience.title] : [],
        problemas: experience.type.includes("problema") ? [experience.title] : [],
        negociaciones: experience.type.includes("decision") || experience.type.includes("compromiso") ? [experience.title] : [],
        historialEntrada: {
          id: experience.id,
          title: experience.title,
          description: experience.description,
          type: experience.type.join(", "),
          timestamp: experience.timestamp,
          demo: Boolean(experience.demo),
          demoId: experience.demoId
        }
      };
      const saved = window.GOSKnowledgeRegistry.upsert("empresas", company, data, `Empresa actualizada: ${company}`);
      window.GOSKnowledgeRegistry.addTimeline(company, data.historialEntrada);
      return saved;
    });
  }

  function upsertPeople(experience) {
    return experience.people.map((person) => {
      return window.GOSKnowledgeRegistry.upsert("personas", person, {
        nombre: person,
        empresa: experience.companies[0] || experience.project,
        cargo: "",
        ultimoContacto: experience.timestamp,
        frecuencia: "Por definir",
        nivelEstrategico: experience.priority === "HIGH" ? "Alto" : "Medio",
        demo: Boolean(experience.demo),
        demoId: experience.demoId,
        compromisos: experience.type.includes("compromiso") ? [experience.title] : [],
        confianza: "Sin evaluar",
        historialEntrada: {
          id: experience.id,
          title: experience.title,
          description: experience.description,
          timestamp: experience.timestamp,
          demo: Boolean(experience.demo),
          demoId: experience.demoId
        }
      }, `Persona actualizada: ${person}`);
    });
  }

  function upsertProject(experience) {
    return window.GOSKnowledgeRegistry.upsert("proyectos", experience.project, {
      nombre: experience.project,
      fechaInicio: experience.timestamp,
      objetivo: `Ordenar contexto y decisiones de ${experience.project}.`,
      estado: experience.type.includes("problema") ? "Con bloqueo o riesgo" : "Activo",
      demo: Boolean(experience.demo),
      demoId: experience.demoId,
      bloqueos: experience.type.includes("problema") ? [experience.title] : [],
      avances: experience.type.includes("oportunidad") || experience.type.includes("contexto") ? [experience.title] : [],
      personas: experience.people,
      decisiones: experience.type.includes("decision") ? [experience.title] : [],
      resultado: "",
      aprendizajes: [experience.learning.queAprendimos],
      historialEntrada: {
        id: experience.id,
        title: experience.title,
        description: experience.description,
        timestamp: experience.timestamp,
        demo: Boolean(experience.demo),
        demoId: experience.demoId
      }
    }, `Proyecto actualizado: ${experience.project}`);
  }

  function upsertDecision(experience) {
    if (!experience.type.includes("decision")) return null;
    return window.GOSKnowledgeRegistry.upsert("decisiones", experience.title, {
      nombre: experience.title,
      queSeDecidio: experience.title,
      porQue: experience.description || "Registrado desde evento.",
      quienParticipo: experience.people,
      resultado: "",
      fecha: experience.timestamp,
      impacto: experience.priority === "HIGH" ? "Alto" : "Medio",
      demo: Boolean(experience.demo),
      demoId: experience.demoId,
      historialEntrada: {
        id: experience.id,
        title: experience.title,
        description: experience.description,
        timestamp: experience.timestamp,
        demo: Boolean(experience.demo),
        demoId: experience.demoId
      }
    }, `Decision registrada: ${experience.title}`);
  }

  function rememberExperience(observation) {
    if (!observation || !window.GOSExperienceEngine || !window.GOSKnowledgeRegistry) return null;
    const experience = window.GOSExperienceEngine.createExperience(observation, registry());
    upsertCompany(experience);
    upsertPeople(experience);
    upsertProject(experience);
    upsertDecision(experience);
    window.GOSKnowledgeRegistry.rememberLearning({
      ...experience.learning,
      fecha: experience.timestamp,
      proyectoRelacionado: experience.project,
      demo: Boolean(experience.demo),
      demoId: experience.demoId
    });
    return experience;
  }

  function recordDailyClose(input, summary) {
    const learning = (summary && summary.aprendizaje) || (input.aprendizajes || [])[0] || "";
    if (!learning) return null;

    return window.GOSKnowledgeRegistry.rememberLearning({
      queAprendimos: learning,
      queFunciono: "Cerrar el dia dejando aprendizaje explicito.",
      queNoFunciono: "",
      queRepetir: "Registrar cierre diario.",
      queEvitar: "Confiar solo en memoria humana.",
      fecha: new Date().toISOString().slice(0, 10),
      proyectoRelacionado: "G-OS"
    });
  }

  function buildSnapshot() {
    const state = registry();
    return {
      personasImportantes: Object.values(state.personas)
        .sort((a, b) => String(b.ultimoContacto || "").localeCompare(String(a.ultimoContacto || "")))
        .slice(0, 12),
      empresasEstrategicas: Object.values(state.empresas)
        .sort((a, b) => (b.historial || []).length - (a.historial || []).length)
        .slice(0, 12),
      proyectosHistoricos: Object.values(state.proyectos)
        .sort((a, b) => String(b.actualizado || "").localeCompare(String(a.actualizado || "")))
        .slice(0, 12),
      aprendizajes: Object.values(state.aprendizajes)
        .sort((a, b) => String(b.fecha || b.actualizado || "").localeCompare(String(a.fecha || a.actualizado || "")))
        .slice(0, 12),
      clientes: Object.values(state.empresas).filter((company) => company.relacion === "Estrategica").slice(0, 12),
      relaciones: buildRelations(state).slice(0, 12),
      ultimosCambios: state.cambios.slice(0, 12)
    };
  }

  function buildRelations(state) {
    const relations = [];
    Object.values(state.empresas).forEach((company) => {
      (company.proyectos || []).forEach((project) => {
        relations.push(`${company.nombre} -> ${project}`);
      });
    });
    return Array.from(new Set(relations));
  }

  function search(question) {
    return window.GOSKnowledgeRegistry.search(question);
  }

  function executiveQuery(question) {
    const text = String(question || "").toLowerCase();
    const state = registry();
    const results = search(question);
    const companyMatch = findCompanyInQuestion(text, state);
    if (companyMatch && (text.includes("sabemos") || text.includes("empresa") || text.includes("cliente") || text.includes("proveedor"))) {
      return buildExecutiveAnswer({
        result: `Empresa: ${companyMatch.nombre}`,
        title: companyMatch.nombre,
        project: (companyMatch.proyectos && companyMatch.proyectos[0]) || companyMatch.nombre,
        priority: companyMatch.relacion === "Estrategica" ? "Alta" : "Media",
        context: contextOf("empresa", companyMatch),
        lastMovement: lastMovementOf(companyMatch),
        recommendation: recommendationOf("empresa", companyMatch),
        nextStep: nextStepOf("empresa", companyMatch)
      });
    }
    const top = results[0];
    const item = top && top.item;
    const frozenProjects = Object.values(state.proyectos).filter((project) => {
      return String(project.estado || "").toLowerCase().includes("bloqueo")
        || String(project.estado || "").toLowerCase().includes("congelado")
        || (project.bloqueos || []).length > 0;
    });

    if (text.includes("congelado") || text.includes("bloqueado") || text.includes("trancado")) {
      return buildExecutiveAnswer({
        result: frozenProjects.length ? frozenProjects.map((project) => project.nombre).join(", ") : "No hay proyectos congelados registrados.",
        title: frozenProjects.length ? `Desbloquear ${frozenProjects[0].nombre}` : "Sin proyectos congelados",
        project: frozenProjects[0] ? frozenProjects[0].nombre : "General",
        priority: frozenProjects.length ? "Alta" : "Baja",
        context: frozenProjects.length ? "El ADN detecto proyectos con bloqueos o estado detenido." : "No encontre bloqueos persistentes en la memoria local.",
        lastMovement: frozenProjects[0] ? frozenProjects[0].actualizado || frozenProjects[0].fechaInicio || "Sin fecha" : "Sin movimiento relevante.",
        recommendation: frozenProjects.length ? "Elegir un proyecto y definir responsable, desbloqueo y fecha." : "Mantener seguimiento normal.",
        nextStep: frozenProjects.length ? `Revisar ${frozenProjects[0].nombre}.` : "Registrar bloqueos cuando aparezcan."
      });
    }

    if (!item) {
      return buildExecutiveAnswer({
        result: "No encontre memoria suficiente.",
        title: "Completar memoria del ADN",
        project: "G-OS",
        priority: "Baja",
        context: "La consulta no coincide todavia con personas, empresas, proyectos, decisiones o aprendizajes registrados.",
        lastMovement: "Sin movimiento registrado.",
        recommendation: "Cargar un evento real relacionado para alimentar el ADN.",
        nextStep: "Pegar correo, nota o conversacion en Nuevo Evento."
      });
    }

    return buildExecutiveAnswer({
      result: `${labelOf(top.type)}: ${item.nombre || item.queAprendimos || item.queSeDecidio || "Registro encontrado"}`,
      title: item.nombre || item.queAprendimos || item.queSeDecidio || "Registro ADN",
      project: item.proyectoRelacionado || (item.proyectos && item.proyectos[0]) || item.empresa || item.nombre || "General",
      priority: item.nivelEstrategico === "Alto" || item.relacion === "Estrategica" ? "Alta" : "Media",
      context: contextOf(top.type, item),
      lastMovement: lastMovementOf(item),
      recommendation: recommendationOf(top.type, item),
      nextStep: nextStepOf(top.type, item)
    });
  }

  function findCompanyInQuestion(text, state) {
    return Object.values(state.empresas).find((company) => {
      return text.includes(String(company.nombre || "").toLowerCase());
    });
  }

  function buildExecutiveAnswer(parts) {
    return {
      resultadoEncontrado: parts.result,
      contexto: parts.context,
      ultimoMovimiento: parts.lastMovement,
      recomendacion: parts.recommendation,
      proximoPaso: parts.nextStep,
      titulo: parts.title || parts.result,
      proyectoRelacionado: parts.project || "General",
      prioridadSugerida: parts.priority || "Media",
      origen: "ADN"
    };
  }

  function labelOf(type) {
    return {
      persona: "Persona",
      empresa: "Empresa",
      proyecto: "Proyecto",
      decision: "Decision",
      aprendizaje: "Aprendizaje"
    }[type] || "Registro";
  }

  function contextOf(type, item) {
    if (type === "persona") return `${item.empresa || "Sin empresa"} | Confianza: ${item.confianza || "Sin evaluar"} | Nivel: ${item.nivelEstrategico || "Sin definir"}`;
    if (type === "empresa") return `Relacion: ${item.relacion || "Sin definir"} | Proyectos: ${(item.proyectos || []).join(", ") || "Sin proyectos"}`;
    if (type === "proyecto") return `Estado: ${item.estado || "Sin estado"} | Objetivo: ${item.objetivo || "Sin objetivo"}`;
    if (type === "aprendizaje") return `Proyecto relacionado: ${item.proyectoRelacionado || "General"}`;
    return item.porQue || item.resultado || "Registro encontrado en memoria local.";
  }

  function lastMovementOf(item) {
    if (item.ultimoContacto) return item.ultimoContacto;
    if (item.historial && item.historial.length) return item.historial[item.historial.length - 1].timestamp || item.actualizado || "Sin fecha";
    return item.fecha || item.actualizado || item.creado || "Sin fecha";
  }

  function recommendationOf(type, item) {
    if (type === "persona") return "Usar historial antes de contactar y actualizar confianza luego de la proxima interaccion.";
    if (type === "empresa") return "Revisar timeline y decidir si requiere accion comercial o solo seguimiento.";
    if (type === "proyecto") return item.estado && item.estado.includes("bloqueo") ? "Definir desbloqueo y responsable." : "Mantener foco en proximo paso ejecutivo.";
    if (type === "aprendizaje") return "Reutilizar el aprendizaje en decisiones similares.";
    return "Revisar contexto antes de decidir.";
  }

  function nextStepOf(type, item) {
    if (type === "persona") return `Preparar contacto con ${item.nombre}.`;
    if (type === "empresa") return `Abrir timeline de ${item.nombre}.`;
    if (type === "proyecto") return `Definir siguiente accion de ${item.nombre}.`;
    if (type === "aprendizaje") return "Aplicarlo al proximo caso parecido.";
    return "Convertir el registro en decision o seguimiento.";
  }

  function timeline(companyName) {
    const state = window.GOSKnowledgeRegistry.read();
    const company = state.empresas[window.GOSKnowledgeRegistry.slug(companyName)];
    if (!company) return null;
    const projects = Object.values(state.proyectos).filter((project) => (company.proyectos || []).includes(project.nombre));
    const decisions = Object.values(state.decisiones).filter((decision) => {
      const text = JSON.stringify(decision).toLowerCase();
      return text.includes(company.nombre.toLowerCase()) || (company.proyectos || []).some((project) => text.includes(project.toLowerCase()));
    });
    const learnings = Object.values(state.aprendizajes).filter((learning) => {
      const text = JSON.stringify(learning).toLowerCase();
      return text.includes(company.nombre.toLowerCase()) || (company.proyectos || []).some((project) => text.includes(project.toLowerCase()));
    });
    const people = Object.values(state.personas).filter((person) => {
      return person.empresa === company.nombre || (company.proyectos || []).includes(person.empresa);
    });

    return {
      company,
      eventos: company.historial || [],
      personas: people,
      decisiones: decisions,
      aprendizajes: learnings,
      proyectos: projects,
      ultimaActividad: lastMovementOf(company)
    };
  }

  function updateRecord(type, id, fields) {
    const collection = type === "persona" ? "personas" : "empresas";
    return window.GOSKnowledgeRegistry.updateFields(collection, id, fields);
  }

  window.GOSOperationalDNA = {
    rememberExperience,
    recordDailyClose,
    buildSnapshot,
    search,
    executiveQuery,
    timeline,
    updateRecord
  };
})();
