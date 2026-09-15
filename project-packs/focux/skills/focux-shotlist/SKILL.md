---
name: focux-shotlist
description: Turn approved FOCUX beats into independent shot generation briefs.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-shotlist

Use one unique id and master path per shot. Include anchor_id, duration in seconds and visible intent. Build requests from world bible, anchor references, previous shot, current brief and next intent. A planned unique path is not proof of a generated independent file: follow with the physical asset gate.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-shotlist path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-shotlist/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
