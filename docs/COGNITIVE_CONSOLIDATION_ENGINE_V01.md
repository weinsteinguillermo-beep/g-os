# COGNITIVE CONSOLIDATION ENGINE v1.0

## Proposito

G-OS deja de acumular eventos visibles y empieza a construir `Casos`.

Un Caso representa una situacion ejecutiva unica: problema, oportunidad, proyecto, negociacion, embarque, cliente o decision abierta.

El objetivo es que Guillermo no lea una base de datos. Debe ver criterio organizado.

## Principio central

Si dos eventos hablan del mismo asunto, no se crea otro Caso.

Se actualiza el Caso existente.

## Que contiene un Caso

- `id`
- `titulo`
- `tipo`
- `estado`
- `prioridad`
- `empresa`
- `personas`
- `proyectos`
- `documentos`
- `riesgos`
- `oportunidades`
- `seguimientos`
- `decisiones`
- `aprendizajes`
- `timeline`
- `origenes`
- `ultimaActualizacion`
- `score`

## Fuentes consolidadas

El motor consolida:

- observaciones del Observer Bus;
- correos entendidos por Cognitive Mail Engine;
- decisiones;
- seguimientos;
- proyectos;
- ideas.

Los formatos anteriores siguen existiendo para compatibilidad, pero la capa ejecutiva trabaja sobre Casos.

## Reglas de consolidacion

El motor compara:

- empresa;
- persona;
- proyecto;
- keywords;
- tema;
- intencion;
- riesgo;
- oportunidad;
- documentos relacionados;
- score semantico.

Si el score supera el umbral, fusiona el evento dentro del Caso existente.

Si no supera el umbral, crea un Caso nuevo.

## Umbral

El umbral inicial es `58`.

Este valor favorece fusionar cuando hay coincidencia clara por empresa, proyecto o keywords, pero evita mezclar situaciones distintas solo porque pertenecen al mismo entorno general.

## Score del Caso

El score considera:

- prioridad de las fuentes;
- cantidad de evidencias;
- riesgos detectados;
- seguimientos pendientes;
- profundidad del timeline.

Clasificacion:

- `CRITICO`: 90 o mas.
- `ALTO`: 70 a 89.
- `MEDIO`: 40 a 69.
- `BAJO`: 0 a 39.

## Timeline del Caso

Cada Caso conserva su propia historia:

1. Creado.
2. Primer evento.
3. Decision.
4. Seguimiento.
5. Nueva evidencia.
6. Resolucion.
7. Aprendizaje.

## Integracion

### Decision Engine

Cuando existen Casos, la Agenda Ejecutiva prioriza Casos, no correos.

### Centro Ejecutivo

Muestra tarjetas de Casos.

No muestra listas crudas de emails ni observaciones duplicadas.

### Daily Briefing

Resume Casos importantes.

### Life Loop

Registra evolucion de Casos y cambios de prioridad del Caso principal.

### ADN Operativo

El ADN conserva contexto, pero el uso ejecutivo diario debe favorecer:

- Caso activo;
- Caso cerrado;
- Caso historico.

## Ruido tecnico

La interfaz diaria no debe mostrar:

- DEBUG;
- QUEUE;
- PIPELINE;
- JSON;
- MAIL_RECEIVED;
- STACK;
- ENGINE;
- EVENT.

Ese material queda para modo desarrollador.

## Optimizacion

El motor guarda IDs de fuentes ya procesadas.

En cada ciclo procesa solo fuentes nuevas o afectadas, salvo que se fuerce reconstruccion.

## Resultado esperado

G-OS debe reducir tarjetas visibles y agrupar temas repetidos.

El usuario debe sentir:

`Alguien ya leyo todo.`

`Alguien ya relaciono todo.`

`Solo tengo tres Casos importantes para resolver hoy.`
