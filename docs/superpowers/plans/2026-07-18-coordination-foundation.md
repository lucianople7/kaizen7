# KAIZEN7 Coordination Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the tested public/private coordination foundation that lets Work and Codex exchange versioned missions and verified receipts without placing private state in the public KAIZEN7 repository.

**Architecture:** The public repository owns validation, state-transition code, CLI adapters, schemas, tests, and sanitized documentation. Runtime state is resolved only through `K7_MEMORY_ROOT`, which must point outside the public checkout; a separate private `kaizen7-memory` repository owns mission snapshots and receipts. This plan deliberately excludes Graphify and Google Drive ingestion, which become independent plans after this foundation passes its dry run.

**Tech Stack:** Node.js 20+, CommonJS, built-in `node:fs`, `node:path`, and `node:assert/strict`; JSON Schema documents without a new validator dependency; existing `k7` CLI and direct Node test style.

## Global Constraints

- Keep `lucianople7/kaizen7` public and store no private mission, Drive identifier, credential, personal record, or unsanitized project content in it.
- Store operational state only in a separate private repository named `lucianople7/kaizen7-memory`.
- Never fall back from a missing `K7_MEMORY_ROOT` to a directory inside the public repository.
- One project may have at most one `in_progress` mission.
- Every state mutation must check mission `id` and integer `version`.
- Allowed states are `proposed`, `approved`, `in_progress`, `blocked`, `completed`, `verified`, and `cancelled`.
- Publishing, deployment, spending, deletion, production mutation, and credential access remain explicit approval gates.
- Add no production dependency for schema validation; implement the small v1 contract directly and keep JSON Schema files as portable interface documents.
- Use tests first, minimal patches, and one commit per task.
- Do not install Graphify or access Google Drive in this plan.

---

### Task 1: Enforce the Public/Private Path Boundary

**Files:**
- Create: `lib/coordination-paths.js`
- Create: `tests/coordination-paths.test.js`
- Modify: `.env.example`
- Modify: `.gitignore:40-58`

**Interfaces:**
- Consumes: `process.cwd()` and `process.env.K7_MEMORY_ROOT`.
- Produces: `resolveMemoryRoot(options) -> { status, publicRoot, memoryRoot }` and `assertPrivateMemoryRoot(publicRoot, memoryRoot) -> string`.

- [ ] **Step 1: Write the failing path-boundary test**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  assertPrivateMemoryRoot,
  resolveMemoryRoot,
} = require("../lib/coordination-paths");

const parent = fs.mkdtempSync(path.join(os.tmpdir(), "k7-coordination-paths-"));
const publicRoot = path.join(parent, "kaizen7");
const privateRoot = path.join(parent, "kaizen7-memory");
fs.mkdirSync(publicRoot);
fs.mkdirSync(privateRoot);

assert.equal(assertPrivateMemoryRoot(publicRoot, privateRoot), privateRoot);
assert.throws(
  () => assertPrivateMemoryRoot(publicRoot, path.join(publicRoot, "coordination")),
  /outside the public KAIZEN7 repository/,
);

assert.deepEqual(resolveMemoryRoot({ cwd: publicRoot, env: {} }), {
  status: "not_configured",
  publicRoot,
  memoryRoot: null,
});

const configured = resolveMemoryRoot({
  cwd: publicRoot,
  env: { K7_MEMORY_ROOT: "../kaizen7-memory" },
});
assert.equal(configured.status, "configured");
assert.equal(configured.memoryRoot, privateRoot);

console.log("coordination path tests passed");
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `node tests/coordination-paths.test.js`

Expected: FAIL with `Cannot find module '../lib/coordination-paths'`.

- [ ] **Step 3: Implement the minimal boundary module**

```js
const path = require("node:path");

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function assertPrivateMemoryRoot(publicRoot, memoryRoot) {
  const publicPath = path.resolve(publicRoot);
  const memoryPath = path.resolve(memoryRoot);
  if (isInside(publicPath, memoryPath)) {
    throw new Error("K7_MEMORY_ROOT must be outside the public KAIZEN7 repository.");
  }
  return memoryPath;
}

function resolveMemoryRoot(options = {}) {
  const publicRoot = path.resolve(options.cwd || process.cwd());
  const env = options.env || process.env;
  const configured = String(env.K7_MEMORY_ROOT || "").trim();
  if (!configured) {
    return { status: "not_configured", publicRoot, memoryRoot: null };
  }
  const memoryRoot = assertPrivateMemoryRoot(publicRoot, path.resolve(publicRoot, configured));
  return { status: "configured", publicRoot, memoryRoot };
}

module.exports = { assertPrivateMemoryRoot, isInside, resolveMemoryRoot };
```

- [ ] **Step 4: Add configuration and ignore rules**

Append to `.env.example`:

```dotenv
# Required for shared Work/Codex operational memory. Must resolve outside this public repository.
K7_MEMORY_ROOT=../kaizen7-memory
```

Append to `.gitignore`:

```gitignore
# Private coordination state and derived knowledge indexes never enter the public kernel.
coordination/
.kaizen7/
graphify-out/
derived/graphify/
```

- [ ] **Step 5: Run the focused test and syntax check**

Run: `node tests/coordination-paths.test.js && node --check lib/coordination-paths.js`

Expected: `coordination path tests passed`, exit code 0.

- [ ] **Step 6: Commit the boundary**

```bash
git add .env.example .gitignore lib/coordination-paths.js tests/coordination-paths.test.js
git commit -m "feat: enforce private coordination root"
```

---

### Task 2: Define and Validate Mission and Receipt Contracts

**Files:**
- Create: `schemas/coordination/mission.schema.json`
- Create: `schemas/coordination/receipt.schema.json`
- Create: `schemas/coordination/project.schema.json`
- Create: `schemas/coordination/focus.schema.json`
- Create: `lib/coordination-contracts.js`
- Create: `tests/coordination-contracts.test.js`

**Interfaces:**
- Consumes: plain JavaScript mission and receipt objects.
- Produces: `validateMission(value)`, `validateReceipt(value)`, and `assertTransition(from, to)`, each with stable v1 property names.

- [ ] **Step 1: Write the failing contract test**

```js
const assert = require("node:assert/strict");
const {
  MISSION_STATES,
  assertTransition,
  validateMission,
  validateReceipt,
} = require("../lib/coordination-contracts");

const mission = {
  schemaVersion: "1.0",
  id: "K7-20260718-001",
  version: 1,
  projectId: "kaizen7",
  repository: "lucianople7/kaizen7",
  title: "Build coordination contracts",
  goal: "Validate mission state before Codex edits files",
  why: "Work and Codex need one shared contract",
  route: "project-connectivity",
  priority: "P1",
  status: "approved",
  contextFiles: ["AGENTS.md"],
  constraints: ["No private state in the public repo"],
  acceptanceTests: ["node tests/coordination-contracts.test.js"],
  approvalGates: [],
  expectedOutput: ["Validated contract"],
  risks: [],
  createdBy: "work",
  createdAt: "2026-07-18T00:00:00.000Z",
  updatedAt: "2026-07-18T00:00:00.000Z",
  claimedBy: null,
  claimVersion: null,
  issueUrl: null,
  pullRequestUrl: null,
};

assert(MISSION_STATES.includes("in_progress"));
assert.deepEqual(validateMission(mission), { ok: true, errors: [] });
assert.equal(validateMission({ ...mission, version: 0 }).ok, false);
assert.equal(validateMission({ ...mission, acceptanceTests: [] }).ok, false);
assert.equal(assertTransition("approved", "in_progress"), true);
assert.throws(() => assertTransition("proposed", "verified"), /Invalid mission transition/);

const receipt = {
  schemaVersion: "1.0",
  missionId: mission.id,
  missionVersion: 1,
  status: "completed",
  agent: "codex",
  startedAt: "2026-07-18T00:00:00.000Z",
  finishedAt: "2026-07-18T00:10:00.000Z",
  summary: "Contracts implemented",
  changedResources: ["lib/coordination-contracts.js"],
  verification: [{ command: "node tests/coordination-contracts.test.js", result: "passed", evidence: "exit 0" }],
  decisions: [],
  risks: [],
  blockers: [],
  nextAction: "Wire contracts into the store",
  issueUrl: null,
  pullRequestUrl: null,
  memoryRecommendation: { required: false, target: null, summary: null },
};

assert.deepEqual(validateReceipt(receipt), { ok: true, errors: [] });
assert.equal(validateReceipt({ ...receipt, verification: [] }).ok, false);
console.log("coordination contract tests passed");
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `node tests/coordination-contracts.test.js`

Expected: FAIL with `Cannot find module '../lib/coordination-contracts'`.

- [ ] **Step 3: Implement the v1 validator and transition table**

```js
const MISSION_STATES = Object.freeze([
  "proposed", "approved", "in_progress", "blocked", "completed", "verified", "cancelled",
]);

const TRANSITIONS = Object.freeze({
  proposed: ["approved", "cancelled"],
  approved: ["in_progress", "cancelled"],
  in_progress: ["blocked", "completed", "cancelled"],
  blocked: ["in_progress", "cancelled"],
  completed: ["verified", "blocked"],
  verified: [],
  cancelled: [],
});

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

function validateMission(value) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, errors: ["mission must be an object"] };
  if (value.schemaVersion !== "1.0") errors.push("schemaVersion must equal 1.0");
  if (!/^K7-\d{8}-\d{3}$/.test(value.id || "")) errors.push("id must match K7-YYYYMMDD-NNN");
  if (!Number.isInteger(value.version) || value.version < 1) errors.push("version must be an integer >= 1");
  for (const key of ["projectId", "repository", "title", "goal", "why", "route", "priority", "createdBy", "createdAt", "updatedAt"]) {
    if (!nonEmpty(value[key])) errors.push(`${key} must be a non-empty string`);
  }
  if (!MISSION_STATES.includes(value.status)) errors.push("status is invalid");
  for (const key of ["contextFiles", "constraints", "acceptanceTests", "approvalGates", "expectedOutput", "risks"]) {
    if (!Array.isArray(value[key])) errors.push(`${key} must be an array`);
  }
  if (!nonEmptyArray(value.acceptanceTests)) errors.push("acceptanceTests must not be empty");
  return { ok: errors.length === 0, errors };
}

function validateReceipt(value) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, errors: ["receipt must be an object"] };
  if (value.schemaVersion !== "1.0") errors.push("schemaVersion must equal 1.0");
  if (!/^K7-\d{8}-\d{3}$/.test(value.missionId || "")) errors.push("missionId must match K7-YYYYMMDD-NNN");
  if (!Number.isInteger(value.missionVersion) || value.missionVersion < 1) errors.push("missionVersion must be an integer >= 1");
  if (!["completed", "blocked"].includes(value.status)) errors.push("status must be completed or blocked");
  for (const key of ["agent", "startedAt", "finishedAt", "summary", "nextAction"]) {
    if (!nonEmpty(value[key])) errors.push(`${key} must be a non-empty string`);
  }
  for (const key of ["changedResources", "verification", "decisions", "risks", "blockers"]) {
    if (!Array.isArray(value[key])) errors.push(`${key} must be an array`);
  }
  if (!nonEmptyArray(value.verification)) errors.push("verification must not be empty");
  if (Array.isArray(value.verification)) {
    value.verification.forEach((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) errors.push(`verification[${index}] must be an object`);
      else {
        if (!nonEmpty(item.command)) errors.push(`verification[${index}].command must be a non-empty string`);
        if (!["passed", "failed", "not_run"].includes(item.result)) errors.push(`verification[${index}].result is invalid`);
        if (!nonEmpty(item.evidence)) errors.push(`verification[${index}].evidence must be a non-empty string`);
      }
    });
  }
  if (!value.memoryRecommendation || typeof value.memoryRecommendation !== "object" || Array.isArray(value.memoryRecommendation)) {
    errors.push("memoryRecommendation must be an object");
  } else if (typeof value.memoryRecommendation.required !== "boolean") {
    errors.push("memoryRecommendation.required must be boolean");
  }
  return { ok: errors.length === 0, errors };
}

function assertTransition(from, to) {
  if (!(TRANSITIONS[from] || []).includes(to)) throw new Error(`Invalid mission transition: ${from} -> ${to}`);
  return true;
}

module.exports = { MISSION_STATES, TRANSITIONS, assertTransition, validateMission, validateReceipt };
```

- [ ] **Step 4: Add portable JSON Schema documents**

Create `mission.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kaizen7.dev/schemas/coordination/mission-v1.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "id", "version", "projectId", "repository", "title", "goal", "why", "route", "priority", "status", "contextFiles", "constraints", "acceptanceTests", "approvalGates", "expectedOutput", "risks", "createdBy", "createdAt", "updatedAt", "claimedBy", "claimVersion", "issueUrl", "pullRequestUrl"],
  "properties": {
    "schemaVersion": { "const": "1.0" },
    "id": { "type": "string", "pattern": "^K7-[0-9]{8}-[0-9]{3}$" },
    "version": { "type": "integer", "minimum": 1 },
    "projectId": { "type": "string", "minLength": 1 },
    "repository": { "type": "string", "minLength": 1 },
    "title": { "type": "string", "minLength": 1 },
    "goal": { "type": "string", "minLength": 1 },
    "why": { "type": "string", "minLength": 1 },
    "route": { "type": "string", "minLength": 1 },
    "priority": { "enum": ["P0", "P1", "P2", "P3"] },
    "status": { "enum": ["proposed", "approved", "in_progress", "blocked", "completed", "verified", "cancelled"] },
    "contextFiles": { "type": "array", "items": { "type": "string" } },
    "constraints": { "type": "array", "items": { "type": "string" } },
    "acceptanceTests": { "type": "array", "minItems": 1, "items": { "type": "string" } },
    "approvalGates": { "type": "array", "items": { "type": "string" } },
    "expectedOutput": { "type": "array", "items": { "type": "string" } },
    "risks": { "type": "array", "items": { "type": "string" } },
    "createdBy": { "type": "string", "minLength": 1 },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "claimedBy": { "type": ["string", "null"] },
    "claimVersion": { "type": ["integer", "null"], "minimum": 1 },
    "issueUrl": { "type": ["string", "null"] },
    "pullRequestUrl": { "type": ["string", "null"] }
  }
}
```

Create `receipt.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kaizen7.dev/schemas/coordination/receipt-v1.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "missionId", "missionVersion", "status", "agent", "startedAt", "finishedAt", "summary", "changedResources", "verification", "decisions", "risks", "blockers", "nextAction", "issueUrl", "pullRequestUrl", "memoryRecommendation"],
  "properties": {
    "schemaVersion": { "const": "1.0" },
    "missionId": { "type": "string", "pattern": "^K7-[0-9]{8}-[0-9]{3}$" },
    "missionVersion": { "type": "integer", "minimum": 1 },
    "status": { "enum": ["completed", "blocked"] },
    "agent": { "type": "string", "minLength": 1 },
    "startedAt": { "type": "string", "format": "date-time" },
    "finishedAt": { "type": "string", "format": "date-time" },
    "summary": { "type": "string", "minLength": 1 },
    "changedResources": { "type": "array", "items": { "type": "string" } },
    "verification": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["command", "result", "evidence"],
        "properties": {
          "command": { "type": "string", "minLength": 1 },
          "result": { "enum": ["passed", "failed", "not_run"] },
          "evidence": { "type": "string", "minLength": 1 }
        }
      }
    },
    "decisions": { "type": "array", "items": { "type": "string" } },
    "risks": { "type": "array", "items": { "type": "string" } },
    "blockers": { "type": "array", "items": { "type": "string" } },
    "nextAction": { "type": "string", "minLength": 1 },
    "issueUrl": { "type": ["string", "null"] },
    "pullRequestUrl": { "type": ["string", "null"] },
    "memoryRecommendation": {
      "type": "object",
      "additionalProperties": false,
      "required": ["required", "target", "summary"],
      "properties": {
        "required": { "type": "boolean" },
        "target": { "type": ["string", "null"] },
        "summary": { "type": ["string", "null"] }
      }
    }
  }
}
```

Create `project.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kaizen7.dev/schemas/coordination/project-v1.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "projectId", "repository", "purpose", "visibility", "status"],
  "properties": {
    "schemaVersion": { "const": "1.0" },
    "projectId": { "type": "string", "minLength": 1 },
    "repository": { "type": "string", "minLength": 1 },
    "purpose": { "type": "string", "minLength": 1 },
    "visibility": { "enum": ["public", "private"] },
    "status": { "enum": ["active", "paused", "archived"] }
  }
}
```

Create `focus.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://kaizen7.dev/schemas/coordination/focus-v1.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "version", "projectId", "missionId", "priority", "updatedAt", "updatedBy"],
  "properties": {
    "schemaVersion": { "const": "1.0" },
    "version": { "type": "integer", "minimum": 1 },
    "projectId": { "type": "string", "minLength": 1 },
    "missionId": { "type": ["string", "null"], "pattern": "^K7-[0-9]{8}-[0-9]{3}$" },
    "priority": { "enum": ["P0", "P1", "P2", "P3"] },
    "updatedAt": { "type": "string", "format": "date-time" },
    "updatedBy": { "type": "string", "minLength": 1 }
  }
}
```

- [ ] **Step 5: Extend the test to load all four schemas**

```js
const fs = require("node:fs");
const path = require("node:path");
for (const name of ["mission", "receipt", "project", "focus"]) {
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "schemas", "coordination", `${name}.schema.json`), "utf8"));
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.additionalProperties, false);
}
```

- [ ] **Step 6: Run the focused test and syntax checks**

Run: `node tests/coordination-contracts.test.js && node --check lib/coordination-contracts.js`

Expected: `coordination contract tests passed`, exit code 0.

- [ ] **Step 7: Commit the contracts**

```bash
git add schemas/coordination lib/coordination-contracts.js tests/coordination-contracts.test.js
git commit -m "feat: define coordination contracts"
```

---

### Task 3: Add Versioned Mission Claim and Closure Storage

**Files:**
- Create: `lib/coordination-store.js`
- Create: `tests/coordination-store.test.js`

**Interfaces:**
- Consumes: `memoryRoot`, a validated mission, agent id, expected version, and validated receipt.
- Produces: `readMission`, `writeMission`, `claimMission`, `closeMission`, and `getCoordinationStatus`.

- [ ] **Step 1: Write the failing store test**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { claimMission, closeMission, getCoordinationStatus, writeMission } = require("../lib/coordination-store");

const memoryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-coordination-store-"));
const mission = {
  schemaVersion: "1.0", id: "K7-20260718-001", version: 1, projectId: "kaizen7",
  repository: "lucianople7/kaizen7", title: "Store mission", goal: "Claim once",
  why: "Prevent conflicting agents", route: "project-connectivity", priority: "P1",
  status: "approved", contextFiles: ["AGENTS.md"], constraints: [],
  acceptanceTests: ["node tests/coordination-store.test.js"], approvalGates: [],
  expectedOutput: ["receipt"], risks: [], createdBy: "work",
  createdAt: "2026-07-18T00:00:00.000Z", updatedAt: "2026-07-18T00:00:00.000Z",
  claimedBy: null, claimVersion: null, issueUrl: null, pullRequestUrl: null,
};

writeMission(memoryRoot, mission);
const claimed = claimMission(memoryRoot, mission.id, { agent: "codex", expectedVersion: 1, now: "2026-07-18T00:01:00.000Z" });
assert.equal(claimed.status, "in_progress");
assert.equal(claimed.version, 2);
assert.equal(claimed.claimedBy, "codex");
assert.throws(() => claimMission(memoryRoot, mission.id, { agent: "work", expectedVersion: 1 }), /Stale mission version/);

const receipt = {
  schemaVersion: "1.0", missionId: mission.id, missionVersion: 2, status: "completed",
  agent: "codex", startedAt: "2026-07-18T00:01:00.000Z", finishedAt: "2026-07-18T00:05:00.000Z",
  summary: "Stored", changedResources: ["lib/coordination-store.js"],
  verification: [{ command: "node tests/coordination-store.test.js", result: "passed", evidence: "exit 0" }],
  decisions: [], risks: [], blockers: [], nextAction: "Review receipt", issueUrl: null,
  pullRequestUrl: null, memoryRecommendation: { required: false, target: null, summary: null },
};
const completed = closeMission(memoryRoot, mission.id, { receipt, expectedVersion: 2, now: "2026-07-18T00:05:00.000Z" });
assert.equal(completed.mission.status, "completed");
assert.equal(getCoordinationStatus(memoryRoot).active.length, 0);
assert.equal(getCoordinationStatus(memoryRoot).completed.length, 1);

const blockedMission = { ...mission, id: "K7-20260718-003", title: "Record blocked run", goal: "Prove failed work remains visible" };
writeMission(memoryRoot, blockedMission);
claimMission(memoryRoot, blockedMission.id, { agent: "codex", expectedVersion: 1, now: "2026-07-18T00:06:00.000Z" });
const blockedReceipt = {
  ...receipt,
  missionId: blockedMission.id,
  status: "blocked",
  summary: "Verification failed",
  verification: [{ command: "node tests/coordination-store.test.js", result: "failed", evidence: "exit 1" }],
  blockers: ["Test failure"],
  nextAction: "Repair test failure",
};
const blocked = closeMission(memoryRoot, blockedMission.id, { receipt: blockedReceipt, expectedVersion: 2, now: "2026-07-18T00:07:00.000Z" });
assert.equal(blocked.mission.status, "blocked");
assert.equal(getCoordinationStatus(memoryRoot).blocked.length, 1);
console.log("coordination store tests passed");
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `node tests/coordination-store.test.js`

Expected: FAIL with `Cannot find module '../lib/coordination-store'`.

- [ ] **Step 3: Implement atomic JSON storage and optimistic version checks**

```js
const fs = require("node:fs");
const path = require("node:path");
const { assertTransition, validateMission, validateReceipt } = require("./coordination-contracts");

function slash(value) { return String(value).replaceAll("\\", "/"); }
function inboxPath(root, id) { return path.join(root, "coordination", "inbox", `${id}.json`); }
function receiptPath(root, id) { return path.join(root, "coordination", "receipts", `${id}.json`); }

function writeJsonAtomic(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, target);
}

function readMission(root, id) {
  const target = inboxPath(root, id);
  if (!fs.existsSync(target)) throw new Error(`Mission not found: ${id}`);
  return JSON.parse(fs.readFileSync(target, "utf8"));
}

function writeMission(root, mission) {
  const validation = validateMission(mission);
  if (!validation.ok) throw new Error(`Invalid mission: ${validation.errors.join("; ")}`);
  writeJsonAtomic(inboxPath(root, mission.id), mission);
  return mission;
}

function requireVersion(mission, expectedVersion) {
  if (mission.version !== expectedVersion) throw new Error(`Stale mission version: expected ${expectedVersion}, found ${mission.version}`);
}

function claimMission(root, id, options = {}) {
  const mission = readMission(root, id);
  requireVersion(mission, options.expectedVersion);
  assertTransition(mission.status, "in_progress");
  const next = { ...mission, status: "in_progress", version: mission.version + 1, claimedBy: options.agent, claimVersion: mission.version + 1, updatedAt: options.now || new Date().toISOString() };
  return writeMission(root, next);
}

function closeMission(root, id, options = {}) {
  const mission = readMission(root, id);
  requireVersion(mission, options.expectedVersion);
  const validation = validateReceipt(options.receipt);
  if (!validation.ok) throw new Error(`Invalid receipt: ${validation.errors.join("; ")}`);
  if (options.receipt.missionId !== id || options.receipt.missionVersion !== mission.version) throw new Error("Receipt does not match the claimed mission version.");
  const targetStatus = options.receipt.status;
  assertTransition(mission.status, targetStatus);
  const next = { ...mission, status: targetStatus, version: mission.version + 1, updatedAt: options.now || new Date().toISOString() };
  writeJsonAtomic(receiptPath(root, id), options.receipt);
  writeMission(root, next);
  return { mission: next, receipt: options.receipt };
}

function getCoordinationStatus(root) {
  const directory = path.join(root, "coordination", "inbox");
  const missions = fs.existsSync(directory)
    ? fs.readdirSync(directory).filter((name) => name.endsWith(".json")).map((name) => JSON.parse(fs.readFileSync(path.join(directory, name), "utf8")))
    : [];
  return {
    schema: "kaizen7.coordination_status.v1",
    root: slash(root),
    active: missions.filter((mission) => mission.status === "in_progress"),
    blocked: missions.filter((mission) => mission.status === "blocked"),
    completed: missions.filter((mission) => ["completed", "verified"].includes(mission.status)),
    proposed: missions.filter((mission) => ["proposed", "approved"].includes(mission.status)),
  };
}

module.exports = { claimMission, closeMission, getCoordinationStatus, inboxPath, readMission, receiptPath, writeJsonAtomic, writeMission };
```

- [ ] **Step 4: Add the one-active-mission guard**

Before writing the claimed mission, call `getCoordinationStatus(root)` and reject when another mission for the same `projectId` is already `in_progress`:

```js
const conflict = getCoordinationStatus(root).active.find((item) => item.projectId === mission.projectId && item.id !== mission.id);
if (conflict) throw new Error(`Project already has an active mission: ${conflict.id}`);
```

Extend the test with a second approved mission for `projectId: "kaizen7"` and assert that claiming it throws `/already has an active mission/` before closing the first mission.

```js
const secondMission = {
  ...mission,
  id: "K7-20260718-002",
  title: "Reject concurrent claim",
  goal: "Prove one active mission per project",
};
writeMission(memoryRoot, secondMission);
assert.throws(
  () => claimMission(memoryRoot, secondMission.id, { agent: "work", expectedVersion: 1 }),
  /already has an active mission/,
);
```

- [ ] **Step 5: Run focused tests and syntax checks**

Run: `node tests/coordination-contracts.test.js && node tests/coordination-store.test.js && node --check lib/coordination-store.js`

Expected: both success messages, exit code 0.

- [ ] **Step 6: Commit the store**

```bash
git add lib/coordination-store.js tests/coordination-store.test.js
git commit -m "feat: add versioned mission store"
```

---

### Task 4: Expose Coordination Through the Existing `k7` CLI

**Files:**
- Modify: `lib/k7-cli.js:1-44,46-239,271-309,550-end`
- Modify: `tests/k7-cli.test.js`
- Modify: `package.json:61-62`

**Interfaces:**
- Consumes: `K7_MEMORY_ROOT`, mission id, expected version, agent id, and receipt JSON path.
- Produces: `k7 coordination-status`, `k7 mission-validate`, `k7 mission-claim`, and `k7 mission-close` with JSON output support.

- [ ] **Step 1: Add failing CLI assertions**

Append to `tests/k7-cli.test.js` using a temporary public root and sibling memory root:

```js
const coordinationMission = {
  schemaVersion: "1.0", id: "K7-20260718-001", version: 1, projectId: "kaizen7",
  repository: "lucianople7/kaizen7", title: "CLI coordination", goal: "Claim from k7 CLI",
  why: "Work and Codex need one command surface", route: "project-connectivity", priority: "P1",
  status: "approved", contextFiles: ["AGENTS.md"], constraints: [],
  acceptanceTests: ["node tests/k7-cli.test.js"], approvalGates: [], expectedOutput: ["claim"], risks: [],
  createdBy: "work", createdAt: "2026-07-18T00:00:00.000Z", updatedAt: "2026-07-18T00:00:00.000Z",
  claimedBy: null, claimVersion: null, issueUrl: null, pullRequestUrl: null,
};
const coordinationRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-cli-coordination-"));
const publicRoot = path.join(coordinationRoot, "kaizen7");
const memoryRoot = path.join(coordinationRoot, "kaizen7-memory");
fs.mkdirSync(publicRoot);
fs.mkdirSync(memoryRoot);
process.env.K7_MEMORY_ROOT = "../kaizen7-memory";

const validateResult = runK7ToolCommand(["mission-validate", JSON.stringify(coordinationMission), "--json"], publicRoot);
assert.equal(validateResult.exitCode, 0);
assert.equal(JSON.parse(validateResult.output).ok, true);

writeMission(memoryRoot, coordinationMission);
const claimResult = runK7ToolCommand(["mission-claim", coordinationMission.id, "--version", "1", "--agent", "codex", "--json"], publicRoot);
assert.equal(JSON.parse(claimResult.output).status, "in_progress");

const statusResult = runK7ToolCommand(["coordination-status", "--json"], publicRoot);
assert.equal(JSON.parse(statusResult.output).active.length, 1);
delete process.env.K7_MEMORY_ROOT;
```

Add imports for `fs`, `os`, `path`, and `writeMission` only if the test file does not already import them.

- [ ] **Step 2: Run the CLI test and verify the unknown-command failure**

Run: `node tests/k7-cli.test.js`

Expected: FAIL because `mission-validate` is not yet a registered command.

- [ ] **Step 3: Register four commands and the coordination imports**

Add imports:

```js
const fs = require("node:fs");
const { validateMission } = require("./coordination-contracts");
const { resolveMemoryRoot } = require("./coordination-paths");
const { claimMission, closeMission, getCoordinationStatus } = require("./coordination-store");
```

Add command descriptors to `COMMANDS`:

```js
{ name: "coordination-status", usage: "npm.cmd run k7 -- coordination-status", value: "Read verified mission state from the configured private memory root." },
{ name: "mission-validate", usage: "npm.cmd run k7 -- mission-validate '<mission-json>'", value: "Validate a v1 Work/Codex mission without writing it." },
{ name: "mission-claim", usage: "npm.cmd run k7 -- mission-claim <id> --version <n> --agent <name>", value: "Claim an approved mission using optimistic version control." },
{ name: "mission-close", usage: "npm.cmd run k7 -- mission-close <id> --version <n> --receipt <path>", value: "Close a claimed mission with a verified receipt." },
```

Add helpers beside `commandText`:

```js
function optionValue(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function requireMemoryRoot(root) {
  const resolved = resolveMemoryRoot({ cwd: root });
  if (resolved.status !== "configured") throw new Error("K7_MEMORY_ROOT is not configured.");
  return resolved.memoryRoot;
}
```

- [ ] **Step 4: Add the four command branches**

Insert before the unknown-command branch in `runK7ToolCommand`:

```js
if (parsed.command === "mission-validate") {
  const raw = parsed.args.find((arg) => !arg.startsWith("--"));
  const result = validateMission(JSON.parse(raw || "{}"));
  return { exitCode: result.ok ? 0 : 1, output: `${JSON.stringify(result, null, 2)}\n` };
}
if (parsed.command === "coordination-status") {
  const result = getCoordinationStatus(requireMemoryRoot(root));
  return { exitCode: 0, output: `${JSON.stringify(result, null, 2)}\n` };
}
if (parsed.command === "mission-claim") {
  const id = parsed.args[0];
  const result = claimMission(requireMemoryRoot(root), id, {
    expectedVersion: Number(optionValue(parsed.args, "--version")),
    agent: optionValue(parsed.args, "--agent") || "codex",
  });
  return { exitCode: 0, output: `${JSON.stringify(result, null, 2)}\n` };
}
if (parsed.command === "mission-close") {
  const id = parsed.args[0];
  const receiptFile = optionValue(parsed.args, "--receipt");
  const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
  const result = closeMission(requireMemoryRoot(root), id, {
    expectedVersion: Number(optionValue(parsed.args, "--version")),
    receipt,
  });
  return { exitCode: 0, output: `${JSON.stringify(result, null, 2)}\n` };
}
```

Do not add a second error wrapper: the existing `main(...).catch(...)` block at `lib/k7-cli.js:845-849` already converts thrown CLI errors to exit code 1, while direct `runK7ToolCommand` callers retain thrown errors for assertions.

- [ ] **Step 5: Include new modules and tests in `npm run check`**

Add these syntax checks before the test list:

```text
node --check lib/coordination-paths.js && node --check lib/coordination-contracts.js && node --check lib/coordination-store.js
```

Add these test commands before `tests/k7-cli.test.js`:

```text
node tests/coordination-paths.test.js && node tests/coordination-contracts.test.js && node tests/coordination-store.test.js
```

- [ ] **Step 6: Run the CLI and focused coordination suite**

Run: `node tests/coordination-paths.test.js && node tests/coordination-contracts.test.js && node tests/coordination-store.test.js && node tests/k7-cli.test.js`

Expected: four passing test messages, exit code 0.

- [ ] **Step 7: Commit the CLI surface**

```bash
git add lib/k7-cli.js tests/k7-cli.test.js package.json
git commit -m "feat: expose coordination commands"
```

---

### Task 5: Bootstrap the Private Memory Repository Safely

**Files:**
- Create: `scripts/bootstrap-private-memory.js`
- Create: `tests/bootstrap-private-memory.test.js`
- Modify: `package.json:10-64`

**Interfaces:**
- Consumes: `K7_MEMORY_ROOT` resolved outside the public checkout.
- Produces: a minimal private repository tree with no secrets and stable initial JSON documents.

- [ ] **Step 1: Write the failing bootstrap test**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { bootstrapPrivateMemory } = require("../scripts/bootstrap-private-memory");

const parent = fs.mkdtempSync(path.join(os.tmpdir(), "k7-private-bootstrap-"));
const publicRoot = path.join(parent, "kaizen7");
const memoryRoot = path.join(parent, "kaizen7-memory");
fs.mkdirSync(publicRoot);

const result = bootstrapPrivateMemory({ publicRoot, memoryRoot, now: "2026-07-18T00:00:00.000Z" });
assert.equal(result.status, "created");
for (const relative of [
  "README.md", ".gitignore", "coordination/registry.json", "coordination/focus.json",
  "coordination/inbox/.gitkeep", "coordination/receipts/.gitkeep", "sources/drive-manifest.json",
]) assert(fs.existsSync(path.join(memoryRoot, relative)), relative);
assert.throws(() => bootstrapPrivateMemory({ publicRoot, memoryRoot: path.join(publicRoot, "memory") }), /outside the public KAIZEN7 repository/);
console.log("private memory bootstrap tests passed");
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `node tests/bootstrap-private-memory.test.js`

Expected: FAIL with `Cannot find module '../scripts/bootstrap-private-memory'`.

- [ ] **Step 3: Implement the bootstrap script**

```js
#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { assertPrivateMemoryRoot, resolveMemoryRoot } = require("../lib/coordination-paths");

function writeNew(target, content) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (!fs.existsSync(target)) fs.writeFileSync(target, content, "utf8");
}

function bootstrapPrivateMemory(options = {}) {
  const publicRoot = path.resolve(options.publicRoot || process.cwd());
  const memoryRoot = assertPrivateMemoryRoot(publicRoot, options.memoryRoot);
  const now = options.now || new Date().toISOString();
  writeNew(path.join(memoryRoot, "README.md"), "# KAIZEN7 Private Memory\n\nPrivate operational state for authorized Work and Codex sessions.\n");
  writeNew(path.join(memoryRoot, ".gitignore"), ".env\n*.tmp\ngraphify-out/\nderived/graphify/*.json\n");
  writeNew(path.join(memoryRoot, "coordination", "registry.json"), `${JSON.stringify({ schemaVersion: "1.0", projects: [] }, null, 2)}\n`);
  writeNew(path.join(memoryRoot, "coordination", "focus.json"), `${JSON.stringify({ schemaVersion: "1.0", version: 1, projectId: "kaizen7", missionId: null, priority: "P1", updatedAt: now, updatedBy: "bootstrap" }, null, 2)}\n`);
  writeNew(path.join(memoryRoot, "coordination", "inbox", ".gitkeep"), "");
  writeNew(path.join(memoryRoot, "coordination", "receipts", ".gitkeep"), "");
  writeNew(path.join(memoryRoot, "projects", ".gitkeep"), "");
  writeNew(path.join(memoryRoot, "sources", "drive-manifest.json"), `${JSON.stringify({ schemaVersion: "1.0", allowlistRoot: "KAIZEN7 KNOWLEDGE VAULT", sources: [] }, null, 2)}\n`);
  return { status: "created", memoryRoot };
}

if (require.main === module) {
  const resolved = resolveMemoryRoot();
  if (resolved.status !== "configured") throw new Error("K7_MEMORY_ROOT is not configured.");
  console.log(JSON.stringify(bootstrapPrivateMemory({ publicRoot: resolved.publicRoot, memoryRoot: resolved.memoryRoot }), null, 2));
}

module.exports = { bootstrapPrivateMemory };
```

- [ ] **Step 4: Add the bootstrap script to `package.json`**

```json
"k7:memory:init": "node scripts/bootstrap-private-memory.js"
```

Add `node --check scripts/bootstrap-private-memory.js` and `node tests/bootstrap-private-memory.test.js` to `npm run check`.

- [ ] **Step 5: Run the bootstrap test**

Run: `node tests/bootstrap-private-memory.test.js && node --check scripts/bootstrap-private-memory.js`

Expected: `private memory bootstrap tests passed`, exit code 0.

- [ ] **Step 6: Create the private GitHub repository at the authorization gate**

Run:

```bash
gh auth status
gh repo create lucianople7/kaizen7-memory --private --description "Private operational memory shared by KAIZEN7, Work and Codex" --clone
```

Expected: an authenticated GitHub account and a private clone named `kaizen7-memory`. If `gh` is absent or unauthenticated, stop with `BLOCKED: private repository creation requires GitHub authorization`; do not create a public fallback and do not put private state in `lucianople7/kaizen7`.

- [ ] **Step 7: Bootstrap and publish the private repository**

From the public KAIZEN7 checkout, configure a sibling path and run:

```bash
export K7_MEMORY_ROOT=../kaizen7-memory
npm run k7:memory:init
cd ../kaizen7-memory
git switch -c main
git add README.md .gitignore coordination projects sources
git commit -m "chore: initialize private KAIZEN7 memory"
git push -u origin main
```

Expected: only the minimal private structure is committed; no Drive content, credentials, or personal files are present.

- [ ] **Step 8: Commit the public bootstrap capability**

```bash
git add scripts/bootstrap-private-memory.js tests/bootstrap-private-memory.test.js package.json
git commit -m "feat: bootstrap private memory repository"
```

---

### Task 6: Migrate Startup Documentation and Run the Foundation Dry Run

**Files:**
- Create: `docs/PRIVATE_MEMORY_BOUNDARY.md`
- Modify: `KAIZEN7_INDEX.md:7-53,125-129`
- Modify: `AGENTS.md` under `Required Startup`, `Repository Boundary`, and `Memory Rule`
- Modify: `docs/CODEX_BRIDGE.md`
- Modify: `README.md` documentation map and setup commands

**Interfaces:**
- Consumes: the tested CLI and private repository from Tasks 1-5.
- Produces: one unambiguous startup route for humans, Work, and Codex.

- [ ] **Step 1: Write the public/private boundary document**

Create `docs/PRIVATE_MEMORY_BOUNDARY.md` with these exact rules:

```markdown
# KAIZEN7 Private Memory Boundary

## Canonical Roles

- `lucianople7/kaizen7` is the public kernel: code, schemas, adapters, tests, and sanitized documentation.
- `lucianople7/kaizen7-memory` is the private operational memory: focus, missions, receipts, decisions, and source manifests.
- `KAIZEN7 KNOWLEDGE VAULT` in Google Drive is the allowlisted source library for documents and media.
- Graphify output is a derived, rebuildable index and never overrides GitHub or Drive sources.
- Obsidian is an optional Markdown viewer, not a required synchronization layer.

## Startup

1. Read `AGENTS.md` and `KAIZEN7_CONTEXT.md` in the public kernel.
2. Set `K7_MEMORY_ROOT` to the sibling private checkout.
3. Run `npm.cmd run k7 -- coordination-status --json`.
4. Read only the active mission's `contextFiles`.
5. Refuse stale versions and unapproved gates.

## Privacy

Never crawl the Google Drive root. Never commit credentials, identity documents, recovery material, financial records, private Drive identifiers, or raw private sources to the public kernel.
```

- [ ] **Step 2: Replace the OneDrive/Obsidian startup rule in `KAIZEN7_INDEX.md`**

Replace lines 7-53 with:

```markdown
## Canonical Stores

- Public kernel: this `lucianople7/kaizen7` checkout.
- Private operational memory: sibling private `lucianople7/kaizen7-memory` checkout selected by `K7_MEMORY_ROOT`.
- Source library: the allowlisted `KAIZEN7 KNOWLEDGE VAULT` Google Drive folder.
- Optional viewer: Obsidian may open Markdown from an authorized checkout but is not a source of live mission status.

## Codex Startup Rule

Before changing files:

1. Read `AGENTS.md` and `KAIZEN7_CONTEXT.md`.
2. Run `npm.cmd run k7 -- coordination-status --json`.
3. Confirm the mission id, version, repository, acceptance tests, and approval gates.
4. Read only the mission's `contextFiles` plus the minimum files required for verification.
5. Close work with a version-matched receipt.

If private memory is unavailable, report `unverified`; do not reconstruct mission state from chat recollection or old Obsidian notes.
```

Replace lines 125-129 with a warning that the Drive root is denied by default and that private memory must never fall back into the public checkout.

- [ ] **Step 3: Align agent and bridge documentation**

In `AGENTS.md`, preserve the existing GitHub Issue -> Codex -> Pull Request route and add:

```markdown
Operational mission state is read from the configured private `kaizen7-memory` checkout. The public kernel owns only contracts and adapters. If `K7_MEMORY_ROOT` is missing, agents may inspect public code but must report mission status as unverified and must not write private state locally.
```

In `docs/CODEX_BRIDGE.md`, add the pre-flight command:

```powershell
npm.cmd run k7 -- coordination-status --json
```

In `README.md`, add `docs/PRIVATE_MEMORY_BOUNDARY.md` to the documentation map and `npm.cmd run k7:memory:init` to fresh setup after `K7_MEMORY_ROOT` is configured.

- [ ] **Step 4: Run a real temporary dry run**

```bash
TEMP_PARENT="$(mktemp -d)"
mkdir "$TEMP_PARENT/kaizen7-public" "$TEMP_PARENT/kaizen7-memory"
K7_MEMORY_ROOT="$TEMP_PARENT/kaizen7-memory" node scripts/bootstrap-private-memory.js
K7_MEMORY_ROOT="$TEMP_PARENT/kaizen7-memory" npm run k7 -- coordination-status --json
```

Expected: bootstrap reports `status: created`; coordination status reports schema `kaizen7.coordination_status.v1` and empty arrays without writing inside `kaizen7-public`.

- [ ] **Step 5: Run the focused suite and the full repository gate**

Run:

```bash
node tests/coordination-paths.test.js
node tests/coordination-contracts.test.js
node tests/coordination-store.test.js
node tests/bootstrap-private-memory.test.js
node tests/k7-cli.test.js
npm run check
npm run k7:smoke
npm run k7:ready
```

Expected: every focused test prints its pass message; `npm run check` exits 0; smoke and readiness return passing/ready status. If an unrelated pre-existing test fails, record the exact command and output in the receipt and do not claim the foundation verified.

- [ ] **Step 6: Inspect the public diff for private data**

Run:

```bash
git diff --check
git status --short
git diff -- . ':!docs/superpowers/plans/2026-07-18-coordination-foundation.md'
```

Expected: no secrets, Drive IDs, raw sources, private mission instances, or generated `graphify-out` artifacts; only the files named in this plan are modified.

- [ ] **Step 7: Commit documentation and close with a receipt**

```bash
git add AGENTS.md KAIZEN7_INDEX.md README.md docs/CODEX_BRIDGE.md docs/PRIVATE_MEMORY_BOUNDARY.md
git commit -m "docs: define Work Codex memory startup"
```

Expected: documentation commit succeeds. Put the structured Mission Outcome Receipt in the pull-request description and in the version-matched private mission closure; do not use the legacy public-checkout receipt ledger for this coordination mission.

---

## Follow-on Plans

Create these only after this foundation is merged and the private repository is accessible to both Work and Codex:

1. `2026-07-18-graphify-index-pilot.md` — project-scoped installation, sanitized KAIZEN7 corpus, provenance checks, cache policy, and token/accuracy baseline.
2. `2026-07-18-google-drive-vault-ingestion.md` — allowlisted folder manifest, native Google Workspace export, deny rules, hashing, and explicit model-disclosure gate.
3. `2026-07-18-work-codex-github-transport.md` — K7 Mission issue template, labels, claim synchronization, pull-request receipt, and Work status summaries.
4. `2026-07-18-external-project-pilot.md` — connect one of Flowmatik, THE FOCUX, or Mr. Kaizen after the transport passes end to end.
