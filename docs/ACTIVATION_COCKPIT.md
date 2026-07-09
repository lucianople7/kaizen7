# KAIZEN7 Activation Cockpit

The Activation Cockpit is the shortest entrypoint into KAIZEN7.

It starts with one question:

```text
Que quieres conseguir ahora?
```

Then it asks only for context that changes the decision.

## Command

```powershell
npm.cmd run k7:cockpit
npm.cmd run k7:cockpit -- --context "repo local" --capability run_tests "mejorar KAIZEN7 con OpenHands"
```

## API

```http
POST /api/k7/cockpit
```

## Loop

```text
Objective -> Minimal context -> Metaskill boot -> Toolchain -> Action -> Verification -> Memory
```

## Metaskill Boot

When the cockpit is ready, it returns a `metaskillBoot` packet for editors and agents.

That packet includes:

- objective type,
- route,
- activation order,
- per-skill instructions,
- editor stop rules,
- `k7:metaskills` and `k7:cockpit` commands.

This lets Codex, OpenHands or another code editor start with KAIZEN7 metaskills already selected instead of loading every skill.

## Rule

The cockpit is not a megatool.

It should:

- ask the minimum useful question,
- activate only the metaskills that fit the objective,
- read at most the initial memory needed,
- select the smallest toolchain,
- produce one next action,
- require verification before closing,
- write only reusable learning.
