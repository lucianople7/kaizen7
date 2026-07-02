# KAIZEN7 Ephemeral Agent Factory

KAIZEN7 should magnify any coding agent or general agent by creating short-lived specialists that open one capability path, then teach the system what worked.

The goal is not to create permanent agents for everything. The goal is to create temporary capability builders that leave reusable learning behind.

## Core Loop

```text
Need
  -> forge packet
  -> ephemeral agent brief
  -> specialized subagent
  -> adapter, capability or mini-skill
  -> evidence gate
  -> learning capture
  -> register or retire
```

## Why It Matters

Most agents lose time because they:

- ask repeated setup questions,
- reload too much context,
- repeat research,
- do not know which provider to use,
- get blocked when a tool has no API or CLI,
- do not turn one successful path into reusable system learning.

KAIZEN7 fixes that by giving the agent:

- direction,
- capability contract,
- provider radar result,
- adapter manifest plan,
- allowed files,
- forbidden actions,
- tests,
- evidence requirements,
- memory writeback.

## Ephemeral Agent Contract

An ephemeral agent is created for one job only.

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

## Learning Capture

Every temporary specialist must leave a compact learning record.

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

This learning is what makes the next subagent faster. The first run may research and build. The second run starts from the pattern. The third run can promote the capability to stable.

## Register Or Retire

After evidence review, KAIZEN7 decides:

- `register`: the capability works and should become reusable.
- `revise`: the path is promising but needs another bounded agent run.
- `retire`: the specialist failed or the provider is not worth keeping.
- `archive_pattern`: the tool is not usable now, but the pattern is useful.

Failed agents do not remain as permanent complexity. They leave only useful learning or a rejection reason.

## Guardrails

- short lifetime,
- one objective,
- explicit allowed files,
- test-first changes,
- no installs without approval,
- no credentials,
- no paid or cloud default,
- no GPU default,
- evidence required before registration,
- memory writeback must be compact and reusable.

## Product Position

KAIZEN7 does not replace Codex or other agents. It makes them better.

```text
Codex + KAIZEN7 = code agent with capability memory and tool-forging direction.
OpenHands + KAIZEN7 = worker with bounded paths and evidence gates.
Local agents + KAIZEN7 = reusable capabilities without manual integration sprawl.
```

The product thesis:

```text
KAIZEN7 converts each task into reusable capability learning so the next agent starts stronger.
```
