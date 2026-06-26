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
    return read();
  }

  window.GOSEventBus = {
    EVENTS,
    emit,
    on,
    wasProcessed,
    markProcessed,
    pendingCount,
    getState,
    stateKey: STATE_KEY
  };
})();
