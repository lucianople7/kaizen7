# KAIZEN7 Agent Handoff

Target agent: `codex`
Objective: necesito transcribir audio local sin GPU
Capability: `audio.transcribe`
Provider decision: `adapt_provider`
Selected provider: `whisper`

## Start Here

Read `forge-packet.json` first.
Then read `agent-brief.md`.
Execute only the first bounded move described by KAIZEN7.

## Current First Move

`create_or_update_provider_manifest`

## Files To Touch

- data/anything-tools.json
- lib/adapters/whisper-adapter.js
- tests/whisper-adapter.test.js

## Hard Stops

- Do not install binaries without approval.
- Do not download models without approval.
- Do not touch credentials.
- Do not use paid APIs by default.
- Do not publish externally.
- Do not delete user assets.
- Do not default to GPU-heavy work.

## Return Contract

Return changed files, verification result, risks and learning.
If blocked, return the exact blocker and the smallest next approval needed.
