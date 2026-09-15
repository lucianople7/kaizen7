---
name: focux-motion
description: Specify restrained deterministic frame-based camera motion per independent FOCUX shot.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-motion

Frame counts must be positive integers; supported modes are push, pull, pan_left, pan_right, static. Baseline zoom range is 1 to 1.15. Compute transforms from frame index so rerenders agree. Motion over one master cannot substitute for separate scenes; examine borders after scaling.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-motion path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-motion/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
