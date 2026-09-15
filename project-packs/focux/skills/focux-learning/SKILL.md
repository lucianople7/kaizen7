---
name: focux-learning
description: Evaluate FOCUX champion/challenger evidence and reversible policy promotion.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-learning

Change exactly one meaningful variable and link unique evidence ids to the experiment context. Promotion requires at least max(3,min_samples) observations and confidence >=0.8. This is a configurable baseline, not statistical significance. Confidence must come from the experiment analysis. Preserve the champion policy for rollback; a single observation is a hypothesis only.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-learning path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-learning/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
