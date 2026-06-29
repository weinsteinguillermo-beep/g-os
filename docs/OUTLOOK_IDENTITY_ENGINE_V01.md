# OUTLOOK IDENTITY ENGINE v0.1

## Proposito

Outlook Identity Engine define la cuenta oficial que G-OS debe observar en Outlook Desktop.

A partir de este hotfix no existe seleccion automatica de Store.

La unica cuenta observada es:

`guillermo.weinstein@mercadoforestal.com.uy`

## Regla principal

G-OS busca exactamente el Store cuyo nombre sea:

`guillermo.weinstein@mercadoforestal.com.uy`

Si existe:

- usa exclusivamente su Bandeja de entrada;
- ignora cualquier otro Store;
- ignora `documentos@mercadoforestal.com.uy`;
- ignora Archivo;
- ignora PST;
- ignora cuentas compartidas.

Si no existe:

- muestra `Cuenta principal no encontrada.`;
- no lee otros Stores;
- no hace fallback.

## Restricciones

- Solo lectura.
- No modifica Outlook.
- No mueve correos.
- No marca correos como leidos.
- No borra correos.
- No envia correos.
- No modifica Event Bus.
- No modifica Local Bridge.
- No rompe GitHub Pages.

## Archivos

- `desktop_observers/outlook_identity_engine.ps1`
- `desktop_observers/START_OUTLOOK_IDENTITY_ENGINE.cmd`
- `desktop_observers/outlook_identity.json`
- `app/desktop_observer/outlook_identity.json`
- `app/desktop_observer/outlook_identity.example.json`

Los dos archivos `outlook_identity.json` son runtime local y no se versionan.

## Datos guardados

El archivo runtime guarda:

- `principalStore`;
- `principalInbox`;
- `principalAccount`;
- `observedAccount`;
- `observedInbox`;
- `status`;
- `lastCalibration`;
- `selectionReason`;
- `error`;
- `readOnly`.

No guarda:

- Activity Score;
- ranking;
- confianza;
- Stores alternativos;
- motivos de seleccion automatica.

## Integracion con Observer

`outlook_desktop_observer.ps1` usa solamente:

- Store: `guillermo.weinstein@mercadoforestal.com.uy`;
- Carpeta: `Bandeja de entrada`.

El Observer no recorre otros Stores. Si la cuenta no existe, corta el ciclo y registra el error claro.

## UI

G-OS muestra:

- Cuenta observada;
- Estado;
- Inbox;
- Ultima lectura.

No muestra Score, Confianza ni Motivo.

## Como probar

1. Abrir Outlook Desktop.
2. Confirmar que la cuenta `guillermo.weinstein@mercadoforestal.com.uy` esta cargada como Store.
3. Ejecutar `desktop_observers/START_OUTLOOK_IDENTITY_ENGINE.cmd`.
4. Confirmar que se crea `desktop_observers/outlook_identity.json`.
5. Confirmar que la UI muestra `Conectado`.
6. Ejecutar `desktop_observers/START_OUTLOOK_DESKTOP_OBSERVER.cmd`.
7. Confirmar que solo lee la Bandeja de entrada de la cuenta principal.

## Criterio de exito

- G-OS observa exactamente la casilla de Guillermo.
- No procesa `documentos@mercadoforestal.com.uy`.
- No procesa Archivo.
- No procesa PST.
- No recorre cuentas compartidas.
- Si la cuenta principal no existe, muestra `Cuenta principal no encontrada.`.
