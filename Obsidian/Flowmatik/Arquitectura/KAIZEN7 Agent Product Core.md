# KAIZEN7 Agent Product Core

## Decision - 2026-07-02

KAIZEN7 is now defined as an agent product, not only a local assistant or project workspace.

The direction is:

```text
Universal Capability Forge for agents
```

KAIZEN7 should help Codex, Claude Code, OpenHands and other agents move from need to capability with less friction, stronger guardrails and reusable memory.

## Product Loop

```text
Need
  -> capability inference
  -> provider/pattern radar
  -> adapter or minimal build
  -> ephemeral specialist agent
  -> bounded execution packet
  -> context firewall
  -> evidence gate
  -> memory governance
  -> next agent starts stronger
```

## What Must Not Be Lost

- KAIZEN7 is not limited to clips or video. It must adapt to any capability need.
- Free/open-source, CPU-first and local-first remain the default.
- Pinokio, MCPs, OpenHands, Codex, Claude Code, Playwright, FFmpeg, Whisper-style tools and future providers are replaceable paths, not the center.
- The center is KAIZEN7's ability to search, choose, adapt, build, verify and remember.
- Subagents should be ephemeral: created for one job, then registered, revised, retired or archived as learning.
- Heavy outputs should be stored as evidence and summarized into compact references.
- External repos must be treated as supply-chain inputs with trust gates before install/run.

## Pieces Already Incorporated

- `Universal Capability Forge`
- `Provider Radar`
- `Adapter Manifest`
- `Forge Sessions`
- `Agent Handoff`
- `Ephemeral Agent Factory`
- `Context Firewall`
- `Agent Magnifier Radar`

## Next Real Build

Build `K7 Memory Governance`.

It should record:

- issues,
- attempts,
- failed fixes,
- decisions,
- fragile files,
- provider learnings,
- capability learnings,
- warnings for future agents.

Before an agent acts, KAIZEN7 should ask local memory:

```text
Has this failed before?
Is this file fragile?
Is there a prior decision?
Does this action need approval?
```

## Trust Gate

Before clone, install or run from external sources:

- check license,
- inspect scripts,
- identify network behavior,
- block secrets exposure,
- require approval for untrusted execution,
- log decision and evidence.

## Canonical Repo Files

```text
docs/KAIZEN7_AGENT_PRODUCT_CORE.md
docs/UNIVERSAL_CAPABILITY_FORGE.md
docs/EPHEMERAL_AGENT_FACTORY.md
docs/AGENT_USAGE.md
docs/CONTEXT_FIREWALL.md
docs/AGENT_MAGNIFIER_RADAR.md
content_library/evolution/agent-product-core.json
content_library/evolution/agent-magnifier-radar.json
```

## Product Thesis

```text
KAIZEN7 converts each task into reusable capability learning so the next agent starts stronger.
```
