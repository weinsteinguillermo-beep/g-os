# Context Engine v0.1

## Objetivo

Context Engine v0.1 es el primer motor local de relaciones de G-OS.

Hasta ahora G-OS guardaba informacion. A partir de esta capa empieza a construir conocimiento: conecta ideas, proyectos, decisiones y aprendizajes para que el sistema pueda recuperar contexto relacionado.

No usa IA, APIs ni backend.

## Archivo

```text
app/context_engine.js
```

## Modelo De Objeto

Cada objeto normalizado del sistema tiene:

- `id`;
- `title`;
- `description`;
- `tags`;
- `relatedEntities`;
- `createdAt`;
- `updatedAt`;
- `priority`;
- `state`;
- `type`;
- `source`.

El motor puede recibir objetos incompletos y los normaliza localmente.

## Tipos Iniciales

- `idea`;
- `proyecto`;
- `decision`;
- `aprendizaje`.

## Arquitectura

Context Engine tiene tres capas:

## 1. Normalizacion

Convierte datos de distintas formas en entidades comparables.

Ejemplos:

- proyecto con `name` pasa a `title`;
- decision con `context` pasa a `title`;
- idea con `text` pasa a `title`;
- aprendizaje string pasa a entidad `aprendizaje`.

## 2. Deteccion De Relaciones

Relaciona objetos por:

- etiquetas compartidas;
- entidades relacionadas;
- coincidencias de texto;
- aparicion del titulo de un objeto dentro de la descripcion de otro;
- enlaces manuales guardados.

## 3. Recuperacion De Contexto

`findRelatedContext(query, input)` busca todo lo relacionado con un tema.

Devuelve:

- semillas encontradas;
- elementos relacionados;
- grupos por tipo;
- relevancia.

## Funciones Principales

## linkEntity()

Permite crear una relacion manual.

```js
GOSContextEngine.linkEntity("proyecto-brasil", "decision-negociar-precio", "relacion comercial");
```

Las relaciones manuales se guardan en `localStorage`.

## findRelatedContext()

Busca contexto relacionado.

```js
GOSContextEngine.findRelatedContext("Brasil", input);
```

Puede devolver:

- proyecto Brasil;
- decisiones relacionadas;
- ideas relacionadas;
- aprendizajes relacionados;
- etiquetas comunes;
- entidades conectadas.

## Vista Contexto

El dashboard incluye una vista `Contexto`.

Al abrir un proyecto, Guillermo puede ver:

- ideas relacionadas;
- decisiones relacionadas;
- aprendizajes relacionados;
- proyectos relacionados;
- etiquetas.

## Integracion Con Chief Of Staff

Antes de generar el Daily Briefing, `app.js` construye un grafo:

```js
const contextGraph = GOSContextEngine.buildGraph(input);
```

Luego lo pasa al Chief of Staff:

```js
GOSChiefOfStaff.generateDailyBriefing({
  ...input,
  contextGraph
});
```

El Chief of Staff usa las relaciones como senal adicional de relevancia. Un objeto conectado a muchos elementos relevantes sube prioridad.

## Escalabilidad Futura

La version actual usa reglas simples. Puede crecer hacia:

- entidades persistidas en Airtable;
- relaciones guardadas en base de datos;
- etiquetas administrables;
- grafo visual;
- busqueda por cliente, proveedor o proyecto;
- integracion con documentos, correos y reuniones;
- ranking con IA.

## Como OpenAI Usara Este Motor

Mas adelante, OpenAI no deberia leer todo el sistema.

Deberia pedir contexto a este motor:

1. El usuario pregunta por un tema.
2. Context Engine recupera entidades relacionadas.
3. OpenAI recibe solo el contexto relevante.
4. OpenAI responde con mejor precision y menos ruido.

Esto permite que G-OS mantenga simplicidad y escalabilidad.

## Filosofia

G-OS deja de almacenar informacion.

Empieza a construir conocimiento.

