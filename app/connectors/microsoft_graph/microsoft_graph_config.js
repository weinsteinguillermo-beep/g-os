(function () {
  const CONFIG_KEY = "gos:microsoftGraph:config";
  const DEFAULT_TENANT = "organizations";
  const DEFAULT_SCOPES = ["Mail.Read"];

  function defaultRedirectUri() {
    return window.location.origin + window.location.pathname;
  }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function write(config) {
    const next = {
      clientId: String(config.clientId || "").trim(),
      tenantId: String(config.tenantId || DEFAULT_TENANT).trim() || DEFAULT_TENANT,
      redirectUri: String(config.redirectUri || defaultRedirectUri()).trim(),
      scopes: DEFAULT_SCOPES
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    return next;
  }

  function getConfig() {
    const stored = read();
    return {
      clientId: stored.clientId || "",
      tenantId: stored.tenantId || DEFAULT_TENANT,
      redirectUri: stored.redirectUri || defaultRedirectUri(),
      scopes: DEFAULT_SCOPES
    };
  }

  function isConfigured() {
    return Boolean(getConfig().clientId);
  }

  window.GOSMicrosoftGraphConfig = {
    getConfig,
    saveConfig: write,
    isConfigured,
    defaultRedirectUri,
    scopes: DEFAULT_SCOPES
  };
})();
