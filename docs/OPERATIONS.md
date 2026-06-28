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
npm.cmd run k7:activate -- "objective"
npm.cmd run k7:run -- --compact "objective"
npm.cmd run k7:advise -- --agent codex --budget 1200 --capability read_files --capability edit_files --capability run_tests "objective"
npm.cmd run k7:loop -- --compact "objective"
npm.cmd run k7:ready
npm.cmd run check
npm.cmd run k7:market
npm.cmd run k7:models -- --list
```

## Model Gateway

```powershell
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openai "objective"
npm.cmd run k7:models -- --provider anthropic "objective"
npm.cmd run k7:models -- --provider google "objective"
npm.cmd run k7:models -- --provider openrouter "objective"
npm.cmd run k7:models -- --provider ollama "objective"
```

Rule:

```text
Model Gateway != KAIZEN7 core
```

Use the best available model for the job. Missing provider keys do not block the local KAIZEN7 core.

## Daily Market Watch

```powershell
npm.cmd run k7:market
```

Tracks adjacent agent frameworks and AI workflow platforms:

- OpenAI Agents SDK
- LangGraph
- Relevance AI
- Lindy
- Gumloop
- Dust
- GitHub agent repositories
- Hugging Face agent assets

Rule:

```text
Adapt patterns before adopting tools.
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

Production readiness:

```powershell
npm.cmd run k7:ready
```

Production plan:

```text
docs/PRODUCTION_READY.md
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
2. Run `npm.cmd run k7:ready`.
3. Publish KAIZEN7 without `site/thefocux/`.
4. Verify THE FOCUX from `C:\Users\lucia\OneDrive\Documentos\thefocux`.
5. Push THE FOCUX to its own repo.
6. Connect Cloudflare Pages to THE FOCUX.

## Production Ready Sequence

```text
Local Production Ready -> Agent/API Ready -> WebUI Cockpit -> MCP -> Hosted Beta
```

Do not jump straight to SaaS. First make KAIZEN7 an excellent private operating brain.
