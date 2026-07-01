# KAIZEN7 Agent Work Brief Design

## Purpose

The Agent Work Brief is the practical working companion generated from the semantic agent contract. It gives an AI agent the minimum useful orientation before acting: first move, focus, limits, evidence, stop rule and expected return.

The contract is the protocol. The brief is the low-friction operating card an agent can use immediately.

## Product Thesis

Current agent tooling often makes agents carry too much prompt scaffolding. A good working companion should reduce this to a small, stable object:

```text
objective -> agent_contract -> agent_brief -> agent acts -> evidence gate
```

The brief should help Codex or any other agent avoid repeated questions, broad context loading, vague completion and unnecessary steps.

## Shape

```json
{
  "schema": "kaizen7.agent_brief.v1",
  "role": "working_companion",
  "objective": "improve the kernel",
  "intent": "kernel_improvement",
  "first_move": "understand_scope",
  "focus": "smallest_useful_change",
  "avoid": ["broad_refactor", "secrets", "external_publish"],
  "evidence_needed": ["changed_surface", "verification_result", "remaining_risks"],
  "stop_when": "required_evidence_is_present",
  "return": ["result_summary", "evidence", "risks", "memory_draft"]
}
```

## Rules

- No commands in the brief.
- No operating-system language in the brief.
- No tool-specific instructions in the brief.
- The brief must be generated from the agent contract, not from a separate resolver.
- The brief must stay small enough to paste into another agent without wasting context.
- The brief should not replace the contract; it should summarize the contract for action.

## Integration

Add:

- `buildAgentBrief(objective, options)`
- CLI: `--brief`
- API: `POST /api/k7/capabilities/brief`
- `packet.agent_brief`
- docs in `docs/AGENT_LANGUAGE.md`

## Success Criteria

- Brief output includes `kaizen7.agent_brief.v1`.
- Brief output does not include `npm.cmd`, `PowerShell`, `bash`, `Windows`, or `Linux`.
- Existing contract and packet outputs keep working.
- Start/Codex packets expose the brief through existing packet generation.
- Full check passes.

## Non-Goals

- Do not add workflow execution.
- Do not add a new runtime.
- Do not add domain content for Mr. Kaizen, Flowmatik or THE FOCUX.
- Do not remove compatibility fields from execution packets.
