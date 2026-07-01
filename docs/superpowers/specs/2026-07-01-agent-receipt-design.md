# KAIZEN7 Agent Receipt Design

## Purpose

The Agent Receipt is the compact return object an agent gives back after working from a KAIZEN7 contract or brief.

It closes the loop:

```text
agent_contract -> agent_brief -> agent work -> agent_receipt -> evidence gate
```

## Shape

```json
{
  "schema": "kaizen7.agent_receipt.v1",
  "objective": "improve the kernel",
  "intent": "code_change",
  "verdict": "pass",
  "summary": "what changed",
  "evidence": {
    "changed_surface": ["files or artifacts"],
    "verification_result": "what was checked",
    "remaining_risks": ["known risks"]
  },
  "missing_evidence": [],
  "accepted_claims": ["claims accepted by the evidence gate"],
  "next_action": "complete",
  "memory_draft": "reusable learning only"
}
```

## Rules

- No commands in the receipt.
- No operating-system language in the receipt.
- Receipt verdict comes from the evidence gate.
- Missing evidence blocks completion.
- Memory draft must be reusable learning only.

## Success Criteria

- A passing receipt has `verdict: "pass"` and `next_action: "complete"`.
- A blocked receipt has `verdict: "block"` and `next_action: "provide_missing_evidence"`.
- Receipt output does not contain runtime language.
- Existing verifier behavior remains compatible.
