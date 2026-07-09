# KAIZEN7 Tool

KAIZEN7 is an official local command tool for making any agent more effective
before execution.

It turns a broad objective into:

- minimal context,
- minimal useful memory,
- agent-agnostic local context,
- free-first/open commons routes,
- tool forge routes that learn patterns from external tools,
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
| `npm.cmd run k7 -- run "<objective>"` | Return the main KAIZEN7 super-metaskill run card for any agent. |
| `npm.cmd run k7 -- doctor` | Check the professional tool surface and readiness contract. |
| `npm.cmd run k7 -- version` | Show package version, command count and schema. |
| `npm.cmd run k7 -- best` | Show the best current operating view. |
| `npm.cmd run k7 -- handoff` | Give another agent the smallest useful execution packet. |
| `npm.cmd run k7 -- mission "<objective>"` | Turn an objective into Growth Gate, route, Mission Brief and receipt template. |
| `npm.cmd run k7 -- solve "<objective>"` | Return the KAIZEN7 metaskill card for minimal memory, API escape, tool routing, verification and learning. |
| `npm.cmd run k7 -- anything "<objective>"` | Build an agent-agnostic Anything CLI route. |
| `npm.cmd run k7 -- mesh "<objective>"` | Return the Tool Mesh Pack: product pillars, adapter pack, scoring model, frontier modules and acceptance tests. |
| `npm.cmd run k7 -- adapt "<objective>"` | Return the modular market adaptation pack: open connection contracts, signal sources, evolution gates and refresh/retire rules. |
| `npm.cmd run k7 -- radar "<objective>"` | Remind agents to search for current better routes, tools, repos and adapters before hardening a decision. |
| `npm.cmd run k7 -- opportunity "<objective>"` | Map constant market problems to KAIZEN7 routes, trust gates, budgets, verification and receipt memory. |
| `npm.cmd run k7 -- commons "<objective>"` | Return the free-first open commons pack: local-first patterns, BYO connections and no vendor lock-in. |
| `npm.cmd run k7 -- forge "<tool-need>"` | Turn a tool need into radar, pattern learning, smallest adapter, verification, receipt memory and promotion rules. |
| `npm.cmd run k7 -- trust "<tool-or-connector>"` | Run the pre-execution trust gate for tools, MCPs, CLIs, browser agents and adapters. |
| `npm.cmd run k7 -- eval "<objective>"` | Generate the minimum eval pack: acceptance tests, regressions, budget, observability and receipt. |
| `npm.cmd run k7 -- production "<objective>"` | Return the production readiness pack: stack choice, trust gate, evals, observability and checklist. |
| `npm.cmd run k7 -- improve "<friction>"` | Run a controlled KAIZEN7 self-improvement pass. |
| `npm.cmd run k7 -- recall "<objective>"` | Search the local receipt ledger for reusable routes, tools and discard rules before opening broad context. |
| `npm.cmd run k7 -- context "<objective>"` | Generate a local, agent-agnostic context pack with trust boundary, receipts and next actions. |
| `npm.cmd run k7 -- resume "<objective>"` | Resume an agent or project from local KAIZEN7 context without replaying broad history. |
| `npm.cmd run k7 -- journal "<event-json>"` | Append an agent-agnostic local memory event for future context and resume packs. |
| `npm.cmd run k7 -- remember "<receipt-json>"` | Store a verified receipt in the local ledger so the next agent starts smarter. |
| `npm.cmd run k7 -- receipt` | Show the closeout fields every mission should return. |
| `npm.cmd run k7 -- check` | Run the compact smoke report. |

Every command that returns structured information supports `--json`.

## Aliases

| Alias | Command |
|---|---|
| `s` | `status` |
| `go`, `preflight` | `run` |
| `d` | `doctor` |
| `v` | `version` |
| `b` | `best` |
| `h` | `handoff` |
| `m` | `mission` |
| `key`, `llave` | `solve` |
| `a` | `anything` |
| `frontier`, `steroids` | `mesh` |
| `market`, `evolve` | `adapt` |
| `watch`, `scan` | `radar` |
| `problems`, `diagnose`, `value` | `opportunity` |
| `free`, `oss`, `libre` | `commons` |
| `forja`, `learn-tool`, `pattern` | `forge` |
| `gate`, `security` | `trust` |
| `tests`, `verify-plan` | `eval` |
| `prod`, `ready` | `production` |
| `i` | `improve` |
| `memory` | `recall` |
| `ctx` | `context` |
| `continue` | `resume` |
| `log` | `journal` |
| `learn` | `remember` |
| `r` | `receipt` |
| `c` | `check` |

## High-Value Flow

```text
objective
-> metaskill
-> opportunity / market problem
-> minimal memory
-> open commons / forge
-> route
-> skill/metaskill
-> executor
-> verification
-> receipt
-> remember / memory recommendation
```

## Tool Roles

| Layer | Job |
|---|---|
| KAIZEN7 Metaskill | Focuses objective, reduces context and selects route. |
| Market Map | Converts constant market problems into KAIZEN7 routes, trust gates and proof targets. |
| Open Commons | Keeps routes free-first, local-first and bring-your-own by default. |
| Tool Forge | Learns external tool patterns, creates the smallest agent-ready adapter and promotes only repeated verified routes. |
| Trust Gate | Blocks or reviews risky tools before agents execute them. |
| Eval Pack | Names acceptance tests, regressions, budget and observability fields. |
| Production Pack | Selects stack and checklist for production agent workflows. |
| Mission Control | Converts objective into Growth Gate, Mission Brief and receipt template. |
| Agent Handoff | Gives another agent only what it needs. |
| Anything CLI Operator | Finds or forges a safe external-tool executor when needed. |
| Verification | Runs smoke/readiness checks before claiming completion. |
| Agent Context | Writes local context and journal memory any agent can consume. |
| Receipt Ledger | Teaches the next run what to reuse and what to discard. |

## Examples

Create an agent-ready mission:

```powershell
npm.cmd run k7 -- run "mejorar este proyecto con menos contexto y mejor verificacion"
npm.cmd run k7 -- go "conectar una app sin API y guardar aprendizaje"
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

Run the improvement radar before hardening a route:

```powershell
npm.cmd run k7 -- radar "buscar si hay un agente browser mejor para este objetivo"
npm.cmd run k7 -- scan "comprobar repos actuales antes de crear un adapter"
```

Map the market problem and value route:

```powershell
npm.cmd run k7 -- opportunity "conectar agentes a herramientas sin API con menos tokens"
npm.cmd run k7 -- diagnose "resolver tool trust, coste y fiabilidad en agentes"
npm.cmd run k7 -- value "hacer cualquier agente mas barato y verificable"
```

Find free-first routes and open patterns:

```powershell
npm.cmd run k7 -- commons "memoria local y agentes sin pagar"
npm.cmd run k7 -- free "repos libres para conectar herramientas propias"
npm.cmd run k7 -- libre "usar CLI, MCP y modelos locales sin vendor lock-in"
```

Forge an agent-ready adapter from a tool need:

```powershell
npm.cmd run k7 -- forge "herramienta de video libre que aprenda patron"
npm.cmd run k7 -- forja "browser sin API con clicks y memoria reutilizable"
npm.cmd run k7 -- pattern "absorber patron de repo y convertirlo en skill"
```

Prepare production execution:

```powershell
npm.cmd run k7 -- trust "MCP browser tool with credentials"
npm.cmd run k7 -- eval "conectar una app sin API con bajo coste"
npm.cmd run k7 -- production "workflow largo con memoria y observabilidad"
```

Start a controlled self-improvement pass:

```powershell
npm.cmd run k7 -- improve "el status muestra demasiada informacion"
```

Recall previous learning before execution:

```powershell
npm.cmd run k7 -- recall "conectar app sin API"
npm.cmd run k7 -- memory "mejorar agente browser con menos tokens"
```

Create or resume agent-agnostic context:

```powershell
npm.cmd run k7 -- context "continuar KAIZEN7 sin releer todo"
npm.cmd run k7 -- resume "conectar agentes a herramientas sin API"
npm.cmd run k7 -- journal "{\"agent\":\"codex\",\"objective\":\"mejorar KAIZEN7\",\"action\":\"added memory pack\",\"outcome\":\"context ready\",\"next_action\":\"run k7:check\"}"
```

Store verified learning after execution:

```powershell
npm.cmd run k7 -- remember "{\"objective\":\"conectar app sin API\",\"route\":\"api_escape_to_tool_route\",\"tool\":\"Anything CLI\",\"verification\":\"npm.cmd run k7:check\",\"reuse_next_time\":\"Start with the known Anything CLI route.\",\"discard\":[\"Do not create a paid API dependency when local control works.\"]}"
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

## Free-First Rule

KAIZEN7 must not require paid services, hosted providers or one framework by
default. Prefer local scripts, free/open repos, user-provided connectors,
self-hosted tools and replaceable manifests. Paid services are allowed only
after explicit human approval and a visible cost/credential risk.

## Tool Forge Rule

KAIZEN7 should not copy whole tools into the kernel. It should learn the useful
pattern, create the smallest adapter a generic agent can use, verify it, and
store only the reusable receipt. A route becomes a skill only after repeated
verified receipts prove that it reduces steps, context, cost or breakage.
