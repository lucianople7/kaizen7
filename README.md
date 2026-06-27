# KAIZEN7

KAIZEN7 is a local modular agent operating system for product growth, research, content, memory and tool evolution.

It is designed to be used by humans and by other agents. The core rule is practical:

```text
Every module must reduce steps, token use, repeated work, risk, or decision time.
```

Super effective rule:

```text
If it does not reduce friction or improve verifiable judgment, it does not enter.
```

## Core Loop

Fresh local setup:

```powershell
npm.cmd install
npm.cmd run k7:init
npm.cmd run k7:ready
```

Supertool entry point:

```powershell
npm.cmd run k7:connect -- --project "Codex" --kind agent "your objective"
npm.cmd run k7:super -- "your objective"
npm.cmd run k7:brain -- "your objective"
```

`k7:connect` is the universal handshake for Codex, coding tools, APIs, CLIs, MCP servers and external agents. It returns project profile, route, context pack, metaskills, tools, frontier signals, action, verification, approval gates and writeback policy.

`k7:super` routes the objective to Codex, Frontier, Hunter, Adapter Registry or Memory and returns the context, skills, tools, action, verification and commands.

`k7:brain` wraps Supertool as a second brain: memory, metaskills, orchestration, verification and a safe memory writeback draft.

The shortest production entry point is:

```powershell
npm.cmd run k7 -- "your objective"
```

It returns one prioritized action, the minimum memory and skills to inspect, and the next commands.

Full runner alias:

```powershell
npm.cmd run k7:run -- "your objective"
```

Agent booster shortcut:

```powershell
npm.cmd run k7:boost -- "your objective"
```

Full agent advisor entry point:

```powershell
npm.cmd run k7:advise -- --agent codex --budget 1200 --capability read_files --capability edit_files --capability run_tests "your objective"
```

It tells another agent what to read, which skills to load, what to avoid, and the first safe action.

Codex bridge:

```powershell
npm.cmd run k7:codex -- "your objective"
npm.cmd run k7:codex -- --frontier --write-signals "choose today's frontier improvement"
npm.cmd run k7:real -- "make KAIZEN7 real with Codex"
```

It packages KAIZEN7's advice for Codex specifically: minimal read list, selected skills, avoid list, first action, verification commands and optional frontier priority.

`k7:real` lets Codex test KAIZEN7 as a product: bridge, readiness, frontier operator and full suite must pass before it returns `real`.

Universal adapter planner:

```powershell
npm.cmd run k7:adapt -- --name "External Coding Agent" --kind agent --capability run_tests "improve this system through KAIZEN7"
```

It tells any API, CLI, MCP server, SDK or external agent how to connect to KAIZEN7 as a supervised system improver without becoming part of the core.

Daily frontier intake:

```powershell
npm.cmd run k7:frontier
npm.cmd run k7:frontier -- --write-signals
npm.cmd run k7:frontier:brief -- --write-signals
```

It turns frontier APIs, MCPs, code tools and agent systems into compact sourceable signal packets. `--write-signals` inserts the daily packets into `data/signal-inbox.json` with same-day deduplication.

`k7:frontier:brief` is the productive daily view: it writes optional signals, asks Hunter for the top frontier candidate, and returns the adapter plan needed to work on it safely.

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
POST /api/k7/connect
POST /api/k7/super
POST /api/k7/brain
POST /api/k7/run
POST /api/k7/advise
GET /api/k7/codex
POST /api/k7/codex
POST /api/k7/realize
GET /api/k7/adapters
POST /api/k7/adapters/plan
GET /api/k7/frontier
POST /api/k7/frontier
```

## Documentation Map

Start here if you are opening the repository cold:

- `KAIZEN7_INDEX.md` - canonical paths, startup rule and agent interface.
- `docs/KAIZEN7_AGENT_LOOP.md` - command/API contract for agents.
- `docs/CONNECTOR_KERNEL.md` - universal handshake for Codex, APIs, CLIs, MCP servers and external agents.
- `docs/SUPERTOOL.md` - single orchestration entrypoint for Codex and external tools.
- `docs/SECOND_BRAIN.md` - second brain and metaskill layer.
- `docs/PRODUCT.md` - product definition, positioning, modules and first sellable package.
- `docs/AI_BOOSTER.md` - AI-for-AI booster layer for Codex and other agents.
- `docs/CODEX_BRIDGE.md` - direct Codex pre-flight bridge.
- `docs/LESS_STEPS_LESS_TOKENS.md` - short daily operating mode and token policy.
- `docs/OPENAI_ACCEPTANCE_PATH.md` - realistic OpenAI Apps SDK submission path.
- `docs/OPENAI_AGENT_ADAPTER.md` - optional OpenAI Agents SDK runtime adapter.
- `docs/UNIVERSAL_ADAPTERS.md` - adapter contract for APIs, CLIs, MCP servers, SDKs and external agents.
- `docs/FRONTIER_WATCH.md` - daily intake of frontier API, MCP, code tool and agent signals.
- `docs/PRODUCTION_READY.md` - roadmap from local production readiness to hosted beta.
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

## Repository Hygiene

`data/` is split into two groups:

- Versioned manifests: `frontier-watch.json`, `hunter-registry.json`, `market-watch.json`, `smart-crons.json`, `thefocux-signal-radar.json`.
- Local runtime state: memory, evaluations, workspace, runs, genome, semantic index and signal inbox.

Runtime state is ignored by git and recreated on demand. This keeps commits focused on product behavior instead of local execution history.

Initialize or restore local runtime files with:

```powershell
npm.cmd run k7:init
```

## Main Commands

```powershell
npm.cmd run k7:init
npm.cmd run k7:loop -- "objective"
npm.cmd run k7:connect -- --project "tool or agent" --kind agent "objective"
npm.cmd run k7:super -- "objective"
npm.cmd run k7:brain -- "objective"
npm.cmd run k7 -- "objective"
npm.cmd run k7:boost -- "objective"
npm.cmd run k7:codex -- "objective"
npm.cmd run k7:real -- "objective"
npm.cmd run k7:adapt -- --name "tool or agent" --kind agent "objective"
npm.cmd run k7:openai -- "objective"
npm.cmd run k7:run -- "objective"
npm.cmd run k7:memory -- "query"
npm.cmd run k7:hunter
npm.cmd run k7:market
npm.cmd run k7:frontier
npm.cmd run k7:frontier -- --write-signals
npm.cmd run k7:frontier:brief -- --write-signals
node lib/hunter.js signals
npm.cmd run k7:github -- "https://github.com/org/repo"
npm.cmd run k7:hf -- "https://huggingface.co/BAAI/bge-m3"
npm.cmd run k7:signal -- --type github --url "https://github.com/org/repo" --text "short source notes"
npm.cmd run k7:ready
npm.cmd run k7:check
npm.cmd run check
```

## Modules

### Supertool Orchestrator

File: `lib/supertool-orchestrator.js`

Single orchestration entrypoint:

```text
objective -> intent -> route -> context + skills + tools + action + verification
```

Use it when Codex, a coding tool, MCP server, API, CLI or external agent needs KAIZEN7 to decide what should happen next.

The supertool is exposed locally at `POST /api/k7/super`.

### Connector Kernel

File: `lib/connector-kernel.js`

Universal handshake for projects, coding tools, APIs, CLIs, MCP servers and agents:

```text
project -> profile -> route -> context pack + metaskills + tools + signals + action + verification + writeback policy
```

Use it when an external system wants KAIZEN7 to understand the project and activate the right metaskills without loading all internal memory.

The connector kernel is exposed locally at `POST /api/k7/connect`.

### Second Brain

File: `lib/second-brain.js`

Operational memory and metaskill layer:

```text
objective -> Supertool -> memory + metaskills + orchestration + verification + writeback draft
```

Use it when Codex or another agent needs KAIZEN7 as a second brain instead of a single command router.

The second brain is exposed locally at `GET /api/k7/brain` and `POST /api/k7/brain`.

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

### Codex Bridge

File: `lib/codex-bridge.js`

Codex-specific pre-flight contract:

```text
objective -> read list + skills + avoid list + first action + verification
```

Use it before Codex edits files, installs packages, connects tools or writes memory.

The bridge is exposed locally at `GET /api/k7/codex` and `POST /api/k7/codex`.

### Codex Realizer

File: `lib/codex-realizer.js`

Verification loop for making KAIZEN7 real:

```text
Codex Bridge -> Production Readiness -> Frontier Operator -> Tests -> real/blocked
```

The realizer is exposed locally at `POST /api/k7/realize`.

### Adapter Registry

File: `lib/adapter-registry.js`

Universal connection contract for external systems:

```text
API/CLI/MCP/SDK/agent/webhook -> plan -> advice/run -> verification -> approved action -> memory
```

Use it when any tool wants to connect to KAIZEN7 as a system improver without adding a permanent dependency to the core.

The planner is exposed locally at `GET /api/k7/adapters` and `POST /api/k7/adapters/plan`.

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

Runs safe propose-only internal checks, including `hunter-daily`, `market-watch` and `frontier-watch`.

`frontier-watch` reads `data/frontier-watch.json` and turns the most relevant daily frontier targets into compact packets for `data/signal-inbox.json`. It does not browse, install, deploy, spend or touch credentials by itself.

`frontier-operator` turns that inbox into one daily productive action:

```text
frontier packets -> Hunter queue -> top candidate -> adapter plan -> verification gates
```

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
