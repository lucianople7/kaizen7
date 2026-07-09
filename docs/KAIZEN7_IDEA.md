# KAIZEN7 Idea

KAIZEN7 is a metaskill OS for agents.

It does not try to be the agent, the app, the framework or the project. It gives
any agent the smallest useful context, the right route, the right skill, a safe
execution boundary and a receipt that teaches the next run.

```text
Human decides.
KAIZEN7 focuses.
Agents execute.
Projects grow.
```

## One Line

KAIZEN7 makes agents more effective by turning broad intent into focused
execution with less context, fewer steps and reusable memory.

## Why It Matters

Most agent systems fail in the same places:

- too much context,
- unclear objective,
- wrong tool,
- repeated discovery,
- no memory of what worked,
- no compact handoff to the next agent,
- no receipt that improves the next run.

KAIZEN7 exists to remove that waste.

## Core Mechanism

```text
objective
-> handoff
-> route
-> skill/metaskill
-> executor
-> verification
-> receipt
-> reusable memory
```

The handoff starts work. The receipt improves the next run.

## Product Promise

Same or better outcome with:

- less repeated context,
- fewer tool decisions,
- fewer wasted searches,
- fewer tokens,
- clearer stop conditions,
- clearer verification,
- better reusable learning.

## What KAIZEN7 Is

- a focus layer,
- a routing layer,
- a handoff layer,
- a receipt layer,
- a memory discipline,
- a way to make agents compound.

## What KAIZEN7 Is Not

- not a mega-agent,
- not a replacement for Codex, OpenClaw, ECC or Anything CLI,
- not a project repository for THE FOCUX, Flowmatik or Mr. Kaizen,
- not a place to hide product work,
- not a reason to add complexity.

## How It Wins

KAIZEN7 wins when the second run is cheaper than the first.

The first time, it may need discovery. The second time, it should reuse the
route, avoid discarded tools and start from the best known handoff.

```text
First run learns.
Second run starts smarter.
Third run becomes a skill.
```

## Anything CLI Position

Anything CLI is the most important external-tool bridge for KAIZEN7.

It is not the brain and it is not the kernel. It is the operator adapter factory:
when a task needs real software and there is no clean API, MCP, CLI or existing
receipt, KAIZEN7 can use Anything CLI / CLI-Anything / cli-hub to find or forge
one repeatable command.

That is how KAIZEN7 can work with tools like OpenClaw, renderers, editors and
desktop software without becoming a heavy platform.

## The Shape

For humans:

```powershell
npm.cmd run k7 -- status
npm.cmd run k7 -- mission "<objective>"
npm.cmd run k7:idea
npm.cmd run k7:handoff
```

For agents and tools:

```powershell
npm.cmd run k7:handoff:json
```

For execution:

```powershell
npm.cmd run k7:now
npm.cmd run k7:check
```

## North Star

KAIZEN7 coordinates intelligence, not tools.

Every improvement must reduce one of these:

- complexity,
- context,
- tokens,
- decision time,
- execution errors,
- repeated work.

If it does not reduce one of them, it does not belong in the kernel.
