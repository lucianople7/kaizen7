---
name: focux-rhythm
description: Plan evolving music sections and align important FOCUX cuts to measured beats.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-rhythm

Require at least three contiguous sections starting at zero with distinct energy values in [0,1]. Record important cuts and beat timestamps in seconds; baseline tolerance is 120 ms. Confirm actual audio evolves through listening and measurement; different labels alone do not prove nonrepetitive music.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-rhythm path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-rhythm/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
