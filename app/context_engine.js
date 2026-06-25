(function () {
  const LINK_KEY = "gos:contextLinks";

  function now() {
    return new Date().toISOString();
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function uniq(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function tokens(value) {
    return uniq(
      slug(value)
        .split("-")
        .filter((token) => token.length > 2)
    );
  }

  function readLinks() {
    try {
      return JSON.parse(localStorage.getItem(LINK_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveLinks(links) {
    localStorage.setItem(LINK_KEY, JSON.stringify(links));
  }

  function inferTags(text) {
    const value = String(text || "").toLowerCase();
    const tags = [];
    [
      "mercado forestal",
      "gb",
      "outdoor",
      "guia express",
      "mantenimiento mental",
      "uruforest",
      "cliente",
      "stock",
      "margen",
      "venta",
      "automatizacion",
      "codex",
      "comercial"
    ].forEach((tag) => {
      if (value.includes(tag)) tags.push(tag);
    });
    return tags;
  }

  function normalizeEntity(type, item) {
    const title = item.title || item.name || item.context || item.text || "Sin titulo";
    const description = item.description || item.lastActivity || item.recommendation || item.text || item.context || "";
    const text = `${title} ${description}`;
    const tags = uniq([...(item.tags || []), ...inferTags(text)]);
    const relatedEntities = uniq([...(item.relatedEntities || []), ...(item.entities || []), ...tags]);

    return {
      id: item.id || `${type}-${slug(title)}`,
      type,
      title,
      description,
      tags,
      relatedEntities,
      createdAt: item.createdAtIso || item.createdAt || item.fechaCreacion || now(),
      updatedAt: item.updatedAt || item.fechaUltimaModificacion || item.createdAtIso || now(),
      priority: item.priority || "Media",
      state: item.state || item.status || "Activo",
      source: item
    };
  }

  function buildGraph(input) {
    const ideas = (input.ideas || []).map((item) => normalizeEntity("idea", item));
    const projects = (input.proyectos || input.projects || []).map((item) => normalizeEntity("proyecto", item));
    const decisions = (input.decisiones || input.decisions || []).map((item) => normalizeEntity("decision", item));
    const observations = (input.observaciones || input.observations || []).map((item) => normalizeEntity("observacion", {
      id: item.id,
      title: item.title,
      description: item.description,
      tags: [item.source, item.type, item.entity],
      relatedEntities: [item.source, item.type, item.entity],
      createdAt: item.timestamp,
      updatedAt: item.timestamp,
      priority: item.priority,
      state: "Observado",
      source: item
    }));
    const aprendizajes = (input.aprendizajes || input.learnings || []).map((item, index) => {
      if (typeof item === "string") {
        return normalizeEntity("aprendizaje", {
          id: `aprendizaje-${index}`,
          title: item,
          description: item,
          priority: "Media",
          state: "Activo"
        });
      }
      return normalizeEntity("aprendizaje", item);
    });

    const nodes = [...ideas, ...projects, ...decisions, ...aprendizajes, ...observations];
    const manualLinks = readLinks();
    const links = [...manualLinks];

    nodes.forEach((a) => {
      nodes.forEach((b) => {
        if (a.id === b.id) return;
        const score = relationScore(a, b);
        if (score > 0) {
          links.push({
            from: a.id,
            to: b.id,
            reason: "auto",
            score
          });
        }
      });
    });

    return { nodes, links };
  }

  function relationScore(a, b) {
    let score = 0;
    const aTags = new Set(a.tags);
    const bTags = new Set(b.tags);
    const aEntities = new Set(a.relatedEntities.map(slug));
    const bEntities = new Set(b.relatedEntities.map(slug));
    const aTokens = new Set(tokens(`${a.title} ${a.description}`));
    const bTokens = new Set(tokens(`${b.title} ${b.description}`));

    aTags.forEach((tag) => {
      if (bTags.has(tag)) score += 30;
    });
    aEntities.forEach((entity) => {
      if (bEntities.has(entity)) score += 24;
    });
    aTokens.forEach((token) => {
      if (bTokens.has(token)) score += 4;
    });

    if (slug(a.title) && slug(b.description).includes(slug(a.title))) score += 40;
    if (slug(b.title) && slug(a.description).includes(slug(b.title))) score += 40;

    return score >= 12 ? score : 0;
  }

  function linkEntity(fromId, toId, reason) {
    const links = readLinks();
    const exists = links.some((link) => link.from === fromId && link.to === toId);
    if (!exists) {
      links.push({
        from: fromId,
        to: toId,
        reason: reason || "manual",
        score: 100,
        createdAt: now()
      });
      saveLinks(links);
    }
    return links;
  }

  function findRelatedContext(query, input) {
    const graph = buildGraph(input || {});
    const querySlug = slug(query);
    const queryTokens = new Set(tokens(query));

    const seedNodes = graph.nodes.filter((node) => {
      const haystack = slug(`${node.id} ${node.title} ${node.description} ${node.tags.join(" ")} ${node.relatedEntities.join(" ")}`);
      if (haystack.includes(querySlug)) return true;
      return Array.from(queryTokens).some((token) => haystack.includes(token));
    });

    const seedIds = new Set(seedNodes.map((node) => node.id));
    const relatedScores = new Map();

    seedNodes.forEach((node) => relatedScores.set(node.id, 120));

    graph.links.forEach((link) => {
      if (seedIds.has(link.from)) relatedScores.set(link.to, Math.max(relatedScores.get(link.to) || 0, link.score));
      if (seedIds.has(link.to)) relatedScores.set(link.from, Math.max(relatedScores.get(link.from) || 0, link.score));
    });

    const related = graph.nodes
      .filter((node) => relatedScores.has(node.id))
      .map((node) => ({ ...node, relevance: relatedScores.get(node.id) }))
      .sort((a, b) => b.relevance - a.relevance);

    return {
      query,
      seeds: seedNodes,
      related,
      grouped: groupByType(related)
    };
  }

  function groupByType(nodes) {
    return nodes.reduce((groups, node) => {
      const key = node.type === "observacion" ? "observaciones" : node.type + "s";
      groups[key] = groups[key] || [];
      groups[key].push(node);
      return groups;
    }, {});
  }

  window.GOSContextEngine = {
    buildGraph,
    linkEntity,
    findRelatedContext,
    normalizeEntity,
    relationScore
  };
})();
