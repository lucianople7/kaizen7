# KAIZEN7 Capability Excellence

## Purpose

KAIZEN7 should not win by having more capabilities.

It should win by having clearer, safer and more reusable capabilities.

## Quality Gates

Each capability is evaluated against:

- clear purpose,
- stable input/output contract,
- concrete verification gates,
- safety boundary,
- dependency clarity,
- tool portability,
- memory policy,
- routing keywords,
- Kernel alignment.

## CLI

JSON:

```powershell
node lib/capabilities/cli.js --quality
```

Markdown:

```powershell
node lib/capabilities/cli.js --quality --markdown
```

## Grades

`world_class` means the capability is clear, bounded, verifiable and reusable.

`strong` means it is good enough to use but can be tightened.

`usable` means it works but needs sharper contracts or verification.

`needs_work` means it should not be trusted as a core capability yet.

## Rule

Improve the lowest scoring capabilities first.

Do not add new capabilities until the existing ones are clear enough to route, brief, execute and close with receipts.
