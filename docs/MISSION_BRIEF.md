# KAIZEN7 Mission Brief

## Purpose

The Mission Brief is the canonical execution card for agents working with KAIZEN7.

The Capability Resolver answers:

```text
What does this mission need?
```

The Mission Brief answers:

```text
What should the agent see before it starts?
```

## Rule

The Kernel prepares work. The agent executes work.

The Mission Brief must not execute code, write memory, publish, deploy, spend, delete or call external tools. It only compresses a K7 Mission into a small operational context.

## Fields

```text
MISSION
Goal
Project
Capability
Priority
Estimated scope

CURRENT STATE
What KAIZEN7 selected and why.

FILES TO READ
Maximum useful files for the agent. Default max: 5.

FILES FORBIDDEN
Files that were provided or tempting but should not be read for this mission.

CONSTRAINTS
Boundaries the agent must obey.

ACCEPTANCE TESTS
How the agent proves the work is done.

RISKS
Known risks or approvals.

CONTEXT BUDGET
Selected files, provided files, dropped files and reduction ratio.

FIRST ACTION
What the agent should do first.

STOP CONDITIONS
When the agent must stop and ask or report a blocker.
```

## CLI

JSON:

```powershell
node lib/capabilities/cli.js --mission-brief --evidence "<mission-json>"
```

Markdown:

```powershell
node lib/capabilities/cli.js --mission-brief --markdown --evidence "<mission-json>"
```

## Success Metrics

- fewer files read,
- smaller mission preparation time,
- fewer out-of-scope changes,
- clearer stop conditions,
- stable output for the same mission.

## Memory Decision

Mission Brief becomes the canonical execution card for agents. Capability Resolver remains the internal selector that feeds the Mission Brief.
