# KAIZEN7

KAIZEN7 is a local modular agent operating system for product growth, research, content, memory and tool evolution.

It is designed to be used by humans and by other agents. The core rule is practical:

```text
Every module must reduce steps, token use, repeated work, risk, or decision time.
```

## Core Loop

The production entry point is:

```powershell
npm.cmd run k7:run -- "your objective"
```

It returns one prioritized action, the minimum memory and skills to inspect, and the next commands.

Agent advisor entry point:

```powershell
npm.cmd run k7:advise -- --agent codex --budget 1200 --capability read_files --capability edit_files --capability run_tests "your objective"
```

It tells another agent what to read, which skills to load, what to avoid, and the first safe action.

For agent-to-agent use:

```powershell
npm.cmd run k7:run -- --compact "your objective"
npm.cmd run k7:run -- --json "your objective"
```

You can ingest market sources in the same run:

```powershell
npm.cmd run k7:run -- --github "https://github.com/org/repo" --hf "https://huggingface.co/BAAI/bge-m3" "improve this agent"
```

HTTP API:

```http
POST /api/k7/run
POST /api/k7/advise
```

## Documentation Map

Start here if you are opening the repository cold:

- `KAIZEN7_INDEX.md` - canonical paths, startup rule and agent interface.
- `docs/KAIZEN7_AGENT_LOOP.md` - command/API contract for agents.
- `docs/ARCHITECTURE.md` - modules, data flow and safety model.
- `docs/REPOSITORIES.md` - KAIZEN7 vs THE FOCUX repo split.
- `docs/OPERATIONS.md` - daily commands, checks, publishing and blockers.
- `docs/ADAPTERS_AND_PATTERNS.md` - Qwen, Alibaba, NotebookLM and other adapters/patterns.
- `docs/THE_FOCUX_PROJECT.md` - project boundary and current handoff.

The full internal operating manual lives in Obsidian:

```text
Obsidian/Flowmatik/Kaizen7/KAIZEN7 OPERATING MANUAL.md
```

Rule:

```text
KAIZEN7 = agent
THE FOCUX = project
```

Example body:

```json
{
  "goal": "improve this agent",
  "githubUrls": ["https://github.com/org/repo"],
  "huggingFaceUrls": ["https://huggingface.co/BAAI/bge-m3"],
  "compact": true
}
```

The lower-level loop remains available:

```powershell
npm.cmd run k7:loop -- "your objective"
```

It returns a compact operating brief:

- relevant memory
- recommended skills
- Hunter top candidates
- active blockers
- next action
- token policy

For agent-to-agent use:

```powershell
npm.cmd run k7:loop -- --compact "your objective"
```

For full JSON:

```powershell
npm.cmd run k7:loop -- --json "your objective"
```

To write the run into daily memory:

```powershell
npm.cmd run k7:loop -- --write-memory "your objective"
```

## Production Check

```powershell
npm.cmd run k7:ready
```

This checks whether the local KAIZEN7 agent core is operational.

Current readiness covers:

- Hunter
- GitHub Adapter
- Signal Ingestion
- Skill Router
- Semantic Memory
- Agent Loop
- Smart Crons
- Cron Doctor
- required data files
- required skills
- safe cron policy

## Main Commands

```powershell
npm.cmd run k7:loop -- "objective"
npm.cmd run k7:run -- "objective"
npm.cmd run k7:memory -- "query"
npm.cmd run k7:hunter
node lib/hunter.js signals
npm.cmd run k7:github -- "https://github.com/org/repo"
npm.cmd run k7:hf -- "https://huggingface.co/BAAI/bge-m3"
npm.cmd run k7:signal -- --type github --url "https://github.com/org/repo" --text "short source notes"
npm.cmd run k7:ready
npm.cmd run check
```

## Modules

### Agent Loop

File: `lib/agent-loop.js`

Composes the minimum context required for action:

```text
goal + semantic memory + blockers + skill router + Hunter top 3 + gates
```

### Agent Runner

File: `lib/agent-runner.js`

Production interface for agents and humans:

```text
objective + optional GitHub/HF URLs -> signal inbox -> memory -> skills -> Hunter queue -> one action
```

Use this when another agent needs to connect to KAIZEN7 without knowing the internal command stack.

The same runner is exposed locally at `POST /api/k7/run`.

### Agent Advisor

File: `lib/agent-advisor.js`

Advisor interface for external agents:

```text
agent + objective + capabilities + context budget -> read list + skills + avoids + first action
```

Use this when Codex, Hermes, Mastra, OpenClaw or another agent should improve its own execution before acting.

The advisor is exposed locally at `POST /api/k7/advise`.

### Semantic Memory

File: `lib/semantic-memory.js`

Builds and reuses `data/semantic-memory.json`, a compact local memory index over Markdown notes.

It detects freshness using file size and modification time.

### Skill Router

File: `lib/skill-router.js`

Indexes local skill metadata and recommends only the skills needed for a task. It avoids loading full `SKILL.md` bodies until a skill is actually selected.

### Hunter

File: `lib/hunter.js`

Turns `data/hunter-registry.json` into an implementation queue, roadmap and search queries for GitHub and Hugging Face.

It also reads `data/signal-inbox.json` when building the execution queue:

```powershell
node lib/hunter.js signals
node lib/hunter.js queue
```

Only high-confidence, non-blocked signals enter the implementation queue.

### GitHub Adapter

File: `lib/github-adapter.js`

Turns a GitHub repository URL into a Signal Ingestion packet using repository metadata, license, activity, topics, releases and README excerpt.

```powershell
npm.cmd run k7:github -- "https://github.com/browser-use/browser-use"
npm.cmd run k7:github -- "https://github.com/browser-use/browser-use" --write
```

It scores the repo for KAIZEN7 using practical criteria:

```text
license safety + adoption + recent activity + ecosystem + clear positioning
```

### Hugging Face Adapter

File: `lib/huggingface-adapter.js`

Turns a Hugging Face model, dataset or Space URL into a Signal Ingestion packet.

```powershell
npm.cmd run k7:hf -- "https://huggingface.co/BAAI/bge-m3"
npm.cmd run k7:hf -- "https://huggingface.co/datasets/HuggingFaceFW/fineweb" --write
npm.cmd run k7:hf -- "https://huggingface.co/spaces/gradio/hello_world" --write
```

It scores assets for KAIZEN7 using:

```text
license safety + downloads + likes + recent activity + tags + capability metadata
```

### Signal Ingestion

File: `lib/signal-ingestion.js`

Turns GitHub, Hugging Face, web, ecommerce, supplier, OCR or plain text input into compact signal packets:

```text
source -> clean markdown -> signals -> confidence -> destination -> next action
```

Use `--write` to append packets to `data/signal-inbox.json`.

### Smart Crons

File: `lib/smart-crons.js`

Runs safe propose-only internal checks, including `hunter-daily`.

### Production Readiness

File: `lib/production-readiness.js`

Verifies the agent core before use.

## Safety Model

KAIZEN7 defaults to proposal mode.

It does not publish, spend, delete, push, or touch credentials without explicit human approval.

External actions are gated by:

- memory first
- metadata before deep read
- Hunter top 3 only
- judge before external action
- write memory before close

## Current Next Step

The next production step is `Signal Ingestion Adapters v1`:

```text
GitHub/Hugging Face/web/OCR adapters -> signal packet -> Hunter queue / Signal Bowl
```

Target candidates: Crawl4AI, OCR.

Each adapter must stay optional until it proves lower friction or better decisions.
