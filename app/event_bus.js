(function () {
  const STATE_KEY = "gos:eventBus";
  const HISTORY_LIMIT = 120;

  const EVENTS = {
    MAIL_RECEIVED: "MAIL_RECEIVED",
    MAIL_UNDERSTOOD: "MAIL_UNDERSTOOD",
    DNA_UPDATED: "DNA_UPDATED",
    DECISION_UPDATED: "DECISION_UPDATED",
    BRIEFING_UPDATED: "BRIEFING_UPDATED",
    EXECUTIVE_CENTER_UPDATED: "EXECUTIVE_CENTER_UPDATED",
    HEART_STATUS_UPDATED: "HEART_STATUS_UPDATED"
  };

  const STAGES = ["Observer", "Queue", "Cognitive", "Decision", "Executive", "LifeLoop"];

  const listeners = {};

  function now() {
    return new Date().toISOString();
  }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY)) || { events: [], processedIds: [] };
    } catch (error) {
      return { events: [], processedIds: [] };
    }
  }

  function write(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    return state;
  }

  function serializeError(error, context) {
    return {
      module: context.module,
      observationId: context.observationId || "",
      message: error && error.message ? error.message : String(error || "Error desconocido"),
      stack: error && error.stack ? error.stack : "",
      timestamp: now()
    };
  }

  function updateStage(module, patch) {
    const state = read();
    state.stages = state.stages || {};
    state.stages[module] = {
      module,
      status: "ok",
      message: "OK",
      observationId: "",
      updatedAt: now(),
      ...(state.stages[module] || {}),
      ...(patch || {})
    };
    write(state);
    return state.stages[module];
  }

  function stageOk(module, context) {
    return updateStage(module, {
      status: "ok",
      message: context && context.message ? context.message : "OK",
      observationId: context && context.observationId ? context.observationId : "",
      lastEvent: context && context.event ? context.event : "",
      error: null,
      updatedAt: now()
    });
  }

  function stagePending(module, context) {
    return updateStage(module, {
      status: "pending",
      message: context && context.message ? context.message : "Esperando",
      observationId: context && context.observationId ? context.observationId : "",
      error: null,
      updatedAt: now()
    });
  }

  function stageError(module, error, context) {
    const serialized = serializeError(error, {
      module,
      observationId: context && context.observationId ? context.observationId : ""
    });
    const state = read();
    state.errors = [serialized, ...((state.errors || []))].slice(0, 50);
    write(state);
    return updateStage(module, {
      status: "error",
      message: `${module}: ${serialized.message}`,
      observationId: serialized.observationId,
      error: serialized,
      updatedAt: serialized.timestamp
    });
  }

  function emit(type, payload) {
    const state = read();
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      payload: payload || {},
      timestamp: now()
    };
    state.events = [event, ...(state.events || [])].slice(0, HISTORY_LIMIT);
    state.lastEvent = event;
    write(state);
    (listeners[type] || []).forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(error);
      }
    });
    return event;
  }

  function on(type, handler) {
    listeners[type] = listeners[type] || [];
    listeners[type].push(handler);
    return () => {
      listeners[type] = (listeners[type] || []).filter((item) => item !== handler);
    };
  }

  function wasProcessed(id) {
    const state = read();
    return (state.processedIds || []).includes(id);
  }

  function markProcessed(id) {
    if (!id) return read();
    const state = read();
    const ids = new Set(state.processedIds || []);
    ids.add(id);
    state.processedIds = Array.from(ids).slice(-1000);
    state.lastProcessedId = id;
    state.lastProcessedAt = now();
    return write(state);
  }

  function pendingCount(observations) {
    const state = read();
    const ids = new Set(state.processedIds || []);
    return (observations || []).filter((observation) => observation && observation.id && !ids.has(observation.id)).length;
  }

  function getState() {
    const state = read();
    state.stages = state.stages || {};
    STAGES.forEach((stage) => {
      state.stages[stage] = state.stages[stage] || {
        module: stage,
        status: "pending",
        message: "Esperando",
        observationId: "",
        updatedAt: null,
        error: null
      };
    });
    return state;
  }

  window.GOSEventBus = {
    EVENTS,
    emit,
    on,
    wasProcessed,
    markProcessed,
    pendingCount,
    stageOk,
    stagePending,
    stageError,
    getState,
    stateKey: STATE_KEY
  };
})();
