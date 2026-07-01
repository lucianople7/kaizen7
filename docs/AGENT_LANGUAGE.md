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

## Handoff

The stable handoff schema is `kaizen7.agent_handoff.v1`.

Use a handoff when one agent needs to delegate or pass work to another agent.

```json
{
  "schema": "kaizen7.agent_handoff.v1",
  "contract": { "schema": "kaizen7.agent_contract.v1" },
  "brief": { "schema": "kaizen7.agent_brief.v1" },
  "expected_receipt_schema": "kaizen7.agent_receipt.v1",
  "handoff_rule": "use_brief_for_action_return_receipt_for_verification"
}
```

The handoff gives the receiving agent enough structure to act without reading the full KAIZEN7 internals.

## Receipt

The stable receipt schema is `kaizen7.agent_receipt.v1`.

Agents use receipts to hand work back with evidence instead of long narrative claims.

```json
{
  "schema": "kaizen7.agent_receipt.v1",
  "objective": "improve the capability kernel",
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

If evidence is missing, the receipt verdict is `block` and `next_action` is `provide_missing_evidence`.

## Evidence Terms

- `changed_surface`: what changed or was produced.
- `verification_result`: what was checked and the outcome.
- `remaining_risks`: what is uncertain, blocked or needs approval.
- `sources`: research sources.
- `artifacts`: visual, video or generated deliverables.
- `approval_state`: status for external effects.

## Commands

Commands are runtime hints or compatibility fields. They are not the agent language.

## Language Guard

Agent-language objects should remain free of runtime or operating-system terms. Use the language guard in code when adding new agent-facing objects:

```js
const { findRuntimeLanguage } = require("./lib/capabilities");
```

Expected result for contract, brief, handoff and receipt objects:

```json
[]
```

## Validation

Validate agent-language objects before handing them to another agent.

The validator checks three things:

- the object uses the expected schema.
- required fields are present.
- runtime language is not leaking into the agent-facing object.

CLI:

```sh
node lib/capabilities/cli.js --validate --evidence "<json>"
```

API:

```http
POST /api/k7/capabilities/validate-language
```

Body:

```json
{
  "value": { "schema": "kaizen7.agent_handoff.v1" },
  "expectedSchema": "kaizen7.agent_handoff.v1"
}
```

Response:

```json
{
  "schema": "kaizen7.agent_handoff.v1",
  "expected_schema": "kaizen7.agent_handoff.v1",
  "verdict": "block",
  "missing": ["contract", "brief", "expected_receipt_schema", "handoff_rule"],
  "runtime_language": [],
  "schema_mismatch": []
}
```

`pass` means the object can move to the next agent. `block` means the object must be repaired before handoff.

## Cycle

The stable cycle schema is `kaizen7.agent_cycle.v1`.

Use a cycle when an agent needs one closure object for a capability run.

```json
{
  "schema": "kaizen7.agent_cycle.v1",
  "objective": "improve the capability kernel",
  "verdict": "pass",
  "readiness": { "schema": "kaizen7.agent_readiness.v1" },
  "verification": { "mode": "capability-evidence-verification" },
  "receipt": { "schema": "kaizen7.agent_receipt.v1" },
  "memory_draft": "reusable learning only",
  "next_action": "complete"
}
```

CLI:

```sh
node lib/capabilities/cli.js --cycle "<objective>" --evidence "<json>"
```

API:

```http
POST /api/k7/capabilities/cycle
```

The cycle is the kernel's minimal useful loop:

```txt
objective -> packet -> readiness -> result evidence -> receipt -> verification -> memory draft -> next action
```

## Kernel Bridge

The stable bridge schema is `kaizen7.kernel_bridge.v1`.

Use a bridge when an external platform or project needs to understand how to consume KAIZEN7 without knowing its internals.

```json
{
  "schema": "kaizen7.kernel_bridge.v1",
  "consumer": "any_agent",
  "project": "mr_kaizen",
  "interface": {
    "input": "objective_plus_optional_result_evidence",
    "output": "agent_cycle_or_repair_request"
  },
  "kernel_objects": [
    "kaizen7.agent_contract.v1",
    "kaizen7.agent_cycle.v1"
  ],
  "guarantees": [
    "schema_validation",
    "readiness_check",
    "evidence_gated_completion"
  ],
  "next_action": "run_cycle"
}
```

CLI:

```sh
node lib/capabilities/cli.js --bridge "<objective>"
```

API:

```http
POST /api/k7/capabilities/bridge
```

The bridge keeps KAIZEN7 portable: Codex, content systems, product workflows and future agents can use the same kernel objects instead of each inventing its own protocol.
