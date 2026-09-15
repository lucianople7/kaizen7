---
name: focux-critic
description: Review FOCUX technical gates and record separate human visual acceptance.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-critic

Reconcile all G01–G18 evidence ids with actual receipts. A missing, failed or skipped gate blocks this acceptance contract. Keep visual review explicitly pending until performed; deterministic metadata gates cannot judge visual quality or logo naturalness. Report individual failures instead of averaging them away.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-critic path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-critic/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
