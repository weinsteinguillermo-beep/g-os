# Connectors

Esta carpeta reserva el espacio arquitectonico para conectores externos de G-OS.

En v0.1 los conectores ejecutables viven en:

```text
app/connectors/
```

Motivo: G-OS v0.1 es una aplicacion estatica sin build step. Los scripts deben cargarse directamente desde `app/index.html`.

Conectores simulados actuales:

- `gmail_connector.js`
- `calendar_connector.js`
- `airtable_connector.js`
- `whatsapp_connector.js`
- `drive_connector.js`

Todos implementan la misma interfaz:

- `initialize()`
- `checkUpdates()`
- `normalize()`
- `emitObservation()`

