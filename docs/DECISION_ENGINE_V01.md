# Decision Engine v0.1

## 1. Proposito

Decision Engine v0.1 es el primer motor local de prioridad ejecutiva de G-OS.

Su objetivo no es responder preguntas. Su objetivo es decidir que merece la atencion de Guillermo primero.

No utiliza IA, APIs ni backend. Todo funciona con reglas transparentes, visibles y explicables.

## 2. Problema que resuelve

Antes de este motor, G-OS podia registrar eventos, relacionarlos y generar briefing. Pero si aparecia un evento nuevo de alto impacto, el sistema no tenia un mecanismo formal para cambiar el orden de prioridades.

Decision Engine corrige eso:

Evento nuevo  
Decision Score  
Agenda Ejecutiva  
Chief of Staff  
Daily Briefing actualizado

## 3. Flujo operativo

Observer Bus recibe una observacion.

Event Log la registra.

Context Engine la relaciona con proyectos, ideas, decisiones y aprendizajes.

Decision Engine calcula su Decision Score.

Chief of Staff usa ese score para construir el briefing.

Agenda Ejecutiva muestra el orden real de atencion.

## 4. Funcion principal

La funcion central es:

```text
calculateDecisionScore()
```

Recibe un elemento del sistema y devuelve:

- score total;
- nivel;
- desglose del calculo;
- razones de prioridad.

## 5. Factores de puntuacion

El score se calcula sobre un maximo de 100 puntos.

Impacto economico: hasta 30 puntos.  
Urgencia: hasta 20 puntos.  
Cliente estrategico: hasta 15 puntos.  
Proyecto estrategico: hasta 10 puntos.  
Tiempo sin movimiento: hasta 10 puntos.  
Cantidad de relaciones: hasta 10 puntos.  
Observaciones recientes: hasta 9 puntos.  
Prioridad manual: hasta 10 puntos.  
Estado: suma o resta segun situacion.

El resultado se limita siempre entre 0 y 100.

## 6. Clasificacion

90 a 100: CRITICO.  
70 a 89: ALTO.  
40 a 69: MEDIO.  
0 a 39: BAJO.

## 7. Reglas iniciales

El motor detecta como senales economicas palabras como:

- precio;
- margen;
- venta;
- compra;
- stock;
- cliente;
- proveedor;
- contrato;
- comercial.

Detecta urgencia con senales como:

- urgente;
- hoy;
- ahora;
- pendiente;
- falta;
- bloqueado;
- trancado.

Detecta clientes o proveedores estrategicos como:

- Ponsse;
- Master;
- Florestal;
- GB;
- Quantum;
- Oregon;
- Log Max;
- EcoLog.

Detecta proyectos estrategicos como:

- Brasil;
- Mercado Forestal;
- URUFOREST;
- GB;
- Outdoor.

## 8. Agenda Ejecutiva

La Agenda Ejecutiva ordena automaticamente los elementos por Decision Score.

Cada fila muestra:

- posicion;
- proyecto;
- Decision Score;
- nivel;
- motivo;
- accion recomendada.

El objetivo es que Guillermo no vea todo. Solo vea lo que requiere atencion ejecutiva.

## 9. Integracion con Chief of Staff

El Chief of Staff ya no depende de textos fijos para definir la prioridad del dia.

Antes de generar el Daily Briefing, consulta Decision Engine y toma:

- recomendacion principal;
- tres decisiones mas importantes;
- riesgos principales;
- oportunidades;
- proyectos prioritarios;
- agenda ejecutiva del dia.

Si una nueva observacion tiene mayor Decision Score, desplaza automaticamente una recomendacion anterior.

## 10. Validacion inicial

La prueba local usa tres eventos simulados:

1. Correo de Ponsse Brasil.
2. Idea de Outdoor Import.
3. Seguimiento URUFOREST.

Resultado esperado:

Ponsse Brasil debe ocupar la posicion numero uno por combinar cliente estrategico, proyecto estrategico, impacto comercial y urgencia.

## 11. Como extender el algoritmo

El algoritmo debe crecer de forma simple.

Antes de agregar una regla nueva, debe responder:

- que decision mejora;
- que senal detecta;
- que peso agrega;
- como se explica a Guillermo;
- que riesgo de falso positivo genera.

No se deben agregar reglas opacas.

## 12. Uso futuro con OpenAI

Cuando G-OS integre OpenAI, el Decision Score no debe desaparecer.

OpenAI podra usarlo para:

- explicar por que algo subio de prioridad;
- generar estrategias sobre las decisiones de mayor score;
- comparar alternativas;
- preparar recomendaciones ejecutivas;
- detectar patrones de decisiones recurrentes.

La IA podra enriquecer la recomendacion, pero el score seguira siendo una base trazable y auditable.

## 13. Principio central

Decision Engine no reemplaza el criterio de Guillermo.

Ordena el ruido para que Guillermo decida mejor, mas rapido y con mas contexto.
