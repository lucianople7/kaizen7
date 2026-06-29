# KAIZEN7 Prompt Filter

`k7:prompt` analyzes, simplifies and magnifies raw prompts before execution.

```text
raw prompt -> analysis -> simplified prompt -> magnified prompt -> wisdom/start/run
```

## Command

```powershell
npm.cmd run k7:prompt -- --project "THE FOCUX" "hazlo brutal con ia y conecta todo rapido"
```

JSON:

```powershell
npm.cmd run k7:prompt -- --project "THE FOCUX" "hazlo brutal con ia y conecta todo rapido" --json
```

## Outputs

- `analysis`: intent, ambiguities, risks and noise.
- `simplifiedPrompt`: direct, smaller and executable.
- `magnifiedPrompt`: stronger operating prompt with scope, gates, evidence and memory.
- `executionGate`: `safe_to_route` or `approval_required`.

## Rule

Never execute the noisy raw prompt directly.

KAIZEN7 should execute the simplified or magnified prompt after the Wisdom Filter checks risk, skills, connections and evidence.
