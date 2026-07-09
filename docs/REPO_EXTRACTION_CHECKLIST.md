# Repo Extraction Checklist

Use this when moving project material out of the KAIZEN7 repo.

## Rule

```text
KAIZEN7 keeps the contract.
The project repo keeps the implementation.
```

## Before Moving

1. Name the target project repo.
2. Identify the smallest folder or file group to extract.
3. Decide what KAIZEN7 still needs to remember.
4. Convert project-specific logic into a contract, receipt or route note.
5. Check that no credentials, secrets, local runtime files or rendered assets are moved.

## KAIZEN7 Keeps

- route name,
- input contract,
- output contract,
- verification rule,
- memory recommendation,
- link or path to the external repo,
- known risks.

## External Project Repo Keeps

- product code,
- public web assets,
- brand copy,
- video templates,
- render assets,
- project IP,
- channel content,
- deployment configuration.

## Extraction Receipt

```yaml
project:
source_in_kaizen7:
target_repo:
kaizen7_contract_kept:
files_moved:
files_left_as_contract:
tests_or_checks:
risks:
next_action:
```

## Do Not

- move secrets,
- publish externally without approval,
- delete KAIZEN7 history to hide old project material,
- keep growing project implementation inside this repo,
- turn a project extraction into a KAIZEN7 architecture rewrite.
