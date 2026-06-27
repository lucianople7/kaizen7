# K7 AI Booster

K7 AI Booster is the KAIZEN7 layer that gives AI agents memory, judgment, tool routing and a next best action before they spend tokens.

It does not replace Codex or other agents. It boosts them.

```text
KAIZEN7 = operating brain
Codex and other agents = execution engines
K7 AI Booster = memory + judgment + permissions + next action
```

## Vision

K7 AI Booster should feel like the copilot every AI wants before touching a project.

It is not just a better prompt. It is an operational activation layer for any project:

```text
Without KAIZEN7:
scattered context, lost decisions, agents starting from zero.

With KAIZEN7:
memory, modules, judgment, verification, learning and continuous evolution.
```

Any project should be able to enter KAIZEN7 and receive a structure that works, grows and adapts.

## What Changes For An Agent

Without K7 AI Booster:

```text
The agent enters a project, reads broadly, infers context, tries to avoid damage and spends tokens discovering what should already be known.
```

With K7 AI Booster:

```text
The agent starts with live memory, the active objective, repository boundaries, prior decisions, risks, allowed tools, the first useful action and a verification rule.
```

## Promise

- less repeated exploration,
- less wasted context,
- fewer tokens,
- fewer mistakes from lost memory,
- better project continuity,
- clearer verification,
- reusable learning after every run.

## Project Activation Protocol

When KAIZEN7 receives a project, it does not just open it. It structures it operationally.

That activation means:

1. **Anchor**: define what the project is, what it is not and the living objective.
2. **Memory**: create or locate the canonical memory.
3. **Map**: identify repositories, web, docs, assets, data and boundaries.
4. **Modules**: connect only the capabilities that matter.
5. **Judgment**: declare decisions, risks and operating rules.
6. **Action**: propose the smallest useful next move.
7. **Verification**: require evidence before closing.
8. **Evolution**: write learning back so the next run is smarter.

Mental model:

```text
Anchor -> Memory -> Map -> Modules -> Judgment -> Action -> Verification -> Evolution
```

## Modular By Design

KAIZEN7 should not load everything every time.

Each project activates only the modules it needs:

- memory,
- repository,
- web,
- ecommerce,
- video,
- image,
- research,
- social,
- payments,
- compliance,
- support,
- analytics,
- external agents.

Rule:

```text
A module enters if it reduces steps, reduces risk or increases clarity.
```

## Evolutionary By Nature

Every cycle should leave the system better:

- fewer repeated questions,
- less redundant reading,
- better decisions,
- better project map,
- better checks,
- better prompts,
- better modules,
- more supervised autonomy.

KAIZEN7 does not only execute. It learns the shape of the project.

## Operating Flow

```text
Agent enters
-> KAIZEN7 reads the objective
-> retrieves minimum useful memory
-> detects decisions and risks
-> selects skills and tools
-> generates an action brief
-> agent executes
-> KAIZEN7 requires verification
-> learning is written back
```

## Components

### Agent Context Pack

The minimum package an agent needs before acting:

- current objective,
- active project,
- canonical files,
- recent decisions,
- risks,
- constraints,
- useful commands,
- verification rule.

### Decision Guard

Compact rules the agent must not contradict.

Example:

```text
KAIZEN7 = agent
THE FOCUX = project
```

### Token Governor

Keeps the agent from reading everything when targeted memory is enough.

```text
Read what matters, not everything available.
```

### Tool Router

Recommends the right tools for the current objective and permission profile.

### Risk Lens

Detects project, repository, compliance, claim, test and token risks before action.

### Verification Gate

Every action must close with evidence:

- test,
- diff,
- file read,
- endpoint,
- screenshot,
- checklist,
- human confirmation.

### Learning Writeback

Important improvements go back to memory:

- decision,
- reason,
- result,
- next action,
- reusable learning.

## Interfaces

CLI:

```powershell
npm.cmd run k7:advise -- --agent codex --budget 1200 "objective"
```

API:

```http
POST /api/k7/advise
```

## Ideal Agent Brief Shape

```json
{
  "agent": "codex",
  "objective": "build the KAIZEN7 product layer",
  "context_pack": {
    "read_first": [],
    "decisions": [],
    "risks": [],
    "constraints": []
  },
  "recommended_tools": [],
  "first_action": "",
  "verification": "",
  "writeback": ""
}
```

## Product Boundary

```text
KAIZEN7 Product
  -> K7 AI Booster
      -> Agent Advisor
      -> Agent Runner
      -> Obsidian Memory
      -> Semantic Memory
      -> Skill Router
      -> Verification Gate
```

## Builder Line

```text
Give every agent memory, judgment and a next best action before it spends tokens.
```

```text
The copilot every AI wants before it acts.
```

```text
Activate any project with memory, modules and evolution.
```

## MVP Proof

The first version should prove:

1. Codex receives a better brief than broad repository exploration.
2. The brief reduces context and steps.
3. The agent knows what not to touch.
4. The action closes with verification.
5. The learning is written back to memory.
