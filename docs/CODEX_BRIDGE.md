# KAIZEN7 Codex Bridge

Codex can use KAIZEN7 as a pre-flight system improver before editing code.

```text
objective -> K7 Codex Bridge -> read list + skills + risks + first action + verification
```

## Command

```powershell
npm.cmd run k7:codex -- "implement the objective"
npm.cmd run k7:codex -- --frontier --write-signals "choose today's frontier improvement"
npm.cmd run k7:codex -- --json --budget 900 "fix this module with tests"
npm.cmd run k7:real -- "make KAIZEN7 real with Codex"
```

## API

```http
GET /api/k7/codex?goal=...
POST /api/k7/codex
POST /api/k7/realize
```

Example body:

```json
{
  "goal": "implement the selected adapter with tests",
  "frontier": true,
  "writeSignals": true,
  "contextBudget": 900
}
```

## Contract

The bridge returns:

- `read`: minimum memory/docs/files to inspect.
- `skills`: selected local skills.
- `avoid`: risk boundaries.
- `action`: first safe action.
- `commands`: verification and memory commands.
- `frontier`: optional daily Frontier Operator priority.

## Rule

Codex should run this before:

- editing files,
- installing dependencies,
- writing memory,
- connecting external tools,
- pushing, publishing or deploying.

KAIZEN7 does not replace Codex. It gives Codex a smaller context window, stronger gates and a better first move.

## Codex Realizer

`k7:real` is the productive verification loop:

```text
Codex Bridge -> readiness -> Frontier Operator -> full test suite -> real/blocked report
```

It returns `status: real` only when all checks pass. If one fails, it stops at the first failing command and reports the next action.
