# KAIZEN7 Quickstart

KAIZEN7 is ready for local production beta use.

It is a local command tool that helps any agent choose the smallest useful
context, route, tool, verification and receipt before work starts.

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects evolve.
```

## Requirements

- Node.js 20 or newer.
- PowerShell on Windows, or equivalent npm commands on another shell.
- No API key is required for the core local workflow.

Optional providers can be connected later, but KAIZEN7 must work in local-first
mode.

## Install

```powershell
npm.cmd install
npm.cmd run k7:init
npm.cmd run k7:check
npm.cmd run k7 -- wizard
```

Expected result:

```text
Status: pass
K7 readiness: ready
Blockers: 0
```

Warnings about empty optional API keys are acceptable in local-first mode.

## First Run

For guided setup:

```powershell
npm.cmd run k7 -- wizard
```

The wizard asks for:

- objective,
- project type,
- local/free-first mode,
- existing connections,
- executing agent,
- expected output.

It returns the route, commands, handoff and receipt template.

For direct use:

```powershell
npm.cmd run k7 -- run "improve this repo with less context and better verification"
```

This returns the main super-metaskill card:

- compressed objective,
- minimal context,
- currentness radar,
- open/free route candidates,
- tool forge path,
- trust gate,
- eval plan,
- production checklist,
- receipt contract.

## Use It With Any Agent

Give another agent this command first:

```powershell
npm.cmd run k7 -- handoff
```

For a specific mission:

```powershell
npm.cmd run k7 -- run "<objective>"
```

For JSON:

```powershell
npm.cmd run k7 -- run "<objective>" --json
```

## Free-First Tool Discovery

Before choosing a hosted or paid provider:

```powershell
npm.cmd run k7 -- commons "find a free local route for this task"
```

Use this when you want local CLIs, MCP servers, browser automation, local model
endpoints, self-hosted tools or repo-derived scripts before paid APIs.

## Forge A Reusable Tool Route

When a tool is needed but the best route is unclear:

```powershell
npm.cmd run k7 -- forge "video tool that can render clips from local assets"
```

Tool Forge does not copy whole tools into KAIZEN7. It learns the useful pattern,
creates the smallest agent-ready adapter contract, verifies it, and stores a
receipt. A route becomes a skill only after repeated verified receipts.

## Trust And Verification

Before using a new tool, connector, MCP server, browser agent or repo script:

```powershell
npm.cmd run k7 -- trust "MCP browser tool with credentials"
npm.cmd run k7 -- eval "connect this tool safely"
npm.cmd run k7 -- production "long-running agent workflow"
```

KAIZEN7 defaults to proposal mode. It does not publish, spend, delete, deploy,
push, or touch credentials without explicit human approval.

## Store Learning

After a verified run:

```powershell
npm.cmd run k7 -- remember "{\"objective\":\"connect app without API\",\"route\":\"api_escape_to_tool_route\",\"tool\":\"local CLI\",\"verification\":\"npm.cmd run k7:check\",\"reuse_next_time\":\"Start with the known CLI route.\",\"discard\":[\"Do not start with a paid API when local control works.\"]}"
```

Before the next run:

```powershell
npm.cmd run k7 -- recall "connect app without API"
```

## Production Beta Definition

This beta is ready when:

- `npm.cmd run k7:check` passes,
- `npm.cmd run k7 -- doctor` passes,
- the working tree is clean,
- a real mission can produce a route, verification plan and receipt,
- no paid service is required for the core workflow.

Public release is a separate step and requires explicit approval before pushing,
publishing, deploying or exposing credentials.
