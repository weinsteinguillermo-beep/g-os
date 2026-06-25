# Executive Decision Center v0.1

## Objetivo

Crear una Bandeja Ejecutiva para Guillermo que no muestre correos crudos.

El Centro Ejecutivo transforma correos procesados por Cognitive Mail Engine, decisiones, seguimientos y agenda ejecutiva en temas accionables.

## Principio

G-OS no debe decir "hay 100 correos".

Debe decir:

`Hay 3 oportunidades, 4 riesgos, 23 seguimientos y 5 decisiones importantes. Recomiendo empezar por Gonzalo Knuth.`

## Flujo

Correo  
Cognitive Mail Engine  
Observer Bus  
ADN Operativo  
Decision Engine  
Executive Decision Center  
Chief of Staff  
Life Loop  
Daily Briefing

## Lo que muestra

1. Decisiones criticas.
2. Riesgos.
3. Oportunidades.
4. Seguimientos pendientes.
5. Empresas con movimiento.
6. Proxima accion recomendada.

## Separacion obligatoria

El Centro Ejecutivo diferencia:

- ultimo correo recibido;
- ultimo correo procesado cognitivamente;
- ultima decision generada;
- ultima accion sugerida.

Esto evita confundir actividad de correo con conocimiento ejecutivo.

## Tarjeta ejecutiva

Cada tema muestra:

- titulo;
- empresa/persona;
- proyecto relacionado;
- origen;
- nivel: CRITICO, ALTO, MEDIO o BAJO;
- motivo;
- accion sugerida;
- fecha/hora;
- acciones ejecutivas.

## Acciones

Cada tarjeta permite:

- Resolver;
- Posponer;
- Delegar;
- Crear mision Codex;
- Archivar.

Cada accion actualiza estado local, regenera el Life Loop y recalcula briefing, agenda y tranquilidad.

## Reglas

- No modifica Outlook.
- No borra correos.
- No marca correos como leidos.
- No responde emails.
- No usa backend.
- No usa IA externa.
- Todo queda en localStorage.

## Escalabilidad

El centro esta disenado para sumar futuros observers:

- Gmail;
- WhatsApp;
- OneDrive;
- Airtable;
- Calendar;
- carpetas locales.

Cada observer debera entregar observaciones normalizadas. El Centro Ejecutivo solo consume conocimiento ya procesado.

## Version futura

En una version con OpenAI, el modelo no reemplazara las reglas.

Usara:

- categorias;
- intenciones;
- entidades;
- Decision Score;
- historial del ADN;
- estado del Life Loop.

Con eso generara recomendaciones mas finas, pero siempre explicables.
