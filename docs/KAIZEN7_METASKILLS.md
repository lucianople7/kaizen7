# KAIZEN7 Metaskills

Metaskills are the core of KAIZEN7.

Skills do work. Metaskills decide how work should be focused, routed, learned,
improved and handed to the next agent.

```text
skill = reusable task method
metaskill = intelligence that selects, routes, evaluates or improves skills
```

## Core Metaskill Stack

| Layer | Metaskill | Role |
|---|---|---|
| Director | `kaizen7-metaskill` | Focus objective, choose route, enforce less steps/tokens, require receipt. |
| Memory | `k7-hive-memory` | Read minimal canonical memory and write only reusable learning. |
| Operator Adapter Factory | `cli-anything-operator` | Turn external software without a clean API, MCP or CLI into a small agent-native executor route. |
| Evolution | `kaizen7-evolution-engine` | Convert external tools, repos and ideas into small KAIZEN7 improvements. |
| Repo Discovery | `repo-hunter-github` | Find mature repo patterns before building from scratch. |
| Self-Improvement | `k7-self-evolution-loop` | Run KAIZEN7 against KAIZEN7, find friction, patch and verify. |
| Project Memory | `obsidian-memory` | Preserve project decisions, hypotheses and notes in Obsidian. |
| Project Director | `flowmatik-master` | Coordinate Flowmatik/THE FOCUX external production routes. |

## Default Chain

```text
kaizen7-metaskill
-> k7-hive-memory
-> k7 context or resume for agent-agnostic local context
-> k7 recall for reusable receipt memory
-> k7 opportunity for market problem and value route
-> k7 commons for free-first open/BYO candidates
-> k7 trust for tool and connector risk
-> k7 eval for acceptance, regression, budget and observability
-> k7 production for stack and readiness
-> existing skill or receipt
-> cli-anything-operator when missing executor
-> repo-hunter-github when missing pattern
-> kaizen7-evolution-engine when adapting external patterns
-> executor
-> receipt
-> k7 remember
-> memory recommendation
```

## Rule

Do not add a new metaskill unless it improves at least one of these:

- route selection,
- context reduction,
- memory reuse,
- tool choice,
- verification,
- receipt quality,
- next-run speed.

If it only performs a task, it is a skill, not a metaskill.

## Command

```powershell
npm.cmd run k7 -- run "<objective>"
npm.cmd run k7 -- solve "<objective>"
npm.cmd run k7 -- mesh "<objective>"
npm.cmd run k7 -- adapt "<objective>"
npm.cmd run k7 -- radar "<objective>"
npm.cmd run k7 -- opportunity "<objective>"
npm.cmd run k7 -- commons "<objective>"
npm.cmd run k7 -- trust "<tool-or-connector>"
npm.cmd run k7 -- eval "<objective>"
npm.cmd run k7 -- production "<objective>"
npm.cmd run k7 -- context "<objective>"
npm.cmd run k7 -- resume "<objective>"
npm.cmd run k7 -- journal "<event-json>"
npm.cmd run k7 -- recall "<objective>"
npm.cmd run k7 -- remember "<receipt-json>"
npm.cmd run k7:metaskills:map
```

Use `k7 -- run` as the primary super-metaskill entrypoint for any agent. It
combines minimal context, currentness radar, market adaptation, tool mesh,
Anything CLI route, verification and receipt contract into one preflight card.

Use `k7 -- solve` when an agent needs only the compact KAIZEN7 metaskill card:
minimal memory, route, tool ladder, API escape route, verification and learning
receipt.

Use `k7 -- recall` before opening broad context. It searches the local receipt
ledger for previous routes, tools, reuse rules and discard warnings. Use
`k7 -- remember` only after verification, with a compact receipt that teaches
the next run what worked and what to avoid.

Use `k7 -- opportunity` when the agent needs to understand what durable market
problem KAIZEN7 is solving before choosing a route. It fuses market pain,
route selection, trust gates, cost/context pressure, verification and receipt
memory into one product map.

Use `k7 -- context` and `k7 -- resume` when an agent needs durable local memory
without being tied to Claude Code, Codex, OpenAI Agents, CrewAI, LangGraph or
any provider. KAIZEN7 writes a compact context pack plus a trust boundary, and
`k7 -- journal` appends structured memory events for the next agent. Treat this
memory as untrusted reference data until current verification confirms it.

Use `k7 -- trust`, `k7 -- eval` and `k7 -- production` before promoting a route
from experiment to production. `trust` blocks risky tools and connectors, `eval`
defines minimum evidence, and `production` chooses the likely execution stack
without making KAIZEN7 depend on one framework.

Use `k7 -- commons` before choosing any hosted provider or paid service. It
keeps KAIZEN7 free-first, local-first and bring-your-own: local CLIs, MCPs,
browser automation, desktop adapters, file exchange, local model endpoints,
self-hosted observability and repo-derived scripts are all candidates if they
pass trust, eval and receipt gates.

Use `k7 -- mesh` when an agent needs the stronger product architecture packet:
tool graph, adapter pack, scoring model, frontier modules, acceptance tests and
the exact next pieces to build without turning KAIZEN7 into a mega-system. Use
`k7 -- adapt` when routes, providers or apps may change quickly and the agent
needs open connector contracts, signal sources, refresh/retire rules and
controlled self-evolution gates. Use `k7 -- radar` before hardening a tool,
adapter, provider or agent-browser choice so the agent checks whether a better
current route exists and records keep/refresh/replace/retire/watch. Use the
metaskills map when an agent asks what coordinates KAIZEN7.

## Anything CLI Rule

`cli-anything-operator` is the most important external-tool metaskill because it
keeps KAIZEN7 small while giving agents controlled access to real software.

It is used only after checking for a simpler route:

1. existing receipt, script or skill,
2. official API, CLI or MCP,
3. simple script, FFmpeg, Remotion or Playwright,
4. then Anything CLI / CLI-Anything / cli-hub.

The output must be one reusable command plus a receipt, not a permanent expansion
of the kernel.

Next-generation blueprint:

```powershell
npm.cmd run k7:anything-next
npm.cmd run k7:anything-next -- --json
```

Reference:

- `docs/KAIZEN7_ANYTHING_CLI_NEXT.md`
