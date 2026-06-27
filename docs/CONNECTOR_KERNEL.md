# KAIZEN7 Connector Kernel

The Connector Kernel is the universal connection layer for Codex, coding tools, APIs, CLIs, MCP servers and external agents.

It gives a connected system one compact operating packet:

```text
project -> profile -> route -> context pack + metaskills + connectors + discovery + action + verification + writeback policy
```

Use it when another system wants KAIZEN7 to understand the project and activate the right metaskills without loading the whole repository or repeating setup data.

## Command

```powershell
npm.cmd run k7:connect -- --project "Flowmatik" --kind project "mejorar redes sociales con memoria y verificacion"
npm.cmd run k7:connect -- --project "Codex" --kind agent --domain coding --capability run_tests "mejorar codigo con tests"
npm.cmd run k7:connect -- --json --project "External Agent" --kind agent --capability deploy --capability publish "deploy and publish"
```

## API

```http
POST /api/k7/connect
```

Example:

```json
{
  "project": "Flowmatik",
  "kind": "project",
  "goal": "mejorar redes sociales con memoria y verificacion",
  "capabilities": ["read_files", "edit_files", "run_tests"],
  "domain": "automation"
}
```

## Output Contract

Every response returns:

- `status`
- `mode`
- `profile`
- `route`
- `contextPack`
- `metaskills`
- `metaskillStack`
- `tools`
- `connectors`
- `discoveryPlan`
- `connectionPrompts`
- `signals`
- `action`
- `commands`
- `verification`
- `approvalGates`
- `writeback`
- `adapter`
- `safety`

`status` is `ready` for safe planning routes and `needs_approval` when requested capabilities include external effects such as publish, deploy, spend, delete, credential writes or dependency installs.

## Routes

- `code`: implementation, tests, refactors and Codex workflows.
- `agent`: external agents, MCP servers, SDKs, APIs and tool adapters.
- `research`: GitHub, Hugging Face, frontier scanning and repo discovery.
- `social`: content and social media workflows with publication gates.
- `commerce`: Shopify, ecommerce, suppliers and product growth workflows.
- `memory`: Obsidian, second brain, semantic memory and writeback drafts.
- `orchestrate`: default mixed route.

## Connectivity

The kernel now recommends the next connectors directly:

- GitHub: `npm.cmd run k7:github -- "<github-repo-url>"`
- Hugging Face: `npm.cmd run k7:hf -- "<huggingface-url>"`
- MCP: `npm.cmd run k7:adapt -- --name "<mcp-name>" --kind mcp "<objective>"`
- OpenAI Agents SDK: `npm.cmd run k7:openai -- "<objective>"`
- Gradio/HF Spaces: `npm.cmd run k7:hf -- "<huggingface-space-url>"`

It also returns sourceable discovery queries such as:

```text
site:github.com <objective> open source
site:github.com <objective> mcp server
site:huggingface.co <objective>
```

This is not autonomous web execution. It is the shortest supervised path to connect sources, ingest signals, activate metaskills and ask for the next approval when external effects appear.

## Safety

The Connector Kernel does not execute external effects. It returns context, route, commands, verification and approval gates.

It never publishes, deploys, spends, deletes, writes credentials, stores secrets or installs dependencies automatically.

## Relationship To Other Modules

- `k7:connect` is the universal handshake.
- `k7:improve` uses KAIZEN7 on KAIZEN7 and returns one supervised self-improvement loop.
- `k7:super` is the internal orchestration engine.
- `k7:brain` is the second brain and metaskill layer.
- `k7:adapt` creates adapter plans for external systems.
- `k7:frontier:brief` supplies current frontier signals.
- `k7:real` verifies whether KAIZEN7 is operational enough for Codex to trust.
