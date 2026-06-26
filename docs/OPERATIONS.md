# KAIZEN7 Operations

## Start A Session

Read first:

```text
Obsidian/Flowmatik/Kaizen7/README - ARRANCAR AQUI.md
Obsidian/Flowmatik/Kaizen7/KAIZEN7 OPERATING MANUAL.md
KAIZEN7_INDEX.md
```

If the task affects THE FOCUX, also read:

```text
Obsidian/TheFocux/THE FOCUX Bible.md
Obsidian/TheFocux/CodexBrain/Decision Ledger.md
```

## Primary Commands

```powershell
npm.cmd run k7:run -- "objective"
npm.cmd run k7:run -- --compact "objective"
npm.cmd run k7:advise -- --agent codex --budget 1200 --capability read_files --capability edit_files --capability run_tests "objective"
npm.cmd run k7:loop -- --compact "objective"
npm.cmd run k7:ready
npm.cmd run check
```

## Source Ingestion

```powershell
npm.cmd run k7:github -- "https://github.com/org/repo" --write
npm.cmd run k7:hf -- "https://huggingface.co/BAAI/bge-m3" --write
npm.cmd run k7:signal -- --type text --text "source notes"
```

Signals go to:

```text
data/signal-inbox.json
```

## Verification

Full verification:

```powershell
npm.cmd run check
```

THE FOCUX verification:

```powershell
cd C:\Users\lucia\OneDrive\Documentos\thefocux
npm.cmd run check
```

## Known Local Blockers

- Codex may be unable to commit KAIZEN7 locally because Windows ACL denies `.git/index.lock`.
- Git HTTPS may fail with `SEC_E_NO_CREDENTIALS` until GitHub auth is fixed in Windows.
- `Lucianople7/thefocux` must exist or be exposed before pushing THE FOCUX.

## Publishing Order

1. Verify KAIZEN7.
2. Publish KAIZEN7 without `site/thefocux/`.
3. Verify THE FOCUX from `C:\Users\lucia\OneDrive\Documentos\thefocux`.
4. Push THE FOCUX to its own repo.
5. Connect Cloudflare Pages to THE FOCUX.
