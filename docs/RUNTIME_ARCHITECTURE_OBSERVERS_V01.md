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

## GitHub Pages y datos locales

GitHub Pages solo puede servir archivos publicados. No puede leer archivos runtime privados de la PC de Guillermo.

Si G-OS se abre desde GitHub Pages y no existe un puente local activo, el pipeline debe mostrar:

`Cola local no disponible desde GitHub Pages. Ejecutar G-OS en modo local o iniciar puente local.`

Esto no es un error del sistema. Es una frontera de seguridad del navegador.

## G-OS Local Bridge

Para conectar la interfaz publica con datos locales reales, G-OS prepara un puente local de solo lectura:

`http://localhost:17829/outlook/queue`

El puente lee la cola local de Outlook Desktop y la entrega a la web con CORS habilitado.

Archivos:

- `desktop_observers/gos_local_bridge.ps1`
- `desktop_observers/START_GOS_LOCAL_BRIDGE.cmd`

El dashboard intenta leer primero el Local Bridge. Si no esta disponible, y G-OS no esta en GitHub Pages, intenta leer el archivo local publicado en `app/desktop_observer`.

## Fuentes separadas

Toda observacion debe conservar su fuente:

- `outlook_desktop`
- `outlook_graph`
- `live_input`
- `demo`
- `manual`
- `system`

Los rankings ejecutivos deben favorecer eventos recientes reales de `outlook_desktop` por encima de datos historicos, demo o manuales.

## Principio

El codigo viaja.

Los datos vivos quedan locales.
