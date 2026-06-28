# KAIZEN7 Eval Harness

`k7:eval` tests whether KAIZEN7 improves an agent/project start.

It compares:

- `agent-alone`: broad context, broad tool choice, late verification.
- `kaizen7-guided`: Activation Cockpit, Metaskill Boot, minimal toolchain and evidence gates.

## Command

```powershell
npm.cmd run k7:eval -- --project "The Focus" --context "repo local KAIZEN7" --capability run_tests "crear proyecto enfocado a creacion de contenido"
```

JSON:

```powershell
npm.cmd run k7:eval -- --project "The Focus" --context "repo local KAIZEN7" "crear proyecto enfocado a creacion de contenido" --json
```

## API

```http
POST /api/k7/eval
```

## What It Returns

- baseline friction,
- KAIZEN7 guided cockpit,
- estimated token reduction,
- reduced steps,
- first run commands,
- required evidence,
- stop rules.

## Rule

This is not a benchmark theater module.

Exact token savings require provider logs. Until then, `k7:eval` reports an estimate based on reduced context loads, fewer tool choices and earlier evidence gates.
