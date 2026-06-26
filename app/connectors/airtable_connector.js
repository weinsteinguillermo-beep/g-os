(function () {
  function initialize() {
    return { source: "system", status: "simulated" };
  }

  function checkUpdates() {
    return [
      {
        record: "Outdoor Import",
        change: "Producto pendiente de margen y proveedor.",
        entity: "Outdoor Import",
        priority: "Media"
      }
    ];
  }

  function normalize(update) {
    return {
      id: "airtable-sim-outdoor",
      source: "system",
      type: "record",
      entity: update.entity,
      title: update.record,
      description: update.change,
      priority: update.priority,
      timestamp: new Date().toISOString(),
      metadata: { simulated: true, originalSource: "airtable" }
    };
  }

  function emitObservation(observation) {
    return observation;
  }

  window.GOSAirtableConnector = { initialize, checkUpdates, normalize, emitObservation };
})();
