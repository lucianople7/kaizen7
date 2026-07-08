# KAIZEN7 Context

## Purpose

KAIZEN7 is the coordination layer between humans, AI agents and digital projects.

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects grow.
```

KAIZEN7 is not another agent and should not become a mega-system. It is the metaskill layer that gives agents purpose, minimal memory, the right route and a reusable receipt.

It coordinates:

- skills,
- metaskills,
- routing,
- memory,
- verification,
- local tools,
- project handoffs,
- evidence before action.
- minimal context before execution.
- mission control before agent execution.

Current doctrine:

```text
Less steps. Less tokens. Better route. Real memory.
```

Use `skills` and `metaskills` as the main vocabulary. Existing `CAPABILITIES/` and `data/capabilities.json` are legacy routing artifacts until replaced or mapped.

Canonical vision:

- `docs/KAIZEN7_KERNEL_VISION.md`

## Project Separation

```text
KAIZEN7 repo = metaskill / memory / routing / verification / project contracts
Flowmatik repo = creative and operating pipeline
THE FOCUX repo = premium brand, dossiers, evidence and future commerce
Mr. Kaizen repo/channel = persona and trust-building content interface
NEUROCITY = project IP, not KAIZEN7 core
Providers = replaceable tools
```

This repository is the KAIZEN7 kernel only. Product, brand, video, content, IP,
commerce and public web surfaces must live in separate repositories or exported
project packs connected back to KAIZEN7 through small contracts.

Legacy folders or files that mention THE FOCUX, Flowmatik, Mr. Kaizen or
NEUROCITY are migration material until extracted. Do not grow them inside this
repo unless the task is explicitly a KAIZEN7 routing, contract, memory or
verification task.

## Current Master Direction

```text
content -> trust -> founding list -> dossiers -> curated selection -> own product
```

Reference:

- `docs/ECOSYSTEM_MASTER_DIRECTION.md`
- `docs/GROWTH_FOCUS_DIRECTIVE.md`
- `docs/GROWTH_SPRINT_01.md`
- `docs/PROJECT_CONNECTIVITY_OS.md`
- `data/project-connectivity-map.json`

## Growth Priority

KAIZEN7 exists to grow projects, not to build more KAIZEN7.

Before any mission, ask:

```text
What can we launch today that grows the ecosystem?
```

Every mission must help at least one growth lane:

- KAIZEN7 Execution Quality
- THE FOCUX Growth
- Flowmatik Production
- Mr. Kaizen Audience

If a mission does not produce content, an asset, a validated decision, a lead, a product, a sale, time saved or friction reduced, discard it.

Inside this repo, the default allowed lane is KAIZEN7 Execution Quality. Other
lanes should produce handoff contracts, receipts, briefs or repo-routing
instructions, not product implementation.

Mission Control must apply a Growth Gate before creating the Mission Brief:

- growth lane,
- valid output,
- execute or rewrite.

Current sprint:

- `docs/GROWTH_SPRINT_01.md`

Default next mission:

- Mission 01 - THE FOCUX Founding Offer

Growth philosophy:

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects grow.
```

## External Project Spine

```text
THE FOCUX dossier
-> Flowmatik content pack
-> Mr. Kaizen script
-> Remotion video factory
-> KAIZEN7 verification
-> Obsidian memory
```

This spine describes connected external projects. KAIZEN7 owns the route,
receipt and verification contract; each project owns its own implementation
repo.

## Communication Protocol

Official async route:

```text
Luciano -> ChatGPT -> K7 Mission -> GitHub Issue -> Codex -> Pull Request -> ChatGPT Review -> Merge -> KAIZEN7 Memory
```

ChatGPT creates structured missions. Codex implements them. GitHub issues and pull requests are the shared channel.

Protocol reference:

- `AGENTS.md`
- `docs/KAIZEN7_KERNEL_VISION.md`
- `docs/CAPABILITY_EXCELLENCE.md`
- `docs/MISSION_CONTROL.md`
- `docs/MISSION_BRIEF.md`
- `docs/CHATGPT_TO_CODEX_PROTOCOL.md`
- `.github/ISSUE_TEMPLATE/k7-mission.yml`
- `.github/pull_request_template.md`

## Key Skills And Metaskills

Primary project metaskill:

- `.agents/skills/kaizen7-metaskill/SKILL.md`

Legacy capability routes still present:

- `kernel.capability_resolver`
- `code.change`
- `code.review`
- `research.pattern_intake`
- `knowledge.source_briefing`
- `claims.check`
- `project.connectivity_os`
- `flowmatik.video_factory`
- `world.artifact_export_plan`

Canonical registry:

```text
data/capabilities.json
```

Human-readable summaries:

```text
CAPABILITIES/
```

Capability Resolver entrypoint:

```powershell
node lib/capabilities/cli.js --resolve-mission --evidence "<mission-json>"
```

Mission Brief entrypoint:

```powershell
node lib/capabilities/cli.js --mission-brief --evidence "<mission-json>"
```

Mission Outcome Receipt entrypoint:

```powershell
node lib/capabilities/cli.js --mission-outcome --evidence "<json>"
```

Mission Control entrypoint:

```powershell
npm.cmd run k7:jarvis -- "<objective>"
```

Impact entrypoint:

```powershell
npm.cmd run k7:now
```

Use `k7:now` first when the user asks what to do next, how to simplify KAIZEN7, or how to create more impact. It returns the highest-impact mission card with minimal context, growth lane, capability, Agent Browser summary, rules, success checks and Mission Outcome Receipt.

Agent Browser entrypoint:

```powershell
npm.cmd run k7:agent-browser
```

Agent Browser is the local repo-intelligence layer inspired by ECC-style tools: repository shape, scripts, docs, tests, capabilities and agent rules.

Capability Quality entrypoint:

```powershell
node lib/capabilities/cli.js --quality
```

## Safety Rules

- Never expose, move or edit secrets.
- Never publish externally without explicit approval.
- Never merge health/supplement claims without evidence and claims review.
- Never treat NEUROCITY metaphors as medical biology.
- Never launch ecommerce before compliance and product evidence exist.

## Testing

Default local checks:

```powershell
npm.cmd run k7:ready
node tests\capabilities.test.js
```

Python capability layer:

```powershell
python -m unittest tests.test_capabilities -v
```

If local Python is unavailable, use the Codex runtime Python when available.

## Memory Update Format

When a mission changes direction, include:

```text
Decision:
Context:
Files changed:
Tests:
Risks:
Next action:
```
