# Observer Bus v0.1

## Objetivo

Observer Bus v0.1 es la infraestructura central de observacion de G-OS.

Su objetivo es preparar a G-OS para observar el mundo exterior sin conectar todavia Gmail, Calendar, Airtable, WhatsApp ni Drive reales.

No usa IA, APIs ni backend. Todo funciona localmente con conectores simulados.

## Archivos

- `app/observer_bus.js`
- `app/event_log.js`
- `app/connectors/gmail_connector.js`
- `app/connectors/calendar_connector.js`
- `app/connectors/airtable_connector.js`
- `app/connectors/whatsapp_connector.js`
- `app/connectors/drive_connector.js`

La carpeta raiz `connectors/` queda reservada para la arquitectura futura. En v0.1 los conectores ejecutables viven dentro de `app/connectors/` para que GitHub Pages pueda cargarlos sin proceso de build.

## Arquitectura

Observer Bus tiene cuatro capas:

## 1. Conectores

Cada conector simulado observa una fuente.

Fuentes actuales:

- Gmail;
- Calendar;
- Airtable;
- WhatsApp;
- Drive.

Fuente real preparada en alfa:

- Outlook mediante Microsoft Graph.

Cada conector implementa exactamente:

```js
initialize()
checkUpdates()
normalize()
emitObservation()
```

## 2. Observer Bus

`observer_bus.js` inicializa conectores, pide novedades, normaliza observaciones y las registra.

Funciones principales:

- `create(connectors)`;
- `initialize()`;
- `checkUpdates()`;
- `getObservations(filters)`;
- `normalizeObservation(raw)`.

## 3. Event Log

`event_log.js` guarda todas las observaciones en `localStorage`.

Permite consultar por:

- fecha;
- fuente;
- prioridad;
- tipo.

## 4. Context Engine Y Chief Of Staff

Las observaciones pasan al Context Engine como entidades `observacion`.

El Chief of Staff tambien las considera al generar el briefing.

## Formato Unico De Observacion

Toda observacion debe tener:

```js
{
  id,
  source,
  type,
  entity,
  title,
  description,
  priority,
  timestamp,
  metadata
}
```

## Flujo

1. Un conector simulado ejecuta `checkUpdates()`.
2. El conector transforma datos con `normalize()`.
3. El conector emite con `emitObservation()`.
4. Observer Bus estandariza la observacion.
5. Event Log la registra.
6. Context Engine la incorpora al grafo.
7. Chief of Staff la usa como senal para el Daily Briefing.

## Como Agregar Un Nuevo Conector

Crear un archivo nuevo en `app/connectors/`.

Debe exponer un objeto global con:

```js
window.GOSNuevoConnector = {
  initialize,
  checkUpdates,
  normalize,
  emitObservation
};
```

Luego agregarlo en `app/index.html` antes de `observer_bus.js` o antes de `app.js`, segun corresponda, y registrarlo en `app.js` dentro de:

```js
window.GOSObserverBus.create([...])
```

## Escalabilidad

En versiones futuras, los conectores simulados podran convertirse en conectores reales.

La interfaz se mantiene igual:

- Gmail real reemplaza Gmail simulado;
- Calendar real reemplaza Calendar simulado;
- Airtable real reemplaza Airtable simulado;
- WhatsApp real reemplaza WhatsApp simulado;
- Drive real reemplaza Drive simulado.

El resto del sistema no deberia cambiar si el contrato de observacion se respeta.

## Como OpenAI Usara Este Sistema

OpenAI no deberia consultar todas las fuentes directamente.

El flujo futuro recomendado:

1. Conectores observan fuentes externas.
2. Observer Bus normaliza.
3. Event Log registra.
4. Context Engine relaciona.
5. Chief of Staff filtra.
6. OpenAI recibe solo contexto relevante y accionable.

Esto reduce ruido, mejora trazabilidad y evita depender de conversaciones sueltas.

## Filosofia

G-OS deja de depender unicamente del usuario.

Queda preparado para empezar a observar el mundo exterior.
