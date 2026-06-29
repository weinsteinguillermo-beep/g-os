# Mail Intelligence Analyst v1.0

## Proposito

Mail Intelligence Analyst es la capa que interpreta correos como lo haria un asistente ejecutivo humano.

Su objetivo no es mostrar mails crudos. Su objetivo es responder:

- este correo importa porque;
- esto puede esperar porque;
- yo haria esto primero;
- este correo crea o actualiza un Caso.

## Entrada

Recibe observaciones de correo desde Outlook Desktop, Outlook Graph o cualquier futuro observer.

Cada correo se mantiene en modo solo lectura. G-OS no modifica Outlook, no responde, no mueve, no borra y no marca mensajes como leidos.

## Salida ejecutiva

Para cada correo genera:

- resumen ejecutivo en una frase;
- que esta pasando;
- quien escribe;
- empresa o persona relacionada;
- que espera de Guillermo;
- si requiere respuesta;
- urgencia: ahora, hoy, esta semana o puede esperar;
- impacto: bajo, medio, alto o critico;
- riesgo detectado;
- oportunidad detectada;
- proximo paso recomendado;
- Caso sugerido para crear o actualizar.

## Reglas de interpretacion

G-OS usa reglas locales y explicables:

- demoras, congestion, ETA o retrasos generan riesgo logistico;
- pedidos, confirmaciones o respuestas pendientes generan seguimiento;
- oportunidades, propuestas o cotizaciones generan oportunidad comercial;
- asuntos con impacto comercial o riesgo pasan a prioridad alta;
- correos sin pedido directo quedan como contexto y pueden esperar.

## Integracion con Casos

El analisis no vive aislado.

Cada correo entendido se envia al Cognitive Consolidation Engine para:

- crear un Caso nuevo si no existe uno relacionado;
- actualizar un Caso existente si comparte empresa, proyecto, persona, tema o riesgo;
- evitar tarjetas duplicadas sobre el mismo asunto;
- guardar la lectura ejecutiva dentro del bloque `Que entendi`.

## Bloque "Que entendi"

Cada Caso puede mostrar:

- Resumen;
- Riesgo;
- Oportunidad;
- Que haria yo;
- Proximo paso.

El correo crudo solo debe aparecer en detalle si Guillermo necesita evidencia.

## Integracion operativa

Pipeline esperado:

Correo
-> Cognitive Mail Engine
-> Mail Intelligence Analyst
-> Cognitive Consolidation Engine
-> ADN Operativo
-> Decision Engine
-> Centro Ejecutivo
-> Briefing
-> Life Loop

## Criterio de calidad

Un correo bien interpretado debe permitir que G-OS diga:

- "Este correo importa porque hay riesgo comercial."
- "Esto puede esperar porque no pide accion ni tiene fecha critica."
- "Yo haria esto primero: revisar impacto y responder con una decision clara."

## Restricciones

- No usar IA externa todavia.
- No usar APIs adicionales.
- No modificar Outlook.
- No duplicar Casos.
- No crear decisiones repetidas.
- No mostrar lenguaje tecnico al usuario final.
