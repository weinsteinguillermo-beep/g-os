(function () {
  const EVENT_LOG_KEY = "gos:eventLog";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(EVENT_LOG_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function write(events) {
    localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(events));
    return events;
  }

  function append(observation) {
    const events = read();
    const exists = events.some((event) => event.id === observation.id);
    if (!exists) {
      events.push(observation);
      write(events);
    }
    return observation;
  }

  function query(filters) {
    const active = filters || {};
    return read().filter((event) => {
      if (active.source && event.source !== active.source) return false;
      if (active.priority && event.priority !== active.priority) return false;
      if (active.type && event.type !== active.type) return false;
      if (active.date && !String(event.timestamp || "").startsWith(active.date)) return false;
      return true;
    });
  }

  window.GOSEventLog = {
    append,
    query,
    read,
    clear: () => write([])
  };
})();

