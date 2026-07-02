# KAIZEN7 Ephemeral Agent Factory Design

Date: 2026-07-02

## Product Direction

The Ephemeral Agent Factory extends the Universal Capability Forge. It creates a short-lived specialist when KAIZEN7 needs a capability, adapter, mini-skill or provider path that does not exist yet.

The specialist does not become a permanent actor. It opens one path, returns evidence and learning, then KAIZEN7 registers the capability, revises the path, archives the pattern or retires the specialist.

## Core Thesis

```text
Need
  -> forge packet
  -> ephemeral agent brief
  -> temporary specialist
  -> adapter/capability/mini-skill
  -> evidence
  -> learning capture
  -> register or retire
```

KAIZEN7 becomes stronger because every useful run teaches the next agent what to do first, what to avoid, which files to touch and how to verify.

## Goals

- Give Codex or another agent a precise specialist brief instead of a broad prompt.
- Create capabilities on demand without keeping permanent agent sprawl.
- Capture provider and adapter learning after every attempt.
- Promote working patterns into stable capabilities.
- Retire failed specialists with a compact rejection reason.
- Make the next subagent start from reusable system knowledge.

## Non-Goals

- Do not create permanent subagents for every tool.
- Do not run open-ended autonomous loops.
- Do not install, download, publish, delete, spend or touch credentials without approval.
- Do not store raw logs or broad transcripts as memory.
- Do not make subagents responsible for product direction. KAIZEN7 keeps authority.

## Ephemeral Agent Brief

Required shape:

```json
{
  "schema": "kaizen7.ephemeral_agent_brief.v1",
  "objective": "create a whisper adapter for local audio transcription",
  "capability": "audio.transcribe",
  "role": "temporary_capability_builder",
  "provider": "whisper",
  "allowed_files": [
    "data/anything-tools.json",
    "lib/adapters/whisper-adapter.js",
    "tests/whisper-adapter.test.js"
  ],
  "forbidden_actions": [
    "install_without_approval",
    "download_model_without_approval",
    "touch_credentials",
    "use_paid_api_by_default",
    "publish_external",
    "delete_user_assets"
  ],
  "done_when": [
    "adapter_contract_exists",
    "verify_command_defined",
    "test_fixture_passes",
    "evidence_contract_documented"
  ],
  "return": [
    "changed_files",
    "test_result",
    "provider_learning",
    "risks",
    "register_or_retire_recommendation"
  ]
}
```

## Learning Record

Required shape:

```json
{
  "schema": "kaizen7.capability_learning.v1",
  "capability": "audio.transcribe",
  "provider": "whisper",
  "worked": true,
  "verify_command": ["whisper", "--help"],
  "evidence": ["transcript_exists", "timestamps_present"],
  "avoid": ["paid_api_default", "gpu_dependency", "unapproved_install"],
  "files_to_touch": [
    "data/anything-tools.json",
    "lib/adapters/whisper-adapter.js",
    "tests/whisper-adapter.test.js"
  ],
  "next_agent_starting_point": "create adapter from existing manifest plan"
}
```

## Lifecycle

1. KAIZEN7 creates or receives a forge packet.
2. Provider Radar decides `use_provider`, `adapt_provider` or `absorb_pattern`.
3. If a specialist is needed, KAIZEN7 writes an ephemeral agent brief.
4. Codex or another agent executes the brief inside allowed files.
5. KAIZEN7 verifies evidence.
6. KAIZEN7 captures learning.
7. KAIZEN7 chooses `register`, `revise`, `retire` or `archive_pattern`.

## Success Criteria

- A forge session can include an ephemeral agent brief.
- The brief is small enough for another agent to consume directly.
- The brief has allowed files, forbidden actions, done conditions and return shape.
- Every completed specialist run leaves a learning record or rejection reason.
- A later agent can start from the learning record without redoing the same research.

## First Product Slice

Extend `forge --write` so each session can include:

```text
ephemeral-agent-brief.json
capability-learning-template.json
```

The first real case should be `audio.transcribe` with provider `whisper`, because it is CPU-first, free/open-source friendly and easy to verify without publishing or credentials.
