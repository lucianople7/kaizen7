# KAIZEN7 Mission Outcome Receipt

## Purpose

Mission Outcome Receipt is the canonical output contract for KAIZEN7 missions.

```text
Mission Brief = input contract.
Mission Outcome Receipt = output contract.
```

It is not a pull request, a report or a memory note. It is a compact operational receipt that certifies what happened.

## Rule

A Mission Outcome Receipt never explains. It certifies.

It should be short, structured and readable by future agents.

## Fields

```text
mission
status
goal_completed
files_changed
tests
constraints_respected
unexpected_changes
recommended_memory
next_capability
follow_up
```

## Status

`pass` means the mission is certified.

`needs_review` means the mission may be complete, but there are unexpected changes or memory recommendations requiring review.

`block` means the mission is not certified.

## CLI

JSON:

```powershell
node lib/capabilities/cli.js --mission-outcome --evidence "<json>"
```

Markdown:

```powershell
node lib/capabilities/cli.js --mission-outcome --markdown --evidence "<json>"
```

## Memory Rule

The receipt may recommend memory. It must not write memory automatically.

Store only durable learning:

- new Kernel rules,
- architecture decisions,
- capability changes,
- recurring decisions,
- verified protocol improvements.

Do not store implementation noise or ephemeral details.
