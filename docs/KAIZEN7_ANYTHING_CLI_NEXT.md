# KAIZEN7 Anything CLI Next

Anything CLI next generation is the external-tool nervous system for KAIZEN7.

It should not become a mega-agent or a second kernel. It should make any useful
software available to agents as one safe, repeatable, agent-native command.

```text
KAIZEN7 decides the objective and route.
Anything CLI discovers or forges the executor.
The adapter returns structured evidence.
The receipt teaches the next run.
```

## What Makes It Next Generation

The current idea is adapter discovery. The stronger idea is a tool mesh with
memory and judgment:

- intent router,
- tool graph,
- adapter forge,
- execution contract,
- sandbox guard,
- evidence recorder,
- memory promoter.

## Tool Graph

Before creating anything, the system ranks possible routes:

1. existing receipt,
2. official API or CLI,
3. stable MCP,
4. local script,
5. cli-hub adapter,
6. small generated wrapper.

Each candidate is scored by output fit, setup cost, repeatability, JSON quality,
safety, speed and maintenance.

## Adapter Forge

The forge creates only the smallest wrapper needed to make a tool agent-native.

Every adapter must declare:

- command,
- input schema,
- output schema,
- required tools,
- permissions,
- dry run,
- verification,
- failure modes,
- reuse rule,
- discard rule.

## Sandbox Guard

Anything CLI must stop before:

- credentials,
- installs,
- paid services,
- external publishing,
- destructive actions,
- broad filesystem writes,
- claims or commerce risk.

Those actions need explicit human approval before execution.

## Lifecycle

```text
define_output
-> search_receipts
-> rank_existing_routes
-> discover_tool
-> forge_adapter_if_needed
-> dry_run
-> execute
-> verify_artifact
-> write_receipt
-> promote_or_discard
```

## Build Phases

| Phase | Output |
|---|---|
| v0 | Blueprint, metaskill and JSON command for agents. |
| v1 | Local registry of tool receipts and discarded routes. |
| v2 | Adapter forge templates for CLI, browser, desktop and render tools. |
| v3 | Sandboxed dry-run runner with artifact verification. |
| v4 | Promotion loop from repeated receipt to skill/metaskill. |
| v5 | Tool mesh that can hand the same route to Codex, OpenClaw, ECC or another agent. |

## Command

```powershell
npm.cmd run k7:anything-next
npm.cmd run k7:anything-next -- --json
```

Use this when an agent asks how KAIZEN7 would design a stronger Anything CLI
route.
