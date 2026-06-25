# Life Engine v0.1

## Objetivo

Life Engine v0.1 hace que G-OS deje de sentirse como una pagina estatica y empiece a comportarse como un sistema vivo.

No usa IA, APIs ni backend. Todo funciona localmente en el navegador.

## Archivos

- `app/system_clock.js`
- `app/life_engine.js`

## System Clock

`system_clock.js` registra:

- ultima apertura;
- ultimo cierre;
- ultima idea;
- ultima decision;
- ultimo aprendizaje;
- ultima sincronizacion local.

Todo se guarda en `localStorage`.

## Life Engine

`life_engine.js` implementa:

- `MorningRoutine()`
- `DayRoutine()`
- `NightRoutine()`

## MorningRoutine()

Se ejecuta al abrir G-OS.

Hace:

- marca ultima apertura;
- ejecuta Chief of Staff;
- genera briefing;
- detecta proyectos olvidados;
- detecta decisiones viejas;
- genera mensaje del dia;
- actualiza ultima sincronizacion.

## DayRoutine()

Se ejecuta cuando cambia algo durante el dia.

Eventos actuales:

- nueva idea;
- edicion de idea;
- cambio de decision;
- aprendizaje guardado.

Hace:

- registra ultimo evento;
- actualiza sincronizacion local;
- mantiene estado interno del sistema.

## NightRoutine()

Se ejecuta al entrar en `Modo cierre`.

Genera:

- decisiones tomadas;
- ideas capturadas;
- pendientes para manana;
- aprendizaje;
- preparacion de manana.

## Indicador De Vida

El dashboard muestra:

```text
G-OS activo
Ultima sincronizacion: Hoy 09:12
```

## Filosofia

Life Engine no responde preguntas. Mantiene continuidad.

El sistema debe saber cuando fue abierto, que cambio y que queda para manana.

## Limitaciones

- No sincroniza entre dispositivos.
- No tiene calendario real.
- No calcula dias habiles.
- No usa IA.
- No interpreta contexto profundo.

## Futuro

Mas adelante Life Engine puede conectarse con:

- fuente de verdad real;
- calendario;
- recordatorios;
- integraciones;
- Chief of Staff con IA.

