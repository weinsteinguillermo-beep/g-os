# Outlook Desktop Observer v0.1

## Objetivo

Observar Microsoft Outlook instalado en Windows mientras la PC este encendida y convertir correos nuevos en observaciones de G-OS.

Esta version no usa Microsoft Graph.

Usa Outlook Desktop / Outlook Object Model / COM local mediante PowerShell.

## Reglas criticas

- Solo lectura.
- No envia correos.
- No borra correos.
- No mueve correos.
- No marca como leido.
- No archiva.
- No modifica Outlook.

El script solo lee propiedades del correo:

- remitente;
- email;
- asunto;
- fecha;
- primeras lineas del cuerpo;
- carpeta;
- EntryID.

## Arquitectura

Outlook Desktop  
Outlook Desktop Observer PowerShell  
Cola local JSON  
G-OS Web App  
Observer Bus  
Context Engine  
ADN Operativo  
Decision Engine  
Chief of Staff  
Daily Briefing  
Life Loop

## Archivos

- `desktop_observers/outlook_desktop_observer.ps1`
- `desktop_observers/START_OUTLOOK_DESKTOP_OBSERVER.cmd`
- `app/desktop_observer/outlook_desktop_queue.json`

## Como funciona

1. Guillermo abre Outlook Desktop.
2. Ejecuta `desktop_observers/START_OUTLOOK_DESKTOP_OBSERVER.cmd`.
3. El script revisa Inbox cada 30 segundos.
4. En la primera ejecucion crea una linea base para no importar correos viejos.
5. Cuando aparece un correo nuevo, crea una observacion local.
6. La observacion queda en `app/desktop_observer/outlook_desktop_queue.json`.
7. G-OS lee esa cola local desde el modulo `Outlook`.
8. Si encuentra observaciones nuevas:
   - las registra en Observer Bus;
   - actualiza ADN Operativo;
   - recalcula Decision Engine;
   - actualiza Chief of Staff;
   - actualiza Daily Briefing;
   - Life Loop registra el evento.

## Interfaz en G-OS

En el modulo `Outlook`, bloque `Outlook Desktop Observer`, se muestra:

- estado;
- ultima revision;
- ultimo correo detectado;
- cantidad de correos procesados;
- intervalo configurable;
- boton `Iniciar Observer`;
- boton `Detener Observer`.

Importante: los botones de G-OS controlan la escucha de la cola local desde la app web.  
El observer nativo de Windows se inicia con el archivo `.cmd`.

## Como probar en Windows

1. Abrir Microsoft Outlook Desktop.
2. Abrir G-OS localmente.
3. Ejecutar:

```powershell
desktop_observers\START_OUTLOOK_DESKTOP_OBSERVER.cmd
```

4. En G-OS, ir a `Outlook`.
5. En `Outlook Desktop Observer`, tocar `Iniciar Observer`.
6. Enviar un correo de prueba a la cuenta abierta en Outlook.
7. Esperar hasta 30 segundos.
8. Confirmar:
   - el estado cambia a `Activo`;
   - aparece ultimo correo detectado;
   - aumenta cantidad procesada;
   - aparece observacion local;
   - Daily Briefing se actualiza si la prioridad es `HIGH` o `MEDIUM`;
   - Life Loop registra el evento.

## Prueba de una sola ejecucion

Para validar sin dejar el observer corriendo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File desktop_observers\outlook_desktop_observer.ps1 -Once
```

Primera ejecucion:

- crea linea base;
- no importa correos viejos.

Para procesar correos existentes en una prueba controlada:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File desktop_observers\outlook_desktop_observer.ps1 -Once -ProcessExisting
```

## Formato de observacion

```json
{
  "id": "outlook-desktop-{EntryID}",
  "source": "outlook_desktop",
  "type": "email",
  "entity": "Proyecto relacionado",
  "title": "Asunto",
  "description": "Primeras lineas del cuerpo",
  "priority": "HIGH | MEDIUM | LOW",
  "timestamp": "fecha del correo",
  "metadata": {
    "senderName": "Nombre",
    "senderEmail": "email",
    "folder": "Inbox",
    "entryId": "EntryID",
    "readOnly": true,
    "shouldAppearInBriefing": true
  }
}
```

## Priorizacion inicial

`HIGH` si menciona:

- Master Florestal;
- Ponsse;
- GB;
- Quantum;
- Oregon;
- Log Max;
- EcoLog;
- cliente;
- proveedor;
- precio;
- margen;
- contrato;
- decision;
- urgente.

`MEDIUM` si menciona:

- seguimiento;
- propuesta;
- reunion;
- oportunidad;
- consulta;
- pendiente.

`LOW` para informacion general.

## Limitaciones conocidas

- Solo observa Inbox por ahora.
- Outlook debe estar abierto.
- La app web no puede iniciar COM directamente por seguridad del navegador.
- Por eso existe un observer PowerShell separado.
- La primera ejecucion crea una linea base para evitar importar correos antiguos.
- Si se borra `outlook_desktop_state.json`, el observer vuelve a crear linea base.
- Si G-OS esta publicado en GitHub Pages, el observer desktop requiere uso local o una futura sincronizacion segura.

## Proximos pasos

1. Permitir seleccionar carpetas observadas.
2. Agregar una bandeja de estado del observer nativo.
3. Crear observers equivalentes para OneDrive, carpetas locales y Calendar.
4. Firmar el script PowerShell para ejecucion corporativa.
5. Migrar la cola local a un servicio local seguro cuando G-OS necesite operar fuera del navegador.
