# KAIZEN7 Repo Reorientation Audit

Date: 2026-07-02

## Decision

The repository direction is now KAIZEN7 Universal Capability Forge.

This audit classifies current surfaces before pruning. Broad deletion is blocked until each path is classified and approved.

## Keep In Core

- `data/`
- `lib/`
- `tests/`
- `docs/`
- `core.py`
- `package.json`
- `package-lock.json`
- `README.md`
- `KAIZEN7_INDEX.md`
- `.agents/`
- `.codex/`

Reason: these hold the capability kernel, provider registries, specs, plans, tests, skills and execution surfaces.

## Keep As Capability Pack Or Demo

- `Obsidian/Flowmatik/`
- `Obsidian/TheFocux/`
- `content_library/`
- `remotion/`
- `THE_FOCUX_SIGNAL_LIBRARY/`
- `examples/`

Reason: these are not the KAIZEN7 core, but they are useful capability packs, demonstrations, source memory or test material.

## Archive Candidate

- `flowmatik_os/`
- `flowmatik_studio/`
- `site/`
- `public/`
- `assets/`
- `artifacts/`

Reason: these may contain useful product or demo material, but they should not define the core. Review before moving or deleting.

## Remove Candidate After Approval

- `.tmp-cli-anything-hub/`
- `.tmp-video-deps/`
- `__pycache__/`

Reason: generated or cache-like paths. Delete only after path verification and explicit approval.

## Decide Later

- `mcp/`
- `n8n/`
- `pip/`
- `tools/`
- `scripts/`
- `skills/`
- `flowmatik_os/`
- `flowmatik_studio/`

Reason: these may become provider catalogs, adapter examples, automation surfaces or legacy material. Do not delete until a capability-forge use or rejection reason is documented.

## Pruning Rule

Delete only paths that are clearly generated, cache-like, duplicated or harmful to the forge direction.

Move product-specific material into capability packs or Obsidian memory when it contains reusable learning.

Do not delete THE FOCUX, Flowmatik or clip assets merely because they are not core. They are demos and packs unless proven stale.
