# KAIZEN7 Action Bridge - Canonical Design

**Date:** 2026-07-28
**Status:** Approved design checkpoint; production implementation not started
**Owner:** Luciano
**Repository:** `lucianople7/kaizen7`
**Control Room:** `lucianople7/kaizen7#14`

## Decision

KAIZEN7 Action Bridge is the primary path for Luciano to operate Codex from a
private KAIZEN7 GPT. Secure MCP Tunnel remains preserved as a future transport,
but the first practical production path is GPT Actions over HTTPS.

Canonical flow:

```text
Luciano
  -> private KAIZEN7 GPT
  -> GPT Actions
  -> Cloudflare KAIZEN7 Gateway
  -> per-installation Durable Object mailbox
  -> outbound polling from mini-PC
  -> KAIZEN7 Local Bridge
  -> ExecutionAdapter
  -> Codex
  -> verified receipt
  -> KAIZEN7
```

KAIZEN7 is the only conversational operating surface. Luciano should not have
to use Paseo, Happy, Remote, a second chatbot or repeated handoffs as the normal
interface. Those systems may exist only as hidden adapters, development aids or
emergency consoles after separate proof.

## Non-Goals

This design does not authorize:

- Cloudflare deployment;
- Cloudflare resource creation or mutation;
- production secrets;
- D1, R2 or Queues as the mission source of truth;
- inbound ports, public tunnels or Cloudflare-initiated connections to the mini-PC;
- generic shell, unrestricted filesystem access or arbitrary command tools;
- Paseo or Happy installation;
- push, PR, merge or production execution;
- recovery ZIP or raw Codex session access.

## Components

### Private KAIZEN7 GPT

The GPT is the user-facing product surface. It converts Luciano's intent into
the minimum typed mission context and invokes private GPT Actions. It must not
send full chat history to Codex. It sends only the mission envelope, constraints,
repository identifier, authority request and correlation metadata required for
execution.

Initial public Actions:

- `getSystemStatus`
- `submitMission`
- `getMissionReceipt`

The protocol must also allow later explicit:

- `approveMission`
- `cancelMission`

The first vertical may expose only status, submit and receipt, but the mission
state machine must not make approve/cancel a breaking change.

### Cloudflare KAIZEN7 Gateway

The Worker authenticates two separate surfaces:

- GPT Action requests with an Action credential.
- Mini-PC device requests with a device credential.

It performs request validation and routes to the Durable Object binding. It must
not use request-scoped global state for production mission coordination.

Secrets are provided only through Cloudflare secret bindings. Secret values must
never be stored in source, config, Git, logs, receipts or test snapshots.

### Durable Object Mailbox

The Durable Object is the productive source of truth. There is one coordination
atom per KAIZEN7 installation/workspace.

It owns:

- mission state;
- idempotency keys;
- atomic claim and bounded lease ownership;
- approval state;
- cancellation state;
- receipt storage;
- state transition audit summaries;
- redacted operational observability.

The current `InMemoryActionBridgeStore` from commit `94254eb` remains valid only
as a proof/test adapter. Production storage must be behind a narrow `MissionStore`
or mailbox interface so gateway routing does not couple to storage internals.

D1 is not the selected coordination source of truth for this vertical. R2 has no
justified role. Cloudflare Queues may be evaluated later for non-authoritative
notifications, but they must not become the mission mailbox.

### KAIZEN7 Local Bridge

The Local Bridge polls outward over HTTPS. It does not open an inbound listener,
public tunnel or remote-control surface on the mini-PC.

Responsibilities:

- claim missions from the mailbox using the device credential;
- validate protocol version, target device, expiry, repository and authority;
- enforce local authority independently of the cloud gateway;
- invoke an `ExecutionAdapter`;
- post structured receipts back to the mailbox;
- avoid raw transcript, secret and recovery artifact leakage.

### ExecutionAdapter

The Local Bridge talks to Codex only through a stable adapter boundary.

Initial proof adapter:

- safe read-only/test adapter;
- no arbitrary shell;
- no unrestricted filesystem;
- no production Codex mission.

Candidate adapters:

- Paseo: leading existing-solution candidate for Codex session orchestration,
  but unverified. It requires an isolated Windows/Codex proof before adoption.
- Direct Codex or AgentAPI: replaceable fallback.
- Happy: optional monitoring/emergency console candidate, not the primary
  operating interface.

KAIZEN7 core must not couple to any one adapter.

## Interfaces

### Public GPT Action Surface

```http
GET /v1/status
POST /v1/missions
GET /v1/receipts/{id}
```

Future compatible additions:

```http
POST /v1/missions/{id}/approve
POST /v1/missions/{id}/cancel
```

The public OpenAPI schema documents only the GPT Action surface. It must not
document mini-PC polling internals.

### Device Polling Surface

```http
GET /v1/agent/missions/next?deviceId=...
POST /v1/agent/missions/{id}/events
POST /v1/agent/receipts
```

These routes use a separate device credential and are not GPT Actions.

### MissionStore Boundary

The gateway depends on a small storage interface:

```ts
interface MissionStore {
  submitMission(mission, idempotencyKey): SubmitResult;
  claimNext(deviceId, lease): ClaimResult;
  markRunning(missionId, leaseId): TransitionResult;
  requireApproval(missionId, actionDigest): TransitionResult;
  approveMission(missionId, approval): TransitionResult;
  cancelMission(missionId, reason): TransitionResult;
  completeMission(receipt): TransitionResult;
  expireLeases(now): ExpiryResult;
  getReceipt(missionId): ReceiptResult;
  getStatus(): StatusResult;
}
```

`InMemoryMissionStore` is for tests. `DurableObjectMissionStore` is the first
production implementation.

## Mission State Machine

Primary flow:

```text
submitted -> claimed -> running -> succeeded
                                -> failed
```

Controlled states:

```text
approval_required
cancelled
expired
```

Rules:

- Every submit requires an idempotency key.
- Duplicate submit returns the original mission or terminal receipt.
- Claim is atomic and creates a bounded lease.
- A claimed mission can move to running only with the current lease.
- If a lease expires before running/completion, the mission can be reclaimed.
- Consequential authority never auto-runs.
- Approval references one mission, one action and one exact action digest.
- Cancellation is explicit and terminal unless no work has started and a new
  mission is submitted with a new idempotency key.
- Expired missions and expired approvals fail closed.

## Authority

- L0: read/status/diagnosis.
- L1: reversible local edits and tests within explicit scope.
- L2: commits, publication or important changes require Luciano's exact approval.
- L3: credentials, money, production and irreversible actions remain blocked
  pending exact approval.

MCP and GPT Actions expose capabilities. They do not grant authority. Both the
gateway and Local Bridge enforce authority.

## Authentication Boundaries

GPT Action credential:

- private to the GPT Action configuration and Cloudflare secret binding;
- authorizes public action endpoints only;
- cannot claim mini-PC work or post receipts.

Device credential:

- private to the mini-PC and Cloudflare secret binding;
- authorizes device polling endpoints only;
- cannot submit user missions as KAIZEN7.

Future admin credential:

- not part of the first vertical;
- only for explicit device revocation, rotation or operator maintenance.

## Observability And Redaction

Operational logs may include:

- mission ID;
- state transition;
- repository identifier;
- lease ID prefix or digest;
- test command name and exit code;
- receipt digest;
- correlation ID.

Operational logs must not include:

- API keys or bearer tokens;
- raw Codex session transcripts;
- recovery ZIP paths beyond approved non-secret references;
- full environment dumps;
- arbitrary filesystem inventories;
- credential names that reveal secret values.

## Failure And Lease Behavior

- Mini-PC offline: mission stays `submitted` until expiry.
- Duplicate submit: returns existing mission/receipt.
- Claim conflict: only one lease wins.
- Lease expiry: mailbox may release the mission for safe reclaim.
- Device crash after claim: mission is reclaimable after lease timeout.
- Adapter unavailable: mission becomes `failed` or `approval_required` with a
  redacted diagnostic receipt.
- Verification failure: mission becomes `failed` with test evidence.
- Cancel request before claim: mission becomes `cancelled`.
- Cancel request while running: Local Bridge reaches a safe stop and posts a
  terminal receipt.
- Unsupported protocol: reject without storing executable work.
- Secret detected in payload/receipt: reject and record redacted security event.

## Verification Strategy

Local proof tests:

- protocol validators;
- gateway REST contract;
- OpenAPI public surface shape;
- authentication split between GPT and device;
- idempotent submit;
- outbound polling consumer;
- local E2E: GPT Action simulation -> gateway -> polling -> receipt.

Production implementation tests before deploy approval:

- Durable Object state machine unit tests;
- atomic claim/lease tests;
- lease expiry and reclaim tests;
- duplicate idempotency tests;
- approve/cancel transition tests;
- Cloudflare Worker integration tests with fake DO storage;
- secret redaction tests;
- OpenAPI validation against GPT Actions requirements;
- local bridge safe adapter E2E.

Manual gates:

- Cloudflare resource creation approval;
- secret entry approval;
- deployment approval;
- private GPT creation/configuration approval;
- first real L0 Codex mission approval.

## Rollback

Rollback must be simple:

- disable GPT Action secret or route;
- disable device credential;
- stop Local Bridge polling process;
- leave GitHub Control Room available as fallback;
- preserve commits, specs, tests and terminal receipts.

Because the mailbox is operational state and not canonical memory, durable
architecture decisions and material receipts remain in Git/GitHub.

## First Vertical Acceptance Criteria

Mission:

```text
Check the active bridge project state without modifying anything. Return branch,
commit, working-tree state and test status.
```

Success requires:

1. Private KAIZEN7 GPT creates one typed L0 mission.
2. Durable Object persists it and returns a mission ID.
3. Mini-PC claims it through outbound polling.
4. Local Bridge invokes safe adapter/Codex.
5. Result becomes a verified receipt.
6. `getMissionReceipt` returns evidence to KAIZEN7.
7. No secret appears in logs, output, snapshots or Git.

## Reconciliation Matrix

| Commit | Component/File | Decision | Rationale |
| --- | --- | --- | --- |
| `8f3954a` | Workspace layout under `apps/*` and `packages/*` | keep | Correct separation for protocol, gateway and local bridge. |
| `8f3954a` | `scripts/verify-bridge-layout.js` | adapt | Keep layout checks, but future checks should recognize Action Bridge naming and Durable Object mailbox. |
| `8f3954a` | Initial `apps/bridge-gateway` package | keep | Gateway remains the Cloudflare Worker package. |
| `8f3954a` | Initial `apps/local-bridge` package | keep | Local outbound polling belongs here. |
| `67fbe2f` | `packages/bridge-protocol` types/validators | keep | Versioned mission, approval and receipt contracts are still foundational. |
| `67fbe2f` | `scripts/run-bridge-typechecks.js` incremental gate | keep | Correct incremental verification model. |
| `1d84d33` | Local MCP proof server | defer | Useful Secure MCP Tunnel proof, but not the main production path for ChatGPT personal. |
| `1d84d33` | `tunnel-client` docs/profile example | defer | Preserve for future MCP tunnel path; not part of Action Bridge first vertical. |
| `1d84d33` | Local `ReceiptStore` test adapter | adapt | Fold concept into Local Bridge/ExecutionAdapter tests; production receipt source is Durable Object mailbox. |
| `94254eb` | `apps/bridge-gateway/src/action-gateway.ts` | adapt | Handler shape is useful, but storage must target `MissionStore` backed by Durable Object in production. |
| `94254eb` | `apps/bridge-gateway/src/mission-store.ts` | adapt | In-memory store remains a test adapter; production must implement Durable Object mailbox. |
| `94254eb` | `apps/bridge-gateway/src/openapi.ts` | adapt | Keep first three public actions; future schema must use operation names `getSystemStatus`, `submitMission`, `getMissionReceipt`. |
| `94254eb` | `/v1/agent/*` routes | adapt | Keep as private device polling surface; never document in GPT Action OpenAPI. |
| `94254eb` | `apps/local-bridge/src/action-consumer.ts` | adapt | Correct outbound direction; next implementation must add leases, running transitions and adapter boundary. |
| `94254eb` | Gateway/local E2E tests | keep | Valid local proof for Action Bridge flow without secrets. |
| Proposed D1 | Any D1-backed mission state | remove | D1 is not the source of truth for mission coordination in this vertical. |
| Proposed R2 | Any R2 artifact storage | remove | No evidenced role in first vertical. |
| Proposed Queues | Queue as mailbox/source of truth | remove | Durable Object owns mission state and atomic claim/lease. |
| Public ingress to mini-PC | Any inbound listener/tunnel as primary path | remove | Mini-PC must poll outward. |
| Paseo | ExecutionAdapter candidate | defer | Must pass isolated Windows/Codex proof before adoption. |
| Happy | Mobile monitoring/emergency console | defer | Not the KAIZEN7 operating surface. |

## Self-Review

- No D1, R2 or Queues are selected as source of truth.
- No public ingress to the mini-PC is introduced.
- Durable Object mailbox is the only production coordination atom.
- The in-memory proof is preserved only as a test adapter.
- GPT Action and device credentials are separate.
- Authority levels are explicit and do not depend on tool availability.
- Approve/cancel are designed even if not in the first vertical.
- Secure MCP Tunnel is preserved as future transport, not duplicated in the
  Action Bridge first vertical.
- Paseo and Happy remain unverified candidates, not dependencies.
- No production implementation, secret, deployment or Cloudflare resource change
  is authorized by this document.

## Next Implementation Boundary

The next implementation task, after Luciano review, should be limited to:

1. Introduce the `MissionStore` interface in gateway code.
2. Keep `InMemoryMissionStore` for tests.
3. Add a Durable Object mailbox implementation with tests for state transitions,
   idempotency, claim/lease, expiry, approval and cancellation.
4. Keep Cloudflare deployment and real secrets behind a later explicit gate.
