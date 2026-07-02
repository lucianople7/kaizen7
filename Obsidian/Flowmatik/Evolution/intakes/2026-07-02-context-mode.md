# Intake - Context Mode

## Source

- Repo: https://github.com/mksglu/context-mode

## Need

KAIZEN7 needs to make Codex and other agents more capable by reducing context waste, keeping heavy tool output outside the prompt and preserving evidence for retrieval.

## Useful Pattern

Context Mode's strongest pattern is a context firewall:

- heavy tool output is stored outside the prompt,
- the agent receives a compact reference,
- session/evidence data can be searched later,
- tool output becomes indexed evidence instead of context noise.

## KAIZEN7 Translation

Implement local `K7 Context Firewall`:

```text
raw output -> evidence file -> compact context capsule -> searchable retrieval
```

## Verdict

`adapt_pattern`

Do not adopt the whole project yet. Absorb the pattern first with a small local module and tests.

## First Implementation

- `lib/context-firewall.js`
- `tests/context-firewall.test.js`
- `docs/CONTEXT_FIREWALL.md`

## Next

Connect forge sessions and agent handoffs to save large command outputs through the context firewall automatically.
