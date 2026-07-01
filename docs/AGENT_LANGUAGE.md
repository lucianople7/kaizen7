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

## Brief

The stable brief schema is `kaizen7.agent_brief.v1`.

The contract is the protocol. The brief is the small working card an agent can act from immediately.

```json
{
  "schema": "kaizen7.agent_brief.v1",
  "role": "working_companion",
  "objective": "improve the capability kernel",
  "intent": "code_change",
  "first_move": "understand_scope",
  "focus": "smallest_useful_change",
  "avoid": ["broad_refactor", "secrets", "external_publish"],
  "evidence_needed": ["changed_surface", "verification_result", "remaining_risks"],
  "stop_when": "required_evidence_is_present",
  "return": ["result_summary", "evidence", "risks", "memory_draft"]
}
```

Use the brief when another agent needs the shortest possible orientation. Use the contract when it needs the full boundary.

## Evidence Terms

- `changed_surface`: what changed or was produced.
- `verification_result`: what was checked and the outcome.
- `remaining_risks`: what is uncertain, blocked or needs approval.
- `sources`: research sources.
- `artifacts`: visual, video or generated deliverables.
- `approval_state`: status for external effects.

## Commands

Commands are runtime hints or compatibility fields. They are not the agent language.
