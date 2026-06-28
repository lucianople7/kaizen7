# KAIZEN7 Universal Adapters

KAIZEN7 should be easy for any API, code tool, MCP server, SDK or external agent to connect to without becoming part of the core.

```text
External system -> adapter plan -> K7 advice/run -> verification -> optional approved action -> memory writeback
```

## Rule

```text
KAIZEN7 is the system improver.
Adapters are replaceable bridges.
```

An adapter must declare:

- what it can do,
- what credentials it needs,
- what it must never do without approval,
- how it proves the result,
- what learning can be written back.

## Commands

```powershell
npm.cmd run k7:adapt -- --name "External Coding Agent" --kind agent --capability run_tests "improve this system through KAIZEN7"
npm.cmd run k7:adapt -- --name "OpenHands Worker" --kind remote_worker --capability return_diff "delegate bounded coding tasks"
npm.cmd run k7:openhands -- --path lib --path tests "use OpenHands to improve KAIZEN7 safely"
npm.cmd run k7:adapt -- --name "Any SaaS API" --kind api --env VENDOR_API_KEY --capability write_external --json "connect this API safely"
```

## API

```http
GET /api/k7/adapters
POST /api/k7/adapters/plan
```

Example:

```json
{
  "name": "External Coding Agent",
  "kind": "agent",
  "goal": "improve systems by connecting to KAIZEN7",
  "capabilities": ["run_tests", "deploy"],
  "authEnv": ["EXTERNAL_AGENT_TOKEN"]
}
```

The response returns:

- recommended K7 endpoints,
- input/output contract,
- risk level,
- approval gates,
- memory policy,
- next implementation steps.

## Supported Adapter Kinds

- `api` - HTTP APIs and SaaS tools.
- `cli` - local command-line tools.
- `mcp` - MCP servers.
- `agent` - Codex, OpenAI Agents SDK, Hermes-style agents or other operators.
- `remote_worker` - bounded remote coding workers such as OpenHands, Claude Code remote, Codex cloud or GitHub agents.
- `sdk` - thin wrappers around libraries.
- `webhook` - event ingestion.

## Remote Worker Contract

Remote workers are execution hands, not the KAIZEN7 brain.

```text
KAIZEN7 decides -> worker executes -> KAIZEN7 verifies -> human approves -> memory records
```

A remote worker packet must include:

- objective,
- minimum context pack,
- allowed paths,
- forbidden actions,
- verification commands,
- required diff or PR output,
- risks and questions,
- memory draft with no secrets.

By default, remote workers must not publish, deploy, delete, spend, write credentials, store secrets, merge directly or expand scope without approval.

## OpenHands Adapter

OpenHands gets a first-class KAIZEN7 planning command:

```powershell
npm.cmd run k7:openhands -- "delegate bounded coding tasks"
npm.cmd run k7:openhands -- --json --path lib --path tests --verify "npm.cmd run check" "improve adapter tests"
```

This does not install or run OpenHands. It creates the work packet KAIZEN7 should hand to OpenHands Agent Canvas or an OpenHands Agent Server.

Recommended setup:

- prefer Docker sandbox,
- mount only a dedicated `PROJECTS_PATH`,
- expose only the project folder needed,
- return diff, tests, risks and memory draft,
- send the result back to KAIZEN7 before merge or writeback.

Avoid the no-sandbox mode for real KAIZEN7 work unless the machine and mounted filesystem are intentionally disposable.

## Safety Model

Adapters default to proposal-first behavior.

KAIZEN7 must require human approval before:

- external publishing,
- external writes,
- deploys,
- spending,
- deletion,
- credential changes,
- sensitive memory writes.

Secrets stay in env vars. They do not enter Obsidian, Product Genome or run memory.

## First Implementation Boundary

This version does not execute external systems. It defines the connection contract and smoke-testable plan. Real execution must be added adapter by adapter after a plan proves it reduces steps, risk, repeated work or decision time.
