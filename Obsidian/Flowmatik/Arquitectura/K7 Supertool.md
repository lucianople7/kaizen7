# K7 Supertool

Fecha: 2026-06-27

## Decision

KAIZEN7 debe exponerse como una supertool modular para Codex, herramientas de codigo, MCPs, APIs, CLIs y agentes externos.

No es un agente autonomo total. Es un orquestador que decide la mejor ruta, reduce contexto, aplica gates y exige verificacion.

## Contrato

```text
objective -> intent -> route -> context + skills + tools + action + verification
```

## Implementacion

- `lib/supertool-orchestrator.js`
- `npm.cmd run k7:super -- "objective"`
- `POST /api/k7/super`
- `docs/SUPERTOOL.md`

## Rutas

- `code`: Codex Bridge y Codex Realizer.
- `adapter`: Adapter Registry.
- `frontier`: Frontier Operator y Hunter.
- `memory`: Semantic Memory y Skill Router.
- `orchestrate`: ruta mixta por defecto.

## Gates

- No publicar, pushear, desplegar, gastar, borrar ni tocar credenciales sin aprobacion.
- No guardar secretos en memoria, Obsidian ni Signal Inbox.
- No declarar completado sin verificacion fresca.

## Siguiente accion

Usar `k7:super` como entrada por defecto para cualquier herramienta o agente que quiera pedirle a KAIZEN7 una decision operativa.
