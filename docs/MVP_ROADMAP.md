# MVP Roadmap

## v0.1 Primera Pantalla

Objetivo: abrir G-OS y ver el panel ejecutivo.

Incluye:

- Daily Briefing;
- cinco modulos;
- datos simulados;
- captura local de ideas;
- decisiones simuladas;
- panel Codex simulado.

Estado: completado como primera version estatica.

## v0.2 Uso Diario Local

Objetivo: que Guillermo pueda probar la rutina por varios dias.

Incluye:

- experiencia iPhone first;
- ideas guardadas en localStorage;
- decisiones con estado persistente;
- estados de idea: nueva, incubadora o proyecto;
- boton archivar decision;
- prompt basico para nueva mision Codex;
- datos iniciales reales de Mercado Forestal, GB Sudamerica, Outdoor Import, Guia Express, Mantenimiento Mental y URUFOREST.

Estado: implementado como MVP usable localmente.

## v0.25 Rutina Real Movil

Objetivo: que Guillermo pueda usar G-OS cada manana en menos de 2 minutos.

Incluye:

- Briefing de hoy limitado a 3 decisiones, 3 proyectos, 3 riesgos y 3 oportunidades;
- cierre del dia con decisiones, ideas, pendientes y preparacion para Codex;
- edicion simple de ideas;
- edicion simple de decisiones;
- cambio de prioridad;
- archivo de ideas y decisiones;
- boton Copiar misión Codex;
- confirmacion visual de copia;
- exportacion manual JSON;
- importacion manual JSON.

Estado: implementado como rutina local sin backend.

## v0.28 Primera Prueba Real

Objetivo: preparar G-OS para que Guillermo lo use manana como rutina real.

Incluye:

- Modo manana;
- Modo cierre;
- aprendizaje del dia guardado en localStorage;
- cierre del dia copiable para ChatGPT o WhatsApp;
- exportacion e importacion incluyendo aprendizaje diario;
- guia `docs/RUTINA_DIARIA_GOS.md`.

Estado: implementado para prueba real.

## v0.1 Public Release

Objetivo: publicar G-OS como primera version web accesible desde cualquier dispositivo.

Incluye:

- estructura preparada para GitHub Pages;
- `index.html` raiz con entrada a la app;
- PWA minima con manifest e icono;
- documentacion de deploy;
- guia de instalacion en iPhone;
- release notes publicas;
- README profesional.

Estado: preparado localmente para publicacion.

## v0.11 Chief Of Staff Por Reglas

Objetivo: crear el primer agente real de G-OS sin IA.

Incluye:

- modulo `app/chief_of_staff.js`;
- funcion `generateDailyBriefing()`;
- priorizacion por urgencia, impacto economico, tiempo sin movimiento, bloqueos y prioridad manual;
- integracion con el dashboard;
- documentacion;
- ejemplos;
- pruebas manuales en navegador.

Estado: implementado como motor de reglas.

## v0.12 Life Engine Local

Objetivo: hacer que G-OS se comporte como un sistema vivo local.

Incluye:

- `app/system_clock.js`;
- `app/life_engine.js`;
- `MorningRoutine()`;
- `DayRoutine()`;
- `NightRoutine()`;
- indicador `G-OS activo`;
- ultima sincronizacion local;
- deteccion de proyectos olvidados;
- deteccion de decisiones viejas;
- resumen nocturno interno.

Estado: implementado sin IA, APIs ni backend.

## v0.13 Context Engine Local

Objetivo: conectar ideas, proyectos, decisiones y aprendizajes para construir conocimiento.

Incluye:

- `app/context_engine.js`;
- normalizacion de entidades;
- `linkEntity()`;
- `findRelatedContext()`;
- vista `Contexto`;
- relaciones por etiquetas, entidades y texto;
- integracion con Chief of Staff;
- documentacion `docs/CONTEXT_ENGINE_V01.md`.

Estado: implementado sin IA, APIs ni backend.

## v0.14 Observer Bus Local

Objetivo: preparar G-OS para observar fuentes externas sin conectarlas todavia.

Incluye:

- `app/observer_bus.js`;
- `app/event_log.js`;
- conectores simulados para Gmail, Calendar, Airtable, WhatsApp y Drive;
- interfaz comun `initialize()`, `checkUpdates()`, `normalize()`, `emitObservation()`;
- formato unico de observacion;
- consultas por fecha, fuente, prioridad y tipo;
- integracion con Context Engine;
- integracion con Chief of Staff;
- documentacion `docs/OBSERVER_BUS_V01.md`.

Estado: implementado localmente sin IA, APIs ni backend.

## v0.15 Microsoft Graph Observer Alfa 1

Objetivo: preparar la primera conexion real de G-OS con Outlook mediante Microsoft Graph.

Incluye:

- `connectors/microsoft_graph/graph_auth.js`;
- `connectors/microsoft_graph/graph_client.js`;
- `connectors/microsoft_graph/outlook_observer.js`;
- OAuth 2.0 con PKCE;
- funciones `authenticate()`, `refreshToken()`, `readInbox()`, `readFolder()`, `normalizeEmail()`, `emitObservation()`;
- conversion de correos en Observation;
- reglas iniciales de prioridad para remitentes estrategicos;
- integracion preparada con Observer Bus;
- documentacion `docs/MICROSOFT_GRAPH_SETUP.md`.

Estado: alfa preparada. Requiere registrar app en Azure y configurar Client ID/Tenant ID para leer correos reales.

## v0.16 Live Input Local

Objetivo: validar el flujo de observacion con informacion real ingresada manualmente antes de conectar Outlook.

Incluye:

- modulo `Evento`;
- `app/live_input.js`;
- procesamiento local de correo, nota, conversacion, documento, idea o WhatsApp;
- reglas de relacion automatica por proyecto;
- prioridad HIGH, MEDIUM, LOW;
- envio al Observer Bus;
- registro en Event Log;
- relacion en Context Engine;
- impacto en Chief of Staff y Daily Briefing;
- documentacion `docs/LIVE_INPUT_V01.md`.

Estado: implementado localmente sin IA, APIs ni conectores reales.

## v0.3 Persistencia Real Minima

Objetivo: guardar ideas, decisiones y proyectos en una fuente simple.

Opciones:

- archivo local;
- Google Sheet;
- Airtable;
- almacenamiento liviano.

Proximo foco:

- elegir fuente de verdad;
- decidir si el JSON exportado alcanza como respaldo temporal;
- registrar decisiones reales;
- preparar briefing diario editable.

## v0.4 Integracion Codex

Objetivo: convertir "Nueva mision" en prompts listos para Codex.

Incluye:

- mision;
- contexto;
- entregables;
- restricciones;
- criterio de aprobacion.

## v0.5 Integraciones Operativas

Objetivo: conectar fuentes reales.

Incluye:

- Gmail;
- Drive;
- Airtable;
- n8n;
- Power BI.

## Criterio Para Avanzar

No avanzar a integraciones hasta que Guillermo quiera abrir el MVP de forma natural durante varios dias.
