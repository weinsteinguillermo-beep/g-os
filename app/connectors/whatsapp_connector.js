(function () {
  function initialize() {
    return { source: "system", status: "simulated" };
  }

  function checkUpdates() {
    return [
      {
        chat: "URUFOREST",
        message: "Pendiente definir plan comercial y clientes objetivo.",
        entity: "URUFOREST",
        priority: "Alta"
      }
    ];
  }

  function normalize(update) {
    return {
      id: "whatsapp-sim-uruforest",
      source: "system",
      type: "message",
      entity: update.entity,
      title: update.chat,
      description: update.message,
      priority: update.priority,
      timestamp: new Date().toISOString(),
      metadata: { simulated: true, originalSource: "whatsapp" }
    };
  }

  function emitObservation(observation) {
    return observation;
  }

  window.GOSWhatsAppConnector = { initialize, checkUpdates, normalize, emitObservation };
})();
