# KAIZEN7 Connector Kernel Design

## Purpose

KAIZEN7 needs one universal connection layer for projects, agents, coding tools, MCP servers, CLIs and APIs.

The Connector Kernel should let an external system connect once and receive:

- project understanding,
- selected memory,
- selected metaskills,
- relevant tools/adapters,
- frontier/repo discovery hints,
- one next action,
- verification gates,
- safe writeback policy.

The kernel is not autonomous deployment. It is an intelligent activation and routing layer.

## Product Contract

Command:

```powershell
npm.cmd run k7:connect -- --project "Flowmatik" --kind project "objective"
```

API:

```http
POST /api/k7/connect
```

Input:

```json
{
  "project": "Flowmatik",
  "kind": "project",
  "goal": "improve social distribution",
  "capabilities": ["read_files", "edit_files", "run_tests"],
  "domain": "automation"
}
```

Output:

```json
{
  "status": "ready",
  "mode": "connector-kernel",
  "profile": {},
  "route": {},
  "contextPack": [],
  "metaskills": [],
  "tools": [],
  "signals": [],
  "action": "",
  "verification": [],
  "writeback": {}
}
```

## Routing

The kernel routes by objective and project profile:

- `code`: Codex Bridge, Codex Realizer, TDD, verification.
- `agent`: Adapter Registry, Supertool, Frontier, Hunter.
- `research`: Frontier Watch, Hunter, memory, source checks.
- `social`: content route, social approval gates, publication review.
- `commerce`: product genome, supplier/compliance gates, Shopify adapter.
- `memory`: Second Brain, semantic memory, Obsidian writeback.
- `orchestrate`: Supertool default route.

## Components

### Project Profile

Creates a compact profile for the connected system:

- name,
- kind,
- domain,
- goals,
- capabilities,
- preferred routes,
- risk policy,
- memory policy.

Profiles are returned in the response first. Persistence can come later after the flow is proven.

### Context Pack

Returns only the context needed for the next action:

- selected memory paths,
- selected skills,
- selected tools,
- relevant frontier or Hunter candidates,
- explicit avoid list.

### Metaskill Activation

Uses existing skill routing and explicit defaults:

- `kaizen7-evolution-engine` for system improvement.
- `test-driven-development` for code changes.
- `verification-before-completion` for closure.
- `repo-hunter-github` for external repo discovery.
- `obsidian-memory` or `k7-hive-memory` for memory writeback.

### Safety

The kernel never:

- publishes,
- deploys,
- spends,
- deletes,
- writes credentials,
- stores secrets,
- installs dependencies automatically.

It returns approval gates when any route implies external effects.

## Data Flow

```text
input
-> normalize project profile
-> detect route
-> call Supertool/Second Brain/Adapter Registry/Frontier as needed
-> build context pack
-> build action and verification
-> return writeback draft
```

## Error Handling

- Missing project name falls back to `local-project`.
- Unknown kind falls back to `project`.
- No signals is not a blocker.
- Missing runtime files are created by `k7:init`.
- Dangerous capabilities return `needs_approval`.

## Testing

Add `tests/connector-kernel.test.js` covering:

- code route,
- social route,
- commerce route,
- agent/tool route,
- memory route,
- dangerous capability approval.

Update:

- `package.json` with `k7:connect`,
- `server.js` with `/api/k7/connect`,
- `production-readiness`,
- README and docs map.

## First Version Scope

Implement routing and response contract only.

Do not add real external fetchers, OAuth, persistence, installs, or autonomous execution in this first version.

## Self Review

- No placeholders remain.
- Scope is limited to one implementation pass.
- Runtime persistence is intentionally deferred.
- Safety boundaries are explicit.
- The design reuses existing KAIZEN7 modules instead of adding a parallel system.
