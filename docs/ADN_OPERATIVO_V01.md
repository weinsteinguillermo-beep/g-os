# ADN Operativo v0.1

## 1. Proposito

ADN Operativo v0.1 es la primera memoria ejecutiva permanente de G-OS.

No busca guardar mas datos. Busca convertir interacciones en experiencia reutilizable.

No utiliza IA, APIs ni backend. Todo funciona localmente con reglas simples, visibles y explicables.

## 2. Principio central

Cada evento importante debe responder:

Esto modifica algo que ya sabemos?

Si la respuesta es si, G-OS actualiza memoria.

Si la respuesta es no, G-OS crea conocimiento nuevo.

## 3. Flujo operativo

Observer Bus recibe un evento.

Context Engine relaciona el evento.

Decision Engine calcula prioridad.

ADN Operativo transforma el evento en experiencia.

Chief of Staff usa esa memoria para enfocar mejor el Daily Briefing.

## 4. Modulos creados

`knowledge_registry.js`

Registro local persistente de personas, empresas, proyectos, decisiones, aprendizajes y cambios.

`experience_engine.js`

Motor que interpreta eventos y detecta empresas, personas, tipo de experiencia, oportunidad, problema, decision o compromiso.

`operational_dna.js`

Capa orquestadora que actualiza el registro, genera snapshots, responde busquedas y mantiene timeline por empresa.

## 5. Que recuerda G-OS

### Personas

- nombre;
- empresa;
- cargo;
- ultimo contacto;
- frecuencia;
- nivel estrategico;
- historial;
- compromisos;
- confianza.

### Empresas

- nombre;
- relacion;
- proyectos;
- negociaciones;
- problemas;
- oportunidades;
- historial.

### Proyectos

- fecha inicio;
- objetivo;
- estado;
- bloqueos;
- avances;
- personas involucradas;
- decisiones tomadas;
- resultado;
- aprendizajes.

### Decisiones

- que se decidio;
- por que;
- quien participo;
- resultado;
- fecha;
- impacto.

### Aprendizajes

- que funciono;
- que no funciono;
- que repetir;
- que evitar;
- fecha;
- proyecto relacionado.

## 6. Timeline

Cada empresa puede construir una linea de tiempo.

Ejemplo:

Ponsse  
Correo  
Respuesta  
Cotizacion  
Llamada  
Resultado  
Aprendizaje

En v0.1 el timeline nace de eventos del Observer Bus y entradas manuales de Live Input.

## 7. Busqueda ejecutiva

La busqueda del ADN permite preguntas como:

- Cuando hable por ultima vez con Rafael Moraes?
- Que decisiones tomamos sobre Outdoor Import?
- Que aprendimos de Klabin?
- Que errores cometimos con Master Florestal?
- Que proyectos estan congelados?
- Que empresas aparecen juntas frecuentemente?

En v0.1 la busqueda es local por coincidencia de texto y reglas simples.

La respuesta ejecutiva debe usar siempre este formato:

- Resultado encontrado.
- Contexto.
- Ultimo movimiento.
- Recomendacion.
- Proximo paso.

Mas adelante podra usar IA, pero el registro seguira siendo trazable.

## 8. Consulta por empresa

Al tocar una empresa, G-OS debe mostrar una ficha ejecutiva con:

- eventos;
- personas;
- decisiones;
- aprendizajes;
- proyectos relacionados;
- ultima actividad.

Esto permite reconstruir una relacion comercial sin depender de memoria humana.

## 9. Campos editables

Personas y empresas pueden editarse localmente con:

- nivel estrategico;
- confianza;
- estado;
- notas.

Estos campos no se inventan automaticamente. Guillermo o el operador deben ajustarlos cuando exista criterio suficiente.

## 10. Acciones desde el ADN

Cada respuesta ejecutiva del ADN puede convertirse en accion.

Acciones disponibles:

- crear decision;
- preparar mision Codex;
- agregar al briefing;
- crear seguimiento;
- archivar respuesta.

Crear decision genera una decision local con:

- titulo;
- contexto;
- prioridad sugerida;
- proyecto relacionado;
- origen ADN.

Preparar mision Codex genera un prompt con:

- contexto recuperado;
- objetivo;
- entregables;
- restricciones;
- criterio de aprobacion.

Agregar al briefing crea una observacion prioritaria para el Daily Briefing.

Crear seguimiento registra:

- persona o empresa;
- motivo;
- fecha sugerida;
- proyecto relacionado.

El principio es simple: memoria que no genera accion se convierte en archivo pasivo. G-OS debe transformar memoria relevante en proximo paso.

## 11. Seguimientos en Daily Briefing

Los seguimientos pendientes aparecen en el Daily Briefing cuando:

- vencen hoy;
- vencen manana;
- estan atrasados;
- tienen prioridad HIGH.

Cada seguimiento muestra:

- persona o empresa;
- motivo;
- proyecto relacionado;
- fecha sugerida;
- prioridad.

Acciones rapidas:

- marcar realizado;
- reprogramar;
- crear mision Codex;
- agregar nota.

Un seguimiento atrasado o HIGH debe aumentar la prioridad del proyecto relacionado dentro del Decision Engine.

## 12. Aprendizaje diario

Cada cierre del dia registra:

- que aprendimos hoy;
- que deberiamos repetir;
- que deberiamos evitar;
- que quedo pendiente.

El objetivo es que G-OS no dependa de recordar conversaciones sueltas.

## 13. Reglas de crecimiento

El ADN debe crecer con cuidado.

No registrar ruido.

No duplicar conocimiento.

No mezclar proyectos.

No asumir datos sensibles.

No inventar cargos, resultados ni confianza.

Toda memoria debe poder explicar de donde salio.

## 14. Futuro con OpenAI

Cuando G-OS use IA, OpenAI no sera la memoria.

OpenAI sera una capa de interpretacion sobre el ADN Operativo.

El ADN mantendra:

- trazabilidad;
- historial;
- estructura;
- datos base;
- relaciones;
- aprendizajes.

La IA podra ayudar a reconstruir negociaciones, explicar patrones y preparar recomendaciones, pero la fuente de verdad sera el registro local o su futura base persistente.

## 15. Objetivo final

Que G-OS recuerde mejor que Guillermo.

Que dentro de dos anos pueda reconstruir cualquier negociacion, decision, proyecto o relacion comercial sin depender de memoria humana.
