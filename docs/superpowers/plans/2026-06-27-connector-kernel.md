# KAIZEN7 Connector Kernel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the KAIZEN7 Connector Kernel so Codex, coding tools, APIs, CLIs, MCP servers and external agents can connect once and receive route, context, metaskills, tools, action, verification and safe writeback policy.

**Architecture:** Add a focused `lib/connector-kernel.js` module that composes existing KAIZEN7 modules instead of replacing them. Expose it through `npm.cmd run k7:connect` and `POST /api/k7/connect`, then register it in readiness, docs and integration tests.

**Tech Stack:** Node.js CommonJS, built-in `assert`, existing KAIZEN7 modules, existing HTTP server.

## Global Constraints

- Implement routing and response contract only.
- Do not add real external fetchers, OAuth, persistence, installs, or autonomous execution in this first version.
- The kernel never publishes, deploys, spends, deletes, writes credentials, stores secrets, or installs dependencies automatically.
- Dangerous capabilities return `needs_approval`.
- Follow TDD: no production code without a failing test first.
- Reuse Supertool, Second Brain, Adapter Registry and Frontier modules.

---

### Task 1: Connector Kernel Core

**Files:**
- Create: `tests/connector-kernel.test.js`
- Create: `lib/connector-kernel.js`

**Interfaces:**
- Consumes: `buildSupertoolPlan(options)`, `buildSecondBrain(options)`, `buildAdapterPlan(options)`, `buildFrontierOperatorBrief(options)`.
- Produces: `buildConnectorKernel(options): object`, `detectConnectorRoute(profile): object`, `parseArgs(argv): object`, `formatConnectorKernel(result): string`.

- [x] **Step 1: Write the failing test**

```javascript
const assert = require("node:assert/strict");
const {
  buildConnectorKernel,
  detectConnectorRoute,
  parseArgs,
} = require("../lib/connector-kernel");

assert.equal(detectConnectorRoute({ goal: "crear posts para redes sociales" }).name, "social");
assert.equal(detectConnectorRoute({ goal: "mejorar agente con tests" }).name, "code");

const result = buildConnectorKernel({
  root: process.cwd(),
  project: "Flowmatik",
  kind: "project",
  goal: "mejorar redes sociales con memoria y verificacion",
  capabilities: ["read_files", "edit_files", "run_tests"],
  supertool: () => ({ status: "ready", skills: ["test-driven-development"], tools: ["codex-bridge"], verification: ["Run tests"], action: "Write test first", commands: ["npm.cmd run check"] }),
  secondBrain: () => ({ status: "ready", metaskills: ["kaizen7-evolution-engine"], memory: ["Obsidian/Flowmatik"], writeback: { mode: "draft" } }),
  adapterPlanner: () => ({ status: "ready", gates: ["Require human approval"], connectToK7: { advise: "POST /api/k7/advise" } }),
  frontier: () => ({ status: "ready", queue: [{ candidate: "OpenAI Agents SDK" }], gates: ["Verify license"] }),
});

assert.equal(result.status, "ready");
assert.equal(result.mode, "connector-kernel");
assert.equal(result.profile.name, "Flowmatik");
assert.equal(result.route.name, "social");
assert(result.metaskills.includes("kaizen7-evolution-engine"));
assert(result.tools.includes("codex-bridge"));
assert(result.signals.some((item) => item.candidate === "OpenAI Agents SDK"));
assert.equal(result.writeback.mode, "draft");

const gated = buildConnectorKernel({
  project: "External Agent",
  goal: "deploy and publish",
  capabilities: ["deploy", "publish"],
});
assert.equal(gated.status, "needs_approval");
assert(gated.approvalGates.some((gate) => gate.includes("publish")));

const args = parseArgs(["--project", "Codex", "--kind", "agent", "--capability", "run_tests", "mejorar", "codigo"]);
assert.equal(args.project, "Codex");
assert.equal(args.kind, "agent");
assert.deepEqual(args.capabilities, ["run_tests"]);
assert.equal(args.goal, "mejorar codigo");

console.log("connector kernel tests passed");
```

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/connector-kernel.test.js`

Expected: FAIL with `Cannot find module '../lib/connector-kernel'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/connector-kernel.js` with:

```javascript
const { buildAdapterPlan } = require("./adapter-registry");
const { buildFrontierOperatorBrief } = require("./frontier-operator");
const { buildSecondBrain } = require("./second-brain");
const { buildSupertoolPlan } = require("./supertool-orchestrator");

const DANGEROUS_CAPABILITIES = ["publish", "deploy", "spend", "delete", "credential_write", "install_dependencies"];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function normalizeProfile(options = {}) {
  return {
    name: String(options.project || options.name || "local-project").trim() || "local-project",
    kind: String(options.kind || "project").trim() || "project",
    domain: String(options.domain || "").trim() || "general",
    goal: String(options.goal || options.objective || "").trim() || "connect to KAIZEN7",
    capabilities: unique(options.capabilities || []),
    riskPolicy: "approval-first",
    memoryPolicy: "selected-context-only",
  };
}

function detectConnectorRoute(profile = {}) {
  const text = `${profile.goal || ""} ${profile.domain || ""} ${profile.kind || ""}`.toLowerCase();
  if (/redes|social|content|contenido|post|tiktok|instagram|linkedin|x\b/.test(text)) return { name: "social", reason: "social/content objective detected" };
  if (/commerce|shopify|ecommerce|producto|supplier|proveedor|venta/.test(text)) return { name: "commerce", reason: "commerce objective detected" };
  if (/memoria|memory|obsidian|segundo cerebro|contexto/.test(text)) return { name: "memory", reason: "memory objective detected" };
  if (/research|investigar|github|hugging face|hf|frontier|puntero|repos?/.test(text)) return { name: "research", reason: "research/frontier objective detected" };
  if (/agent|agente|mcp|api|sdk|tool|herramienta|adapter|adaptador/.test(text)) return { name: "agent", reason: "agent/tool connection detected" };
  if (/code|codigo|código|codex|test|bug|refactor|implementar/.test(text)) return { name: "code", reason: "code objective detected" };
  return { name: "orchestrate", reason: "default orchestration route" };
}

function dangerousCapabilities(capabilities = []) {
  return capabilities.filter((capability) => DANGEROUS_CAPABILITIES.includes(String(capability).toLowerCase()));
}

function buildConnectorKernel(options = {}) {
  const root = options.root || process.cwd();
  const profile = normalizeProfile(options);
  const route = detectConnectorRoute(profile);
  const dangerous = dangerousCapabilities(profile.capabilities);
  const supertool = (options.supertool || buildSupertoolPlan)({ root, goal: profile.goal, capabilities: profile.capabilities, intent: route.name === "agent" ? "adapter" : route.name });
  const secondBrain = (options.secondBrain || buildSecondBrain)({ root, goal: profile.goal, writeSignals: false });
  const adapter = (options.adapterPlanner || buildAdapterPlan)({ name: profile.name, kind: profile.kind === "agent" ? "agent" : "api", goal: profile.goal, capabilities: profile.capabilities });
  const frontier = (options.frontier || buildFrontierOperatorBrief)({ root, writeSignals: false, limit: options.limit || 3 });
  const approvalGates = unique([
    ...dangerous.map((capability) => `Capability ${capability} requires explicit human approval`),
    ...(adapter.gates || []),
    ...(route.name === "social" ? ["Publishing social content requires explicit human approval"] : []),
    ...(route.name === "commerce" ? ["Commerce writes and supplier actions require explicit human approval"] : []),
  ]);

  return {
    version: 1,
    status: dangerous.length ? "needs_approval" : "ready",
    mode: "connector-kernel",
    profile,
    route,
    contextPack: unique([...(supertool.context || []), ...(secondBrain.memory || [])]),
    metaskills: unique([...(secondBrain.metaskills || []), ...(supertool.skills || [])]),
    tools: unique([...(supertool.tools || []), "adapter-registry", "second-brain", "supertool-orchestrator"]),
    signals: frontier.queue || [],
    action: supertool.action || "Use KAIZEN7 to select one safe next action.",
    commands: unique([...(supertool.commands || []), "npm.cmd run k7:connect -- \"<objective>\""]),
    verification: unique([...(supertool.verification || []), ...(frontier.gates || []), "Run npm.cmd run check before claiming completion"]),
    approvalGates,
    writeback: secondBrain.writeback || { mode: "draft", target: "memory", approvalRequired: true },
    adapter,
    safety: [
      "No publish, deploy, spend, delete, credential write, secret storage or dependency install without explicit approval.",
      "Return context and next action only; do not execute external effects.",
    ],
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `node tests/connector-kernel.test.js`

Expected: PASS and `connector kernel tests passed`.

### Task 2: CLI, API and Readiness

**Files:**
- Modify: `package.json`
- Modify: `server.js`
- Modify: `lib/production-readiness.js`
- Modify: `tests/server.integration.test.js`
- Modify: `tests/production-readiness.test.js`

**Interfaces:**
- Consumes: `buildConnectorKernel(options)`.
- Produces: `npm.cmd run k7:connect`, `POST /api/k7/connect`.

- [x] **Step 1: Write failing integration/readiness expectations**

Add integration assertions that `POST /api/k7/connect` returns `mode: "connector-kernel"` and social route for a social objective.

Add readiness expectations for `lib/connector-kernel.js`, `/api/k7/connect`, and script `k7:connect`.

- [x] **Step 2: Run tests to verify failure**

Run: `node tests/server.integration.test.js`

Expected: FAIL with 404/HTML or missing endpoint for `/api/k7/connect`.

- [x] **Step 3: Wire code**

Add:

```javascript
const { buildConnectorKernel } = require("./lib/connector-kernel");
```

Add route:

```javascript
if (req.method === "POST" && url.pathname === "/api/k7/connect") {
  return writeJson(res, 200, buildConnectorKernel({ root, ...(await readBody(req)) }));
}
```

Add package script:

```json
"k7:connect": "node lib/connector-kernel.js"
```

Add `connector-kernel` to readiness required modules, API endpoints and script checks.

- [x] **Step 4: Run tests to verify pass**

Run:

```powershell
node tests/connector-kernel.test.js
node tests/server.integration.test.js
node tests/production-readiness.test.js
```

Expected: all pass.

### Task 3: Documentation and Final Verification

**Files:**
- Create: `docs/CONNECTOR_KERNEL.md`
- Create: `Obsidian/Flowmatik/Arquitectura/K7 Connector Kernel.md`
- Modify: `README.md`
- Modify: `KAIZEN7_INDEX.md`

**Interfaces:**
- Consumes: final command/API contract.
- Produces: user-facing docs for humans and external agents.

- [x] **Step 1: Document the user contract**

Create docs with exact examples for:

```powershell
npm.cmd run k7:connect -- --project "Flowmatik" --kind project "mejorar redes sociales"
```

```http
POST /api/k7/connect
```

- [x] **Step 2: Run full verification**

Run:

```powershell
npm.cmd run check
npm.cmd run k7:connect -- --project "Codex" --kind agent --capability run_tests "mejorar codigo con tests"
npm.cmd run k7:real -- "validar Connector Kernel KAIZEN7"
```

Expected: all commands exit 0.

- [x] **Step 3: Commit and push**

Run:

```powershell
git add docs/superpowers/plans/2026-06-27-connector-kernel.md tests/connector-kernel.test.js lib/connector-kernel.js package.json server.js lib/production-readiness.js tests/server.integration.test.js tests/production-readiness.test.js docs/CONNECTOR_KERNEL.md README.md KAIZEN7_INDEX.md "Obsidian/Flowmatik/Arquitectura/K7 Connector Kernel.md"
git commit -m "Add KAIZEN7 connector kernel"
git push origin kaizen7-frontier-operator
```

Expected: push succeeds.

## Self Review

- Spec coverage: command, API, output contract, routing, context pack, metaskills, safety gates, tests and docs are covered.
- Placeholder scan: no deferred implementation or open TODOs are required.
- Type consistency: `buildConnectorKernel`, `detectConnectorRoute`, `parseArgs`, and `formatConnectorKernel` are the stable exported names.
