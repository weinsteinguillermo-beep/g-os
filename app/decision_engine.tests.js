(function () {
  const input = {
    observaciones: [
      {
        id: "event-ponsse-brasil",
        source: "live_input",
        type: "correo",
        entity: "Mercado Forestal",
        title: "Correo de Ponsse Brasil",
        description: "Cliente estrategico solicita precio y decision comercial para Brasil.",
        priority: "HIGH",
        timestamp: new Date().toISOString(),
        metadata: {}
      },
      {
        id: "event-outdoor",
        source: "live_input",
        type: "idea",
        entity: "Outdoor Import",
        title: "Idea Outdoor Import",
        description: "Idea de producto para evaluar margen.",
        priority: "MEDIUM",
        timestamp: new Date().toISOString(),
        metadata: {}
      },
      {
        id: "event-uruforest",
        source: "live_input",
        type: "nota",
        entity: "URUFOREST",
        title: "Seguimiento URUFOREST",
        description: "Pendiente plan comercial y clientes objetivo.",
        priority: "MEDIUM",
        timestamp: new Date().toISOString(),
        metadata: {}
      }
    ],
    decisiones: [],
    contextGraph: { nodes: [], links: [] }
  };

  const agenda = window.GOSDecisionEngine.buildExecutiveAgenda(input);
  const expected = agenda[0] && agenda[0].title.includes("Ponsse Brasil");
  console.log("Decision Engine test - Brasil first:", expected ? "OK" : "ERROR", agenda);
})();

