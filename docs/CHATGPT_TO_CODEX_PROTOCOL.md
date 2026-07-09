# ChatGPT to Codex Protocol

## Purpose

This document tells ChatGPT how to communicate with Codex inside the KAIZEN7 ecosystem.

ChatGPT does not talk directly to Codex. GitHub is the shared operational channel.

Canonical KAIZEN7 identity:

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects evolve.
```

Reference: `docs/KAIZEN7_KERNEL_VISION.md`.

Official route:

```text
Luciano -> ChatGPT -> K7 Mission -> GitHub Issue -> Codex -> Pull Request -> ChatGPT Review -> Merge -> KAIZEN7 Memory
```

## What ChatGPT Must Do

When Luciano gives an idea, ChatGPT should convert it into a K7 Mission instead of giving Codex vague instructions.

ChatGPT is responsible for:

- clarifying the objective,
- choosing or proposing the correct capability,
- reducing context to the minimum useful files,
- defining constraints,
- defining acceptance tests,
- identifying risks,
- describing the expected output,
- reviewing the final pull request.

## K7 Mission Template

```yaml
goal:
why:
capability:
context_files:
constraints:
acceptance_tests:
risks:
expected_output:
priority:
estimated_scope:
```

## Field Rules

`goal` must be concrete and testable.

`why` explains why this matters now.

`capability` must exist in `CAPABILITIES/` or be clearly proposed as a new capability.

`context_files` must be the smallest useful set of files for Codex to read.

`constraints` define what Codex must not touch.

`acceptance_tests` must be executable whenever possible.

`risks` must explain what could break or what needs human approval.

`expected_output` must describe the exact artifact Codex should return.

`priority` should be one of:

- `P0 - blocker`
- `P1 - high`
- `P2 - normal`
- `P3 - later`

`estimated_scope` should be one of:

- `XS - docs or config only`
- `S - small focused change`
- `M - multi-file change`
- `L - architecture change`

## Default Context for Codex

Every mission should tell Codex to read:

- `AGENTS.md`
- `KAIZEN7_CONTEXT.md`
- the specific capability file inside `CAPABILITIES/`

Only add more files when needed.

Before sending a broad mission to Codex, ChatGPT can ask KAIZEN7 to resolve the mission context:

```powershell
node lib/capabilities/cli.js --resolve-mission --evidence "<mission-json>"
```

The resolver returns the selected capability, minimum context files, constraints and next action. ChatGPT should prefer that smaller context over a large file list.

For execution handoff, ChatGPT should prefer a Mission Brief:

```powershell
node lib/capabilities/cli.js --mission-brief --evidence "<mission-json>"
```

The Mission Brief is the compact card Codex should read before starting. It is the preferred handoff object when a mission is ready to implement.

After Codex finishes a Mission Brief, ChatGPT should expect a Mission Outcome Receipt:

```powershell
node lib/capabilities/cli.js --mission-outcome --evidence "<json>"
```

The Outcome Receipt is the compact closeout object. It should certify status, files changed, tests, constraints, unexpected changes and memory recommendation.

## Pull Request Review Checklist

When Codex returns a pull request, ChatGPT should review:

- Does it solve the mission?
- Did it stay inside scope?
- Were tests run?
- Are risks visible?
- Is a memory update needed?
- Does the change preserve KAIZEN7 direction?
- Does the change keep KAIZEN7 as coordination layer instead of turning it into an executor?
- Did the mission avoid unnecessary context files?
- Did Codex receive or produce a Mission Brief when the mission needed execution?
- Did Codex produce a Mission Outcome Receipt when the mission used a Mission Brief?

## Memory Rule

If the change affects architecture, capabilities, memory, protocols, Flowmatik, THE FOCUX, Kaizen, Mission Control or recurring decisions, ChatGPT should recommend what goes into KAIZEN7 Memory or Obsidian.

Memory should not be updated automatically unless Luciano approves it.

## Ready-To-Paste Instruction For ChatGPT

```text
Actua como ChatGPT dentro del protocolo KAIZEN7 Communication Protocol v1.

No intentes hablar directamente con Codex.
Tu trabajo es convertir mi idea en una K7 Mission lista para GitHub Issue.

Usa exactamente este formato:

goal:
why:
capability:
context_files:
constraints:
acceptance_tests:
risks:
expected_output:
priority:
estimated_scope:

Reglas:
- El objetivo debe ser concreto.
- La capability debe existir o proponerse claramente.
- Los context_files deben ser minimos.
- Las constraints deben decir que no puede tocar Codex.
- Los acceptance_tests deben poder ejecutarse si es posible.
- Los risks deben explicar que puede romperse.
- expected_output debe decir exactamente que debe entregar Codex.
- Cada mision debe modificar una unica responsabilidad del sistema cuando sea posible.
- Si hace falta memoria, propon la actualizacion, pero no la ejecutes sin aprobacion.

Ruta oficial:
Luciano -> ChatGPT -> K7 Mission -> GitHub Issue -> Codex -> Pull Request -> ChatGPT Review -> Merge -> KAIZEN7 Memory.
```
