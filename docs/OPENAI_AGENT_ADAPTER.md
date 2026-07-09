# K7 OpenAI Agent Adapter

KAIZEN7 keeps its core independent and uses the OpenAI Agents SDK as an optional runtime adapter.

```text
KAIZEN7 core = memory, judgment, project activation and verification
OpenAI Agents SDK = optional runtime for agents, guardrails, traces and future handoffs
```

## Commands

```powershell
npm.cmd run k7:openai -- "objective"
npm.cmd run k7:openai -- --no-sdk "objective"
```

## API

```http
POST /api/k7/openai/activate
POST /api/k7/openai/advise
POST /api/k7/openai/verify
```

## Runtime Modes

### `local-compatible`

Default safe mode when `@openai/agents` is not installed or `OPENAI_API_KEY` is not configured.

It still returns:

- context pack,
- decision guard,
- tools,
- next action,
- verification gate,
- writeback policy.

### `openai-agents-sdk`

Used when `@openai/agents` is installed and `OPENAI_API_KEY` is configured.

The adapter creates a `KAIZEN7 Project Activation` agent and asks it to turn the local K7 brief into a compact execution brief.

## Tools Prepared For MCP/App Review

- `get_project_brief`
- `get_activation_checklist`
- `save_project_learning`

The write tool requires explicit user confirmation and must not store secrets.

## Rule

```text
OpenAI SDK != KAIZEN7 core
OpenAI SDK = optional execution companion
```

This keeps KAIZEN7 portable and prepares it for OpenAI Apps SDK / MCP without locking the product to one runtime.
