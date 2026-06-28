---
name: k7-self-evolution-loop
description: Use when KAIZEN7 must evaluate itself, run KAIZEN7 against KAIZEN7, repeat self-improvement passes, detect friction, write tests, patch the project, verify results, or record reusable learning from self-improvement cycles.
---

# K7 Self Evolution Loop

## Mission

Turn KAIZEN7 self-use into verified project improvement.

This skill is for controlled self-evolution, not autonomous churn. Each pass must expose real friction, convert it into a test or check, make the smallest useful change, verify, and record learning.

## Core Loop

Run short passes:

```text
k7:start -> k7:eval -> friction -> test -> patch -> verify -> memory -> next pass
```

Default command:

```powershell
npm.cmd run k7:start -- --project "KAIZEN7" --context "repo local KAIZEN7" --capability run_tests "evaluar KAIZEN7 contra KAIZEN7 y mejorar friccion"
```

## Pass Rules

For each pass:

1. Run `k7:start` or `k7:eval` against KAIZEN7 or the selected project.
2. Identify one concrete friction from the output.
3. Ignore vague improvements, feature creep and decorative docs.
4. Write or update a failing test/check for the friction.
5. Patch the smallest module that owns the behavior.
6. Run focused tests.
7. Continue only if the result improves the next start packet.

Stop after the requested number of passes, or earlier if no concrete friction remains.

## Valid Friction

Treat these as valid:

- lost `--context`, `--project` or `--capability` signals,
- wrong route or worker selection,
- missing metaskill for the objective,
- duplicated commands,
- unsafe approval policy,
- missing evidence gates,
- memory writeback too vague,
- output that cannot guide the next agent.

Do not patch for:

- wording preference only,
- speculative integrations,
- broad refactors,
- unmeasured token claims,
- new dependencies without a blocking need.

## Evidence Contract

A pass is complete only when it has:

- command output from `k7:start` or `k7:eval`,
- changed test/check or a reason no code change was needed,
- focused verification,
- full `npm.cmd run check` before final claim,
- memory writeback with decision and learning.

## Output

Close with:

```text
Passes run:
Friction found:
Changes made:
Verification:
Memory updated:
Remaining limits:
```
