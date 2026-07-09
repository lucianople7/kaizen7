# KAIZEN7 Best Now

This is the compact operating view for extracting the best current value from
the repository.

```powershell
npm.cmd run k7:best
```

For the shortest agent-ready card:

```powershell
npm.cmd run k7:handoff
```

For machine-readable handoff JSON:

```powershell
npm.cmd run k7:handoff:json
```

It surfaces:

- the current operating decision,
- the compact agent handoff,
- the best current KAIZEN7 assets,
- the safest commands to use,
- the current execution route,
- THE FOCUX OS state on top of ECC,
- the next mission,
- warnings that must stay visible,
- the next command to run.

## Current Principle

```text
Less steps. Less tokens. Better route. Reusable learning.
```

## Human Use

Run `k7:best` when you want the latest high-signal summary without reading the
whole repo.

## Agent Use

Run `k7:best` before broad work, then follow `k7:now` and the Mission Brief. If
`k7:best` fails, fix the route or blocker first.

Decision meanings:

- `execute`: proceed with the focused Mission Brief.
- `execute_with_guardrails`: proceed only inside the allowed KAIZEN7 kernel
  scope; keep project-facing risk behind review gates.
- `review_first`: stop project execution and create/complete the review route.
- `blocked`: fix health, readiness or missing context before execution.

The `Agent Handoff` section is the compact execution card. It tells the next
agent:

- what goal is active,
- what scope is allowed,
- which commands to run,
- when to stop,
- how to close the work with reusable memory.
- which receipt fields to return.
