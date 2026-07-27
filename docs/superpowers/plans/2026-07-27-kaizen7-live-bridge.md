# KAIZEN7 Live Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, resumable and authority-gated real-time bridge from ChatGPT Work through Cloudflare to Codex on Luciano's mini PC.

**Architecture:** A Cloudflare Worker exposes five typed Remote MCP tools and routes missions to one device-scoped Durable Object. A TypeScript local client opens an outbound authenticated channel, validates every mission locally, controls Codex through an injected controller backed by the official Codex SDK/app-server, and returns ordered events and compact receipts. GitHub remains the durable fallback and engineering receipt store.

**Tech Stack:** Existing KAIZEN7 CommonJS/Node kernel; isolated npm workspaces using Node 22, TypeScript, `node:test`, Cloudflare Workers, Durable Objects, Streamable HTTP MCP, the official Codex SDK/app-server, Windows Credential Manager and GitHub.

**Verified platform choices (official docs checked 2026-07-27):** use Cloudflare `McpAgent` for the authenticated stateful MCP session, a separate `DeviceSession` Durable Object for the mini-PC lease/mission queue, Streamable HTTP at `/mcp`, and OAuth 2.1 via `@cloudflare/workers-oauth-provider`. Use GitHub OAuth and allow only GitHub login `lucianople7`; never deploy an authless intermediate. Required gateway packages are `agents`, `@modelcontextprotocol/sdk`, `zod`, `@cloudflare/workers-oauth-provider`, `wrangler` and `@cloudflare/workers-types`. Pin the exact versions resolved during implementation in `package-lock.json`.

## Global Constraints

- Work from current `main` in a clean dedicated worktree and branch `agent/kaizen7-live-bridge`.
- Read `AGENTS.md`, `KAIZEN7_CONTEXT.md`, the approved design and this plan before editing.
- Keep the existing root CommonJS kernel operational; bridge workspaces must not require converting legacy files to ESM or TypeScript.
- Do not delete or replace `lib/codex-bridge.js` or `tests/codex-bridge.test.js` in this implementation.
- Use Node 22 for the two Bridge applications and Bridge packages; leave the root kernel floor unchanged until a separate migration is approved.
- Do not add Redis, N8N, Supabase, Buzz, a paid API or a fourth active repository.
- Do not expose Codex app-server on a public listener. Use loopback or child-process transport only.
- The local client must initiate every network connection.
- Do not accept a raw shell command, raw path or arbitrary environment map through MCP.
- Initial production allowlist contains only `kaizen7`, `thefocux-platform` and `flowmatik-studio`.
- Levels 2 and 3 remain disabled. No push, PR creation, product deployment, publish, spend, credential mutation, merge or delete is allowed.
- Cloudflare Bridge gateway deployment is a separate exact-action approval gate during Task 8.
- Never read, upload or commit raw Codex sessions, private transcripts, credentials or the recovery ZIP.
- Keep provider credentials in Cloudflare encrypted secrets and Windows Credential Manager; never pass secrets in command arguments.
- Use test-first RED → GREEN cycles and commit after each task.
- Run `npm run k7:check` before the final PR. Preserve the existing reported readiness contract.

---

## File map

### Root integration

- `package.json`: add npm workspace declarations and Bridge-only scripts without reordering or removing legacy checks.
- `.nvmrc`: pin Bridge development to Node 22.
- `AGENTS.md`: after end-to-end verification, change the mission route to Live Bridge primary and GitHub fallback.
- `scripts/verify-bridge-layout.js`: fail-closed structural/runtime verifier.
- `tests/bridge-layout.test.js`: root regression for isolation from the legacy kernel.

### Protocol package

- `packages/bridge-protocol/package.json`: isolated TypeScript package.
- `packages/bridge-protocol/tsconfig.json`: strict compilation.
- `packages/bridge-protocol/src/types.ts`: versioned mission, event, approval and receipt types.
- `packages/bridge-protocol/src/validate.ts`: schema validation and canonical action digest.
- `packages/bridge-protocol/src/index.ts`: public exports only.
- `packages/bridge-protocol/test/protocol.test.ts`: malformed, replay and version tests.

### Authority package

- `packages/authority/package.json`
- `packages/authority/tsconfig.json`
- `packages/authority/src/policy.ts`: Levels 0–3 and disabled-level decisions.
- `packages/authority/src/paths.ts`: canonical repository-to-path validation.
- `packages/authority/src/redact.ts`: secret and private-artifact redaction.
- `packages/authority/src/index.ts`
- `packages/authority/test/authority.test.ts`
- `packages/authority/test/paths.test.ts`
- `packages/authority/test/redact.test.ts`

### Gateway application

- `apps/bridge-gateway/package.json`
- `apps/bridge-gateway/tsconfig.json`
- `apps/bridge-gateway/wrangler.jsonc`
- `apps/bridge-gateway/src/env.ts`: typed bindings.
- `apps/bridge-gateway/src/device-session.ts`: Durable Object mission state machine.
- `apps/bridge-gateway/src/mcp-tools.ts`: the five typed tool handlers.
- `apps/bridge-gateway/src/index.ts`: authenticated Worker routing only.
- `apps/bridge-gateway/test/device-session.test.ts`
- `apps/bridge-gateway/test/mcp-tools.test.ts`
- `apps/bridge-gateway/test/worker.test.ts`

### Local application

- `apps/local-bridge/package.json`
- `apps/local-bridge/tsconfig.json`
- `apps/local-bridge/src/config.ts`: production/test profiles and exact path mapping.
- `apps/local-bridge/src/credential-store.ts`: Windows Credential Manager interface and injected fake.
- `apps/local-bridge/src/connection.ts`: outbound session, heartbeat and reconnect.
- `apps/local-bridge/src/codex-controller.ts`: injected controller contract.
- `apps/local-bridge/src/codex-app-server.ts`: official Codex SDK/app-server adapter.
- `apps/local-bridge/src/mission-runner.ts`: claim, local validation, event streaming and safe stop.
- `apps/local-bridge/src/receipt-store.ts`: compact append-only receipts.
- `apps/local-bridge/src/index.ts`: process entry point.
- `apps/local-bridge/test/*.test.ts`: config, connection, mission, Codex and receipt tests.
- `apps/local-bridge/scripts/install-startup.ps1`: explicit Windows login-task installer with `-WhatIf`.
- `apps/local-bridge/scripts/remove-startup.ps1`: matching reversible uninstaller.

### Operations

- `docs/control-room/BRIDGE_BOOTSTRAP.md`: local prerequisites, pairing and manual launch.
- `docs/control-room/BRIDGE_RUNBOOK.md`: status, pause, revoke, reconnect and rollback.
- `docs/control-room/BRIDGE_RECEIPT.md`: compact receipt contract.

---

### Task 1: Establish the isolated Bridge workspace contract

**Files:**
- Create: `.nvmrc`
- Create: `scripts/verify-bridge-layout.js`
- Create: `tests/bridge-layout.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing root CommonJS package and `npm run k7:check`.
- Produces: npm workspaces `apps/*` and `packages/*`, plus `npm run bridge:verify`.

- [ ] **Step 1: Create the execution worktree**

```powershell
git fetch origin
git switch main
git pull --ff-only
git worktree add ..\kaizen7-live-bridge -b agent/kaizen7-live-bridge main
Set-Location ..\kaizen7-live-bridge
git status --short --branch
```

Expected: branch `agent/kaizen7-live-bridge`, clean worktree.

- [ ] **Step 2: Record the baseline without editing**

```powershell
node --version
npm --version
npm run k7:smoke
npm run k7:ready
git status --short
```

Expected: capture exact results in the task receipt. Stop if smoke/readiness is not green; do not hide a pre-existing failure.

- [ ] **Step 3: Write the failing layout test**

```js
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const result = spawnSync(process.execPath, ["scripts/verify-bridge-layout.js"], {
  cwd: process.cwd(),
  encoding: "utf8",
});

assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /KAIZEN7 Live Bridge layout: valid/);
console.log("bridge layout tests passed");
```

- [ ] **Step 4: Run RED**

```powershell
node tests/bridge-layout.test.js
```

Expected: FAIL because `scripts/verify-bridge-layout.js` does not exist.

- [ ] **Step 5: Add the minimal workspace declaration and verifier**

Add to root `package.json` without changing existing scripts:

```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "bridge:verify": "node scripts/verify-bridge-layout.js",
    "bridge:test": "npm run test --workspaces --if-present",
    "bridge:typecheck": "npm run typecheck --workspaces --if-present"
  }
}
```

Create `.nvmrc`:

```text
22
```

`verify-bridge-layout.js` must assert that the four workspace directories exist, each has a package manifest, local-bridge requires Node 22, and the root remains CommonJS. It must exit `1` with one exact missing path on failure and print the success line on pass.

- [ ] **Step 6: Create minimal manifests for the four workspaces**

Each manifest must be `private: true`, declare Node `>=22 <23`, expose `typecheck` and `test`, and contain no runtime dependency yet. Use names:

```text
@kaizen7/bridge-protocol
@kaizen7/authority
@kaizen7/bridge-gateway
@kaizen7/local-bridge
```

Use this exact initial manifest shape, substituting only the package name:

```json
{
  "name": "@kaizen7/bridge-protocol",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22 <23" },
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "tsx --test test/**/*.test.ts"
  },
  "devDependencies": {
    "tsx": "latest",
    "typescript": "latest"
  }
}
```

- [ ] **Step 7: Run GREEN and regression**

```powershell
npm install --package-lock-only
node tests/bridge-layout.test.js
npm run bridge:verify
npm run k7:smoke
npm run k7:ready
git diff --check
```

- [ ] **Step 8: Commit**

```powershell
git add .nvmrc package.json package-lock.json scripts/verify-bridge-layout.js tests/bridge-layout.test.js apps packages
git commit -m "Add isolated Live Bridge workspace contract"
```

### Task 2: Implement the versioned Bridge protocol

**Files:**
- Create: `packages/bridge-protocol/tsconfig.json`
- Create: `packages/bridge-protocol/src/types.ts`
- Create: `packages/bridge-protocol/src/validate.ts`
- Create: `packages/bridge-protocol/src/index.ts`
- Create: `packages/bridge-protocol/test/protocol.test.ts`
- Modify: `packages/bridge-protocol/package.json`

**Interfaces:**
- Produces: `validateMission`, `validateEvent`, `validateApproval`, `validateReceipt`, `digestAction`, `BRIDGE_PROTOCOL_VERSION`.
- Return shape: `{ ok: true, value } | { ok: false, errors: string[] }`.

- [ ] **Step 1: Write failing contract tests**

Tests must prove:

```ts
assert.equal(validateMission({}).ok, false)
assert.equal(validateMission(validMission).ok, true)
assert.equal(validateMission({ ...validMission, protocol: "kaizen7.bridge.v2" }).ok, false)
assert.equal(validateApproval({ ...validApproval, actionDigest: "wrong" }, exactAction).ok, false)
assert.equal(digestAction(exactAction), digestAction({ ...exactAction }))
assert.equal(validateReceipt({ ...validReceipt, secret: "forbidden" }).ok, false)
```

Use fixed UTC timestamps and deterministic IDs. Valid mission fields must exactly match the approved design.

- [ ] **Step 2: Run RED**

```powershell
npm test -w @kaizen7/bridge-protocol
```

Expected: FAIL because public exports do not exist.

- [ ] **Step 3: Implement strict types and validators**

Use discriminated event status literals and reject unknown top-level fields. Define:

```ts
export const BRIDGE_PROTOCOL_VERSION = "kaizen7.bridge.v1" as const
export type AuthorityLevel = 0 | 1 | 2 | 3
export type RepositoryId = "kaizen7" | "thefocux-platform" | "flowmatik-studio"
export type MissionStatus =
  | "accepted" | "started" | "progress" | "approval_required"
  | "approval_resolved" | "verification" | "blocked" | "failed"
  | "cancelled" | "completed"
```

`digestAction` must canonicalize sorted object keys and return SHA-256 hex. Approval validation must compare the digest, mission ID, expiry and single-use identifier.

- [ ] **Step 4: Run GREEN**

```powershell
npm run typecheck -w @kaizen7/bridge-protocol
npm test -w @kaizen7/bridge-protocol
```

- [ ] **Step 5: Add negative replay and sequence tests**

Prove sequence numbers are positive integers, terminal receipts use only terminal statuses, expired approvals fail under an injected clock, and private payload keys (`secret`, `token`, `rawTranscript`, `recoveryZip`) are rejected recursively.

- [ ] **Step 6: Verify and commit**

```powershell
npm run bridge:typecheck
npm run bridge:test
git diff --check
git add packages/bridge-protocol package-lock.json
git commit -m "Add versioned Live Bridge protocol"
```

### Task 3: Implement local authority, path confinement and redaction

**Files:**
- Create: `packages/authority/tsconfig.json`
- Create: `packages/authority/src/policy.ts`
- Create: `packages/authority/src/paths.ts`
- Create: `packages/authority/src/redact.ts`
- Create: `packages/authority/src/index.ts`
- Create: `packages/authority/test/authority.test.ts`
- Create: `packages/authority/test/paths.test.ts`
- Create: `packages/authority/test/redact.test.ts`
- Modify: `packages/authority/package.json`

**Interfaces:**
- Consumes: `AuthorityLevel`, `Mission`, `RepositoryId` from protocol.
- Produces: `authorizeMission`, `authorizeAction`, `resolveRepositoryPath`, `redactEventPayload`.

- [ ] **Step 1: Write authority RED tests**

Prove:

```ts
assert.deepEqual(authorizeMission(level0Mission), { allowed: true, approvalRequired: false })
assert.deepEqual(authorizeMission(level1Mission), { allowed: false, approvalRequired: true })
assert.equal(authorizeAction({ kind: "push", level: 1 }).allowed, false)
assert.equal(authorizeAction({ kind: "delete", level: 1 }).allowed, false)
assert.equal(authorizeAction({ kind: "read_git_status", level: 0 }).allowed, true)
```

Levels 2 and 3 must return `disabled_in_mvp` even when an approval object is supplied.

- [ ] **Step 2: Write path-confinement RED tests**

Use temporary real directories. Cover normal child paths, `..`, drive/user roots, missing paths, repository mismatch and a junction/symlink escaping the allowed root. Expected result for every escape is `{ ok: false, reason: "outside_allowlist" }`.

- [ ] **Step 3: Write redaction RED tests**

Use values resembling bearer tokens, GitHub tokens, OpenAI keys, Windows paths to the recovery ZIP and raw transcript keys. Assert the result contains `[REDACTED]` and never contains the original value.

- [ ] **Step 4: Implement minimal policy**

The action allowlist for MVP is explicit:

```ts
const LEVEL_ZERO = new Set(["read_git_status", "read_versions", "list_repo_files", "read_diagnostics"])
const LEVEL_ONE = new Set(["create_branch", "edit_workspace", "run_tests", "create_local_commit"])
const DISABLED = new Set(["push", "create_pr", "deploy", "publish", "spend", "credential_write", "merge", "delete"])
```

Unknown actions are denied. No heuristic may turn an unknown action into Level 0 or 1.

- [ ] **Step 5: Implement canonical path validation**

Resolve both repository root and target with filesystem real paths. Reject before file access when either cannot be resolved. Compare path components case-insensitively on Windows and case-sensitively elsewhere. Reject symlink/junction escapes after realpath resolution.

- [ ] **Step 6: Implement recursive redaction**

Redact by key and value pattern. Return a new object; never mutate the original event. Limit depth, string length and array length to prevent log amplification.

- [ ] **Step 7: Run GREEN and commit**

```powershell
npm run typecheck -w @kaizen7/authority
npm test -w @kaizen7/authority
npm run bridge:test
git diff --check
git add packages/authority package-lock.json
git commit -m "Enforce Live Bridge local authority"
```

### Task 4: Implement the durable mission state machine

**Files:**
- Create: `apps/bridge-gateway/tsconfig.json`
- Create: `apps/bridge-gateway/src/env.ts`
- Create: `apps/bridge-gateway/src/device-session.ts`
- Create: `apps/bridge-gateway/test/device-session.test.ts`
- Modify: `apps/bridge-gateway/package.json`

**Interfaces:**
- Consumes: validated protocol objects.
- Produces: `DeviceSessionCore` with `pair`, `heartbeat`, `enqueue`, `claim`, `appendEvent`, `approve`, `pause`, `resume`, `getStatus`.

- [ ] **Step 1: Write state-machine RED tests**

Use in-memory injected storage and clock. Prove:

- one mission is claimed by one current lease;
- a duplicate idempotency key returns the existing mission;
- events must be appended in exact sequence;
- a stale lease cannot append;
- pause prevents a new claim;
- reconnect with the same live device resumes instead of duplicating;
- an offline mission remains pending until expiry;
- an expired mission becomes blocked without execution;
- normalized operational events older than thirty days are removed while the compact terminal receipt remains.

- [ ] **Step 2: Run RED**

```powershell
npm test -w @kaizen7/bridge-gateway -- device-session
```

- [ ] **Step 3: Implement `DeviceSessionCore` independent of Cloudflare globals**

Use injected `Storage`, `Clock` and `IdGenerator` interfaces so every transition is deterministic. Persist mission record before returning acceptance. Store only normalized events and compact terminal state. Implement retention cleanup using the injected clock: normalized event payloads expire after thirty days; terminal receipt metadata and idempotency outcome remain.

- [ ] **Step 4: Run GREEN and add restart test**

Recreate `DeviceSessionCore` over the same fake storage and prove mission/lease/sequence state survives construction.

- [ ] **Step 5: Commit**

```powershell
npm run typecheck -w @kaizen7/bridge-gateway
npm test -w @kaizen7/bridge-gateway
git add apps/bridge-gateway package-lock.json
git commit -m "Add durable Bridge mission state machine"
```

### Task 5: Expose the five typed MCP tools without local execution

**Files:**
- Create: `apps/bridge-gateway/src/mcp-tools.ts`
- Create: `apps/bridge-gateway/src/index.ts`
- Create: `apps/bridge-gateway/test/mcp-tools.test.ts`
- Create: `apps/bridge-gateway/test/worker.test.ts`
- Create: `apps/bridge-gateway/wrangler.jsonc`
- Modify: `apps/bridge-gateway/package.json`

**Interfaces:**
- Produces exactly: `bridge_status`, `inspect_workspace`, `start_mission`, `approve_action`, `pause_bridge`.
- Tool handlers call a `DeviceSessionPort`; they never invoke shell, Git or Codex.

- [ ] **Step 1: Confirm and install the verified gateway stack**

Read the current Cloudflare Remote MCP, transport and OAuth instructions before editing. The chosen design is stateful `McpAgent` + separate `DeviceSession` Durable Object + Streamable HTTP + GitHub OAuth. Install the official packages and record the exact resolved versions:

```powershell
npm install -w @kaizen7/bridge-gateway agents @modelcontextprotocol/sdk zod @cloudflare/workers-oauth-provider
npm install -D -w @kaizen7/bridge-gateway wrangler @cloudflare/workers-types
npm ls -w @kaizen7/bridge-gateway agents @modelcontextprotocol/sdk zod @cloudflare/workers-oauth-provider wrangler @cloudflare/workers-types
```

Stop if current official documentation has removed or superseded any selected API; update the plan/spec before substituting architecture. Do not copy or deploy an authless demo.

- [ ] **Step 2: Write MCP surface RED tests**

Assert `tools/list` exposes exactly the five approved names. For each tool, assert unknown keys, free-form paths, raw commands and environment maps are rejected before `DeviceSessionPort` is called.

- [ ] **Step 3: Write Worker route RED tests**

Prove:

- unauthenticated `/mcp` returns 401;
- an authenticated but wrong GitHub login returns 403;
- unsupported content type returns 415;
- unauthenticated `/device/connect` returns 401;
- a wrong or revoked device credential returns 403;
- `/healthz` returns only service/version/readiness, no device details;
- no route exposes the Durable Object directly.

- [ ] **Step 4: Implement tool handlers and the two authenticated routes**

`/mcp` is Streamable HTTP behind OAuth 2.1 and allows only GitHub login `lucianople7`. `inspect_workspace` accepts only `{ repository: RepositoryId }`. `start_mission` accepts the validated mission input without `signature`, which the gateway adds after authentication. `approve_action` accepts `{ missionId, actionId, actionDigest, decision }`. `pause_bridge` accepts `{ paused: boolean }`.

`/device/connect` upgrades only an outbound mini-PC request carrying the device credential in the authorization header. The Worker validates the credential verifier before attaching the connection to the single `DeviceSession` Durable Object. It never accepts a device ID or Durable Object name chosen by the caller.

- [ ] **Step 5: Configure one Durable Object binding**

Use binding name `DEVICE_SESSIONS` and class `DeviceSession`. Keep all environment names in `env.ts`. `wrangler.jsonc` must contain no account IDs, tokens or secrets.

- [ ] **Step 6: Run GREEN locally**

```powershell
npm run typecheck -w @kaizen7/bridge-gateway
npm test -w @kaizen7/bridge-gateway
npx wrangler deploy --dry-run --config apps/bridge-gateway/wrangler.jsonc
```

No real deployment is authorized in this task.

- [ ] **Step 7: Commit**

```powershell
git add apps/bridge-gateway package-lock.json
git commit -m "Expose private Live Bridge MCP tools"
```

### Task 6: Implement the local outbound client and receipt store

**Files:**
- Create: `apps/local-bridge/tsconfig.json`
- Create: `apps/local-bridge/src/config.ts`
- Create: `apps/local-bridge/src/credential-store.ts`
- Create: `apps/local-bridge/src/connection.ts`
- Create: `apps/local-bridge/src/receipt-store.ts`
- Create: `apps/local-bridge/test/config.test.ts`
- Create: `apps/local-bridge/test/connection.test.ts`
- Create: `apps/local-bridge/test/receipt-store.test.ts`
- Modify: `apps/local-bridge/package.json`

**Interfaces:**
- Produces: `loadBridgeConfig`, `CredentialStore`, `GatewayConnection`, `ReceiptStore`.
- `GatewayConnection` emits validated mission/control messages and accepts normalized events.

- [ ] **Step 1: Write config RED tests**

Production config must resolve exactly the three repository IDs. Reject duplicate real paths, missing repositories, broad roots, relative paths and a production/test profile collision. Test profile accepts exactly one disposable repository and marks every receipt `profile: "test"`.

- [ ] **Step 2: Write connection RED tests**

With a fake transport and clock, prove authenticated hello, heartbeat, exponential reconnect with jitter, mission acknowledgement, ordered event delivery and safe stop after lease loss. Verify the client never opens a listener.

- [ ] **Step 3: Write receipt RED tests**

Prove append-only JSONL, terminal status validation, redaction before disk write, bounded record size and refusal to write outside the configured receipt directory.

- [ ] **Step 4: Implement configuration and injected credential store**

`CredentialStore` exposes only `getDeviceCredential()` and `deleteDeviceCredential()`. Tests use an in-memory implementation. The Windows implementation reads one generic credential target named `KAIZEN7_LIVE_BRIDGE_DEVICE`; it never prints the value.

- [ ] **Step 5: Implement outbound connection**

Use TLS only outside tests. Authenticate in the connection header, not URL or command arguments. Heartbeat interval: 15 seconds. Consider device offline after 45 seconds without a valid heartbeat. Cap reconnect at 30 seconds and stop retrying after credential revocation.

- [ ] **Step 6: Implement receipt store**

Default receipt location is a `.kaizen7/bridge-receipts` directory inside the selected repository for repository work, ignored by Git. Non-repository operational receipts go under the local Bridge data directory. Never store full prompts or event deltas.

- [ ] **Step 7: Run GREEN and commit**

```powershell
npm run typecheck -w @kaizen7/local-bridge
npm test -w @kaizen7/local-bridge
npm run bridge:test
git diff --check
git add apps/local-bridge package-lock.json .gitignore
git commit -m "Add outbound Live Bridge client"
```

### Task 7: Integrate Codex app-server behind an injected controller

**Files:**
- Create: `apps/local-bridge/src/codex-controller.ts`
- Create: `apps/local-bridge/src/codex-app-server.ts`
- Create: `apps/local-bridge/src/mission-runner.ts`
- Create: `apps/local-bridge/src/index.ts`
- Create: `apps/local-bridge/test/codex-app-server.test.ts`
- Create: `apps/local-bridge/test/mission-runner.test.ts`
- Modify: `apps/local-bridge/package.json`

**Interfaces:**
- `CodexController.start(input): AsyncIterable<CodexEvent>`
- `CodexController.resume(threadId, input): AsyncIterable<CodexEvent>`
- `CodexController.interrupt(threadId): Promise<void>`
- `MissionRunner.run(mission, lease): Promise<TerminalReceipt>`

- [ ] **Step 1: Write controller RED tests against a fake app-server**

Prove initialize/initialized handshake, thread start, turn start, progress normalization, thread resume, approval event forwarding, completion and interruption. The fake must verify loopback/child-process transport and reject a public WebSocket URL.

- [ ] **Step 2: Write mission-runner RED tests**

Prove local revalidation happens before Codex starts; Level 1 requires mission approval; disabled action requests become `approval_required` then `blocked`; lease loss interrupts; verification failure returns failed receipt; duplicate mission returns the stored receipt.

- [ ] **Step 3: Install and pin the official Codex SDK**

```powershell
npm install -w @kaizen7/local-bridge @openai/codex-sdk
```

Record the exact installed version. Do not add an OpenAI API key. Use the existing local Codex/ChatGPT authentication supported by the SDK runtime.

- [ ] **Step 4: Implement the adapter**

Configure workspace-write only for Level 1 turns and read-only for Level 0. Set the mission repository path as `cwd`. Do not expose `danger-full-access`. Convert SDK/app-server items to the approved event kinds and apply redaction before transport.

- [ ] **Step 5: Implement mission runner**

The runner obtains execution ownership, invokes the controller, evaluates every requested action through local authority, streams ordered events, runs declared acceptance checks and writes one terminal receipt. It must stop on pause, lease loss, expiry or unsupported action.

- [ ] **Step 6: Run GREEN with fake Codex only**

```powershell
npm run typecheck -w @kaizen7/local-bridge
npm test -w @kaizen7/local-bridge
npm run bridge:test
```

No live Codex or network call is part of this step.

- [ ] **Step 7: Perform a read-only local Codex bootstrap check**

From a normal user PowerShell, resolve a user-executable Codex installation and run its version/help command. If the only executable is the protected WindowsApps binary and it returns `Access is denied`, stop and report the bootstrap blocker. Do not change ACLs or run as administrator.

- [ ] **Step 8: Commit**

```powershell
git add apps/local-bridge package-lock.json
git commit -m "Connect Live Bridge to Codex app-server"
```

### Task 8: Pair and deploy the private gateway

**Files:**
- Create: `docs/control-room/BRIDGE_BOOTSTRAP.md`
- Create: `docs/control-room/BRIDGE_RUNBOOK.md`
- Create: `docs/control-room/BRIDGE_RECEIPT.md`
- Modify: `apps/bridge-gateway/wrangler.jsonc` with the OAuth KV binding and production Worker configuration

**Interfaces:**
- Produces: one private MCP endpoint, one paired device identity and documented revocation.

- [ ] **Step 1: Run the complete pre-deploy gate**

```powershell
npm run bridge:typecheck
npm run bridge:test
npm run bridge:verify
npm run k7:smoke
npm run k7:ready
git diff --check
```

Stop on any failure.

- [ ] **Step 2: Request exact deployment approval**

Present the Cloudflare account/project, Worker name, route, Durable Object binding, authentication method, secrets to be created by name only, and rollback command. Do not deploy until Luciano approves that exact action.

- [ ] **Step 3: Create GitHub OAuth and Bridge secrets interactively**

Create one GitHub OAuth App named `KAIZEN7 Live Bridge` with the deployed Worker homepage and `/callback` authorization callback. Restrict the authorization handler to GitHub login `lucianople7`. Use `wrangler secret put` from a normal user terminal so values never enter chat, issues, command arguments or Git:

```powershell
npx wrangler secret put GITHUB_CLIENT_ID --config apps/bridge-gateway/wrangler.jsonc
npx wrangler secret put GITHUB_CLIENT_SECRET --config apps/bridge-gateway/wrangler.jsonc
npx wrangler secret put COOKIE_ENCRYPTION_KEY --config apps/bridge-gateway/wrangler.jsonc
npx wrangler secret put BRIDGE_SIGNING_KEY --config apps/bridge-gateway/wrangler.jsonc
npx wrangler secret put DEVICE_CREDENTIAL_SHA256 --config apps/bridge-gateway/wrangler.jsonc
```

Create OAuth KV namespace `OAUTH_KV`, add only its returned namespace ID to `wrangler.jsonc`, and never copy secret values into receipts.

- [ ] **Step 4: Deploy and inspect**

```powershell
npx wrangler deploy --config apps/bridge-gateway/wrangler.jsonc
npx wrangler deployments list --config apps/bridge-gateway/wrangler.jsonc
```

Record the actual deployment ID and endpoint. Verify unauthenticated MCP access is denied and `/healthz` exposes no device information.

- [ ] **Step 5: Pair the mini PC**

Generate a one-time pairing response, store the device credential in Windows Credential Manager, revoke the pairing code immediately and start the local Bridge manually. Do not configure startup yet.

- [ ] **Step 6: Verify heartbeat and pause**

Call `bridge_status`, confirm a fresh heartbeat, invoke `pause_bridge`, prove a new mission is rejected, then resume. Revoke and re-pair once to prove credential rotation.

- [ ] **Step 7: Write exact runbooks and commit**

Document commands using the actual Worker name and local repository paths, but never secret values. Include manual stop, credential revoke, route disable and GitHub fallback.

```powershell
git add docs/control-room apps/bridge-gateway/wrangler.jsonc
git commit -m "Document and pair private Live Bridge"
```

### Task 9: Connect the private ChatGPT Work plugin and run end-to-end gates

**Files:**
- Modify: `docs/control-room/BRIDGE_RUNBOOK.md` with the installed private-plugin identity and MCP URL; no speculative plugin-manifest files are committed.
- Create: `apps/local-bridge/test/e2e/read-only.e2e.ts`
- Create: `apps/local-bridge/test/e2e/reconnect.e2e.ts`
- Create: `apps/local-bridge/test/e2e/reversible-write.e2e.ts`
- Modify: `docs/control-room/BRIDGE_RUNBOOK.md`

**Interfaces:**
- Produces: five callable tools in this ChatGPT Work environment and verified end-to-end receipts.

- [ ] **Step 1: Build the private plugin from the deployed MCP endpoint**

Use the current OpenAI plugin/MCP workflow. Scope the plugin to Luciano and expose only the five approved tools. Do not request unrelated connectors or broader workspace permissions.

- [ ] **Step 2: Run the read-only smoke from this chat**

Invoke `bridge_status`, then `inspect_workspace({ repository: "kaizen7" })`. Verify the mini PC returns the actual repository path, branch, HEAD and clean/dirty state. The receipt must show Level 0 and no extra approval.

- [ ] **Step 3: Run thread continuity smoke**

Start a read-only mission asking Codex for the repository package name, retain its thread ID, and resume the same thread asking for the Node engine. Verify both answers come from the same thread and no file changes occur.

- [ ] **Step 4: Run disconnect/idempotency smoke**

Interrupt the network after mission acceptance, reconnect the client and resend the same idempotency key. Verify one execution and one terminal receipt.

- [ ] **Step 5: Run reversible-write smoke in test profile**

Create a disposable Git repository under a newly generated temporary directory, start the local Bridge exclusively in test profile, approve one Level 1 mission, create `bridge-smoke.txt`, verify it, remove the disposable directory through the test harness's scoped cleanup, and return to production profile. Never target one of the three production allowlisted repositories for this test.

- [ ] **Step 6: Prove critical blocking**

Request representative `push`, `deploy` and `delete` actions. Verify each returns `disabled_in_mvp` and no command is executed.

- [ ] **Step 7: Commit plugin metadata and tests**

```powershell
npm run bridge:typecheck
npm run bridge:test
git diff --check
git add apps/local-bridge/test/e2e docs/control-room/BRIDGE_RUNBOOK.md
git commit -m "Verify Live Bridge end to end"
```

### Task 10: Install reversible startup and make Live Bridge the primary route

**Files:**
- Create: `apps/local-bridge/scripts/install-startup.ps1`
- Create: `apps/local-bridge/scripts/remove-startup.ps1`
- Create: `apps/local-bridge/test/startup-script.test.ts`
- Modify: `AGENTS.md`
- Modify: `KAIZEN7_CONTEXT.md`
- Modify: `package.json`

**Interfaces:**
- Produces: user-login automatic startup, reversible removal and canonical Live Bridge routing guidance.

- [ ] **Step 1: Write startup-script RED tests**

Run both scripts with `-WhatIf`. Assert the install action uses the current user's resolved `node.exe`, the exact local-bridge entry point, working directory `C:\Users\lucia\OneDrive\Documentos\kaizen7`, no administrator elevation and task name `KAIZEN7 Live Bridge`. Assert removal targets only that exact task.

- [ ] **Step 2: Implement reversible PowerShell scripts**

The installer must fail if Node 22, the built entry point, credential or config is missing. It must register an at-logon task for the current user, not a system service. The uninstaller removes only the named task and preserves credentials, receipts and source files.

- [ ] **Step 3: Run manual restart test**

Install the task, sign out/restart only when Luciano approves, verify heartbeat returns within 60 seconds, pause/resume once, then run the uninstaller and verify the task disappears. Reinstall only after the test receipt is reviewed.

- [ ] **Step 4: Update the canonical route**

In `AGENTS.md`, replace the statement that direct real-time communication is unnecessary with:

```text
Primary: Luciano -> ChatGPT Work -> KAIZEN7 Live Bridge -> Codex local -> verified receipt.
Fallback: GitHub Issue -> Codex -> Pull Request -> ChatGPT review -> merge.
```

State that GitHub remains mandatory for code review, commits, PRs and durable engineering receipts. Do not change product ownership boundaries.

- [ ] **Step 5: Add root operator scripts**

Add without removing legacy commands:

```json
{
  "scripts": {
    "k7:bridge:local": "npm run start -w @kaizen7/local-bridge",
    "k7:bridge:status": "npm run status -w @kaizen7/local-bridge"
  }
}
```

- [ ] **Step 6: Run final verification**

```powershell
npm run bridge:typecheck
npm run bridge:test
npm run bridge:verify
npm run k7:check
git diff --check
git status --short
```

Also rerun from this chat:

```text
bridge_status
inspect_workspace(repository="kaizen7")
pause_bridge(paused=true)
start_mission(Level 0 inspection) -> must be rejected
pause_bridge(paused=false)
```

- [ ] **Step 7: Produce the final Mission Outcome Receipt**

Include exact commit, test commands/results, deployed gateway ID, paired device ID, plugin tool list, startup state, rollback steps, known limitations and confirmation that Levels 2/3 remain disabled.

- [ ] **Step 8: Commit and push the implementation branch**

This push is a Level 2 action and requires exact approval immediately before execution.

```powershell
git add AGENTS.md KAIZEN7_CONTEXT.md package.json package-lock.json apps/local-bridge/scripts apps/local-bridge/test/startup-script.test.ts docs/control-room
git commit -m "Make Live Bridge the primary KAIZEN7 route"
git push -u origin agent/kaizen7-live-bridge
```

Open a draft pull request linked to the Bridge mission. Do not merge.

## Final stop condition

Stop after the draft PR, verified live status and final receipt. Do not inventory, quarantine, move or delete mini-PC repositories in this plan. The cleanup inventory is the next separately authorized mission.
