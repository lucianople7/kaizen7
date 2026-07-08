# kernel.mission_brief_generator

## Purpose

Transform a K7 Mission into a compact one-page Mission Brief for any agent.

## Use When

- A mission is ready to hand off to Codex or another agent.
- The context file list is too broad.
- The agent needs a clear first action, stop conditions and acceptance tests.

## Do Not Use When

- The mission itself is unclear.
- Human approval is needed before any work can start.
- The task requires direct execution instead of context preparation.

## Outputs

- mission
- capability
- current state
- files to read
- files forbidden
- constraints
- acceptance tests
- risks
- context budget
- first action
- stop conditions

## Verification

- Brief is present.
- Max file budget is respected.
- Stop conditions are present.
- Context budget is present.
- Kernel prepares work but does not execute it.
