# KAIZEN7

KAIZEN7 is a Universal Capability Forge for agentic work.

It converts real needs into executable, verifiable and reusable capability paths:

```text
need -> capability -> provider or pattern -> adapter or minimal build -> execution packet -> evidence -> memory
```

KAIZEN7 prefers free, open-source, CPU-first and local-first paths. It can use tools such as Pinokio, Stability Matrix, ComfyUI, FFmpeg, Remotion, local transcribers, Ollama, SearXNG, MCPs and future providers, but those tools are replaceable. The center is the capability forge.

KAIZEN7 is also a goal-to-execution layer for projects, coding assistants and agents.

It turns one objective into the shortest verified path to action:

```text
Objective -> Minimal Context -> Memory -> Toolchain -> Execution -> Verification -> Learning
```

KAIZEN7 is not a megatool, a chatbot, a generic task manager or a giant context dump.

It asks what you want, reads only what matters, connects the right tools, delegates when useful, verifies evidence and writes back only reusable learning.

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
npm.cmd run k7:setup
npm.cmd run k7:state
npm.cmd run k7:ready
```

`k7:state` is Rule #0 for all agents: read the current root, branch, commit, readiness, blockers, warnings, scripts, modules and APIs before critique or action. `k7:setup` reports the first-run state: local runtime files, OpenAI, GitHub, Hugging Face, MCP and readiness. `local-only` mode is valid and works without API keys.

Fastest proof:

```powershell
npm.cmd run k7:anything -- "your objective"
npm.cmd run k7:cockpit
npm.cmd run k7:cockpit -- --context "repo local" --capability run_tests "your objective"
```

`k7:anything` is the CLI kernel entrypoint. With only an objective it returns the smallest executable surface, usually a run card. With evidence it can close the run, produce mutual learning and prepare the memory plane.

`k7:cockpit` is the shortest entrypoint. It starts with the objective, asks only for missing context, selects the minimum toolchain, returns one next action, verification and memory rule.

Classic activation proof:

```powershell
npm.cmd run k7:activate -- "your objective"
```

`k7:activate` is the 30 second activation layer: before friction, after friction, minimum context, next best action, verification and memory rule.

One-command onboarding:

```powershell
npm.cmd run k7:onboard -- --list
npm.cmd run k7:onboard -- --preset codex "mejorar KAIZEN7 con tests"
npm.cmd run k7:onboard -- --preset social "crear contenido para redes"
```

Presets: `codex`, `flowmatik`, `defocus`, `social`, `commerce`, `research`, `memory`.

Supertool entry point:

```powershell
npm.cmd run k7:connect -- --project "Codex" --kind agent "your objective"
npm.cmd run k7:bridge -- --project "KAIZEN7" "brain vision arms objective"
npm.cmd run k7:strength -- --project "KAIZEN7" "weakness to convert"
npm.cmd run k7:evolve
npm.cmd run k7:tickets
npm.cmd run k7:next
npm.cmd run k7:self-test
npm.cmd run k7:onboard -- --preset codex "your objective"
npm.cmd run k7:improve -- "mejorar KAIZEN7 usando KAIZEN7"
npm.cmd run k7:super -- "your objective"
npm.cmd run k7:brain -- "your objective"
```

`k7:connect` is the universal handshake for Codex, coding tools, APIs, CLIs, MCP servers and external agents. It returns project profile, route, context pack, metaskills, connector recommendations, discovery queries, frontier signals, action, verification, approval gates and writeback policy.

`k7:improve` uses KAIZEN7 on KAIZEN7: Connector Kernel, Frontier, Codex Realizer and market-pattern signals produce one supervised self-improvement loop.

`k7:strength` turns one concrete weakness into a red test, minimal patch plan, verification commands and Obsidian memory writeback.

`k7:evolve` triages daily signal packets into `strength`, `entra`, `memory`, `espera` or `fuera`.

`k7:tickets` turns those signal packets into governed work tickets with owner, priority, budget, approval, stop condition and evidence.

`k7:next` is the one-command loop for Hermes, Codex or any agent: state, tickets, compact loop and one safe next action.

`k7:self-test` runs the KAIZEN7 next-action loop repeatedly and measures consensus, drift and the difference between stability and real learning.

`k7:super` routes the objective to Codex, Frontier, Hunter, Adapter Registry or Memory and returns the context, skills, tools, action, verification and commands.

`k7:brain` wraps Supertool as a second brain: memory, metaskills, orchestration, verification and a safe memory writeback draft.

Metaskill fitness ledger:

```powershell
npm.cmd run k7:metaskills
```

It summarizes which operating disciplines have worked best by objective type and feeds future metaskill activation.

Project focus:

```powershell
npm.cmd run k7:focus
npm.cmd run k7:focus -- --write --project "Online Watch Store" --phase validation "crear una tienda online de relojes rentable"
```

It keeps KAIZEN7 aligned to one living project objective, filters distractions and requires evidence for progress.

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
npm.cmd run k7:claude-flow -- "evaluate Claude Flow as bounded worker"
npm.cmd run k7:hermes -- "evaluate Hermes as KAIZEN7 companion"
npm.cmd run k7:jcode -- "evaluate jcode as KAIZEN7 harness candidate"
npm.cmd run k7:operating -- "build K7 Operating Layer"
npm.cmd run k7:mission -- "build a bounded mission packet"
npm.cmd run k7:harness -- "route objective to the safest executor"
npm.cmd run k7:headroom -- "evaluate Headroom as KAIZEN7 context compression"
npm.cmd run k7:context -- "build K7 Context Layer"
npm.cmd run k7:paperclip -- "evaluate Paperclip as KAIZEN7 control plane"
npm.cmd run k7:control -- "build K7 Control Plane"
```

It tells any API, CLI, MCP server, SDK or external agent how to connect to KAIZEN7 as a supervised system improver without becoming part of the core.

`k7:claude-flow` packages Claude Flow as a candidate multi-agent worker. KAIZEN7 keeps authority; Claude Flow must prove fewer steps or clearer decomposition before adoption.

`k7:hermes` packages Hermes Agent as a candidate intimate companion. Hermes critiques and challenges KAIZEN7 plans, but cannot execute or install until source/license/value are verified.

`k7:jcode` packages jcode as a candidate harness layer. KAIZEN7 absorbs useful patterns like sessions, memory, providers, browser and swarm without making jcode the core.

`k7:operating` defines the modular K7 Operating Layer: KAIZEN7 core, memory, harness, adapters, eval and daily evolution.

`k7:mission` and `k7:harness` turn a goal into a bounded mission packet and route it to the safest executor: Codex, Qwen Code, Aider, jcode, browser or manual approval.

`k7:headroom` packages Headroom as a candidate reversible context compression adapter. It can reduce noisy context only when originals remain retrievable and quality is measured.

`k7:context` defines KAIZEN7's own context layer: classify, compress, retrieve, verify and learn.

`k7:paperclip` packages Paperclip as a candidate agent-company control plane. KAIZEN7 absorbs org charts, tickets, heartbeats, budgets and audit without giving up authority.

`k7:control` defines KAIZEN7's own control plane: goal, role, ticket, budget, heartbeat, approval, audit and learning.

Model gateway:

```powershell
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openai "your objective"
npm.cmd run k7:models -- --provider anthropic "your objective"
npm.cmd run k7:models -- --provider google "your objective"
npm.cmd run k7:models -- --provider openrouter "your objective"
npm.cmd run k7:models -- --provider ollama "your objective"
```

`k7:models` keeps KAIZEN7 open to top hosted, aggregated and local models. Providers are optional runtime companions; the KAIZEN7 core does not depend on any single vendor.

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
POST /api/k7/bridge
GET /api/k7/onboard
POST /api/k7/onboard
POST /api/k7/improve
POST /api/k7/super
POST /api/k7/brain
POST /api/k7/run
POST /api/k7/advise
GET /api/k7/codex
POST /api/k7/codex
POST /api/k7/realize
GET /api/k7/models
POST /api/k7/models
GET /api/k7/adapters
POST /api/k7/adapters/plan
GET /api/k7/frontier
POST /api/k7/frontier
```

## Documentation Map

Start here if you are opening the repository cold:

- `KAIZEN7_INDEX.md` - canonical paths, startup rule and agent interface.
- `docs/KAIZEN7_AGENT_LOOP.md` - command/API contract for agents.
- `docs/GOAL_TO_EXECUTION_LAYER.md` - product thesis: objective to verified action for projects, editors and agents.
- `docs/ACTIVATION_COCKPIT.md` - shortest conversational entrypoint.
- `docs/TOOLCHAIN_ROUTER.md` - minimum toolchain selection and eval firewall.
- `docs/K7_HARNESS_ROUTER.md` - mission packet, executor routing and dry-run action plan.
- `docs/30_SECOND_ACTIVATION.md` - first product proof: objective to verified next action in 30 seconds.
- `docs/CONNECTOR_KERNEL.md` - universal handshake for Codex, APIs, CLIs, MCP servers and external agents.
- `docs/PROMPT_FILTER.md` - prompt analysis, simplification and magnification before execution.
- `docs/WISDOM_FILTER.md` - judgment layer for risks, skills, connections and approval gates.
- `docs/ROAD_TO_TOP.md` - strategic path: Prompt-to-Action Filter above agents, runtimes and connectors.
- `docs/BODY_BRIDGE.md` - cerebro, vision and brazos bridge for supervised sensing and action.
- `docs/SUPERTOOL.md` - single orchestration entrypoint for Codex and external tools.
- `docs/SECOND_BRAIN.md` - second brain and metaskill layer.
- `docs/PRODUCT.md` - product definition, positioning, modules and first sellable package.
- `docs/AI_BOOSTER.md` - AI-for-AI booster layer for Codex and other agents.
- `docs/CODEX_BRIDGE.md` - direct Codex pre-flight bridge.
- `docs/LESS_STEPS_LESS_TOKENS.md` - short daily operating mode and token policy.
- `docs/OPENAI_ACCEPTANCE_PATH.md` - realistic OpenAI Apps SDK submission path.
- `docs/OPENAI_AGENT_ADAPTER.md` - optional OpenAI Agents SDK runtime adapter.
- `docs/MODEL_GATEWAY.md` - provider-agnostic model gateway for OpenAI, Anthropic, Google, OpenRouter, local and compatible APIs.
- `docs/UNIVERSAL_ADAPTERS.md` - adapter contract for APIs, CLIs, MCP servers, SDKs and external agents.
- `docs/CLAUDE_FLOW_ADAPTER.md` - candidate Claude Flow worker adapter with source/license/value gates.
- `docs/HERMES_AGENT_ADAPTER.md` - candidate Hermes companion adapter with install blocked until source verification.
- `docs/JCODE_ADAPTER.md` - candidate jcode harness adapter with self-dev/install gates.
- `docs/K7_OPERATING_LAYER.md` - KAIZEN7-owned modular operating layer for tools, sessions, adapters and verification.
- `docs/HEADROOM_ADAPTER.md` - candidate Headroom adapter for local-first reversible context compression.
- `docs/K7_CONTEXT_LAYER.md` - KAIZEN7-owned context compression rules and proof contract.
- `docs/PAPERCLIP_ADAPTER.md` - candidate Paperclip adapter for governed teams of agents.
- `docs/K7_CONTROL_PLANE.md` - KAIZEN7-owned agent control plane contract.
- `docs/K7_STATE.md` - single source of truth and Rule #0 for all agents.
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
npm.cmd run k7:setup
npm.cmd run k7:activate -- "objective"
npm.cmd run k7:loop -- "objective"
npm.cmd run k7:onboard -- --preset codex "objective"
npm.cmd run k7:connect -- --project "tool or agent" --kind agent "objective"
npm.cmd run k7:connect -- --project "Codex" --kind agent --capability run_tests "buscar repos GitHub Hugging Face Gradio Ponytail para ahorrar pasos"
npm.cmd run k7:improve -- "mejorar KAIZEN7 usando señales actuales"
npm.cmd run k7:super -- "objective"
npm.cmd run k7:brain -- "objective"
npm.cmd run k7 -- "objective"
npm.cmd run k7:boost -- "objective"
npm.cmd run k7:codex -- "objective"
npm.cmd run k7:real -- "objective"
npm.cmd run k7:adapt -- --name "tool or agent" --kind agent "objective"
npm.cmd run k7:openai -- "objective"
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openrouter "objective"
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
project -> profile -> route -> context pack + metaskills + connectors + discovery + action + verification + writeback policy
```

Use it when an external system wants KAIZEN7 to understand the project and activate the right metaskills without loading all internal memory.

The connector kernel is exposed locally at `POST /api/k7/connect`.

### Onboarding

File: `lib/onboarding.js`

Preset-based entry point for humans and agents:

```text
preset + objective -> Connector Kernel profile + metaskills + connectors + commands + gates
```

Use it when Codex, Flowmatik, DeFocus, social, commerce, research or memory workflows should connect without manually composing flags.

It is exposed locally at `GET /api/k7/onboard` and `POST /api/k7/onboard`.

### Self Improvement Loop

File: `lib/self-improvement-loop.js`

Uses KAIZEN7 to improve KAIZEN7:

```text
Connector Kernel + Frontier + Codex Realizer + market patterns -> one supervised improvement action
```

It keeps self-improvement in proposal mode: no installs, OAuth, deploys, spending or credential writes without explicit approval.

The loop is exposed locally at `POST /api/k7/improve`.

### Weakness To Strength

File: `lib/weakness-to-strength.js`

Turns a concrete weakness into a controlled improvement packet:

```text
observe -> red_test -> minimal_patch -> verify -> remember -> retest_next_prompt
```

Use it when KAIZEN7 detects friction and needs to make the weak part strong without drifting into broad refactors.

The engine is exposed locally at `GET /api/k7/strength` and `POST /api/k7/strength`.

### Evolution Inbox

File: `lib/evolution-inbox.js`

Daily signal triage:

```text
signal-inbox -> strength | entra | memory | espera | fuera
```

Use it after daily radar, n8n, Hunter or Frontier adds signals. It decides what deserves execution, what becomes memory, what waits for evidence and what gets rejected.

The inbox is exposed locally at `GET /api/k7/evolve` and `POST /api/k7/evolve`.

### Action Queue Tickets

File: `lib/action-queue-tickets.js`

Governed work queue:

```text
signal-inbox -> k7:evolve -> k7:tickets -> approval -> verification -> Obsidian
```

Use it after `k7:evolve` to turn signals into safe tickets with owner, priority, budget, approval gate, stop condition, evidence and next action.

The ticket queue is exposed locally at `GET /api/k7/tickets` and `POST /api/k7/tickets`.

### KAIZEN7 Next

File: `lib/k7-next.js`

Single next action:

```text
k7:state -> k7:tickets -> k7:loop -> one safe next action
```

Use it when Hermes, Codex or another agent asks what to do now. It returns the current state, recommended governed ticket, compact loop context, one action and safety gates.

### KAIZEN7 Self Test

File: `lib/k7-self-test.js`

Repeated self-analysis:

```text
k7:next x 7 -> consensus -> drift -> honest verdict
```

Use it when testing KAIZEN7 against KAIZEN7. Seven identical answers prove stability, not learning. Learning requires verified memory, code, tests or a better next cycle.

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

### Claude Flow Adapter

File: `lib/claude-flow-adapter.js`

Candidate multi-agent worker contract:

```text
KAIZEN7 decides -> Claude Flow coordinates bounded subtasks -> KAIZEN7 verifies
```

It is exposed locally at `POST /api/k7/claude-flow`.

### Hermes Agent Adapter

File: `lib/hermes-agent-adapter.js`

Candidate intimate companion contract:

```text
KAIZEN7 decides -> Hermes critiques -> KAIZEN7 verifies
```

It is exposed locally at `POST /api/k7/hermes`.

### jcode Adapter

File: `lib/jcode-adapter.js`

Candidate harness contract:

```text
KAIZEN7 decides -> jcode may operate sessions/tools -> KAIZEN7 verifies
```

It is exposed locally at `POST /api/k7/jcode`.

### K7 Operating Layer

File: `lib/k7-operating-layer.js`

This is KAIZEN7's own modular operating layer: core, memory, harness, adapters, eval and evolution. It is exposed locally at `POST /api/k7/operating`.

### K7 Harness Router

File: `lib/k7-harness-router.js`

`k7:mission` creates the bounded mission packet. `k7:harness` routes that packet to the safest executor: Codex, Qwen Code, Aider, jcode, browser or manual approval. It is dry-run first and exposed locally at `POST /api/k7/mission`, `POST /api/k7/harness/route` and `POST /api/k7/harness/dry-run`.

### Headroom Adapter

File: `lib/headroom-adapter.js`

Candidate context compression contract:

```text
KAIZEN7 decides -> Headroom may compress/retrieve -> KAIZEN7 verifies evidence
```

It is exposed locally at `POST /api/k7/headroom`.

### K7 Context Layer

File: `lib/k7-context-layer.js`

This is KAIZEN7's own context layer: classify, compress, retrieve, verify and learn. It is exposed locally at `POST /api/k7/context`.

### Paperclip Adapter

File: `lib/paperclip-adapter.js`

Candidate control-plane contract:

```text
KAIZEN7 decides -> Paperclip may coordinate agent teams -> KAIZEN7 verifies and approves
```

It is exposed locally at `POST /api/k7/paperclip`.

### K7 Control Plane

File: `lib/k7-control-plane.js`

This is KAIZEN7's own control plane: goal, role, ticket, budget, heartbeat, approval, audit and learning. It is exposed locally at `POST /api/k7/control`.

### Semantic Memory

File: `lib/semantic-memory.js`

Builds and reuses `data/semantic-memory.json`, a compact local memory index over Markdown notes.

It detects freshness using file size, modification time and requested provider/model metadata.

Default runtime is local lexical fallback with `BAAI/bge-m3` declared as the candidate model, not downloaded or loaded. Use `docs/SEMANTIC_MEMORY.md` for the safe path from lexical baseline to approved embedding runtime.

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
