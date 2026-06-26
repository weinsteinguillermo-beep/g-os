# Runtime Architecture para Observers Locales

## Objetivo

Separar codigo fuente de datos generados en ejecucion.

Los observers locales pueden producir colas, estados, logs y caches. Esos archivos son dinamicos, pertenecen a la maquina local y no deben quedar versionados.

## Regla principal

Git debe contener:

- codigo fuente;
- scripts;
- documentacion;
- archivos de ejemplo;
- carpetas base con `.gitkeep`.

Git no debe contener:

- colas reales;
- estados locales;
- logs;
- caches;
- datos temporales;
- informacion generada por Outlook Desktop u otros observers.

## Rutas runtime

- `app/desktop_observer/*.json`
- `app/desktop_observer/*.log`
- `app/desktop_observer/*.tmp`
- `desktop_observers/*.json`
- `desktop_observers/*.log`
- `desktop_observers/*.tmp`
- `app/runtime/**`
- `app/cache/**`
- `app/local_data/**`

## Archivos de ejemplo

Se mantienen versionados:

- `app/desktop_observer/outlook_desktop_queue.example.json`
- `desktop_observers/outlook_desktop_state.example.json`

Estos archivos explican el formato esperado sin exponer datos reales.

## Outlook Desktop Observer

El observer real sigue escribiendo localmente:

- `app/desktop_observer/outlook_desktop_queue.json`
- `desktop_observers/outlook_desktop_state.json`

Ambos archivos quedan en la PC de Guillermo y G-OS puede seguir leyendolos, pero Git los ignora.

## Principio

El codigo viaja.

Los datos vivos quedan locales.
