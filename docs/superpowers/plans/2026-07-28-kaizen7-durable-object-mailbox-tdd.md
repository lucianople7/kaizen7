# KAIZEN7 Durable Object Mailbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Action Bridge proof store with a production-ready Durable Object mailbox design while proving state, leases, idempotency, credential binding, signatures, typed operations and lockfile safety through TDD before any deploy.

**Architecture:** Keep the current in-memory store only as a test adapter and introduce a narrow `MissionStore` boundary backed by one SQLite Durable Object mailbox per KAIZEN7 installation/workspace. The Worker authenticates GPT Action and device surfaces separately, routes every state mutation to the mailbox, and the Local Bridge claims missions outward with a lease-bound device identity. No D1, R2, Queues, public mini-PC ingress or generic shell is introduced.

**Tech Stack:** Node 22, TypeScript, Cloudflare Workers, Cloudflare Durable Objects with SQLite storage, `@cloudflare/vitest-pool-workers`, existing `node:test` gateway tests, existing Zod-like bridge protocol validators, npm workspaces.

## Global Constraints

- Repository: `lucianople7/kaizen7`.
- Branch: `agent/kaizen7-live-bridge`.
- Issue: `lucianople7/kaizen7#14`.
- Production implementation remains blocked until this plan is approved.
- No Cloudflare deploy, resource creation, D1, R2, Queues, production secrets, PR, merge, recovery ZIP access or raw Codex session access.
- Preserve `94254eb` as a valid local proof; the memory store remains only for tests.
- The productive source of truth is a Durable Object mailbox, not process memory.
- Every production behavior starts with a failing test and the expected failure must be recorded in the task receipt.
- Before merge, prove a clean dependency installation and the full repository suite, because the current branch changes `package-lock.json` heavily.
- Cloudflare Durable Object references checked on 2026-07-28: coordination/storage model, SQLite storage, RPC-style methods, alarms and Workers Vitest integration.

---

## File Structure

- Modify: `apps/bridge-gateway/package.json`
  - Add test scripts for Durable Object tests only when the first failing test requires them.
  - Add Cloudflare test dependencies only through a reviewed lockfile update.
- Create: `apps/bridge-gateway/wrangler.jsonc`
  - Local/test configuration for `KAIZEN7_MAILBOX` Durable Object binding.
  - Must use SQLite Durable Object declaration or migration according to the installed Wrangler version.
- Create: `apps/bridge-gateway/vitest.config.ts`
  - Configure `@cloudflare/vitest-pool-workers` against the local wrangler config.
- Create: `apps/bridge-gateway/test/env.d.ts`
  - Type test bindings for the Durable Object runtime.
- Modify: `apps/bridge-gateway/src/mission-store.ts`
  - Split the current proof store into a stable `MissionStore` interface plus `InMemoryMissionStore`.
  - Keep proof behavior available for existing tests.
- Create: `apps/bridge-gateway/src/mailbox-types.ts`
  - Define mailbox states, lease shape, credential identity, transition results and typed operation envelopes.
- Create: `apps/bridge-gateway/src/mailbox-durable-object.ts`
  - Implement the SQLite Durable Object mailbox.
- Modify: `apps/bridge-gateway/src/action-gateway.ts`
  - Route public GPT and private device calls through the new interface.
  - Require device-bound leases and action-bound signature or remove the signature field from accepted input.
- Modify: `apps/bridge-gateway/src/authority.ts`
  - Replace forbidden-word safety with typed operation allowlists.
- Modify: `packages/bridge-protocol/src/types.ts`
  - Add explicit operation types, device identity fields and either verified signatures or no signature field.
- Modify: `packages/bridge-protocol/src/validate.ts`
  - Validate operation allowlists, expiry, device binding and signature policy.
- Add tests:
  - `apps/bridge-gateway/test/mission-store-contract.test.ts`
  - `apps/bridge-gateway/test/mailbox-durable-object.test.ts`
  - `apps/bridge-gateway/test/action-gateway-device-binding.test.ts`
  - `apps/bridge-gateway/test/typed-operations.test.ts`
  - `apps/bridge-gateway/test/package-lock-clean-install.test.ts`
  - `packages/bridge-protocol/test/operation-contract.test.ts`

---

### Task 1: MissionStore Contract And State Vocabulary

**Files:**
- Modify: `apps/bridge-gateway/src/mission-store.ts`
- Create: `apps/bridge-gateway/src/mailbox-types.ts`
- Create: `apps/bridge-gateway/test/mission-store-contract.test.ts`

**Interfaces:**
- Consumes: existing `Mission`, `TerminalReceipt` from `packages/bridge-protocol/src/index.ts`.
- Produces:
  - `MissionStore`
  - `MissionStatus = "submitted" | "claimed" | "running" | "approval_required" | "succeeded" | "failed" | "cancelled" | "expired"`
  - `Lease = { leaseId: string; missionId: string; deviceId: string; expiresAt: string }`
  - `ClaimNextInput = { deviceId: string; now: string; leaseSeconds: number }`
  - `ClaimNextResult = { ok: true; mission: Mission; lease: Lease } | { ok: false; reason: "empty" | "device_not_authorized" }`
  - `ReceiptInput = { deviceId: string; leaseId: string; receipt: TerminalReceipt }`

- [ ] **Step 1: Write the failing contract test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryMissionStore } from "../src/mission-store.ts";
import { makeMission, makeReceipt } from "./support/fixtures.ts";

test("MissionStore requires device-bound leases before accepting receipts", () => {
  const store = new InMemoryMissionStore();
  const mission = makeMission({
    missionId: "mission_device_bound_1",
    targetDeviceId: "device-mini-pc",
    idempotencyKey: "idem-device-bound-1",
  });

  store.submitMission(mission, { now: "2026-07-28T10:00:00.000Z" });
  const claim = store.claimNext({ deviceId: "device-mini-pc", now: "2026-07-28T10:00:01.000Z", leaseSeconds: 60 });

  assert.equal(claim.ok, true);
  if (!claim.ok) throw new Error("claim should succeed");

  const wrongDevice = store.completeMission({
    deviceId: "other-device",
    leaseId: claim.lease.leaseId,
    receipt: makeReceipt({ missionId: mission.missionId }),
  });

  assert.deepEqual(wrongDevice, { ok: false, reason: "lease_device_mismatch" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -w @kaizen7/bridge-gateway -- test/mission-store-contract.test.ts`

Expected: FAIL because `submitMission`, `claimNext` and `completeMission` do not exist yet.

- [ ] **Step 3: Write minimal interface and in-memory adapter update**

```ts
export type MissionStatus =
  | "submitted"
  | "claimed"
  | "running"
  | "approval_required"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired";

export interface Lease {
  leaseId: string;
  missionId: string;
  deviceId: string;
  expiresAt: string;
}

export interface MissionStore {
  submitMission(mission: Mission, input: { now: string }): { ok: true; mission: Mission; duplicate: boolean };
  claimNext(input: { deviceId: string; now: string; leaseSeconds: number }): ClaimNextResult;
  completeMission(input: { deviceId: string; leaseId: string; receipt: TerminalReceipt }): TransitionResult;
  getReceipt(missionId: string): TerminalReceipt | undefined;
  summary(): { submitted: number; claimed: number; running: number; receipts: number };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm.cmd test -w @kaizen7/bridge-gateway -- test/mission-store-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Run existing bridge tests**

Run: `npm.cmd run bridge:test`

Expected: PASS with the existing proof tests still green.

- [ ] **Step 6: Commit**

```bash
git add apps/bridge-gateway/src/mission-store.ts apps/bridge-gateway/src/mailbox-types.ts apps/bridge-gateway/test/mission-store-contract.test.ts
git commit -m "test: define bridge mailbox store contract"
```

---

### Task 2: Durable Object Mailbox Persistence, Idempotency And Leases

**Files:**
- Create: `apps/bridge-gateway/wrangler.jsonc`
- Create: `apps/bridge-gateway/vitest.config.ts`
- Create: `apps/bridge-gateway/test/env.d.ts`
- Create: `apps/bridge-gateway/src/mailbox-durable-object.ts`
- Create: `apps/bridge-gateway/test/mailbox-durable-object.test.ts`
- Modify: `apps/bridge-gateway/package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `MissionStore`, `MissionStatus`, `Lease`.
- Produces:
  - `Kaizen7Mailbox` Durable Object class.
  - RPC methods: `submitMission`, `claimNext`, `markRunning`, `completeMission`, `expireLeases`, `getReceipt`, `summary`.

- [ ] **Step 1: Write the failing Durable Object persistence test**

```ts
import { env } from "cloudflare:workers";
import { evictDurableObject } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { makeMission } from "./support/fixtures";

describe("Kaizen7Mailbox Durable Object", () => {
  it("persists a submitted mission and idempotency mapping across eviction", async () => {
    const id = env.KAIZEN7_MAILBOX.idFromName("luciano-primary");
    const stub = env.KAIZEN7_MAILBOX.get(id);
    const mission = makeMission({
      missionId: "mission_persist_1",
      idempotencyKey: "idem-persist-1",
      targetDeviceId: "device-mini-pc",
    });

    await stub.submitMission(mission, { now: "2026-07-28T10:00:00.000Z" });
    await evictDurableObject(stub);

    const afterEviction = env.KAIZEN7_MAILBOX.get(id);
    const duplicate = await afterEviction.submitMission(mission, { now: "2026-07-28T10:00:05.000Z" });

    expect(duplicate).toEqual({ ok: true, mission, duplicate: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:do -w @kaizen7/bridge-gateway -- test/mailbox-durable-object.test.ts`

Expected: FAIL because Cloudflare Vitest config, binding and `Kaizen7Mailbox` do not exist.

- [ ] **Step 3: Add the minimum Cloudflare test configuration**

```jsonc
{
  "name": "kaizen7-action-bridge-gateway",
  "main": "src/index.ts",
  "compatibility_date": "2026-07-28",
  "exports": {
    "Kaizen7Mailbox": {
      "type": "durable-object",
      "storage": "sqlite"
    }
  },
  "durable_objects": {
    "bindings": [{ "name": "KAIZEN7_MAILBOX", "class_name": "Kaizen7Mailbox" }]
  }
}
```

- [ ] **Step 4: Implement SQLite schema and idempotent submit**

```ts
this.ctx.storage.sql.exec(`
  CREATE TABLE IF NOT EXISTS missions (
    mission_id TEXT PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    target_device_id TEXT NOT NULL,
    state TEXT NOT NULL,
    mission_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    lease_id TEXT,
    lease_device_id TEXT,
    lease_expires_at TEXT,
    receipt_json TEXT
  )
`);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm.cmd run test:do -w @kaizen7/bridge-gateway -- test/mailbox-durable-object.test.ts`

Expected: PASS.

- [ ] **Step 6: Add failing lease tests**

```ts
it("claims exactly one mission per device and lease window", async () => {
  const stub = env.KAIZEN7_MAILBOX.get(env.KAIZEN7_MAILBOX.idFromName("lease-test"));
  await stub.submitMission(makeMission({ missionId: "m1", idempotencyKey: "i1", targetDeviceId: "device-a" }), { now: "2026-07-28T10:00:00.000Z" });

  const first = await stub.claimNext({ deviceId: "device-a", now: "2026-07-28T10:00:01.000Z", leaseSeconds: 30 });
  const second = await stub.claimNext({ deviceId: "device-a", now: "2026-07-28T10:00:02.000Z", leaseSeconds: 30 });

  expect(first.ok).toBe(true);
  expect(second).toEqual({ ok: false, reason: "empty" });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm.cmd run test:do -w @kaizen7/bridge-gateway -- test/mailbox-durable-object.test.ts`

Expected: FAIL because claim/lease transition is not implemented.

- [ ] **Step 8: Implement atomic claim and lease expiry**

Use one synchronous SQLite update/returning path inside the Durable Object method:

```ts
const row = this.ctx.storage.sql.exec<Row>(
  `SELECT mission_id, mission_json
     FROM missions
    WHERE target_device_id = ?
      AND state = 'submitted'
      AND datetime(?) < datetime(json_extract(mission_json, '$.expiresAt'))
    ORDER BY created_at ASC
    LIMIT 1`,
  input.deviceId,
  input.now,
).one();
```

Then update the selected row to `claimed` with a generated lease ID and expiry before returning it.

- [ ] **Step 9: Run Durable Object tests**

Run: `npm.cmd run test:do -w @kaizen7/bridge-gateway`

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/bridge-gateway/package.json package-lock.json apps/bridge-gateway/wrangler.jsonc apps/bridge-gateway/vitest.config.ts apps/bridge-gateway/test/env.d.ts apps/bridge-gateway/src/mailbox-durable-object.ts apps/bridge-gateway/test/mailbox-durable-object.test.ts
git commit -m "feat: add durable mailbox persistence"
```

---

### Task 3: Credential-To-Device Binding

**Files:**
- Modify: `apps/bridge-gateway/src/action-gateway.ts`
- Modify: `apps/bridge-gateway/src/mailbox-durable-object.ts`
- Create: `apps/bridge-gateway/test/action-gateway-device-binding.test.ts`
- Modify: `packages/bridge-protocol/src/types.ts`
- Modify: `packages/bridge-protocol/src/validate.ts`
- Modify: `packages/bridge-protocol/test/protocol.test.ts`

**Interfaces:**
- Consumes: `Mission.targetDeviceId`, `Lease.deviceId`.
- Produces:
  - `DevicePrincipal = { deviceId: string; credentialId: string }`
  - Device route auth result binds bearer token to one `deviceId`.
  - Receipt writes require `receipt.missionId`, current `leaseId` and the same bound `deviceId`.

- [ ] **Step 1: Write the failing gateway test**

```ts
test("agent token cannot post a receipt for a mission leased by another device", async () => {
  const store = new InMemoryMissionStore();
  const handler = createActionBridgeHandler(store, {
    actionBearerToken: "action-token",
    agentCredentials: {
      "agent-token-a": { deviceId: "device-a", credentialId: "cred-a" },
      "agent-token-b": { deviceId: "device-b", credentialId: "cred-b" },
    },
    bridgeVersion: "test",
  });

  await submitMission(handler, makeMission({ missionId: "m-device", targetDeviceId: "device-a", idempotencyKey: "idem-device" }));
  const claim = await claimNext(handler, "agent-token-a");

  const response = await postReceipt(handler, "agent-token-b", makeReceipt({ missionId: "m-device", leaseId: claim.lease.leaseId }));

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { ok: false, error: "lease_device_mismatch" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -w @kaizen7/bridge-gateway -- test/action-gateway-device-binding.test.ts`

Expected: FAIL because `agentCredentials` and lease-bound receipt checks do not exist.

- [ ] **Step 3: Implement credential binding**

Replace single `agentBearerToken` config with a credential map:

```ts
export interface ActionBridgeConfig {
  actionBearerToken: string;
  agentCredentials: Record<string, { deviceId: string; credentialId: string }>;
  bridgeVersion: string;
}
```

Device endpoints must ignore `deviceId` query claims that conflict with the authenticated device principal.

- [ ] **Step 4: Run focused and bridge tests**

Run:

```bash
npm.cmd test -w @kaizen7/bridge-gateway -- test/action-gateway-device-binding.test.ts
npm.cmd run bridge:test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/bridge-gateway/src/action-gateway.ts apps/bridge-gateway/src/mailbox-durable-object.ts apps/bridge-gateway/test/action-gateway-device-binding.test.ts packages/bridge-protocol/src/types.ts packages/bridge-protocol/src/validate.ts packages/bridge-protocol/test/protocol.test.ts
git commit -m "fix: bind bridge receipts to device credentials"
```

---

### Task 4: Signature Policy And Typed Operation Allowlists

**Files:**
- Modify: `packages/bridge-protocol/src/types.ts`
- Modify: `packages/bridge-protocol/src/validate.ts`
- Create: `packages/bridge-protocol/test/operation-contract.test.ts`
- Modify: `apps/bridge-gateway/src/authority.ts`
- Create: `apps/bridge-gateway/test/typed-operations.test.ts`

**Interfaces:**
- Consumes: mission authority model.
- Produces:
  - `BridgeOperation = { kind: "repo.status"; repository: string } | { kind: "tests.run"; workspace: string; command: "bridge:typecheck" | "bridge:test" | "bridge:verify" | "k7:smoke" | "k7:ready" } | { kind: "git.commit"; repository: string; files: string[]; message: string }`
  - `signaturePolicy = "verified" | "absent"` at the protocol boundary.
  - No accepted mission may contain an unchecked non-empty `signature`.

- [ ] **Step 1: Write failing protocol tests**

```ts
test("rejects legacy non-empty signatures until cryptographic verification exists", () => {
  const result = validateMission({
    ...validMission(),
    signature: "not-empty-but-not-verified",
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /signature_not_supported/);
});

test("rejects missions without typed operations", () => {
  const result = validateMission({
    ...validMission(),
    requestedOperation: { kind: "shell", command: "npm test" },
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /unsupported_operation/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm.cmd test -w @kaizen7/bridge-protocol -- test/operation-contract.test.ts`

Expected: FAIL because the protocol still allows the legacy shape.

- [ ] **Step 3: Remove unchecked signature acceptance or add real verification boundary**

For this checkpoint choose one safe policy:

```ts
if ("signature" in mission && typeof mission.signature === "string" && mission.signature.length > 0) {
  errors.push("signature_not_supported");
}
```

Do not keep a field that is merely "not empty" as a security signal.

- [ ] **Step 4: Replace forbidden-word authorization with typed allowlists**

```ts
const allowedOperationsByAuthority = {
  0: new Set(["repo.status"]),
  1: new Set(["repo.status", "tests.run"]),
  2: new Set(["git.commit"]),
  3: new Set([]),
} as const;
```

Reject unsupported operation kinds before inspecting human text.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm.cmd test -w @kaizen7/bridge-protocol -- test/operation-contract.test.ts
npm.cmd test -w @kaizen7/bridge-gateway -- test/typed-operations.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run bridge gates**

Run:

```bash
npm.cmd run bridge:typecheck
npm.cmd run bridge:test
npm.cmd run bridge:verify
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/bridge-protocol/src/types.ts packages/bridge-protocol/src/validate.ts packages/bridge-protocol/test/operation-contract.test.ts apps/bridge-gateway/src/authority.ts apps/bridge-gateway/test/typed-operations.test.ts
git commit -m "fix: enforce typed bridge operations"
```

---

### Task 5: Gateway Integration And Clean Install Gate

**Files:**
- Modify: `apps/bridge-gateway/src/index.ts`
- Modify: `apps/bridge-gateway/src/action-gateway.ts`
- Modify: `apps/bridge-gateway/test/action-bridge.e2e.test.ts`
- Create: `apps/bridge-gateway/test/package-lock-clean-install.test.ts`
- Modify: `scripts/run-bridge-typechecks.js`
- Modify: `scripts/verify-bridge-layout.js`
- Modify: `.github/workflows/*` only if an existing workflow already owns checks for this branch.

**Interfaces:**
- Consumes: `Kaizen7Mailbox`, `MissionStore`, typed operations and credential-bound device principals.
- Produces:
  - Gateway factory that can use in-memory store for tests and Durable Object mailbox for Cloudflare runtime.
  - CI/local gate proving clean install, lockfile integrity and full suite before merge.

- [ ] **Step 1: Write failing integration test for runtime routing**

```ts
test("gateway routes production mission state through Durable Object mailbox binding", async () => {
  const response = await exports.default.fetch("https://example.test/v1/status", {
    headers: { authorization: "Bearer action-token" },
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.store.kind, "durable_object_mailbox");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd run test:do -w @kaizen7/bridge-gateway -- test/action-bridge.e2e.test.ts`

Expected: FAIL because the Worker entrypoint still uses an in-memory proof store.

- [ ] **Step 3: Implement runtime mailbox adapter**

Use the Worker env binding to select the mailbox by deterministic installation/workspace name:

```ts
const mailbox = env.KAIZEN7_MAILBOX.getByName(env.KAIZEN7_INSTALLATION_ID);
```

The name must be stable for Luciano's installation and must not contain secret values.

- [ ] **Step 4: Write failing clean install/lockfile test**

```ts
test("package lock was produced by a clean install path", () => {
  const lock = JSON.parse(readFileSync(new URL("../../../package-lock.json", import.meta.url), "utf8"));
  assert.equal(lock.lockfileVersion >= 3, true);
  assert.ok(lock.packages["apps/bridge-gateway"]);
  assert.ok(lock.packages["apps/bridge-gateway"].devDependencies["@cloudflare/vitest-pool-workers"]);
});
```

- [ ] **Step 5: Run test to verify it fails or proves current lockfile**

Run: `npm.cmd test -w @kaizen7/bridge-gateway -- test/package-lock-clean-install.test.ts`

Expected: FAIL until the dependency and lockfile update are intentional and reviewed.

- [ ] **Step 6: Prove clean dependency installation**

Use an empty temp copy, not the working repository, and do not run package scripts:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd install --package-lock-only --ignore-scripts --no-audit --no-fund
```

Expected: `package-lock.json` remains stable after `npm ci` and lockfile regeneration.

- [ ] **Step 7: Run full verification suite**

Run:

```bash
npm.cmd run bridge:typecheck
npm.cmd run bridge:test
npm.cmd run bridge:verify
npm.cmd run k7:smoke
npm.cmd run k7:ready
npm.cmd run k7:check
```

Expected: PASS. Warnings about absent documented environment variables remain acceptable only if they are already documented as warnings, not blockers.

- [ ] **Step 8: Run bounded secret and artifact preflight**

Run a scan over `git diff --name-only origin/main...HEAD`.

Expected:

```text
PATH_PREFLIGHT_OK
SECRET_PREFLIGHT_OK
NO_RECOVERY_ARTIFACTS
```

- [ ] **Step 9: Commit**

```bash
git add apps/bridge-gateway/src/index.ts apps/bridge-gateway/src/action-gateway.ts apps/bridge-gateway/test/action-bridge.e2e.test.ts apps/bridge-gateway/test/package-lock-clean-install.test.ts scripts/run-bridge-typechecks.js scripts/verify-bridge-layout.js package-lock.json package.json apps/bridge-gateway/package.json
git commit -m "test: gate durable mailbox integration"
```

---

## Final Acceptance Gate Before PR

- [ ] `git log --oneline origin/main..HEAD` shows small reviewable commits.
- [ ] `git diff --name-only origin/main...HEAD` excludes ZIP, JSONL, raw sessions, secrets, env files and generated artifacts.
- [ ] `npm.cmd ci --ignore-scripts --no-audit --no-fund` succeeds in a clean temp copy.
- [ ] `npm.cmd run bridge:typecheck` passes.
- [ ] `npm.cmd run bridge:test` passes.
- [ ] `npm.cmd run bridge:verify` passes.
- [ ] `npm.cmd run k7:check` passes.
- [ ] Durable Object tests prove persistence across eviction.
- [ ] Device credential A cannot claim or complete device B missions.
- [ ] Receipt writes require the current lease ID and bound device ID.
- [ ] Mission `signature` is either cryptographically verified or rejected/absent.
- [ ] Free-text forbidden-word checks are not the security boundary.
- [ ] OpenAPI still documents only the GPT Action surface.
- [ ] Device polling internals remain undocumented in public GPT Actions.
- [ ] No Cloudflare deploy, resource mutation, production secret, PR or merge occurs without a later exact approval.

## Self-Review

- Coverage: the plan maps all five review blockers to specific tests and tasks.
- TDD: every behavior-changing task starts with a failing test and expected failure.
- Durable Objects: uses one mailbox per installation/workspace, SQLite storage, deterministic binding lookup and eviction testing.
- Security: credential binding, lease checks, typed operations and signature policy are explicit gates.
- Lockfile: clean install and full-suite proof are required before merge.
- Scope: no deploy, no secrets, no D1/R2/Queues, no recovery artifacts, no PR/merge.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-28-kaizen7-durable-object-mailbox-tdd.md`.

Two execution options:

1. Subagent-Driven (recommended) - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. Inline Execution - execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Recommended first checkpoint: Task 1 only, local commit only, no push until review.
