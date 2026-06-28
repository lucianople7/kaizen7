# KAIZEN7 Index

## Purpose

This file prevents KAIZEN7 work from drifting outside the canonical workspace and memory.

## Canonical Paths

### Codex Workspace

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7
```

Codex edits code, site files, local KAIZEN7 WebUI, connectors and project skills here.

### Canonical Obsidian Vault

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7\Obsidian
```

Obsidian is the source of truth for KAIZEN7, Flowmatik and THE FOCUX.

### Canonical Architecture Document

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7\Obsidian\Flowmatik\Arquitectura\KAIZEN7 Arquitectura Fundacional v2.md
```

## Codex Startup Rule

Codex always starts KAIZEN7 work from Obsidian. No exceptions.

For operational work, use the local agent loop before opening broad context:

```powershell
npm.cmd run k7:loop -- --compact "objective"
```

The loop returns the minimum memory paths, skills, Hunter candidates and next action to inspect.

Before answering with direction, changing files, designing architecture, touching product, content, ecommerce, claims, suppliers, skills or connectors, Codex must read the minimum relevant Obsidian context first.

Minimum startup read:

1. The canonical architecture document.
2. The shared operating protocol.
3. The active semaforo note.
4. The current KAIZEN7 daily note when it exists.
5. THE FOCUX notes if the change affects brand, content, ecommerce or compliance.

Every relevant movement must leave a trace in Obsidian: decision, context, changed files or assets, risks and next action.

## Agent Product Interface

The connectable KAIZEN7 interface is documented in:

```text
docs/KAIZEN7_AGENT_LOOP.md
```

Primary commands:

```powershell
npm.cmd run k7:connect -- --project "Codex" --kind agent "objective"
npm.cmd run k7:activate -- "objective"
npm.cmd run k7:onboard -- --preset codex "objective"
npm.cmd run k7:setup
npm.cmd run k7:run -- "objective"
npm.cmd run k7:run -- --compact "objective"
npm.cmd run k7:advise -- --compact --agent codex "objective"
npm.cmd run k7:loop -- "objective"
npm.cmd run k7:loop -- --compact "objective"
npm.cmd run k7:memory -- "query"
npm.cmd run k7:hunter
npm.cmd run k7:github -- "https://github.com/org/repo"
npm.cmd run k7:hf -- "https://huggingface.co/BAAI/bge-m3"
npm.cmd run k7:signal -- --type text --text "source notes"
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openrouter "objective"
npm.cmd run k7:ready
```

Primary local API:

```http
POST /api/k7/connect
POST /api/k7/activate
GET /api/k7/onboard
POST /api/k7/onboard
POST /api/k7/run
POST /api/k7/advise
GET /api/k7/models
POST /api/k7/models
```

Use `k7:connect` as the default handshake when a new coding tool, agent, API, CLI, MCP server or project wants to attach to KAIZEN7. It returns the profile, route, context pack, metaskills, tools, signals, action, verification gates and writeback policy.

Signal ingestion writes compact discovery packets to:

```text
data\signal-inbox.json
```

## Warning

Do not assume `C:\Users\lucia\Obsidian\Flowmatik` is the canonical vault unless Lucia explicitly changes it again.

Do not use external agent workspaces as operational memory. If it matters for KAIZEN7, bring it into Obsidian first.
