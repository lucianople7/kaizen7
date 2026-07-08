# KAIZEN7 Capabilities

This folder gives ChatGPT, Codex and humans a small readable map of KAIZEN7 capabilities.

Canonical machine-readable registry:

```text
data/capabilities.json
```

Use this folder for quick routing only. If there is disagreement, `data/capabilities.json` wins.

## Core Route

```text
Need -> Capability -> Provider -> Execution -> Evidence -> Memory
```

## Main Capability Groups

- `kernel.*` - registry, resolver and forge.
- `kernel.capability_quality_auditor` - scores capability quality and suggests upgrades.
- `kernel.mission_brief_generator` - compact execution card for agents.
- `kernel.mission_outcome_receipt` - compact output receipt after agent execution.
- `code.*` - implementation and review.
- `research.*` - repo/model/tool intake.
- `knowledge.*` - source packs, briefings and dossiers.
- `claims.*` - wellness, supplement and product claim review.
- `content.*` - scripts, storyboards and persona voice.
- `flowmatik.*` - video/content factory.
- `project.*` - project boundaries and connectivity.
- `world.*` - connectors, MCP, files and artifacts.
- `super.*` - compact agent workbench and next action.
