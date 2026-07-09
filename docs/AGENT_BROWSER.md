# KAIZEN7 Agent Browser

## Purpose

Agent Browser is the KAIZEN7 repo-intelligence layer.

It gives coding agents a fast map of the project before they touch files:

```text
repo -> scripts -> docs -> tests -> capabilities -> agent rules -> action card
```

This absorbs the useful ECC-style pattern:

```text
repository intelligence -> agent rules -> safer execution
```

It does not replace KAIZEN7. It feeds KAIZEN7.

## Command

```powershell
npm.cmd run k7:agent-browser
```

JSON:

```powershell
npm.cmd run k7:agent-browser -- --json
```

## What It Returns

- canonical files
- repo counts
- useful script groups
- agent rules
- recommended files for Codex, Claude Code, Cursor and Qwen Code
- next best action

## How It Connects

`k7:now` includes an Agent Browser summary so every growth mission starts with:

1. what to launch today,
2. how to navigate the repo,
3. what not to touch,
4. how to close the mission.

## Rule

Use Agent Browser when:

- a new agent joins the project,
- Codex needs a fast repo map,
- a mission feels broad,
- the project has too many entrypoints,
- KAIZEN7 needs stronger execution memory.

## Current Decision

KAIZEN7 adopts the pattern now.

No external install is required.

Future tools like ECC Tools, Repomix, Gitingest or other repo-context systems can become providers later if they beat the local Agent Browser.
