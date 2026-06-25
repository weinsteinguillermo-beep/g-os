# Microsoft Graph Setup Para G-OS

## Objetivo

Configurar G-OS para leer correos de Outlook usando Microsoft Graph API.

G-OS Alfa 1 solo observa.

No envia correos.

No modifica correos.

No borra correos.

No usa IMAP.

No usa POP.

## Arquitectura

Archivos principales:

```text
connectors/microsoft_graph/graph_auth.js
connectors/microsoft_graph/graph_client.js
connectors/microsoft_graph/outlook_observer.js
```

Para publicacion estatica tambien existen copias en:

```text
app/connectors/microsoft_graph/
```

## Seguridad

G-OS nunca debe guardar usuario ni contrasena.

La autenticacion usa OAuth 2.0 con PKCE.

En Alfa 1, los tokens se guardan en `sessionStorage`. Esto reduce persistencia accidental. Si se cierra el navegador, puede requerirse autenticar de nuevo.

## 1. Registrar Aplicacion En Azure

1. Entrar a Azure Portal.
2. Abrir `Microsoft Entra ID`.
3. Ir a `App registrations`.
4. Elegir `New registration`.
5. Nombre sugerido:

```text
G-OS Outlook Observer
```

6. Supported account types:

Para uso personal/empresa de Guillermo, elegir segun necesidad:

- Single tenant: solo una organizacion.
- Multitenant: varias organizaciones.
- Personal Microsoft accounts: si se usara Outlook personal.

Para empezar, si no hay decision clara, usar:

```text
Accounts in this organizational directory only
```

7. Redirect URI:

Tipo:

```text
Single-page application (SPA)
```

URI local:

```text
http://localhost:8080/app/
```

URI publicada en GitHub Pages:

```text
https://USUARIO.github.io/g-os/app/
```

Guardar.

## 2. Obtener Client ID

En la pantalla de la aplicacion registrada:

- copiar `Application (client) ID`.

Ese valor se usa como:

```js
clientId
```

## 3. Obtener Tenant ID

En la misma pantalla:

- copiar `Directory (tenant) ID`.

Ese valor se usa como:

```js
tenantId
```

Tambien se puede usar `common` para pruebas multicuenta si la configuracion de la app lo permite.

## 4. Configurar Permisos

Ir a:

```text
API permissions
```

Agregar Microsoft Graph:

```text
Delegated permissions
```

Permisos minimos:

```text
Mail.Read
openid
profile
offline_access
```

No agregar:

```text
Mail.Send
Mail.ReadWrite
Mail.ReadWrite.Shared
```

G-OS Alfa 1 debe ser solo lectura.

## 5. Configurar Redirect URI SPA

Ir a:

```text
Authentication
```

Verificar que exista una plataforma:

```text
Single-page application
```

Agregar:

```text
http://localhost:8080/app/
https://USUARIO.github.io/g-os/app/
```

Activar tokens segun politica de Microsoft para SPA. No usar client secret en frontend.

## 6. Configurar G-OS En El Navegador

Desde la consola del navegador en G-OS:

```js
GOSGraphAuth.configure({
  clientId: "APPLICATION_CLIENT_ID",
  tenantId: "DIRECTORY_TENANT_ID",
  redirectUri: window.location.origin + window.location.pathname
});
```

Luego autenticar:

```js
GOSOutlookObserver.authenticate();
```

Microsoft redirigira de vuelta a G-OS con un `code`.

Luego ejecutar:

```js
GOSGraphAuth.handleRedirectCallback();
```

## 7. Probar Conexion

Leer inbox:

```js
GOSOutlookObserver.readInbox({ top: 5 });
```

Convertir un correo en observacion:

```js
const emails = await GOSOutlookObserver.readInbox({ top: 1 });
const observation = GOSOutlookObserver.normalizeEmail(emails[0]);
console.log(observation);
```

Registrar observaciones mediante Observer Bus:

```js
const bus = GOSObserverBus.create([GOSOutlookObserver]);
await bus.checkUpdatesAsync();
```

## 8. Formato De Observacion

Cada correo se convierte en:

```js
{
  id,
  source: "outlook",
  type: "email",
  entity,
  title,
  description,
  priority,
  timestamp,
  metadata
}
```

Metadata incluye:

- remitente;
- asunto;
- fecha;
- importancia;
- categorias;
- adjuntos;
- conversacion;
- webLink.

## 9. Reglas Iniciales De Prioridad

Si remitente o asunto contiene:

- Master Florestal;
- GB;
- Quantum;
- Oregon;
- Log Max;
- EcoLog;
- Clientes estrategicos;

entonces:

```text
Priority = Alta
```

## 10. Flujo G-OS

1. Outlook Observer lee correos via Microsoft Graph.
2. Cada correo se normaliza como Observation.
3. Observer Bus registra en Event Log.
4. Context Engine relaciona con proyectos, ideas, decisiones y aprendizajes.
5. Chief of Staff decide si entra al Daily Briefing.

## 11. Restricciones Alfa 1

- Solo lectura.
- Sin envio.
- Sin modificacion.
- Sin borrado.
- Sin IMAP.
- Sin POP.
- Sin Airtable real.
- Sin Gmail real.
- Sin WhatsApp real.

## 12. Problemas Comunes

## Redirect URI Incorrecta

El redirect URI de Azure debe coincidir exactamente con la URL de G-OS.

## Permiso Incorrecto

Verificar que exista `Mail.Read` como permiso delegado.

## Token Expirado

Ejecutar:

```js
GOSGraphAuth.refreshToken();
```

Si no funciona, autenticar nuevamente.

## Consentimiento Requerido

Algunas organizaciones requieren aprobacion de administrador para permisos Graph.

