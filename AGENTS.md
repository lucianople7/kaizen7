# KAIZEN7 Agent Instructions

## Communication Protocol v1

## Canonical Identity

KAIZEN7 is the coordination layer between humans, AI agents and digital projects.

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects evolve.
```

Reference: `docs/KAIZEN7_KERNEL_VISION.md`.

## Growth Protocol

KAIZEN7 does not exist to build more KAIZEN7. KAIZEN7 exists to grow projects.

Before starting any mission, ask:

```text
What can we launch today that grows the ecosystem?
```

If the mission does not produce content, a reusable asset, a validated decision, a lead, a product, a sale, time saved or friction reduced, do not execute it.

Reference: `docs/GROWTH_FOCUS_DIRECTIVE.md`.

## Mission Route

KAIZEN7 uses GitHub as the shared channel between Luciano, ChatGPT and Codex:

```text
Luciano -> ChatGPT -> GitHub Issue -> Codex -> Pull Request -> ChatGPT Review -> Merge -> KAIZEN7 Memory
```

ChatGPT and Codex do not need direct real-time communication. The issue and pull request are the handoff.

No agent should assume private context from another agent. The shared state is the issue, the pull request, repository files and KAIZEN7 memory.

## Responsibilities

- Luciano defines the objective and approves important decisions.
- ChatGPT researches, designs, creates K7 Missions, reviews pull requests and detects risks.
- Codex reads minimal context, implements the mission, runs tests and returns a small pull request.
- KAIZEN7 keeps routes, skills, metaskills, memory and system rules.

## Repository Boundary

This repository is the KAIZEN7 kernel.

KAIZEN7 owns:

- metaskills,
- routing,
- memory contracts,
- verification receipts,
- project handoff contracts,
- agent rules.

THE FOCUX, Flowmatik, Mr. Kaizen, NEUROCITY/project IP, public websites,
commerce surfaces, video factories and channel content must live in separate
repositories or exported project packs.

Legacy project material still present in this working tree is extraction
backlog. Do not grow it inside this repo unless the mission explicitly updates
KAIZEN7 routing, contracts, receipts, verification or memory.

## K7 Mission Format

Every mission must include:

```yaml
goal:
why:
route:
context_files:
constraints:
acceptance_tests:
risks:
expected_output:
priority:
estimated_scope:
```

## Required Startup

Before changing files:

1. Read `AGENTS.md`.
2. Read `KAIZEN7_CONTEXT.md`.
3. Use the Mission Brief if the issue provides one, or identify the smallest relevant route, skill or metaskill.
4. Read only `files_to_read` from the Mission Brief, or the files listed in the issue plus the minimum files needed to verify the task.
5. Avoid loading broad context unless the mission requires it.

## Work Rules

- Keep changes small and scoped to the issue.
- Prefer existing project patterns over new frameworks.
- Do not touch credentials, secrets, billing, deployments, destructive deletes or external publishing without explicit approval in the issue or PR.
- Do not add paid services or external APIs unless the mission explicitly approves them.
- If a task affects health, supplements, claims, ecommerce or legal risk, use the claims route.
- If a task affects project architecture, use the project connectivity route.
- If a task creates video/content, keep implementation in the external project repo and use only a KAIZEN7 handoff route here.
- If a task turns sources into briefs, use the source briefing route.
- Each mission should modify one responsibility of the system when possible.
- In this repo, default to KAIZEN7 kernel changes. Project implementation
  belongs in its project repo.
- Use `node lib/capabilities/cli.js --resolve-mission --evidence "<mission-json>"` when a mission has too much context and needs reduction before implementation. This is a legacy command name; the product concept is route resolution.
- Use `node lib/capabilities/cli.js --mission-brief --evidence "<mission-json>"` to create the compact execution card for an agent.
- Use `node lib/capabilities/cli.js --mission-outcome --evidence "<json>"` to close a Mission Brief with a structured receipt.

## Pull Request Requirements

Every PR must include:

- issue/mission reference,
- changes made,
- tests run,
- risks,
- memory update recommendation,
- Mission Outcome Receipt when the mission used a Mission Brief.

## Memory Rule

If the change affects system direction, routes, skills, metaskills, memory, protocols, Mission Control, project boundaries, THE FOCUX strategy, Flowmatik pipeline, Mr. Kaizen voice, NEUROCITY IP, or recurring decisions, include a memory update recommendation in the PR.

Do not update memory automatically without human approval unless the issue explicitly requests it.

Possible memory targets:

- `KAIZEN7_CONTEXT.md`
- external project repo memory or exported project pack
- `data/hunter-registry.json`
- route, skill or metaskill registries

## Done Definition

A mission is complete only when:

- acceptance tests pass or the blocker is clearly reported,
- files changed match the mission,
- risks are visible,
- Mission Outcome Receipt is present when a Mission Brief was used,
- memory update is stated,
- PR description is complete.

## Philosophy

KAIZEN7 does not coordinate tools. It coordinates intelligence.

Each agent should receive only the context required to complete its work with the lowest useful amount of time, context and complexity.

Before adding Kernel functionality, ask whether it reduces complexity, context, tokens, decision time or execution errors. If it does not, keep it outside the Kernel.
