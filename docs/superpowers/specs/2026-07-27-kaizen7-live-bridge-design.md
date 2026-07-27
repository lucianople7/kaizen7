# KAIZEN7 Live Bridge — Design

**Date:** 2026-07-27  
**Status:** Approved design; implementation not started  
**Owner:** Luciano  
**Repository:** `lucianople7/kaizen7`

## Decision

KAIZEN7 Live Bridge will become the primary operational connection between ChatGPT Work and Codex on Luciano's mini PC. GitHub Control Room remains the durable fallback, review surface and receipt store; it is not the main real-time transport.

The approved operating rule remains:

```text
Human decides.
KAIZEN7 coordinates.
Codex executes locally.
Projects own their product state.
```

The Bridge is coordination infrastructure and therefore belongs in `kaizen7`. It must not absorb THE FOCUX product state or Flowmatik creative assets.

## Goals

1. Send structured missions from ChatGPT Work to Codex on the mini PC.
2. Stream status, progress, approval requests and final results back to the originating chat.
3. Preserve Codex thread continuity across multiple turns.
4. Apply explicit authority levels before local or external effects occur.
5. Survive temporary disconnections without losing or duplicating missions.
6. Produce compact, verifiable receipts without transferring private recovery material.
7. Establish a safe control channel before recovery, cleanup or reconstruction work begins.

## Non-goals

The MVP will not:

- delete, move or clean any mini-PC repository;
- reconstruct THE FOCUX;
- publish content or deploy any product to production;
- merge pull requests;
- spend money or create paid dependencies;
- transfer raw Codex sessions, the private recovery ZIP, credentials or customer data;
- expose the local Codex app-server directly to the public internet;
- introduce Redis, N8N, Supabase, Buzz or another orchestration platform;
- replace GitHub as the source-control and code-review system.

Deploying the private Bridge gateway itself is part of the MVP. This permission does not extend to THE FOCUX, Flowmatik or any other product deployment.

## System boundary

```text
ChatGPT Work
    | private plugin / Remote MCP
    v
KAIZEN7 Bridge Gateway — Cloudflare Worker
    | authenticated mission and event channel
    v
Device Session — Cloudflare Durable Object
    | outbound encrypted connection initiated by mini PC
    v
KAIZEN7 Local Bridge — Windows user process
    | loopback only
    v
Codex app-server / Codex SDK
    |
    +-- authorized local repositories
    +-- approved local tools
    +-- GitHub remote
```

The mini PC initiates the connection. No public listener, inbound router port or direct public Codex endpoint is permitted.

## Repository structure

```text
kaizen7/
├── apps/
│   ├── bridge-gateway/       # Cloudflare Worker and Remote MCP surface
│   └── local-bridge/         # Mini-PC client and Codex controller
├── packages/
│   ├── bridge-protocol/      # Versioned schemas and validators
│   └── authority/            # Risk classification and approval policy
└── docs/
    └── control-room/         # Operations, pairing, recovery and receipts
```

No fourth active repository is created. Product repositories remain external:

- `kaizen7`: coordination kernel and Bridge;
- `thefocux-platform`: public media, culture, lifestyle, discovery and commerce platform;
- `flowmatik-studio`: internal creative production engine.

## Components

### Bridge Gateway

A Cloudflare Worker exposes a private Streamable HTTP MCP endpoint to ChatGPT Work. It validates the user identity, validates every request against the versioned protocol and routes it to the correct paired device session.

The initial MCP surface contains exactly five tools:

1. `bridge_status`
2. `inspect_workspace`
3. `start_mission`
4. `approve_action`
5. `pause_bridge`

The gateway never accepts arbitrary shell commands as a tool argument. It accepts typed mission objectives, repository identifiers, constraints and requested authority.

### Device Session

One Durable Object represents the paired mini PC. It owns:

- online/offline presence and heartbeat;
- the current connection lease;
- pending mission delivery;
- event ordering;
- approval correlation;
- cancellation and pause state;
- short-lived operational state required for reconnection.

Durable Object storage persists undelivered missions and terminal mission state. A mission identifier and idempotency key prevent duplicate execution.

### Local Bridge

The local Bridge is a TypeScript/Node 22 process running under Luciano's Windows user account. It:

- opens an outbound TLS connection to the gateway;
- proves possession of a revocable device credential;
- verifies mission signatures, expiry, device target and protocol version;
- maps approved repository identifiers to explicit local paths;
- invokes Codex through the supported SDK/app-server interface on loopback;
- streams normalized Codex events back to the gateway;
- enforces local authority independently of the cloud gateway;
- writes a local append-only operational receipt without raw secrets or full transcripts.

The Bridge must use a user-executable official Codex installation. It must not depend on launching the protected WindowsApps executable from a service context. Installation and authentication are an explicit bootstrap gate.

### Codex controller

Codex app-server provides thread, turn, item, approval and streaming primitives. The local Bridge may use the Codex SDK as its typed client, but the app-server remains bound to loopback or a local process transport. Its thread identifier is stored only as scoped operational metadata.

### GitHub adapter

GitHub records meaningful engineering outcomes: branch, commit, pull request, verification summary and compact receipt. Routine heartbeat and token-by-token Codex events are not written to GitHub.

GitHub Issue #11 remains the fallback Control Room when the live channel is unavailable.

## Protocol

Every message uses a versioned envelope. The first protocol version is `kaizen7.bridge.v1`.

### Mission

A mission contains:

- immutable `mission_id`;
- `idempotency_key`;
- creation and expiry timestamps;
- requesting user and target device identifiers;
- canonical repository identifier, never a free-form filesystem root;
- objective and acceptance checks;
- constraints and requested authority level;
- optional existing Codex thread identifier;
- correlation identifier for the originating chat request;
- signature and protocol version.

### Event

Events have a monotonically increasing sequence within a mission. Event kinds are limited to:

- accepted;
- started;
- progress;
- approval_required;
- approval_resolved;
- verification;
- blocked;
- failed;
- cancelled;
- completed.

The Bridge transmits summaries and structured tool metadata. Raw environment dumps, credential values and private transcript bodies are prohibited.

### Approval

An approval references one mission, one pending action and one exact action digest. It includes the approving identity, decision, expiry and authority level. Approval cannot be reused for a changed command or later mission.

Critical approvals expire after ten minutes and are single-use.

### Receipt

A terminal receipt includes:

- mission and device identifiers;
- final status;
- repository, branch and commit references when applicable;
- executed verification commands and exit results;
- artifact references and digests;
- approvals consumed;
- start/end timestamps;
- concise next action.

It excludes secrets, raw sessions and the recovery ZIP.

## Authority model

### Level 0 — Observation

Examples: repository status, branch, versions, file inventory and read-only diagnostics. These may run without another approval after device pairing, but remain limited to allowlisted repositories and commands.

### Level 1 — Reversible workspace work

Examples: create a branch, edit inside an authorized repository, run tests and prepare a local commit. The parent mission must be explicitly approved.

### Level 2 — External effects

Examples: push, create a pull request, deploy a preview or change a connected service. Each distinct external effect requires action-specific approval.

### Level 3 — Critical effects

Examples: delete, publish, spend, alter production, use or rotate credentials, change domains, merge, or perform another irreversible action. The Bridge blocks until Luciano approves the exact action immediately before execution.

The MVP enables Levels 0 and 1. Levels 2 and 3 remain disabled until the end-to-end smoke suite and recovery drills pass.

The local execution policy independently denies destructive commands, broad filesystem targets and external-effect commands at Levels 0 and 1 even if a mission prompt requests them.

## Local scope

Initial repository allowlist:

- `kaizen7`
- `thefocux-platform`
- `flowmatik-studio`

Each name maps to one resolved absolute path in local configuration. The Bridge rejects:

- unresolved variables;
- path traversal;
- paths outside the allowlist;
- broad roots such as a user profile, drive root, OneDrive root or workspace parent;
- symlink or junction escapes;
- commands whose resolved working directory is outside the selected repository.

The recovery artifact directory may be referenced by digest for preservation checks, but its files cannot be transferred through the Bridge or committed.

A dedicated test profile may replace the production allowlist with one disposable repository created specifically for end-to-end tests. Test and production profiles cannot be active in the same process, and receipts must identify the selected profile.

## Authentication and secrets

Two separate trust relationships are used:

1. ChatGPT Work to Remote MCP: authenticated plugin access tied to Luciano's account.
2. Mini PC to gateway: a revocable device credential with a distinct device identity.

Cloudflare stores server secrets through encrypted secret bindings. Windows stores the local device credential in Windows Credential Manager. Secrets must not appear in command arguments, Git, logs, mission payloads or receipts.

Pairing is explicit and one-time. Revoking a device immediately prevents new mission claims. Re-pairing creates a new credential rather than restoring an old one.

## State and retention

The gateway retains only operational mission metadata and normalized events for thirty days. Terminal engineering receipts are preserved in GitHub when they correspond to repository work. The local Bridge keeps compact append-only receipts and bounded diagnostic logs; it does not persist complete chat or Codex transcript copies.

The private recovery ZIP remains at its existing local path with its recorded SHA-256 and is never uploaded by the Bridge.

## Mission lifecycle

```text
Chat request
  -> MCP tool call
  -> gateway authentication and schema validation
  -> authority classification
  -> durable mission creation
  -> local device claim
  -> local validation and Codex turn start/resume
  -> ordered progress events
  -> optional action-specific approval
  -> verification
  -> terminal receipt
  -> optional GitHub reference
```

A mission is executed by at most one live device lease. Reconnection may resume the same mission, but cannot create a second execution owner.

## Failure handling

- **Mini PC offline:** mission remains pending until expiry; no local action occurs.
- **Connection loss during work:** stop issuing new tool actions, preserve current state and attempt bounded reconnection.
- **Lease loss:** the old connection becomes read-only and cannot commit another event or action.
- **Duplicate delivery:** return the existing mission state or receipt; never execute again.
- **Expired mission or approval:** block and request a fresh authorization.
- **Unsupported protocol:** fail closed with the supported version.
- **Codex unavailable:** report a blocked state with diagnostics; do not fall back to another executor silently.
- **Verification failure:** finish as failed or blocked, preserving the worktree for review.
- **Gateway unavailable:** local work is not started from queued remote instructions. GitHub Control Room remains the manual fallback.
- **Pause enabled:** reject new missions and allow the active mission only to reach a safe stopping point.

## Delivery sequence

1. Implement and test protocol contracts.
2. Deploy the private gateway and Remote MCP surface without local access.
3. Pair the mini PC and establish heartbeat/status.
4. Complete a read-only repository inspection from ChatGPT Work.
5. Complete a reversible write in a disposable test repository and restore it.
6. Start and resume a persistent Codex thread.
7. Create a test branch, commit and receipt without merge.
8. Configure automatic startup after Windows user login.
9. Run the first useful mission: mini-PC repository inventory with no deletion.
10. Design and authorize a separate quarantine and cleanup mission.

Automatic startup is implemented only after manual launch, reconnect, pause and revocation tests pass.

## Acceptance criteria

The MVP is accepted only when all of the following are demonstrated:

1. ChatGPT Work reports the paired mini PC online with a fresh heartbeat.
2. `inspect_workspace` returns the correct repository, branch, HEAD and clean/dirty state.
3. Codex progress events are visible during an active mission.
4. The same Codex thread can be resumed from a later request.
5. Disconnection and restart do not duplicate a mission.
6. A Level 2 or Level 3 action is rejected while those levels are disabled.
7. An expired or mismatched approval cannot authorize an action.
8. `pause_bridge` prevents new mission execution.
9. Revoking the device credential prevents reconnection.
10. Under the dedicated test profile, a disposable file change can be created, verified and reverted without touching an authorized production repository.
11. Logs and receipts contain no secret values, raw recovery transcripts or ZIP content.
12. Each completed mission returns a valid terminal receipt.

## Test strategy

- Unit tests for every protocol schema, state transition and authority rule.
- Property tests for duplicate events, replayed approvals and idempotency keys.
- Integration tests between Worker, Durable Object and a fake local Bridge.
- Local integration tests between the Bridge and a fake Codex app-server.
- One explicit manual pairing test.
- One offline/reconnect test.
- One pause/revocation test.
- One end-to-end read-only test against an allowlisted repository.
- One end-to-end reversible write test against a disposable repository under the dedicated test profile.
- Security checks for path traversal, junction escape, forged signatures, expired credentials and secret redaction.

No cleanup, product production deployment or repository deletion is part of the Bridge acceptance suite.

## Rollback

The gateway can disable the device and MCP tools independently. The local Bridge can be paused or removed from Windows startup without changing any project repository. GitHub Control Room remains usable throughout rollout.

Before Levels 2 or 3 are enabled, rollback consists of stopping the local process, revoking the device credential and disabling the Cloudflare route. No product data migration is required.

## Follow-on work

After MVP acceptance, the next mission is a read-only inventory of the mini PC. That inventory will classify each repository and information source as `KEEP`, `RECOVER`, `QUARANTINE` or `DELETE_CANDIDATE`. Permanent deletion requires a later design, verified backup and explicit target-by-target approval.
