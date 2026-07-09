# KAIZEN7 Second Brain

KAIZEN7 Second Brain turns the system into an operational memory and metaskill layer for Codex, agents and code tools.

```text
objective -> Supertool -> memory + metaskills + orchestration + verification + writeback draft
```

## Command

```powershell
npm.cmd run k7:brain -- "objective"
npm.cmd run k7:brain -- --write-signals --json "choose today's improvement"
npm.cmd run k7:brain -- --write-memory "record this reusable learning"
```

## API

```http
GET /api/k7/brain?goal=...
POST /api/k7/brain
```

## Layers

- `memory`: Obsidian, semantic memory and signal inbox.
- `metaskills`: selects operating skills before action.
- `orchestration`: routes through Supertool.
- `verification`: requires commands before completion.
- `frontier`: turns external signals into adaptation candidates.

## Writeback

The brain produces a memory draft, but writeback requires confirmation. It must never store secrets, credentials, private tokens or unverified claims.
