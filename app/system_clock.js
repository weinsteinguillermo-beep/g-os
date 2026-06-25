(function () {
  const CLOCK_KEY = "gos:systemClock";

  function now() {
    return new Date().toISOString();
  }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(CLOCK_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function write(state) {
    localStorage.setItem(CLOCK_KEY, JSON.stringify(state));
    return state;
  }

  function mark(field) {
    const state = read();
    state[field] = now();
    state.lastSync = state[field];
    return write(state);
  }

  function formatSync(iso) {
    if (!iso) return "Sin actividad registrada";

    const date = new Date(iso);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const time = new Intl.DateTimeFormat("es-UY", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);

    if (isToday) return `Hoy ${time}`;

    return new Intl.DateTimeFormat("es-UY", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  window.GOSSystemClock = {
    read,
    markOpen: () => mark("lastOpen"),
    markClose: () => mark("lastClose"),
    markIdea: () => mark("lastIdea"),
    markDecision: () => mark("lastDecision"),
    markLearning: () => mark("lastLearning"),
    formatSync
  };
})();

