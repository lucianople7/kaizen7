# K7 Self Evolution Loop

`k7-self-evolution-loop` is the metaskill for KAIZEN7 against KAIZEN7.

It turns self-use into controlled improvement:

```text
k7:start -> k7:eval -> friction -> test -> patch -> verify -> memory -> next pass
```

## When It Triggers

Use it for objectives like:

- `KAIZEN7 contra KAIZEN7`
- `autoevaluar KAIZEN7`
- `automejorar KAIZEN7`
- `self-evolution`
- repeated self-improvement passes

## Skill Files

```text
.agents/skills/k7-self-evolution-loop/SKILL.md
.codex/skills/k7-self-evolution-loop/SKILL.md
```

## Contract

Each pass must have:

- `k7:start` or `k7:eval` evidence,
- one concrete friction,
- a focused test or explicit no-code stop reason,
- minimal patch,
- verification,
- memory writeback.

## Guardrail

This is not autonomous churn.

If a pass finds no concrete friction that reduces steps, risk, context loss or verification gaps, stop.
