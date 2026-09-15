---
name: focux-brand-placement
description: Place the canonical FOCUX mark naturally inside selected scenes.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-brand-placement

Baseline permits zero to two placements and at most eight percent frame area per placement. Composite the canonical mark with perspective and lighting appropriate to the surface. Record canonical logo provenance. Review spelling and naturalness visually; never use generated text as canonical identity.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-brand-placement path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-brand-placement/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
