---
name: focux-visual-dna
description: Apply FOCUX palette, camera and sparse manga treatment to a shot plan.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-visual-dna

Manga is a transient separate overlay: baseline maximum two hits, each at most 0.5 seconds. Keep live-action identity visible before and after each hit. Inspect the rendered overlay; passing metadata cannot establish aesthetic quality.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-visual-dna path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-visual-dna/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
