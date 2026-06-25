(function () {
  const TOKEN_KEY = "gos:microsoftGraph:sessionToken";
  const VERIFIER_KEY = "gos:microsoftGraph:pkceVerifier";
  const STATE_KEY = "gos:microsoftGraph:state";

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

  function authorizeEndpoint(config) {
    return `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/authorize`;
  }

  function tokenEndpoint(config) {
    return `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`;
  }

  function getToken() {
    try {
      return JSON.parse(sessionStorage.getItem(TOKEN_KEY)) || null;
    } catch (error) {
      return null;
    }
  }

  function isConnected() {
    const token = getToken();
    return Boolean(token && token.access_token && token.expires_at > Date.now() + 30000);
  }

  async function loginOutlook() {
    if (!window.GOSMicrosoftGraphConfig) throw new Error("Configuracion Microsoft Graph no cargada.");
    const config = window.GOSMicrosoftGraphConfig.getConfig();
    if (!config.clientId) throw new Error("Configurar Application/Client ID antes de conectar Outlook.");

    const verifier = randomString(64);
    const challenge = base64UrlEncode(await sha256(verifier));
    const state = `gos-outlook-${randomString(16)}`;
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
      code_challenge_method: "S256",
      prompt: "select_account"
    });

    window.location.assign(`${authorizeEndpoint(config)}?${params.toString()}`);
  }

  async function handleRedirectCallback(url) {
    const current = new URL(url || window.location.href);
    const code = current.searchParams.get("code");
    const state = current.searchParams.get("state");
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!window.GOSMicrosoftGraphConfig) throw new Error("Configuracion Microsoft Graph no cargada.");
    const config = window.GOSMicrosoftGraphConfig.getConfig();

    if (!code) return null;
    if (!state || state !== expectedState) throw new Error("Estado OAuth invalido.");
    if (!verifier) throw new Error("PKCE verifier no encontrado.");
    if (!config.clientId) throw new Error("Config Microsoft Graph no encontrada.");

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

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`No se pudo conectar Outlook: ${detail}`);
    }

    const token = await response.json();
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
      access_token: token.access_token,
      expires_at: Date.now() + token.expires_in * 1000,
      scope: token.scope || config.scopes.join(" ")
    }));
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    return getToken();
  }

  function logoutOutlook() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
  }

  async function getAccessToken() {
    const token = getToken();
    if (!token || !token.access_token) throw new Error("Outlook no esta conectado.");
    if (token.expires_at <= Date.now() + 30000) {
      logoutOutlook();
      throw new Error("La sesion de Outlook expiro. Conectar nuevamente.");
    }
    return token.access_token;
  }

  window.GOSMicrosoftGraphAuth = {
    loginOutlook,
    logoutOutlook,
    handleRedirectCallback,
    getAccessToken,
    getToken,
    isConnected
  };

  window.loginOutlook = loginOutlook;
  window.logoutOutlook = logoutOutlook;

  window.GOSGraphAuth = window.GOSGraphAuth || {
    configure: window.GOSMicrosoftGraphConfig ? window.GOSMicrosoftGraphConfig.saveConfig : () => ({}),
    getConfig: window.GOSMicrosoftGraphConfig ? window.GOSMicrosoftGraphConfig.getConfig : () => ({}),
    authenticate: loginOutlook,
    handleRedirectCallback,
    refreshToken: async () => null,
    getAccessToken,
    getToken,
    isConnected
  };
})();
