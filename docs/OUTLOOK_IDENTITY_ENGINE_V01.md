# OUTLOOK IDENTITY ENGINE v0.1

## Proposito

Outlook Identity Engine determina cual es la cuenta e Inbox principal de Outlook Desktop para G-OS.

Su mision es evitar que el Observer procese Stores viejos, archivos PST, duplicados o bandejas historicas.

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

## Funcionamiento

El motor recorre todos los Stores de Outlook y registra:

- nombre;
- tipo;
- ruta;
- Inbox;
- cantidad de correos;
- ultimo correo;
- fecha del ultimo correo;
- correos hoy;
- correos de los ultimos 7 dias;
- correos de los ultimos 30 dias.

Con esos datos calcula un `Activity Score` y elige la Inbox mas activa y confiable.

## Activity Score

Reglas:

- `+100` si recibio correo hoy.
- `+60` si recibio correo en la ultima hora.
- `+40` si tuvo actividad en los ultimos 7 dias.
- `+20` si tuvo actividad en los ultimos 30 dias.
- `-150` si es Archivo.
- `-120` si parece PST historico.
- `-80` si la Inbox esta vacia.
- `-50` si el Store parece duplicado `(1)`.
- `-40` si no tiene actividad hace mas de 90 dias.

## Resultado

Guarda:

- `principalStore`;
- `principalInbox`;
- `principalAccount`;
- `confidence`;
- `status`;
- `score`;
- `lastCalibration`;
- `activityHistory`;
- `ranking`;
- `selectionReason`;
- `readOnly`.

## Confianza

- `Alta`: score alto y diferencia clara con el segundo Store.
- `Media`: actividad suficiente pero diferencia menor.
- `Baja`: poca actividad, Stores ambiguos o error de lectura.

## Integracion con Observer

`outlook_desktop_observer.ps1` intenta leer `desktop_observers/outlook_identity.json`.

Si existe identidad valida y fue calibrada en las ultimas 12 horas:

1. Busca el Store principal.
2. Abre solo su Inbox.
3. Procesa correos desde esa Inbox.
4. Evita escanear todos los Stores.

Si no existe identidad valida:

1. Ejecuta el Identity Engine.
2. Vuelve a intentar usar la Inbox principal.
3. Si no puede, usa fallback al escaneo completo anterior.

## UI

G-OS muestra la tarjeta `Outlook Identity Engine` dentro del modulo Outlook.

La tarjeta muestra:

- cuenta utilizada;
- Inbox utilizada;
- score;
- confianza;
- motivo de seleccion;
- ultima recalibracion;
- estado.

El boton `Recalibrar Inbox Principal` vuelve a leer el archivo runtime local. La calibracion real se ejecuta desde Windows con:

`desktop_observers/START_OUTLOOK_IDENTITY_ENGINE.cmd`

## Como probar

1. Abrir Outlook Desktop.
2. Ejecutar `desktop_observers/START_OUTLOOK_IDENTITY_ENGINE.cmd`.
3. Confirmar que se crea `desktop_observers/outlook_identity.json`.
4. Confirmar que se crea `app/desktop_observer/outlook_identity.json`.
5. Abrir G-OS.
6. Ir a Outlook.
7. Verificar la tarjeta `Outlook Identity Engine`.
8. Ejecutar `desktop_observers/START_OUTLOOK_DESKTOP_OBSERVER.cmd`.
9. Confirmar que el Observer usa la Inbox principal.

## Criterio de exito

- G-OS detecta la Inbox correcta.
- El Observer deja de recorrer Stores viejos o duplicados cuando existe identidad valida.
- La UI muestra cuenta, Inbox, score, confianza y motivo.
- La cola de Outlook conserva `identity` para diagnostico.
- El pipeline actual sigue funcionando.
