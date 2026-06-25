# Cognitive Mail Engine V1

## Objetivo

Transformar correos en conocimiento estructurado.

G-OS no debe limitarse a almacenar emails: debe entender categorias, intencion, entidades, accion requerida y prioridad ejecutiva.

## Pipeline

Correo  
Clasificador  
Extractor  
ADN Operativo  
Decision Engine  
Life Loop

## Clasificacion

El motor clasifica correos por reglas transparentes en:

- Pedido;
- Cliente;
- Proveedor;
- Produccion;
- Logistica;
- Cobranza;
- Factura;
- Oportunidad;
- Problema;
- Idea;
- Seguimiento;
- Agenda;
- General.

## Extraccion

Cada correo genera:

- empresa;
- persona;
- proyecto;
- tema principal;
- prioridad;
- fecha detectada;
- accion requerida;
- estado;
- entidades relacionadas.

## Intencion

El motor detecta:

- Informa;
- Solicita accion;
- Espera respuesta;
- Confirma;
- Cancela;
- Riesgo;
- Oportunidad.

## Salidas generadas

Por cada correo, G-OS puede generar:

- observacion enriquecida;
- actualizacion de ADN Operativo;
- seguimiento pendiente;
- decision sugerida;
- evento para Life Loop;
- resumen ejecutivo agrupado por categoria.

## Integracion

El motor se ejecuta en:

- correos leidos por Microsoft Graph;
- correos detectados por Outlook Desktop Observer.

Los correos entran por `GOSCognitiveMailEngine.processEmail(...)` antes de ser registrados en Observer Bus.

## Restricciones

- No modifica Outlook.
- No mueve correos.
- No marca como leidos.
- No responde.
- No elimina mensajes.
- Trabaja solo con observaciones locales ya leidas.

## Resultado esperado

G-OS debe poder decir:

`Detecte 3 oportunidades comerciales, 2 riesgos, 5 seguimientos pendientes. Recomiendo empezar por Rafael Moraes: preparar respuesta ejecutiva.`
