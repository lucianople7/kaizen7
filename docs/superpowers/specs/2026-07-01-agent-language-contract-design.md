# KAIZEN7 Agent Language Contract Design

## Purpose

KAIZEN7 should become the semantic companion an agent would want when doing long, business-facing work: a small kernel that reduces repeated prompting, operational stress, wasted tokens and unclear completion criteria.

The next kernel cycle creates an agent-to-agent language contract. KAIZEN7 will not primarily speak in commands, operating systems, or tool-specific instructions. It will speak in intent, capabilities, boundaries, evidence and completion rules.

## Product Thesis

Most agent systems still make humans and agents translate too much:

```text
human objective -> long prompt -> tool commands -> raw result -> interpretation -> next prompt
```

KAIZEN7 should remove translation friction:

```text
human objective -> compact agent contract -> agent acts -> evidence gate -> reusable memory
```

This makes KAIZEN7 useful above Codex, OpenHands, local agents, remote agents, business automations and future agent runtimes without becoming a large framework itself.

## Design Principles

- Keep the kernel small. Domain projects remain outside core.
- Prefer semantic contracts over command lists.
- Make every packet readable by an AI agent without local KAIZEN7 knowledge.
- Reduce tokens by removing repeated instructions and carrying only relevant boundaries.
- Reduce steps by making the next decision explicit.
- Reduce stress by defining what is allowed, what is forbidden and what counts as done.
- Never mark work complete without evidence.
- Keep commands as optional runtime hints, not as the kernel language.

## Core Vocabulary

The Agent Language Contract uses these terms:

- `objective`: the human or system goal.
- `intent`: the type of work the agent should perform.
- `route`: the smallest useful path through the work.
- `capabilities`: semantic abilities needed to complete the work.
- `boundary`: allowed scope, constraints and forbidden actions.
- `context`: compact references the agent may read if needed.
- `evidence`: proof required before accepting the result.
- `done`: completion rule.
- `result`: agent-facing summary of what changed or was produced.
- `memory`: reusable learning draft, never secrets or raw transcripts.

## Contract Shape

The canonical contract should be JSON-compatible and readable as plain text:

```json
{
  "schema": "kaizen7.agent_contract.v1",
  "objective": "mejorar el kernel de capacidades",
  "intent": "improve_kernel",
  "route": ["understand_scope", "make_small_change", "verify", "report"],
  "capabilities": ["modify_code", "verify_result", "report_risks"],
  "boundary": {
    "scope": "smallest_useful_change",
    "avoid": ["broad_refactor", "secrets", "external_publish", "unapproved_delete"]
  },
  "context": {
    "mode": "minimal",
    "references": ["docs/CAPABILITY_KERNEL.md"]
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

## Runtime Boundary

The contract must not depend on Windows, Linux, shell syntax, package managers, or a specific agent runtime.

KAIZEN7 may include optional `runtime_hints`, but those hints are not the contract:

```json
{
  "runtime_hints": [
    {
      "intent": "verify_repository",
      "human_label": "Run the repository verification suite"
    }
  ]
}
```

An agent decides how to satisfy the hint in its own environment. The kernel decides what must be proven.

## Capability Route

The existing capability resolver should evolve from selecting raw capabilities to producing a compact semantic route.

Example:

```json
{
  "intent": "code_change",
  "route": ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"]
}
```

The route should stay short. If the route grows too large, the kernel should split the work into a first useful action instead of creating a long workflow.

## Evidence Gate

The agent contract must require evidence before completion. Evidence terms are semantic:

- `changed_surface`: what changed or was created.
- `verification_result`: what was checked and the outcome.
- `remaining_risks`: what is still uncertain or blocked.
- `sources`: for research.
- `artifacts`: for visual, video or generated deliverables.
- `approval_state`: for external effects.

The existing verifier can continue accepting concrete evidence, but the public language should use semantic evidence names.

## Done Rule

Every contract includes a done rule. The default is:

```text
do_not_complete_until_required_evidence_is_present
```

This is the stress reducer: agents know when they can stop, humans know why the answer is trustworthy, and the system avoids false completion.

## Memory Rule

Memory is not a transcript dump. It is a draft of reusable learning:

- decision made,
- evidence accepted,
- risk or constraint discovered,
- reusable pattern,
- next useful improvement.

Memory must not contain secrets, credentials, private raw conversations, or unverified claims.

## Integration With Current Kernel

The current `k7-execution-packet` remains useful, but it should become a generated view of the new agent contract.

Planned mapping:

```text
capability plan -> agent contract -> optional execution packet -> evidence verification
```

Existing CLI/API can keep compatibility while adding agent-language outputs:

- `--contract "<objective>"`
- `POST /api/k7/capabilities/contract`
- `start.capabilityPacket.agent_contract`
- `codex.capabilityPacket.agent_contract`

## Success Criteria

The cycle succeeds when:

- a contract can be generated without OS-specific language,
- tests prove the contract contains no command-centric required field,
- existing packets still work,
- start/Codex surfaces include the semantic contract,
- evidence verification understands semantic evidence aliases,
- docs explain how an agent should read the contract,
- `npm.cmd run check` passes.

## Non-Goals

- Do not add a new agent runtime.
- Do not build a workflow engine.
- Do not add Mr. Kaizen content volume yet.
- Do not make Flowmatik or THE FOCUX part of core.
- Do not remove CLI/API compatibility from the previous kernel cycle.

## Risks

- If the vocabulary is too abstract, agents may produce vague work. Mitigation: keep evidence and boundary fields concrete.
- If the route becomes a workflow engine, the kernel will grow too much. Mitigation: route stays short and first-action oriented.
- If commands remain central, the contract loses the agent-to-agent advantage. Mitigation: commands become optional runtime hints only.

## Open Decision

The implementation should keep the name `capabilityPacket` for compatibility, but introduce `agentContract` as the clearer first-class concept.
