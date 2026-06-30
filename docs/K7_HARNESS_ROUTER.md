# K7 Harness Router

`K7 Harness Router` turns a project goal into a safe execution mission.

```text
goal -> mission packet -> executor route -> dry-run -> evidence -> memory
```

## Commands

```powershell
npm.cmd run k7:mission -- "mejorar THE FOCUX landing con tests"
npm.cmd run k7:harness -- "mejorar THE FOCUX landing con tests"
```

## API

```http
POST /api/k7/mission
POST /api/k7/harness/route
POST /api/k7/harness/dry-run
```

## Executors

- `codex`: default local executor.
- `qwen-code`: future adapter for memory, skills, subagents and MCP.
- `aider`: future adapter for focused repo patching.
- `jcode`: future adapter for session harness work.
- `browser`: visual and web evidence.
- `manual`: approval fallback.

## Safety

V1 is dry-run first. It does not install or execute external CLIs.

High-risk missions route to `manual`.
