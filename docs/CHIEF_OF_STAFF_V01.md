# Chief Of Staff v0.1

## Objetivo

Crear el primer agente operativo de G-OS.

En v0.1 no usa IA. Funciona con reglas simples y transparentes.

Su unica pregunta es:

Que merece la atencion de Guillermo?

## Archivo

```text
app/chief_of_staff.js
```

## Entrada

`generateDailyBriefing()` recibe:

- ideas;
- proyectos;
- decisiones;
- aprendizajes.

## Salida

Devuelve un objeto:

```js
{
  fecha,
  saludo,
  resumen,
  decisionPrincipal,
  decisiones,
  riesgos,
  oportunidades,
  proyectos,
  aprendizajes,
  recomendacion
}
```

## Criterios De Priorizacion

El motor prioriza por:

- urgencia;
- impacto economico;
- tiempo sin movimiento;
- cantidad de bloqueos;
- prioridad manual.

## Reglas

## Urgencia

Sube prioridad si detecta palabras como:

- urgente;
- hoy;
- pendiente;
- falta.

## Impacto Economico

Sube prioridad si detecta senales comerciales:

- comercial;
- venta;
- cliente;
- margen;
- stock;
- mercado;
- forestal;
- GB;
- URUFOREST;
- Outdoor.

## Tiempo Sin Movimiento

Sube prioridad si el elemento esta pendiente, en incubadora o no tiene movimiento registrado.

## Bloqueos

Sube prioridad si detecta:

- pendiente;
- falta;
- bloqueado;
- trancado;
- riesgo;
- sin definir.

## Prioridad Manual

Usa prioridad `Alta`, `Media` o `Baja`.

## Ejemplo

Entrada:

```js
generateDailyBriefing({
  ideas: [{ text: "Comparar proveedores Outdoor", status: "Nueva" }],
  proyectos: [{ name: "Mercado Forestal", priority: "Alta", status: "En definicion operativa" }],
  decisiones: [{ context: "Definir clientes como primer modulo", priority: "Alta", state: "Pendiente" }],
  aprendizajes: ["No automatizar antes de cerrar flujo."]
});
```

Salida esperada:

- decision principal vinculada a Mercado Forestal;
- riesgo operativo;
- oportunidad desde la idea nueva;
- recomendacion enfocada en resolver la decision principal.

## Integracion

`app.js` llama a:

```js
window.GOSChiefOfStaff.generateDailyBriefing(...)
```

El Daily Briefing ya no usa texto fijo. Se construye automaticamente desde datos locales y proyectos iniciales.

## Pruebas

Abrir:

```text
app/chief_of_staff.tests.html
```

Debe mostrar pruebas simples en pantalla y consola del navegador.

## Limitaciones

- No entiende lenguaje natural como un modelo IA.
- Usa reglas y palabras clave.
- No consulta fuentes externas.
- No aprende automaticamente todavia.

## Futuro

Mas adelante este motor podra ser reemplazado o enriquecido con ChatGPT, manteniendo el mismo contrato de salida.

