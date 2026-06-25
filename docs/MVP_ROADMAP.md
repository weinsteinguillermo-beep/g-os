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
