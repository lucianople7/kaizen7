# KAIZEN7 Agent Loop

This document describes KAIZEN7 as a connectable agent product.

## Goal

Provide a small, reliable interface any human, agent, script or external system can call to improve work with less context and less friction.

The loop answers:

```text
Given this objective, what should KAIZEN7 read, use, improve and do next?
```

## Command

Production command:

```powershell
npm.cmd run k7:run -- "objective"
```

Agent JSON:

```powershell
npm.cmd run k7:run -- --compact "objective"
npm.cmd run k7:run -- --json "objective"
```

Optional source ingestion:

```powershell
npm.cmd run k7:run -- --github "https://github.com/org/repo" --hf "https://huggingface.co/BAAI/bge-m3" "objective"
```

HTTP API:

```http
POST /api/k7/run
POST /api/k7/advise
```

Request:

```json
{
  "goal": "objective",
  "githubUrls": ["https://github.com/org/repo"],
  "huggingFaceUrls": ["https://huggingface.co/BAAI/bge-m3"],
  "compact": true
}
```

Compact response:

```json
{
  "status": "ready",
  "goal": "objective",
  "action": {},
  "signals": [],
  "skills": [],
  "memory": [],
  "commands": []
}
```

Agent Advisor request:

```json
{
  "agent": "codex",
  "goal": "fix failing tests and improve routing",
  "capabilities": ["read_files", "edit_files", "run_tests"],
  "contextBudget": 1200,
  "riskTolerance": "low",
  "compact": true
}
```

Advisor response:

```json
{
  "status": "ready",
  "agent": "codex",
  "goal": "fix failing tests and improve routing",
  "advice": {
    "read": [],
    "skills": [],
    "avoid": [],
    "action": "string",
    "tokenPolicy": "string",
    "commands": []
  }
}
```

Lower-level loop:

```powershell
npm.cmd run k7:loop -- "objective"
```

## Modes

### Human Brief

```powershell
npm.cmd run k7:loop -- "mejorar sistema modular para agentes"
```

Returns Markdown:

- Memory
- Skills
- Hunter
- Blockers
- Next Action
- Token Policy

### Compact Agent JSON

```powershell
npm.cmd run k7:loop -- --compact "mejorar sistema modular para agentes"
```

Contract:

```json
{
  "date": "YYYY-MM-DD",
  "goal": "string",
  "memory": ["path"],
  "skills": ["skill-name"],
  "hunter": ["module:candidate"],
  "next": "string"
}
```

This is the preferred mode for other agents.

### Full JSON

```powershell
npm.cmd run k7:loop -- --json "objective"
```

Use this when an integration needs scores, snippets, gates, blockers or source metadata.

### Memory Write

```powershell
npm.cmd run k7:loop -- --write-memory "objective"
```

Appends the run to:

```text
Obsidian/Flowmatik/Kaizen7/YYYY-MM-DD.md
```

## Data Flow

```text
objective
  -> semantic memory search
  -> contextQuery
  -> skill routing
  -> Hunter top 3
  -> gates
  -> nextAction
```

External discoveries enter through Signal Ingestion:

```powershell
npm.cmd run k7:signal -- --type github --url "https://github.com/org/repo" --text "source notes"
```

GitHub repositories can be ingested directly:

```powershell
npm.cmd run k7:github -- "https://github.com/org/repo"
npm.cmd run k7:github -- "https://github.com/org/repo" --write
```

Hugging Face assets can be ingested directly:

```powershell
npm.cmd run k7:hf -- "https://huggingface.co/BAAI/bge-m3"
npm.cmd run k7:hf -- "https://huggingface.co/datasets/HuggingFaceFW/fineweb" --write
npm.cmd run k7:hf -- "https://huggingface.co/spaces/gradio/hello_world" --write
```

With `--write`, the packet is appended to:

```text
data/signal-inbox.json
```

Hunter consumes that inbox when ranking execution:

```powershell
node lib/hunter.js signals
node lib/hunter.js queue
```

Blocked, low-confidence or license-risk signals stay out of implementation.

## Token Policy

```text
metadata first;
deep-read only selected skills, top Hunter candidates and cited memory files
```

## Gates

```text
memory_first
metadata_before_deep_read
hunter_top3_only
judge_before_external_action
write_memory_before_close
```

## Practical Usage

Before any significant task:

```powershell
npm.cmd run k7:loop -- --compact "task objective"
```

Then read only:

1. memory paths returned by the loop
2. selected skill files
3. selected Hunter candidates

Do not browse the entire vault or load all skills unless the loop fails to find usable context.

## Integration Pattern

External agent:

1. Calls `k7:advise -- --compact` or `POST /api/k7/advise` before acting.
2. Reads only returned memory and selected skills.
3. Calls `k7:run -- --compact` or `POST /api/k7/run` when it needs an operational decision.
4. Executes only the returned `action`.
5. Calls `k7:loop -- --write-memory` or writes a compatible memory entry.

## Current Module Stack

- `lib/agent-runner.js`
- `lib/agent-advisor.js`
- `lib/agent-loop.js`
- `lib/semantic-memory.js`
- `lib/skill-router.js`
- `lib/hunter.js`
- `lib/github-adapter.js`
- `lib/huggingface-adapter.js`
- `lib/signal-ingestion.js`
- `lib/smart-crons.js`
- `lib/production-readiness.js`

## Next Product Step

Build the next `Signal Ingestion Adapter`.

Purpose:

```text
Turn external web, OCR and ecommerce sources into verified, compact research packets.
```

Minimum contract:

```json
{
  "source": {
    "type": "github|huggingface|web|paper|ocr|ecommerce|supplier|text",
    "url": "string",
    "domain": "string",
    "fetchedAt": "ISO datetime"
  },
  "content": {
    "title": "string",
    "markdown": "string",
    "summary": "string"
  },
  "signals": {
    "claims": [],
    "entities": [],
    "prices": [],
    "ingredients": [],
    "tools": [],
    "risks": []
  },
  "confidence": "low|medium|high",
  "destination": "signal_bowl|research|task|decision|spec|discard",
  "nextAction": "string"
}
```
