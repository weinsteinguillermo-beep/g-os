# Outlook Observer Real v0.1

## Objetivo

Conectar G-OS con Outlook / Microsoft 365 usando Microsoft Graph para leer correos reales y convertirlos en observaciones.

La integracion es solo lectura:

- no envia correos;
- no borra correos;
- no modifica correos;
- no usa backend;
- no guarda usuario ni contrasena;
- no guarda refresh tokens;
- usa el permiso minimo `Mail.Read`.

## Arquitectura

Outlook real  
Microsoft Graph  
Outlook Real Connector  
Observer Bus  
Context Engine  
Decision Engine  
Chief of Staff  
Daily Briefing

## Archivos

- `app/connectors/microsoft_graph/microsoft_graph_config.js`
- `app/connectors/microsoft_graph/microsoft_graph_auth.js`
- `app/connectors/microsoft_graph/outlook_real_connector.js`

## Flujo de autorizacion

G-OS usa OAuth 2.0 Authorization Code Flow con PKCE desde una Single-page application.

La configuracion sensible queda asi:

- `clientId`: se guarda localmente porque es identificador publico de la app.
- `tenantId`: se guarda localmente.
- `redirectUri`: se guarda localmente.
- `access_token`: se guarda solo en `sessionStorage`.
- `refresh_token`: no se solicita ni se guarda.
- contrasena: nunca se solicita ni se guarda.

## Registrar app en Microsoft Entra

1. Entrar a Microsoft Entra admin center.
2. Ir a `Identity` > `Applications` > `App registrations`.
3. Crear `New registration`.
4. Nombre recomendado: `G-OS Outlook Observer`.
5. Elegir cuentas permitidas:
   - para Microsoft 365 empresarial: `Accounts in this organizational directory only`;
   - para permitir varios tenants: `Accounts in any organizational directory`.
6. Crear la app.

## Obtener IDs

Dentro de la app creada, copiar:

- `Application (client) ID`;
- `Directory (tenant) ID`.

En G-OS:

1. Abrir modulo `Outlook`.
2. Pegar `Application / Client ID`.
3. Pegar `Tenant ID` o dejar `organizations`.
4. Confirmar `Redirect URI`.
5. Tocar `Guardar config`.

## Configurar Redirect URI

En Microsoft Entra:

1. Abrir `Authentication`.
2. Agregar plataforma.
3. Elegir `Single-page application`.
4. Agregar exactamente la misma URL que muestra G-OS en `Redirect URI`.

Ejemplos:

- local: `http://localhost:8787/index.html`
- GitHub Pages: `https://usuario.github.io/g-os/app/index.html`

La URL debe coincidir exactamente con la registrada.

## Agregar permiso Microsoft Graph

1. Abrir `API permissions`.
2. Tocar `Add a permission`.
3. Elegir `Microsoft Graph`.
4. Elegir `Delegated permissions`.
5. Agregar solo `Mail.Read`.
6. Guardar.

Si Microsoft solicita aprobacion de administrador, pedir aprobacion solo para `Mail.Read`.

## Probar login

1. Abrir G-OS.
2. Ir a `Outlook`.
3. Tocar `Conectar Outlook`.
4. Microsoft pedira autorizacion para leer correo.
5. Aceptar.
6. Al volver a G-OS debe decir `Outlook conectado`.

## Leer correos

1. Tocar `Leer ultimos correos`.
2. G-OS leera hasta 10 mensajes recientes con Microsoft Graph.
3. Cada correo se normaliza como observacion:

```json
{
  "source": "outlook",
  "type": "email",
  "entity": "Proyecto relacionado",
  "title": "Asunto",
  "description": "Vista previa",
  "priority": "HIGH | MEDIUM | LOW",
  "timestamp": "fecha del correo",
  "metadata": {
    "from": {},
    "importance": "normal",
    "hasAttachments": false,
    "conversationId": "",
    "webLink": "",
    "readOnly": true
  }
}
```

## Reglas de prioridad

`HIGH` si el correo menciona:

- Master Florestal;
- Ponsse;
- GB;
- Quantum;
- Oregon;
- Log Max;
- EcoLog;
- cliente;
- proveedor;
- precio;
- margen;
- contrato;
- decision comercial;
- urgente.

`MEDIUM` si menciona:

- seguimiento;
- propuesta;
- reunion;
- oportunidad;
- consulta;
- pendiente.

`LOW` si es informacion general.

## Resultado esperado

Guillermo conecta Outlook, toca `Leer ultimos correos` y G-OS:

- detecta correos relevantes;
- los convierte en observaciones;
- los registra en Event Log;
- actualiza ADN Operativo;
- recalcula Decision Engine;
- actualiza Chief of Staff;
- actualiza Daily Briefing.

## Fuentes oficiales consultadas

- Microsoft Graph `List messages`: https://learn.microsoft.com/en-us/graph/api/user-list-messages
- Microsoft identity platform OAuth 2.0 authorization code flow: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow
- SPA app registration: https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-app-registration
