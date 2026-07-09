# KAIZEN7 Tool

KAIZEN7 is an official local command tool for making any agent more effective
before execution.

It turns a broad objective into:

- minimal context,
- minimal useful memory,
- a route,
- the right skill or metaskill,
- an API escape route when direct APIs are blocked,
- Anything CLI executor discovery,
- the safest executor or adapter,
- verification,
- a receipt,
- reusable memory recommendation.

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects grow.
```

## Start

```powershell
npm.cmd run k7 -- status
npm.cmd run k7 -- doctor
```

Use this first when opening the repo or handing work to another agent.

## Command Surface

| Command | Use |
|---|---|
| `npm.cmd run k7 -- help` | Show the tool surface. |
| `npm.cmd run k7 -- status` | Show branch, readiness, repo shape, risks and next mission. |
| `npm.cmd run k7 -- doctor` | Check the professional tool surface and readiness contract. |
| `npm.cmd run k7 -- version` | Show package version, command count and schema. |
| `npm.cmd run k7 -- best` | Show the best current operating view. |
| `npm.cmd run k7 -- handoff` | Give another agent the smallest useful execution packet. |
| `npm.cmd run k7 -- mission "<objective>"` | Turn an objective into Growth Gate, route, Mission Brief and receipt template. |
| `npm.cmd run k7 -- solve "<objective>"` | Return the KAIZEN7 metaskill card for minimal memory, API escape, tool routing, verification and learning. |
| `npm.cmd run k7 -- anything "<objective>"` | Build an agent-agnostic Anything CLI route. |
| `npm.cmd run k7 -- mesh "<objective>"` | Return the Tool Mesh Pack: product pillars, adapter pack, scoring model, frontier modules and acceptance tests. |
| `npm.cmd run k7 -- adapt "<objective>"` | Return the modular market adaptation pack: open connection contracts, signal sources, evolution gates and refresh/retire rules. |
| `npm.cmd run k7 -- improve "<friction>"` | Run a controlled KAIZEN7 self-improvement pass. |
| `npm.cmd run k7 -- receipt` | Show the closeout fields every mission should return. |
| `npm.cmd run k7 -- check` | Run the compact smoke report. |

Every command that returns structured information supports `--json`.

## Aliases

| Alias | Command |
|---|---|
| `s` | `status` |
| `d` | `doctor` |
| `v` | `version` |
| `b` | `best` |
| `h` | `handoff` |
| `m` | `mission` |
| `key`, `llave` | `solve` |
| `a` | `anything` |
| `frontier`, `steroids` | `mesh` |
| `market`, `evolve` | `adapt` |
| `i` | `improve` |
| `r` | `receipt` |
| `c` | `check` |

## High-Value Flow

```text
objective
-> metaskill
-> minimal memory
-> route
-> skill/metaskill
-> executor
-> verification
-> receipt
-> memory recommendation
```

## Tool Roles

| Layer | Job |
|---|---|
| KAIZEN7 Metaskill | Focuses objective, reduces context and selects route. |
| Mission Control | Converts objective into Growth Gate, Mission Brief and receipt template. |
| Agent Handoff | Gives another agent only what it needs. |
| Anything CLI Operator | Finds or forges a safe external-tool executor when needed. |
| Verification | Runs smoke/readiness checks before claiming completion. |
| Receipt | Teaches the next run what to reuse and what to discard. |

## Examples

Create an agent-ready mission:

```powershell
npm.cmd run k7 -- mission "renderizar video con OpenClaw usando menos pasos"
npm.cmd run k7 -- m "renderizar video con OpenClaw usando menos pasos"
```

Create the metaskill card for a hard objective:

```powershell
npm.cmd run k7 -- solve "conectar una app sin API y aprender la ruta"
npm.cmd run k7 -- llave "reducir pasos, tokens y contexto en este repo"
```

Get a handoff for another agent:

```powershell
npm.cmd run k7 -- handoff
```

Inspect the external-tool mesh:

```powershell
npm.cmd run k7 -- anything --json
```

Build a route for a concrete project improvement:

```powershell
npm.cmd run k7 -- anything "mejorar cualquier repo con un ejecutor seguro"
```

Build the stronger tool mesh pack:

```powershell
npm.cmd run k7 -- mesh "conectar apps sin API y aprender rutas reutilizables"
npm.cmd run k7 -- frontier "resolver proyectos con CLIs, memoria y receipts"
```

Keep routes modular as markets change:

```powershell
npm.cmd run k7 -- adapt "mantener conectores utiles aunque cambien las herramientas"
npm.cmd run k7 -- evolve "refrescar adapters obsoletos sin hacer megasistema"
```

Start a controlled self-improvement pass:

```powershell
npm.cmd run k7 -- improve "el status muestra demasiada informacion"
```

Close a mission:

```powershell
npm.cmd run k7 -- receipt
```

## Self-Improvement Rule

`k7 improve` is not permission for autonomous churn. It returns one controlled
pass:

```text
friction
-> failing test or check
-> smallest kernel patch
-> focused verification
-> k7:check
-> receipt
-> memory recommendation
```

Use `--raw --json` only when you need the full underlying self-improvement loop.

## Rule

KAIZEN7 is valuable only when it reduces complexity, context, tokens, decision
time, execution errors or repeated work.

If a feature does not reduce one of those, keep it outside the kernel.
