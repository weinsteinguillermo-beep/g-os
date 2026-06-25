# QA G-OS v0.1

## Proposito

Este documento define una prueba rapida para validar G-OS de punta a punta sin IA, APIs ni backend.

El objetivo es poder comprobar el ciclo completo en menos de dos minutos desde el movil.

## Botones de prueba

La app incluye:

- Cargar demo.
- Limpiar demo.

`Cargar demo` crea datos simulados marcados como demo.

`Limpiar demo` elimina solo registros demo y conserva datos reales.

## Datos cargados por la demo

La demo incluye:

- Ponsse / Rafael Moraes;
- Brasil;
- Mercado Forestal;
- Outdoor Import;
- URUFOREST;
- una decision critica;
- un seguimiento atrasado;
- un seguimiento para manana;
- un aprendizaje;
- un prompt Codex demo.

## Checklist QA

Validar:

- evento entra;
- ADN recuerda;
- seguimiento aparece;
- score cambia;
- briefing cambia;
- accion Codex se genera.

## Prueba en dos minutos

1. Abrir G-OS.
2. Tocar `Cargar demo`.
3. Revisar Daily Briefing.
4. Confirmar que aparece `Seguimientos de hoy`.
5. Confirmar que aparece `Ponsse / Rafael Moraes`.
6. Abrir `Agenda`.
7. Confirmar que Mercado Forestal / Ponsse Brasil aparece como prioridad alta o critica.
8. Abrir `ADN`.
9. Consultar `Que sabemos de Ponsse?`.
10. Confirmar respuesta ejecutiva.
11. Abrir `Codex`.
12. Confirmar que existe prompt demo.
13. Tocar `Limpiar demo`.
14. Confirmar que los datos demo desaparecen.

## Resultado esperado

Al tocar `Cargar demo`, G-OS debe mostrar inmediatamente un escenario vivo donde Rafael / Ponsse / Brasil aparecen como prioridad critica.

## Criterio de aprobacion

La prueba queda aprobada si:

- el Daily Briefing cambia sin recarga manual;
- el seguimiento atrasado aparece en `Seguimientos de hoy`;
- Decision Engine sube el score del proyecto relacionado;
- ADN recuerda empresa, persona, proyecto y aprendizaje;
- Codex queda con prompt listo;
- `Limpiar demo` elimina datos demo sin borrar registros no demo.

## Reglas

- Sin IA.
- Sin APIs.
- Sin backend.
- Sin inyeccion manual de localStorage.
- Sin borrar datos reales al limpiar demo.
