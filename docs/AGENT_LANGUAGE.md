# KAIZEN7 Agent Language

KAIZEN7 speaks to agents through semantic contracts, not command lists.

## Contract

The stable schema is `kaizen7.agent_contract.v1`.

```json
{
  "schema": "kaizen7.agent_contract.v1",
  "objective": "improve the capability kernel",
  "intent": "code_change",
  "route": ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"],
  "capabilities": ["modify_code", "verify_result", "report_risks"],
  "boundary": {
    "scope": "smallest_useful_change",
    "avoid": ["broad_refactor", "secrets", "external_publish", "unapproved_delete"]
  },
  "evidence": {
    "required": ["changed_surface", "verification_result", "remaining_risks"]
  },
  "done": {
    "rule": "do_not_complete_until_required_evidence_is_present"
  },
  "memory": {
    "rule": "draft_reusable_learning_only"
  }
}
```

## Agent Rule

Read the contract as the working boundary. Choose your own runtime actions. Do not claim completion until the required evidence exists.

## Evidence Terms

- `changed_surface`: what changed or was produced.
- `verification_result`: what was checked and the outcome.
- `remaining_risks`: what is uncertain, blocked or needs approval.
- `sources`: research sources.
- `artifacts`: visual, video or generated deliverables.
- `approval_state`: status for external effects.

## Commands

Commands are runtime hints or compatibility fields. They are not the agent language.
