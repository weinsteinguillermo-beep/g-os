# Frontend Architecture

## Decision

El MVP se construye como aplicacion web estatica con HTML, CSS y JavaScript sin dependencias.

## Por Que Esta Arquitectura

Esta decision favorece:

- apertura en menos de dos segundos;
- uso directo desde iPhone;
- cero instalacion;
- cero servidor;
- bajo costo de mantenimiento;
- facilidad para iterar experiencia;
- migracion futura a React, Next.js o una app movil si el uso lo justifica.

## Principio

Primero validar que Guillermo quiera abrir G-OS cada manana. Despues decidir tecnologia mas pesada.

## Estructura Inicial

- `app/index.html`: estructura de la primera pantalla.
- `app/styles.css`: sistema visual minimalista.
- `app/data.js`: datos simulados.
- `app/app.js`: comportamiento local.

## Modelo De Crecimiento

## Fase 1: Estatico

Datos simulados y captura local.

## Fase 2: Persistencia Simple

Guardar ideas, decisiones y misiones en almacenamiento local o archivo controlado.

## Fase 3: Backend Liviano

Agregar API cuando existan flujos reales validados.

## Fase 4: Integraciones

Conectar Gmail, Drive, Airtable, n8n, Codex y Power BI.

## Regla

No agregar framework hasta que el MVP demuestre que la experiencia diaria funciona.

