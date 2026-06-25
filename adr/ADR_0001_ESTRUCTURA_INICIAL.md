# ADR 0001: Estructura Inicial De G-OS

## Fecha

25 de junio de 2026.

## Estado

Aceptada.

## Contexto

G-OS necesita comenzar como una base documental clara antes de desarrollar aplicaciones, automatizaciones o integraciones.

El sistema debe ser legible por Guillermo y por futuros agentes IA. Debe permitir ordenar contexto, proyectos, ideas, decisiones y roles sin crear complejidad prematura.

## Decision

Crear una estructura inicial con cinco areas:

- `docs/`: documentos fundacionales y modelos operativos.
- `agents/`: perfiles de agentes IA.
- `projects/`: fichas de proyectos y empresas.
- `templates/`: plantillas reutilizables.
- `adr/`: registro de decisiones arquitectonicas.

## Motivo

Esta estructura permite empezar con claridad, mantener trazabilidad y crecer de forma modular. Tambien evita empezar programando antes de entender el sistema operativo real de Guillermo.

## Consecuencias

Positivas:

- base simple y entendible;
- facil lectura por humanos y agentes;
- separacion clara entre vision, operacion, agentes y proyectos;
- preparacion para futuras integraciones.

Riesgos:

- puede requerir reorganizacion cuando aparezcan bases de datos o herramientas conectadas;
- algunos proyectos tendran informacion incompleta al inicio;
- sera necesario mantener disciplina documental.

## Proxima Revision

Revisar despues de completar la version v0.2 de captura de ideas.

