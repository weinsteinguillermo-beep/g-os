# Live Input v0.1

## Objetivo

Live Input permite pegar informacion real manualmente y hacer que G-OS la procese como si viniera de un conector real.

No usa IA.

No usa APIs.

No conecta Outlook, Gmail, WhatsApp ni Airtable.

Todo funciona localmente.

## Flujo

```text
Nuevo Evento
-> Observer Bus
-> Event Log
-> Context Engine
-> Chief of Staff
-> Daily Briefing actualizado
```

## Pantalla

La vista `Evento` incluye:

- selector de tipo;
- campo titulo;
- campo texto largo;
- boton `Procesar evento`;
- resultado del analisis.

Tipos iniciales:

- correo;
- nota;
- conversacion;
- documento;
- idea;
- mensaje de WhatsApp.

## Reglas De Relacion

Si el texto contiene:

- Brasil;
- Master;
- Florestal;
- GB;
- Quantum;
- Outdoor;
- URUFOREST;
- Mantenimiento Mental;
- Guia Express;
- Caseritas;

G-OS lo relaciona automaticamente con el proyecto correspondiente.

## Reglas De Prioridad

## HIGH

Si menciona cliente, proveedor estrategico o decision comercial.

Senales:

- cliente;
- proveedor;
- precio;
- margen;
- venta;
- compra;
- decision;
- contrato;
- Master;
- Florestal;
- Quantum;
- Log Max;
- EcoLog.

## MEDIUM

Si es seguimiento o idea.

Senales:

- seguimiento;
- idea;
- revisar;
- pendiente;
- propuesta;
- oportunidad.

## LOW

Informacion general sin accion clara.

## Resultado Visible

Despues de procesar, G-OS muestra:

1. Que detecto.
2. Con que proyecto lo relaciono.
3. Prioridad.
4. Recomendacion del Chief of Staff.
5. Si debe aparecer en el briefing.

## Integracion

`app/live_input.js` genera una observacion con formato estandar:

```js
{
  id,
  source,
  type,
  entity,
  title,
  description,
  priority,
  timestamp,
  metadata
}
```

Luego `app.js` la envia a:

```js
observerBus.recordObservation(...)
```

Esto registra la observacion en Event Log. Context Engine la toma como entidad `observacion`. Chief of Staff la considera al recalcular el Daily Briefing.

## Filosofia

Antes de conectar servicios reales, G-OS debe demostrar que puede procesar informacion real pegada por Guillermo.

Este modulo valida el flujo vivo sin riesgo tecnico ni permisos externos.

