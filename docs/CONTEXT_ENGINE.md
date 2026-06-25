# Context Engine De G-OS

## Proposito

El Context Engine define como un agente encuentra contexto automaticamente antes de responder.

No es una base de datos ni una herramienta tecnica. Es el protocolo mental y documental que deben seguir los agentes de G-OS.

## Principio

Antes de responder, buscar contexto. Antes de recomendar, conectar. Antes de ejecutar, confirmar si corresponde.

## Flujo De Contexto

## 1. Identificar El Tipo De Solicitud

Clasificar la solicitud:

- decision;
- idea;
- proyecto;
- cliente;
- proveedor;
- producto;
- reunion;
- documento;
- automatizacion;
- analisis;
- comunicacion;
- alerta.

## 2. Leer Documentos Base

Todo agente debe considerar:

- `docs/G-WEINSTEIN.md`;
- `docs/CONSTITUTION.md`;
- `docs/KNOWLEDGE_MAP.md`;
- documento especifico del modulo si existe.

## 3. Revisar Proyecto Relacionado

Si la solicitud menciona una empresa, proyecto o linea de negocio, revisar:

- ficha en `projects/`;
- estado actual;
- proximas acciones;
- decisiones pendientes;
- documentos relacionados.

## 4. Revisar Clientes O Proveedores

Si aparecen nombres de clientes o proveedores, buscar:

- ficha del cliente o proveedor si existe;
- historial relevante;
- reuniones;
- correos;
- oportunidades;
- riesgos;
- compromisos pendientes.

## 5. Consultar Decisiones

Antes de recomendar, revisar si ya existe una decision previa relacionada.

Buscar:

- decisiones tomadas;
- motivo;
- resultado esperado;
- resultado real;
- aprendizaje;
- patrones.

## 6. Recuperar Aprendizajes

Antes de repetir una accion, buscar aprendizajes previos:

- que funciono;
- que no funciono;
- que patron aplica;
- que recomendacion futura existe.

## 7. Separar Hechos, Supuestos Y Faltantes

Antes de responder, el agente debe saber:

- que esta confirmado;
- que se esta suponiendo;
- que informacion falta;
- si falta una decision de Guillermo.

## 8. Responder Con Formato Ejecutivo

Cuando corresponda, usar:

- Situacion;
- Opciones;
- Recomendacion;
- Riesgos;
- Decision necesaria;
- Proximo paso.

## Documentos Que Leer Segun Caso

## Si Es Una Decision

Leer:

- `docs/G-WEINSTEIN.md`;
- `docs/BUSINESS_DECISION_RECORDS.md`;
- `docs/06_MODELO_DE_DECISIONES.md`;
- proyecto relacionado;
- decisiones previas relacionadas;
- aprendizajes relevantes.

## Si Es Una Idea

Leer:

- `docs/G-WEINSTEIN.md`;
- `docs/07_MODELO_DE_IDEAS.md`;
- `templates/TEMPLATE_IDEA.md`;
- proyectos similares;
- aprendizajes relevantes.

## Si Es Un Proyecto

Leer:

- `docs/G-WEINSTEIN.md`;
- ficha del proyecto;
- `templates/TEMPLATE_PROYECTO.md`;
- decisiones relacionadas;
- documentos vinculados;
- aprendizajes.

## Si Es Cliente O Comercial

Leer:

- `docs/G-WEINSTEIN.md`;
- ficha del cliente si existe;
- proyecto o empresa relacionada;
- correos o reuniones disponibles;
- decisiones comerciales previas;
- aprendizajes comerciales.

## Si Es Automatizacion

Leer:

- `docs/CONSTITUTION.md`;
- `docs/09_ARQUITECTURA_INICIAL.md`;
- flujo operativo existente;
- decisiones relacionadas;
- riesgos;
- fuente de verdad.

## Regla Final

Si el contexto no existe, el agente debe decirlo y proponer como capturarlo. No debe inventarlo.

