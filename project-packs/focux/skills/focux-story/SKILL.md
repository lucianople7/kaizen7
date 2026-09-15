---
name: focux-story
description: Shape a FOCUX micro-story into timed arrival, development and release beats.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-story

Give every beat a visible change and intended emotional effect. Preserve causal order; a shot should implement an approved beat rather than introduce new plot. Time is in seconds. The minimal baseline requires three beats with arrival first and release last; additional middle beats are allowed.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-story path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-story/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
