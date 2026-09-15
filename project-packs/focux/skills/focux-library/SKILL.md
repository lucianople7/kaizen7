---
name: focux-library
description: Retrieve reusable FOCUX assets with traceable ownership and source metadata.
metadata:
  version: "1.0.0"
  owner: "THE FOCUX"
---

# focux-library

Search before generating. Inspect selected candidates with focux library inspect. Keep tags, hashes, source provenance and license evidence separate. Unknown licensing blocks selection; a text license label still needs supporting evidence. This gate checks catalog metadata, not file existence or rights adjudication.

Read [the contract](references/contract.md) for the exact fixture schema and limits. Use the installed FOCUX CLI/core; do not install another orchestrator or change global settings. Follow existing authorization for external generation costs and publishing.

Validate a proposed JSON plan using `python -m focux.skill_checks focux-library path/to/plan.json`. Exit 0 means this planning contract passes; exit 2 means it fails. Inspect errors before continuing. These checks complement the production asset/audio/render gates; they do not produce media.

Run `python skills/focux-library/scripts/selftest.py` from the FOCUX checkout (or run the script by absolute path). This runs a positive baseline and a deliberately invalid regression. The package expects the FOCUX Python package or its checkout `src/` to be available; it is not a standalone global installation.
