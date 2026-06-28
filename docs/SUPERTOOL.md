# KAIZEN7 Supertool

KAIZEN7 Supertool is the single orchestration entrypoint for Codex, coding tools, MCP servers, APIs, CLIs and external agents.

```text
objective -> intent -> route -> context + skills + tools + action + verification
```

## Command

```powershell
npm.cmd run k7:super -- "implement endpoint with tests"
npm.cmd run k7:super -- --intent adapter --kind mcp --name "GitHub MCP" "connect safely"
npm.cmd run k7:super -- --write-signals "find today's frontier improvement"
```

## API

```http
GET /api/k7/super?goal=...
POST /api/k7/super
```

Example:

```json
{
  "goal": "connect GitHub MCP as a supervised tool",
  "intent": "adapter",
  "kind": "mcp",
  "name": "GitHub MCP"
}
```

## Routes

- `code` -> Codex Bridge and optionally Codex Realizer.
- `adapter` -> Adapter Registry.
- `frontier` -> Frontier Operator and Hunter.
- `memory` -> Codex Bridge, Semantic Memory and Skill Router.
- `orchestrate` -> default mixed route.

## Output Contract

Every response returns:

- `status`
- `intent`
- `route`
- `context`
- `skills`
- `tools`
- `action`
- `verification`
- `risk`
- `commands`

## Safety

Supertool does not publish, push, deploy, spend, delete or write credentials by default. It gives the calling agent a verified next action and blocks dangerous work behind explicit approval.
