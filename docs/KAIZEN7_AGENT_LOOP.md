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

External discoveries enter through Signal Ingestion and can be written to `data/signal-inbox.json`.

## Gates

```text
memory_first
metadata_before_deep_read
hunter_top3_only
judge_before_external_action
write_memory_before_close
```

## Integration Pattern

External agent:

1. Calls `POST /api/k7/advise` before acting.
2. Reads only returned memory and selected skills.
3. Calls `POST /api/k7/run` when it needs an operational decision.
4. Executes only the returned `action`.
5. Writes a compatible memory entry before close.
