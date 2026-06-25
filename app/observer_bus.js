(function () {
  const OBSERVER_STATE_KEY = "gos:observerBus";

  function now() {
    return new Date().toISOString();
  }

  function saveState(state) {
    localStorage.setItem(OBSERVER_STATE_KEY, JSON.stringify(state));
    return state;
  }

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(OBSERVER_STATE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function normalizeObservation(raw) {
    return {
      id: raw.id || `${raw.source}-${Date.now()}`,
      source: raw.source || "unknown",
      type: raw.type || "observation",
      entity: raw.entity || "general",
      title: raw.title || "Observacion sin titulo",
      description: raw.description || "",
      priority: raw.priority || "Media",
      timestamp: raw.timestamp || now(),
      metadata: raw.metadata || {}
    };
  }

  function create(connectors) {
    const registered = connectors || [];

    function initialize() {
      registered.forEach((connector) => connector.initialize());
      const state = readState();
      state.initializedAt = state.initializedAt || now();
      state.connectorCount = registered.length;
      state.lastCheck = state.lastCheck || null;
      saveState(state);
      return state;
    }

    function checkUpdates() {
      const observations = [];

      registered.forEach((connector) => {
        const updates = connector.checkUpdates() || [];
        updates.forEach((update) => {
          const normalized = connector.normalize(update);
          const emitted = connector.emitObservation(normalized);
          const observation = normalizeObservation(emitted);
          window.GOSEventLog.append(observation);
          observations.push(observation);
        });
      });

      const state = readState();
      state.lastCheck = now();
      state.lastObservationCount = observations.length;
      saveState(state);

      return observations;
    }

    async function checkUpdatesAsync() {
      const observations = [];

      for (const connector of registered) {
        const updates = await connector.checkUpdates();
        (updates || []).forEach((update) => {
          const normalized = connector.normalize(update);
          const emitted = connector.emitObservation(normalized);
          const observation = normalizeObservation(emitted);
          window.GOSEventLog.append(observation);
          observations.push(observation);
        });
      }

      const state = readState();
      state.lastCheck = now();
      state.lastObservationCount = observations.length;
      saveState(state);

      return observations;
    }

    function getObservations(filters) {
      return window.GOSEventLog.query(filters);
    }

    function recordObservation(raw) {
      const observation = normalizeObservation(raw);
      window.GOSEventLog.append(observation);

      const state = readState();
      state.lastCheck = now();
      state.lastObservationCount = (state.lastObservationCount || 0) + 1;
      saveState(state);

      return observation;
    }

    return {
      initialize,
      checkUpdates,
      checkUpdatesAsync,
      recordObservation,
      getObservations,
      getState: readState,
      connectors: registered
    };
  }

  window.GOSObserverBus = {
    create,
    normalizeObservation
  };
})();
