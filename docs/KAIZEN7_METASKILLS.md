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
-> existing skill or receipt
-> cli-anything-operator when missing executor
-> repo-hunter-github when missing pattern
-> kaizen7-evolution-engine when adapting external patterns
-> executor
-> receipt
-> memory
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
npm.cmd run k7 -- solve "<objective>"
npm.cmd run k7:metaskills:map
```

Use `k7 -- solve` when an agent needs the compact KAIZEN7 metaskill card:
minimal memory, route, tool ladder, API escape route, verification and learning
receipt. Use the metaskills map when an agent asks what coordinates KAIZEN7.

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
