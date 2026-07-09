# KAIZEN7 Repository Structure

KAIZEN7 is the core agent system and this repository should contain only the
kernel needed to route, verify, remember and coordinate work. Flowmatik,
THE FOCUX, Mr. Kaizen and other projects are separate repositories or exported
project packs connected to KAIZEN7 by small contracts.

```text
KAIZEN7 repo = metaskills, memory, routing, verification, receipts
Flowmatik repo = creative and operating pipeline
THE FOCUX repo = premium brand/project and future commerce surface
Mr. Kaizen repo/channel = content persona and demo channel
THE FOCUX OS / NEUROCITY = project IP outside KAIZEN7 core
Providers = optional tools for specific routes
```

## Ownership

| Piece | Role | Primary location | Boundary |
| --- | --- | --- | --- |
| KAIZEN7 Core | Agent coordination kernel | `AGENTS.md`, `KAIZEN7_CONTEXT.md`, `.agents/`, `.github/`, `docs/`, `lib/`, `data/`, `tests/` | Keeps metaskills, contracts, routing, receipts and evidence gates |
| Skill and metaskill registry | Reusable agent methods | `.agents/skills/`, `skills/`, `data/capabilities.json` while legacy exists | Skills stay small; project-specific execution belongs outside the kernel |
| Flowmatik | Content, video and automation pipeline | External repo or exported project pack | Produces creative workflows; KAIZEN7 stores only route contracts and receipts |
| THE FOCUX | Premium project, public brand and future commerce | External repo, currently expected at `C:\Users\lucia\OneDrive\Documentos\thefocux` | Public repo must not include KAIZEN7 private memory |
| Mr. Kaizen | Persona/content demo | External repo/channel or exported pack | Teaches and demonstrates; KAIZEN7 stores voice contracts only when useful |
| THE FOCUX OS / NEUROCITY | Educational IP | External project repo or THE FOCUX repo | Project IP must not become KAIZEN7 doctrine |
| Providers | Optional execution tools | Pinokio apps, FFmpeg, Remotion, n8n, MCPs | Provider != core; install only when useful and approved |

## Product Split Contract

Each product must have one owner and one output surface:

| Product | Owns | Does not own in this repo |
| --- | --- | --- |
| KAIZEN7 | routes, skills, metaskills, memory contracts, verification, receipts, handoff contracts | public websites, commerce surfaces, video factories, brand IP implementation |
| THE FOCUX | brand, dossiers, evidence, public site, founding list, future commerce | KAIZEN7 kernel rules, private agent memory, generic route logic |
| Flowmatik | content production, render pipelines, media manifests, creative automation | KAIZEN7 routing doctrine or THE FOCUX brand decisions |
| Mr. Kaizen | persona, scripts, channel packaging, audience learning | kernel contracts, ecommerce logic, private project memory |

When one product needs another, create a contract or receipt instead of moving
implementation across repos.

## Migration Boundary

Some legacy folders in this working tree still contain project material:
`Obsidian/Flowmatik/`, `Obsidian/TheFocux/`, `flowmatik_os/`,
`flowmatik_studio/`, `remotion/`, `thefocuxOS/`, `THE_FOCUX_SIGNAL_LIBRARY/`
and public assets. Treat them as extraction backlog, not active KAIZEN7 kernel
surface.

Do not add new product, brand, video, commerce or IP implementation here. Add
only KAIZEN7 contracts, receipts, routing rules or migration notes that help
external repos connect cleanly.

## Current Product Direction

KAIZEN7 is now oriented around:

```text
Need -> route -> skill/metaskill -> provider or pattern -> execution packet -> evidence -> receipt
```

The active doctrine is:

- free/open-source first,
- CPU-first or no-GPU by default,
- local-first when practical,
- minimal setup,
- explicit approval for external effects,
- evidence before memory writeback.

## Working Rules

1. Start from `AGENTS.md` and `KAIZEN7_CONTEXT.md`.
2. Read the smallest relevant KAIZEN7 docs or skill.
3. Keep THE FOCUX, Flowmatik and Mr. Kaizen as separate projects/repos.
4. Treat project folders still present here as migration material.
5. Keep rendered videos, frames, WAV files and runtime evidence out of git.
6. Install providers only when they reduce current friction.
7. Publish, spend, delete, push, deploy or touch credentials only with explicit approval.

## Next Practical Moves

1. Stabilize KAIZEN7 entrypoints documented in `KAIZEN7_CONTEXT.md`.
2. Create a repo split checklist for extracting Flowmatik and THE FOCUX.
3. Build K7 Memory Governance as the next KAIZEN7 core improvement.
4. Keep product implementation changes out of this repository.
5. Evaluate providers one at a time only after a real KAIZEN7 kernel need appears.
