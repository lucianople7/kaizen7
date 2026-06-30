# K7 Harness Router Design

Date: 2026-06-30
Status: Draft for user review

## Goal

Give KAIZEN7 more power as a real action copilot for code agents and project improvement without making any external tool the core.

KAIZEN7 should decide, route, limit, verify and remember. Codex, Qwen Code, Aider, jcode, browser tools and future agents should be replaceable executors.

## Core Decision

Build a `K7 Harness Router`.

```text
User goal
-> KAIZEN7 Core
-> Mission Packet
-> Harness Router
-> Executor Adapter
-> Evidence
-> Memory Writeback
```

The fusion is architectural, not dependency-first. V1 does not install or trust external CLIs by default. It creates a shared mission contract and dry-run adapters so KAIZEN7 can choose the right executor before any real execution is enabled.

## Roles

KAIZEN7 owns:

- objective interpretation
- risk and approval policy
- context and memory selection
- allowed paths and budgets
- stop rules
- verification commands
- evidence contract
- Obsidian writeback

Executors own:

- acting inside the allowed scope
- returning structured evidence
- exposing their limits clearly
- never bypassing KAIZEN7 gates

## Executor Strategy

### Codex

Default V1 executor. Best for local repo work, tests, documentation, careful edits and current workspace integration.

Use when:

- the task is local to this repo
- tests can be run directly
- precise edits and review matter
- no external install is needed

### Qwen Code

Priority architecture reference and future adapter. It contributes strong patterns: Auto-Memory, Auto-Skills, SubAgents, MCP, daemon/API, sandbox/worktrees and agent protocol compatibility.

Use later when:

- session continuity matters
- subagents or teams are useful
- MCP/tool orchestration is central
- smoke tests prove it adds value over Codex

### Aider

Focused code-editing arm. Strong candidate for repo-level edits, patch generation, git-centered workflows and test/lint loops.

Use later when:

- the task is a surgical code change
- repo map and edit loop are valuable
- the user approves a real CLI smoke test

### jcode

Advanced harness candidate. Useful for sessions, memory, providers, MCP, browser and swarm ideas, but not the core.

Use later when:

- long-running harness behavior is useful
- session reuse matters
- direct smoke tests prove it reduces steps or context cost

### Browser Eyes

Visual and web evidence layer. It should inspect UI state, pages, screenshots and DOM snapshots.

Use when:

- the task requires seeing a website or app
- visual evidence is needed before/after a change
- UI behavior must be checked

### Manual

Safety fallback. Used when execution should stop for approval.

Use when:

- credentials are needed
- deploy, publish, payment or deletion is involved
- license/compliance risk is unclear
- risk is high or evidence is insufficient

## Mission Packet

Every executable request becomes a mission packet:

```json
{
  "objective": "string",
  "project": "KAIZEN7",
  "risk": "low | medium | high",
  "allowedPaths": ["lib", "tests", "docs"],
  "budget": {
    "maxSteps": 5,
    "maxTokens": 1600,
    "maxMinutes": 30
  },
  "capabilities": ["edit_code", "run_tests"],
  "preferredExecutor": "auto | codex | qwen-code | aider | jcode | browser | manual",
  "stopRules": [
    "stop_if_credentials_required",
    "stop_if_publish_deploy_payment_or_delete_is_needed",
    "stop_after_budget_exhausted"
  ],
  "verificationCommands": ["npm.cmd run check"],
  "expectedEvidence": ["diff_summary", "test_output", "memory_draft"],
  "memoryWriteback": {
    "target": "Obsidian/Flowmatik/Kaizen7",
    "kind": "Decision"
  }
}
```

## Router Scoring

The router scores executors by:

- capability fit
- local availability
- risk fit
- allowed path compatibility
- expected evidence quality
- setup cost
- token/context efficiency
- prior KAIZEN7 memory

Default rules:

- Prefer `codex` for normal local repo work.
- Prefer `browser` when visual/web evidence is required.
- Prefer `manual` when stop rules trigger.
- Prefer `aider` for focused repo patching only after a smoke test.
- Prefer `qwen-code` for memory/subagent/MCP workflows only after a smoke test.
- Prefer `jcode` for harness/session experiments only after a smoke test.

## Dry-Run Adapters

V1 adapters return plans, not real external execution:

- `codex`: local executor plan and verification commands
- `qwen-code`: suggested Qwen Code command, capabilities and blocked modes
- `aider`: suggested Aider command, files and verification path
- `jcode`: current jcode adapter plan
- `browser`: visual inspection packet
- `manual`: approval request packet

This keeps the fusion useful immediately while avoiding dependency risk.

## API

Add endpoints:

```text
POST /api/k7/mission
POST /api/k7/harness/route
POST /api/k7/harness/dry-run
```

`/api/k7/mission` creates a mission packet.

`/api/k7/harness/route` recommends an executor and explains why.

`/api/k7/harness/dry-run` returns the exact next action, approval gates, verification commands and memory draft.

## WebUI

Add a K7 Action Copilot panel in the existing cockpit:

- mission input
- recommended executor
- why this executor
- risk and stop rules
- allowed paths
- verification commands
- evidence checklist
- memory writeback draft

The UI should show action readiness, not marketing copy.

## Safety

No adapter may:

- write secrets to Obsidian
- run external installs without approval
- deploy, publish, pay, delete or push without approval
- bypass allowed paths
- mark a task complete without evidence
- turn swarm/subagents on by default

High-risk packets route to `manual`.

## Testing

Add focused tests for:

- mission packet defaults
- high-risk manual routing
- browser routing for visual tasks
- Codex routing for local repo edits
- Aider routing for focused code patches
- Qwen Code routing for memory/subagent/MCP tasks
- jcode routing for harness/session tasks
- dry-run output contract
- production readiness inclusion

Run:

```powershell
npm.cmd run check
```

## Success Criteria

V1 is successful when:

- KAIZEN7 can turn a goal into a mission packet.
- KAIZEN7 can explain which executor should act and why.
- The WebUI exposes the decision clearly.
- No external tool is required for V1.
- External executors are represented as safe dry-runs.
- Tests prove routing and safety gates.
- Obsidian records the decision and next learning.

## Out Of Scope For V1

- Installing Qwen Code, Aider or jcode.
- Running external CLIs for real changes.
- Autonomous swarm execution.
- Cloud deployment.
- Credential management.
- Full SWE-bench integration.

## Later Phases

1. Codex real executor.
2. Aider smoke test.
3. Qwen Code smoke test.
4. jcode smoke test.
5. Browser Eyes real visual inspection.
6. Local KAIZEN7 task benchmark.
7. SWE-bench style evaluation.
