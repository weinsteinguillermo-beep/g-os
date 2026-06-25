(function () {
  const output = document.getElementById("output");
  const results = [];

  function assert(label, condition) {
    results.push(`${condition ? "OK" : "ERROR"} - ${label}`);
    if (!condition) {
      console.error("Chief of Staff test failed:", label);
    }
  }

  const briefing = window.GOSChiefOfStaff.generateDailyBriefing({
    ideas: [
      {
        text: "Comparar proveedores Outdoor por margen y riesgo",
        status: "Nueva",
        priority: "Media"
      }
    ],
    proyectos: [
      {
        name: "Mercado Forestal",
        status: "En definicion operativa",
        priority: "Alta",
        lastActivity: "Falta cerrar clientes como primer modulo."
      },
      {
        name: "Mantenimiento Mental",
        status: "Incubadora",
        priority: "Media",
        lastActivity: "Idea creativa sin ejecucion."
      }
    ],
    decisiones: [
      {
        id: "d1",
        context: "Definir clientes como primer modulo operativo de Mercado Forestal.",
        recommendation: "Aprobar foco inicial.",
        priority: "Alta",
        state: "Pendiente"
      },
      {
        id: "d2",
        context: "Outdoor requiere validar margen antes de stock.",
        recommendation: "Seguir analizando.",
        priority: "Media",
        state: "En analisis"
      }
    ],
    aprendizajes: ["No automatizar antes de cerrar flujo operativo."]
  });

  assert("devuelve fecha", Boolean(briefing.fecha));
  assert("devuelve decision principal", Boolean(briefing.decisionPrincipal));
  assert("limita decisiones a 3", briefing.decisiones.length <= 3);
  assert("limita riesgos a 2", briefing.riesgos.length <= 2);
  assert("limita oportunidades a 1", briefing.oportunidades.length <= 1);
  assert("genera recomendacion", Boolean(briefing.recomendacion));
  assert("prioriza Mercado Forestal", briefing.decisionPrincipal.context.includes("Mercado Forestal"));

  output.textContent = results.join("\n") + "\n\nObjeto generado:\n" + JSON.stringify(briefing, null, 2);
})();

