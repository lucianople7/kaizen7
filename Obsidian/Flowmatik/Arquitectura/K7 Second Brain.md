# K7 Second Brain

Fecha: 2026-06-27

## Decision

KAIZEN7 debe operar como segundo cerebro con metaskills para Codex, agentes y herramientas de codigo.

No es solo memoria. Es memoria + seleccion de skills + orquestacion + verificacion + draft de aprendizaje.

## Contrato

```text
objective -> Supertool -> memory + metaskills + orchestration + verification + writeback draft
```

## Implementacion

- `lib/second-brain.js`
- `npm.cmd run k7:brain -- "objective"`
- `GET /api/k7/brain`
- `POST /api/k7/brain`
- `docs/SECOND_BRAIN.md`

## Metaskills base

- `kaizen7-evolution-engine`
- `test-driven-development`
- `verification-before-completion`
- `obsidian-memory`

## Regla de memoria

Solo se escribe aprendizaje confirmado. Nunca secretos, credenciales, tokens, cookies ni claims no verificados.

## Siguiente accion

Usar `k7:brain` como entrada cuando el objetivo requiera criterio, memoria y skills antes de actuar.
