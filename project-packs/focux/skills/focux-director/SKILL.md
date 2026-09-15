---
name: focux-director
description: Coordinate an existing FOCUX production through verified stage outputs.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-director

Require concept and music direction before story; freeze continuity and anchors before independent generation. Treat asset_gate_passed as supplied evidence to cross-check with focux assets validate, never proof by itself. Render only after the real asset gate passes. Use focux status and project show before resuming a production.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-director path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-director/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
