(function () {
  const REGISTRY_KEY = "gos:operationalDna";

  function now() {
    return new Date().toISOString();
  }

  function emptyRegistry() {
    return {
      personas: {},
      empresas: {},
      proyectos: {},
      decisiones: {},
      aprendizajes: {},
      cambios: []
    };
  }

  function read() {
    try {
      return { ...emptyRegistry(), ...(JSON.parse(localStorage.getItem(REGISTRY_KEY)) || {}) };
    } catch (error) {
      return emptyRegistry();
    }
  }

  function write(registry) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    return registry;
  }

  function slug(value) {
    return String(value || "general")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "general";
  }

  function appendChange(registry, type, title, detail) {
    registry.cambios.unshift({
      id: `change-${Date.now()}-${registry.cambios.length}`,
      type,
      title,
      detail,
      timestamp: now()
    });
    registry.cambios = registry.cambios.slice(0, 80);
  }

  function mergeLists(current, incoming) {
    return Array.from(new Set([...(current || []), ...(incoming || [])].filter(Boolean)));
  }

  function appendHistory(record, entry) {
    const history = record.historial || [];
    const exists = history.some((item) => item.id === entry.id);
    return exists ? history : [...history, entry].slice(-40);
  }

  function upsert(collection, key, data, changeTitle) {
    const registry = read();
    const id = slug(key);
    const current = registry[collection][id] || { id, nombre: key, creado: now(), historial: [] };
    const next = { ...current, ...data, actualizado: now() };

    ["proyectos", "negociaciones", "problemas", "oportunidades", "compromisos", "personas", "decisiones", "aprendizajes"].forEach((field) => {
      if (data[field]) next[field] = mergeLists(current[field], data[field]);
    });

    if (data.demo || data.demoId) {
      next.demo = Boolean(data.demo);
      next.demoId = data.demoId || next.demoId;
    }

    if (data.historialEntrada) {
      next.historial = appendHistory(current, data.historialEntrada);
      delete next.historialEntrada;
    }

    registry[collection][id] = next;
    appendChange(registry, collection, changeTitle || `Actualizado ${key}`, key);
    if (data.demoId && registry.cambios[0]) {
      registry.cambios[0].demo = true;
      registry.cambios[0].demoId = data.demoId;
    }
    write(registry);
    return next;
  }

  function addTimeline(companyName, event) {
    const registry = read();
    const id = slug(companyName);
    const current = registry.empresas[id] || { id, nombre: companyName, creado: now(), historial: [] };
    const timeline = appendHistory(current, event);
    registry.empresas[id] = { ...current, historial: timeline, actualizado: now() };
    appendChange(registry, "timeline", `Nueva experiencia en ${companyName}`, event.title);
    if (event.demoId && registry.cambios[0]) {
      registry.cambios[0].demo = true;
      registry.cambios[0].demoId = event.demoId;
    }
    write(registry);
    return registry.empresas[id];
  }

  function rememberLearning(learning) {
    const id = slug(`${learning.fecha || now()}-${learning.proyectoRelacionado || "general"}-${learning.queFunciono || learning.queAprendimos || "aprendizaje"}`);
    return upsert("aprendizajes", id, {
      nombre: learning.queAprendimos || learning.queFunciono || "Aprendizaje",
      queFunciono: learning.queFunciono || "",
      queNoFunciono: learning.queNoFunciono || "",
      queRepetir: learning.queRepetir || "",
      queEvitar: learning.queEvitar || "",
      fecha: learning.fecha || now(),
      proyectoRelacionado: learning.proyectoRelacionado || "General",
      demo: Boolean(learning.demo),
      demoId: learning.demoId,
      historialEntrada: {
        id,
        title: learning.queAprendimos || "Aprendizaje del dia",
        description: learning.queFunciono || learning.queNoFunciono || "",
        timestamp: now()
      }
    }, "Aprendizaje registrado");
  }

  function list(collection) {
    return Object.values(read()[collection] || {});
  }

  function updateFields(collection, id, fields) {
    const registry = read();
    const current = registry[collection] && registry[collection][id];
    if (!current) return null;
    const next = { ...current, ...fields, actualizado: now() };
    registry[collection][id] = next;
    appendChange(registry, collection, `Editado ${next.nombre || id}`, "Campos ejecutivos actualizados");
    if (fields.demoId && registry.cambios[0]) {
      registry.cambios[0].demo = true;
      registry.cambios[0].demoId = fields.demoId;
    }
    write(registry);
    return next;
  }

  function search(question) {
    const query = String(question || "").toLowerCase();
    const registry = read();
    const all = [
      ...Object.values(registry.personas).map((item) => ({ type: "persona", item })),
      ...Object.values(registry.empresas).map((item) => ({ type: "empresa", item })),
      ...Object.values(registry.proyectos).map((item) => ({ type: "proyecto", item })),
      ...Object.values(registry.decisiones).map((item) => ({ type: "decision", item })),
      ...Object.values(registry.aprendizajes).map((item) => ({ type: "aprendizaje", item }))
    ];

    return all
      .map((entry) => {
        const text = JSON.stringify(entry.item).toLowerCase();
        const words = query.split(/\s+/).filter((word) => word.length > 2);
        const score = words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
        return { ...entry, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }

  window.GOSKnowledgeRegistry = {
    read,
    write,
    upsert,
    addTimeline,
    rememberLearning,
    list,
    updateFields,
    search,
    slug,
    key: REGISTRY_KEY
  };
})();
