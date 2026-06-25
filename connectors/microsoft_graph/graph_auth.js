(function () {
  const CONFIG_KEY = "gos:graph:config";
  const TOKEN_KEY = "gos:graph:token";
  const VERIFIER_KEY = "gos:graph:pkceVerifier";
  const STATE_KEY = "gos:graph:state";
  const DEFAULT_SCOPES = ["openid", "profile", "offline_access", "Mail.Read"];

  function base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function randomString(length) {
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    return Array.from(values, (value) => ("0" + value.toString(16)).slice(-2)).join("");
  }

  async function sha256(value) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  }

  function getConfig() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function configure(config) {
    const next = {
      clientId: config.clientId,
      tenantId: config.tenantId || "common",
      redirectUri: config.redirectUri || window.location.origin + window.location.pathname,
      scopes: config.scopes || DEFAULT_SCOPES
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    return next;
  }

  function tokenEndpoint(config) {
    return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  }

  function authorizeEndpoint(config) {
    return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize`;
  }

  async function authenticate(configOverride) {
    const config = configOverride ? configure(configOverride) : getConfig();
    if (!config.clientId) throw new Error("Microsoft Graph Client ID no configurado.");

    const verifier = randomString(64);
    const challenge = base64UrlEncode(await sha256(verifier));
    const state = randomString(16);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: "code",
      redirect_uri: config.redirectUri,
      response_mode: "query",
      scope: config.scopes.join(" "),
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    window.location.assign(`${authorizeEndpoint(config)}?${params.toString()}`);
  }

  async function handleRedirectCallback(url) {
    const config = getConfig();
    const current = new URL(url || window.location.href);
    const code = current.searchParams.get("code");
    const state = current.searchParams.get("state");
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);

    if (!code) return null;
    if (!state || state !== expectedState) throw new Error("Estado OAuth invalido.");
    if (!verifier) throw new Error("PKCE verifier no encontrado.");

    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
      scope: config.scopes.join(" ")
    });

    const response = await fetch(tokenEndpoint(config), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) throw new Error("No se pudo obtener token Microsoft Graph.");
    const token = await response.json();
    token.expires_at = Date.now() + token.expires_in * 1000;
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    return token;
  }

  function getToken() {
    try {
      return JSON.parse(sessionStorage.getItem(TOKEN_KEY)) || null;
    } catch (error) {
      return null;
    }
  }

  async function refreshToken() {
    const config = getConfig();
    const token = getToken();
    if (!token || !token.refresh_token) return null;

    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
      scope: config.scopes.join(" ")
    });

    const response = await fetch(tokenEndpoint(config), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!response.ok) return null;
    const next = await response.json();
    next.expires_at = Date.now() + next.expires_in * 1000;
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next));
    return next;
  }

  async function getAccessToken() {
    const token = getToken();
    if (!token) throw new Error("No hay token Graph. Ejecutar authenticate().");
    if (token.expires_at && token.expires_at - Date.now() < 60000) {
      const refreshed = await refreshToken();
      if (refreshed) return refreshed.access_token;
    }
    return token.access_token;
  }

  window.GOSGraphAuth = {
    configure,
    authenticate,
    handleRedirectCallback,
    refreshToken,
    getAccessToken,
    getToken,
    getConfig
  };
})();

