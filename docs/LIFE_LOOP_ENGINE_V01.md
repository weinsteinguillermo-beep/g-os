# Life Loop Engine v0.1

## Proposito

Life Loop Engine es el latido local de G-OS.

Su funcion es ejecutar ciclos automaticos de observacion, analisis, priorizacion y actualizacion sin IA, APIs ni backend.

## Ciclo

Loop  
Observe  
Think  
Prioritize  
Update  
Sleep  
Loop

## Estados vivos

### REPOSO

Sin cambios importantes.

Mensaje: `❤️ Todo bajo control.`

### ATENCION

Hay novedades.

Mensaje: `❤️ Analizando novedades...`

### ACCION

Hay decision importante, seguimiento vencido o evento HIGH.

Mensaje: `❤️ Preparando recomendaciones...`

### EMERGENCIA

Hay prioridad critica.

Mensaje: `❤️ Detecté algo importante.`

## Historial del corazon

Cada latido guarda:

- hora;
- estado;
- que reviso;
- que encontro;
- que modifico;
- duracion.

La app muestra los ultimos 20 latidos.

## Latido accionable

Desde la version accionable el usuario puede ejecutar un ciclo manual con el boton `Latir ahora`.

Ese ciclo:

- observa novedades locales;
- recalcula Context Engine;
- recalcula Decision Engine;
- actualiza Chief of Staff;
- actualiza Daily Briefing;
- actualiza Agenda Ejecutiva;
- actualiza ADN Operativo visible;
- recalcula Indice de Tranquilidad;
- registra un nuevo latido en el historial.

## Que cambio

Cada latido compara el estado nuevo contra el latido anterior.

La comparacion registra:

- prioridad maxima anterior;
- prioridad maxima nueva;
- variacion del Indice de Tranquilidad;
- nuevos seguimientos relevantes;
- nuevas observaciones;
- cambios en Agenda Ejecutiva.

## Resumen ejecutivo del ultimo latido

El panel superior muestra siempre:

- Estado;
- Tranquilidad;
- Tema principal;
- Cambio detectado;
- Accion sugerida.

El formato esta pensado para que Guillermo entienda en segundos si debe actuar, revisar o seguir.

## Indice de Tranquilidad

El indice va de 0 a 100.

Considera:

- seguimientos vencidos;
- prioridades criticas;
- decisiones pendientes;
- eventos HIGH;
- observaciones recientes;
- agenda ejecutiva;
- briefing actualizado;
- aprendizajes pendientes.

Lectura:

- 80 a 100: `🟢 Todo bajo control.`
- 50 a 79: `🟠 Existen temas importantes.`
- 0 a 49: `🔴 Conviene reorganizar el día.`

## Integracion

Life Loop Engine consulta:

- Observer Bus;
- Context Engine;
- Decision Engine;
- Chief of Staff;
- ADN Operativo;
- Life Engine;
- System Clock.

Si cambia la prioridad maxima, actualiza:

- Agenda Ejecutiva;
- Daily Briefing;
- historial del corazon.

## Persistencia

Todo se guarda localmente en `localStorage`.

El historial del latido se incluye en export/import como `lifeLoop`.

## Restricciones

- No conecta Outlook.
- No conecta Gmail.
- No conecta WhatsApp.
- No usa IA.
- No usa backend.
- No reemplaza el criterio de Guillermo.

## Criterio de aprobacion

La implementacion es valida si:

- el corazon late automaticamente;
- se ve el estado vivo;
- se ve ultimo latido;
- existe historial;
- existe Indice de Tranquilidad;
- Briefing y Agenda pueden actualizarse automaticamente;
- todo sigue funcionando localmente.
