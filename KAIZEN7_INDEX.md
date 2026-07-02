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

### Stable External Memory Route

```text
C:\KAIZEN7_MEMORY
```

This is the primary local memory route outside OneDrive. Use it for durable KAIZEN7 memory, clean repo snapshots, agent packets and Google Drive sync staging.

### Canonical Architecture Document

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7\Obsidian\Flowmatik\Arquitectura\KAIZEN7 Arquitectura Fundacional v2.md
```

## Codex Startup Rule

Codex always starts KAIZEN7 work from Obsidian. No exceptions.

For operational work, use the local agent loop before opening broad context:

```powershell
npm.cmd run k7:state
npm.cmd run k7:loop -- --compact "objective"
```

`k7:state` is Rule #0: every agent must read it before critique, planning, install, push or autonomous work. The loop then returns the minimum memory paths, skills, Hunter candidates and next action to inspect.

Before answering with direction, changing files, designing architecture, touching product, content, ecommerce, claims, suppliers, skills or connectors, Codex must read the minimum relevant Obsidian context first.

Minimum startup read:

1. The canonical architecture document.
2. The shared operating protocol.
3. The active semaforo note.
4. The current KAIZEN7 daily note when it exists.
5. THE FOCUX notes if the change affects brand, content, ecommerce or compliance.

Every relevant movement must leave a trace in Obsidian: decision, context, changed files or assets, risks and next action.

## Agent Product Interface

KAIZEN7 is now oriented as a Universal Capability Forge:

```text
Need -> Capability -> Provider or Pattern -> Adapter or Minimal Build -> Execution Packet -> Evidence -> Memory
```

Canonical forge direction:

```text
docs/AGENT_USAGE.md
docs/KAIZEN7_AGENT_PRODUCT_CORE.md
docs/MEMORY_ROUTE.md
docs/REPO_PRUNING_DECISION.md
docs/AGENT_MAGNIFIER_RADAR.md
docs/CONTEXT_FIREWALL.md
docs/UNIVERSAL_CAPABILITY_FORGE.md
docs/EPHEMERAL_AGENT_FACTORY.md
docs/superpowers/specs/2026-07-02-kaizen7-universal-capability-forge-design.md
docs/superpowers/specs/2026-07-02-kaizen7-ephemeral-agent-factory-design.md
Obsidian/Flowmatik/Arquitectura/KAIZEN7 Universal Capability Forge.md
Obsidian/Flowmatik/Arquitectura/KAIZEN7 Ephemeral Agent Factory.md
Obsidian/Flowmatik/Arquitectura/KAIZEN7 Agent Product Core.md
```

The previous goal-to-execution layer remains as the operating loop inside this forge:

```text
Objective -> Minimal Context -> Memory -> Toolchain -> Execution -> Verification -> Learning
```

Canonical product thesis:

```text
docs/GOAL_TO_EXECUTION_LAYER.md
```

Current strategic path:

```text
docs/ROAD_TO_TOP.md
docs/DAILY_SELF_IMPROVEMENT_LOOP.md
docs/BODY_BRIDGE.md
docs/WEAKNESS_TO_STRENGTH.md
docs/EVOLUTION_INBOX.md
docs/ACTION_QUEUE_WEBUI.md
docs/CLAUDE_FLOW_ADAPTER.md
docs/HERMES_AGENT_ADAPTER.md
docs/JCODE_ADAPTER.md
docs/K7_OPERATING_LAYER.md
docs/K7_HARNESS_ROUTER.md
docs/HEADROOM_ADAPTER.md
docs/K7_CONTEXT_LAYER.md
docs/PAPERCLIP_ADAPTER.md
docs/K7_CONTROL_PLANE.md
docs/K7_STATE.md
Obsidian/Flowmatik/Kaizen7/KAIZEN7 Road To The Top.md
```

The connectable KAIZEN7 interface is documented in:

```text
docs/KAIZEN7_AGENT_LOOP.md
```

Primary commands:

```powershell
npm.cmd run k7:anything -- forge "necesito transcribir audio local sin GPU"
npm.cmd run k7:cockpit
npm.cmd run k7:state
npm.cmd run k7:next
npm.cmd run k7:self-test
npm.cmd run k7:cockpit -- --context "repo local" --capability run_tests "objective"
npm.cmd run k7:connect -- --project "Codex" --kind agent "objective"
npm.cmd run k7:bridge -- --project "KAIZEN7" "objective"
npm.cmd run k7:strength -- --project "KAIZEN7" "weakness"
npm.cmd run k7:evolve
npm.cmd run k7:tickets
npm.cmd run k7:next
npm.cmd run k7:self-test
npm.cmd run k7:activate -- "objective"
npm.cmd run k7:toolchain -- "objective"
npm.cmd run k7:openhands -- "objective"
npm.cmd run k7:claude-flow -- "objective"
npm.cmd run k7:hermes -- "objective"
npm.cmd run k7:jcode -- "objective"
npm.cmd run k7:operating -- "objective"
npm.cmd run k7:mission -- "objective"
npm.cmd run k7:harness -- "objective"
npm.cmd run k7:headroom -- "objective"
npm.cmd run k7:context -- "objective"
npm.cmd run k7:paperclip -- "objective"
npm.cmd run k7:control -- "objective"
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
POST /api/k7/cockpit
POST /api/k7/connect
POST /api/k7/bridge
POST /api/k7/strength
POST /api/k7/evolve
POST /api/k7/tickets
POST /api/k7/toolchain
POST /api/k7/mission
POST /api/k7/harness/route
POST /api/k7/harness/dry-run
POST /api/k7/openhands
POST /api/k7/claude-flow
POST /api/k7/hermes
POST /api/k7/jcode
POST /api/k7/operating
POST /api/k7/headroom
POST /api/k7/context
POST /api/k7/paperclip
POST /api/k7/control
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
