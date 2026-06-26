# LOCAL BRIDGE v0.1

## Proposito

G-OS puede publicarse en GitHub Pages, pero los datos reales generados en la PC de Guillermo viven localmente. GitHub Pages no puede leer archivos privados del equipo, como `outlook_desktop_queue.json`.

El Local Bridge es la pieza que conecta ambos mundos sin subir datos privados a GitHub.

## Separacion de responsabilidades

### GitHub Pages

Es la interfaz publica de G-OS.

Sirve para abrir el dashboard desde cualquier dispositivo y mantener el proyecto desplegado.

No debe depender de archivos runtime locales ni versionar correos reales.

### Runtime local

Es la informacion generada mientras G-OS corre en la PC:

- cola de Outlook Desktop;
- logs del observer;
- archivos temporales;
- caches locales;
- estados de ejecucion.

Estos archivos no se suben a Git y estan ignorados por `.gitignore`.

### G-OS Local Bridge

Es un pequeno servidor local de solo lectura.

Expone:

`http://localhost:17829/outlook/queue`

La web intenta leer primero este endpoint. Si esta disponible, procesa los correos reales. Si no esta disponible y G-OS esta abierto desde GitHub Pages, muestra:

`Cola local no disponible desde GitHub Pages. Ejecutar G-OS en modo local o iniciar puente local.`

## Como iniciar el puente

1. Abrir Outlook Desktop.
2. Ejecutar `desktop_observers/START_OUTLOOK_DESKTOP_OBSERVER.cmd`.
3. Ejecutar `desktop_observers/START_GOS_LOCAL_BRIDGE.cmd`.
4. Abrir G-OS.
5. Iniciar el observer desde el dashboard si no estaba activo.

## Seguridad

El puente:

- solo lee `app/desktop_observer/outlook_desktop_queue.json`;
- no abre Outlook;
- no envia correos;
- no borra correos;
- no marca correos como leidos;
- no modifica archivos de Outlook;
- no guarda usuario ni contrasena.

## Fuentes operativas

G-OS separa las fuentes para no mezclar pruebas con informacion real:

- `outlook_desktop`: correos reales observados desde Outlook Desktop.
- `outlook_graph`: correos reales leidos por Microsoft Graph.
- `live_input`: eventos pegados manualmente en Nuevo Evento.
- `demo`: datos cargados con Cargar demo.
- `manual`: informacion creada manualmente.
- `system`: eventos internos de G-OS.

Los rankings ejecutivos priorizan eventos recientes de `outlook_desktop` sobre datos historicos, demo o manuales.

## Limpieza operativa

El boton `Limpiar memoria operativa` elimina:

- eventos manuales antiguos;
- datos demo;
- live input no deseado;
- decisiones generadas de prueba;
- seguimientos de prueba;
- estado viejo del pipeline;
- prioridades historicas falsas.

No elimina:

- configuracion de Outlook;
- cola runtime real;
- IDs ya procesados de Outlook;
- ADN real.

## Criterio de exito

G-OS debe poder:

- funcionar en GitHub Pages sin mostrar errores genericos;
- explicar cuando la cola local no esta disponible;
- usar el Local Bridge cuando este activo;
- priorizar correos reales de Outlook Desktop;
- limpiar memoria operativa de pruebas sin destruir conocimiento real.
