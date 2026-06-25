# G-OS v0.1

G-OS es el sistema operativo ejecutivo de Guillermo Weinstein para centralizar contexto, ordenar proyectos, coordinar agentes de IA y mejorar la toma de decisiones.

Esta version publica inicial no intenta ser el sistema completo. Es el primer producto usable: un panel ejecutivo movil para abrir cada manana, revisar foco, capturar ideas, tomar decisiones simples y preparar misiones para Codex.

## Objetivo

Que Guillermo quiera abrir G-OS todas las mananas y pueda entender en menos de dos minutos:

- que decisiones importan hoy;
- que proyectos requieren atencion;
- que riesgos y oportunidades estan visibles;
- que ideas nuevas fueron capturadas;
- que debe preparar Codex;
- que aprendizaje queda para el cierre del dia.

## Estado Actual

Version oficial: `G-OS v0.1`.

Estado: MVP local/publicable, sin backend, sin APIs y sin dependencias externas.

La aplicacion guarda datos en `localStorage` del navegador:

- ideas;
- estados de decisiones;
- ultima mision Codex;
- aprendizaje del dia.

Tambien permite exportar e importar un JSON manual como respaldo temporal.

## Arquitectura

La version v0.1 usa una arquitectura estatica:

- HTML;
- CSS;
- JavaScript;
- PWA minima con `manifest.json`;
- GitHub Pages como opcion primaria de despliegue.

La decision es intencional: primero validar uso diario y velocidad. Despues agregar backend, APIs o integraciones solo si aportan valor real.

## Estructura

- `app/`: aplicacion web G-OS v0.1.
- `docs/`: documentos de producto, arquitectura, rutina, despliegue y roadmap.
- `agents/`: roles de agentes IA.
- `projects/`: fichas iniciales de proyectos.
- `templates/`: plantillas reutilizables.
- `adr/`: decisiones arquitectonicas.

## Ejecutar Localmente

Opcion simple:

1. Abrir `app/index.html` en el navegador.

Opcion con servidor local:

```bash
python -m http.server 8080
```

Luego abrir:

```text
http://localhost:8080/app/
```

## Desplegar En GitHub Pages

Ver [DEPLOY.md](docs/DEPLOY.md).

Resumen:

1. Crear repositorio `g-os` en GitHub.
2. Subir este proyecto.
3. Activar GitHub Pages desde la rama `main` y carpeta `/root`.
4. Abrir la URL publica generada por GitHub Pages.

## Instalar En iPhone

Ver [INSTALL_IPHONE.md](docs/INSTALL_IPHONE.md).

## Roadmap

Ver [MVP_ROADMAP.md](docs/MVP_ROADMAP.md).

Proximas etapas:

- prueba real de rutina diaria;
- fuente de verdad minima;
- integracion gradual con Codex;
- integraciones con Drive, Gmail, Airtable, n8n y Power BI.

## Documento Central

El documento central del sistema es [G-WEINSTEIN.md](docs/G-WEINSTEIN.md).

Todo agente IA que trabaje para G-OS debe leerlo antes de actuar.

## Regla De Oro

G-OS no guarda informacion, construye conocimiento.

