# Event Bus v0.1

## Objetivo

Convertir G-OS en un sistema reactivo.

Cada observacion nueva debe disparar procesamiento cognitivo, actualizacion de ADN, Decision Engine, Life Loop, Daily Briefing y Centro Ejecutivo sin recargar la pagina.

## Flujo

Outlook Desktop Observer  
Cola local  
Event Bus interno  
Cognitive Mail Engine  
ADN Operativo  
Decision Engine  
Life Loop  
Daily Briefing  
Centro Ejecutivo  
Dashboard actualizado

## Eventos

- `MAIL_RECEIVED`
- `MAIL_UNDERSTOOD`
- `DNA_UPDATED`
- `DECISION_UPDATED`
- `BRIEFING_UPDATED`
- `EXECUTIVE_CENTER_UPDATED`
- `HEART_STATUS_UPDATED`

## Fuente de verdad

`lastEmail` no es fuente unica de verdad.

Sirve para mostrar el ultimo correo recibido, pero G-OS procesa la lista `observations` y mantiene un registro local de IDs procesados.

Si una observacion:

- no fue procesada, entra al pipeline;
- ya fue procesada, se ignora;
- genera decision o seguimiento, se evita duplicar usando `sourceObservationId`.

## Estado visual del pipeline

El dashboard muestra:

- ultimo evento recibido;
- ultimo correo recibido;
- ultimo correo entendido;
- ultimo modulo actualizado;
- hora del ultimo recalculo;
- ultimo latido disparado por evento;
- eventos procesados;
- eventos pendientes;
- estado: Activo, Esperando o Error.

## Persistencia

El Event Bus guarda estado en localStorage:

`gos:eventBus`

Tambien se mantiene compatibilidad con:

`gos:outlookDesktopObserver:processed`

Esto evita reprocesar correos antiguos al actualizar la arquitectura.

## Restricciones

- No modifica Outlook.
- No mueve correos.
- No marca correos como leidos.
- No responde.
- No elimina.
- Todo local.
- Sin backend.
- Sin IA externa.

## Caso esperado

Un correo con:

`Sv: Invoice 383344 [Invoice]`

y texto:

`I have been informed about a delay for this shipping due to congestion in Brazil. Updated ETA is 2026-07-05.`

debe ser entendido como:

- categoria: Logistica / Factura / Problema;
- intencion: Riesgo;
- riesgo: demora logistica;
- fecha detectada: 2026-07-05;
- accion sugerida: revisar impacto del nuevo ETA y confirmar si afecta compromisos comerciales;
- destino: Centro Ejecutivo como riesgo o seguimiento.
