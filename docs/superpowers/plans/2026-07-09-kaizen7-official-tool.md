# KAIZEN7 Official Tool Plan

## Goal

Turn KAIZEN7 from a kernel cleanup repo into a professional local tool surface
for agent-agnostic project improvement.

## Scope

- Keep KAIZEN7 inside its kernel boundary.
- Make the package identify as `kaizen7`.
- Expose a real `k7` binary entrypoint.
- Make Anything CLI routing actionable for any project objective.
- Keep blueprint output available for agents that need the architecture.
- Verify with focused tests and the existing KAIZEN7 check suite.

## Acceptance

- `k7 -- anything "<objective>"` produces a concrete route, command plan,
  adapter contract, safety gates and receipt template.
- `k7 -- anything` still shows the next-generation blueprint.
- `k7 -- doctor` checks the route contract and binary entrypoint.
- Tests cover the new route behavior.
