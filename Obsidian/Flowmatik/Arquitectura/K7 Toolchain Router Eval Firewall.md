# K7 Toolchain Router Eval Firewall

Fecha: 2026-06-28

## Decision

KAIZEN7 incorpora `K7 Toolchain Router + Eval Firewall`.

El objetivo es pasar de tener adaptadores a elegir cadenas minimas de herramientas, workers y verificadores segun el objetivo.

```text
objetivo -> memoria -> toolchain minima -> ejecucion/delegacion -> eval firewall -> aprobacion/writeback
```

## Patrones externos absorbidos

- MCP-Atlas: evaluar tool-use con tareas multi-step, claims y evidencia.
- MCP-Zero: no cargar todas las herramientas; recuperar/seleccionar toolchain por necesidad.
- OmniCode: ampliar evaluacion mas alla de bugfix; incluir tests, review fixes y style fixes.
- OpenHands SDK: worker sandboxed, lifecycle control y multi-backend execution.
- MemReranker: memoria como retrieve -> rerank -> decision, no solo busqueda lexical.

## Implementacion

- `lib/toolchain-router.js`
- `npm.cmd run k7:toolchain`
- `POST /api/k7/toolchain`
- `POST /api/k7/toolchain/evaluate`
- `docs/TOOLCHAIN_ROUTER.md`

## Eval Firewall

Bloquea resultado si falta evidencia para claims basicos:

- cambio acotado -> diff,
- tests pasados -> evidencia de tests,
- riesgos reportados -> evidencia de riesgos.

## Regla

KAIZEN7 no debe cargar todas las herramientas ni aceptar reportes de agentes por confianza.

Debe seleccionar la cadena minima y exigir evidencia antes de aprobar, publicar, escribir memoria o cerrar trabajo.

## Siguiente accion

Exponer `toolchainPlan` en el Project Activation Cockpit junto a OpenHands, memoria usada y gates.

