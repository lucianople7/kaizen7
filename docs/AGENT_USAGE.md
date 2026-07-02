# Using KAIZEN7 With Coding Agents

KAIZEN7 is now usable as a forge front door for Codex, Claude Code, OpenHands or any agent that can read files and follow a bounded brief.

## Create A Forge Session

```powershell
npm.cmd run k7:anything -- forge "necesito transcribir audio local sin GPU" --write --agent codex
```

Supported agent profiles:

- `codex`
- `claude-code`
- `openhands`
- `generic`

The command writes:

```text
content_library/forge/sessions/<session-id>/forge-packet.json
content_library/forge/sessions/<session-id>/agent-brief.md
content_library/forge/sessions/<session-id>/agent-handoff.md
```

## Agent Instructions

Give the target agent this instruction:

```text
Read agent-handoff.md first.
Read forge-packet.json and agent-brief.md.
Execute only the first bounded move.
Do not install, download models, use paid APIs, touch credentials, publish or delete assets without approval.
Return changed files, verification result, risks and learning.
```

## Why This Works

KAIZEN7 narrows the task before the agent acts:

```text
need -> capability -> provider radar -> adapter manifest -> agent handoff -> evidence -> learning
```

The agent is temporary. The learning is permanent.
