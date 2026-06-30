# K7 Harness Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the V1 KAIZEN7 Action Copilot layer that turns project goals into mission packets, routes them to the best executor, and exposes safe dry-runs in API and WebUI.

**Architecture:** Add focused modules for mission packet creation and harness routing, then wire them into `server.js`, `package.json`, production readiness, tests, docs and the existing AI Cockpit. V1 does not install Qwen Code, Aider or jcode; those are represented as dry-run adapters until explicit smoke tests are approved.

**Tech Stack:** Node.js CommonJS modules, built-in `assert` tests, existing KAIZEN7 WebUI (`index.html`, `app.js`, `styles.css`), existing `npm.cmd run check` verification flow.

## Global Constraints

- No external CLI installation in V1.
- External executors are represented as safe dry-runs.
- KAIZEN7 owns objective interpretation, risk, approvals, context, budgets, stop rules, verification, evidence and memory writeback.
- High-risk packets route to `manual`.
- No adapter may write secrets to Obsidian, run external installs, deploy, publish, pay, delete, push, bypass allowed paths, complete without evidence, or turn swarm/subagents on by default.
- V1 executors: `codex`, `qwen-code`, `aider`, `jcode`, `browser`, `manual`.
- Final verification command: `npm.cmd run check`.

---

## File Structure

- Create `lib/k7-mission-packet.js`: builds normalized mission packets from user goals and options.
- Create `tests/k7-mission-packet.test.js`: covers packet defaults, risk detection, stop rules, THE FOCUX defaults and CLI parsing.
- Create `lib/k7-harness-router.js`: scores executor candidates and returns route/dry-run plans.
- Create `tests/k7-harness-router.test.js`: covers routing rules for Codex, Qwen Code, Aider, jcode, browser and manual.
- Modify `server.js`: add `POST /api/k7/mission`, `POST /api/k7/harness/route`, `POST /api/k7/harness/dry-run`.
- Modify `tests/server.integration.test.js`: add endpoint coverage for the new API.
- Modify `package.json`: add `k7:mission`, `k7:harness`, and include new modules/tests in `check`.
- Modify `lib/production-readiness.js`: include modules, scripts and API endpoints in readiness checks.
- Modify `tests/production-readiness.test.js`: assert readiness coverage.
- Modify `index.html`: add a compact K7 Action Copilot panel or action controls inside the existing AI Cockpit.
- Modify `app.js`: call `/api/k7/harness/dry-run` and render mission, route, stop rules, verification and memory.
- Modify `styles.css`: add minimal styles only if existing cockpit styles do not cover the new panel.
- Create `docs/K7_HARNESS_ROUTER.md`: document commands, API and safety contract.
- Modify `README.md`, `KAIZEN7_INDEX.md`, `docs/CHANGELOG.md`: add concise discoverability entries.

---

### Task 1: Mission Packet Module

**Files:**
- Create: `lib/k7-mission-packet.js`
- Create: `tests/k7-mission-packet.test.js`

**Interfaces:**
- Produces: `buildMissionPacket(options = {}) -> MissionPacket`
- Produces: `parseArgs(argv = []) -> { json: boolean, compact: boolean, objective: string, project: string, risk: string, preferredExecutor: string, allowedPaths: string[], capabilities: string[], verificationCommands: string[] }`
- Produces: `formatMissionPacket(packet) -> string`

- [ ] **Step 1: Write the failing test**

Create `tests/k7-mission-packet.test.js`:

```js
const assert = require("node:assert/strict");
const {
  buildMissionPacket,
  formatMissionPacket,
  parseArgs,
} = require("../lib/k7-mission-packet");

const packet = buildMissionPacket({
  objective: "mejorar landing THE FOCUX con tests",
  project: "THE FOCUX",
  capabilities: ["edit_code", "run_tests"],
});

assert.equal(packet.status, "ready");
assert.equal(packet.mode, "k7-mission-packet");
assert.equal(packet.project, "THE FOCUX");
assert.equal(packet.objective, "mejorar landing THE FOCUX con tests");
assert.equal(packet.risk, "low");
assert.deepEqual(packet.allowedPaths, ["lib", "tests", "docs", "Obsidian/Flowmatik/Kaizen7"]);
assert.deepEqual(packet.budget, { maxSteps: 5, maxTokens: 1600, maxMinutes: 30 });
assert(packet.capabilities.includes("edit_code"));
assert(packet.capabilities.includes("run_tests"));
assert.equal(packet.preferredExecutor, "auto");
assert(packet.stopRules.includes("stop_if_credentials_required"));
assert(packet.stopRules.includes("stop_if_publish_deploy_payment_or_delete_is_needed"));
assert(packet.verificationCommands.includes("npm.cmd run check"));
assert(packet.expectedEvidence.includes("diff_summary"));
assert.equal(packet.memoryWriteback.target, "Obsidian/Flowmatik/Kaizen7");
assert.equal(packet.memoryWriteback.kind, "Decision");

const highRisk = buildMissionPacket({
  objective: "deploy production and write API token to notes",
  capabilities: ["deploy", "credential_write"],
});
assert.equal(highRisk.risk, "high");
assert(highRisk.stopRules.includes("stop_until_human_approval"));
assert(highRisk.approval.required);
assert(highRisk.approval.reasons.some((reason) => reason.includes("credentials")));
assert(highRisk.approval.reasons.some((reason) => reason.includes("deploy")));

const browserPacket = buildMissionPacket({
  objective: "revisar visualmente la web de THE FOCUX y sacar screenshot",
});
assert(browserPacket.capabilities.includes("visual_inspection"));
assert(browserPacket.expectedEvidence.includes("screenshot_or_dom_snapshot"));

const parsed = parseArgs([
  "--project", "THE FOCUX",
  "--risk", "medium",
  "--executor", "codex",
  "--path", "site",
  "--capability", "edit_code",
  "--verify", "npm.cmd run check",
  "--json",
  "activar", "copilot",
]);
assert.equal(parsed.json, true);
assert.equal(parsed.project, "THE FOCUX");
assert.equal(parsed.risk, "medium");
assert.equal(parsed.preferredExecutor, "codex");
assert.deepEqual(parsed.allowedPaths, ["site"]);
assert.deepEqual(parsed.capabilities, ["edit_code"]);
assert.deepEqual(parsed.verificationCommands, ["npm.cmd run check"]);
assert.equal(parsed.objective, "activar copilot");

const text = formatMissionPacket(packet);
assert(text.includes("## K7 Mission Packet"));
assert(text.includes("THE FOCUX"));
assert(text.includes("mejorar landing THE FOCUX con tests"));

console.log("k7 mission packet tests passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/k7-mission-packet.test.js`

Expected: FAIL with `Cannot find module '../lib/k7-mission-packet'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/k7-mission-packet.js`:

```js
const DEFAULT_ALLOWED_PATHS = ["lib", "tests", "docs", "Obsidian/Flowmatik/Kaizen7"];
const DEFAULT_STOP_RULES = [
  "stop_if_credentials_required",
  "stop_if_publish_deploy_payment_or_delete_is_needed",
  "stop_if_license_or_compliance_risk_is_unclear",
  "stop_after_budget_exhausted",
];
const DEFAULT_EVIDENCE = ["diff_summary", "test_output", "memory_draft"];

function clean(value = "") {
  return String(value || "").trim();
}

function unique(items = []) {
  return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}

function normalizePaths(items = []) {
  return unique(items).map((item) => item.replace(/\\/g, "/"));
}

function inferCapabilities(objective = "", capabilities = []) {
  const text = clean(objective).toLowerCase();
  const inferred = [...capabilities];
  if (/visual|screenshot|captura|dom|web|browser|navegador/.test(text)) inferred.push("visual_inspection");
  if (/test|prueba|check|verificar/.test(text)) inferred.push("run_tests");
  if (/edit|code|codigo|implementar|mejorar|landing|repo/.test(text)) inferred.push("edit_code");
  if (/mcp|tool|herramienta/.test(text)) inferred.push("mcp_tools");
  if (/memory|memoria|obsidian/.test(text)) inferred.push("memory_writeback");
  return unique(inferred);
}

function riskSignals(objective = "", capabilities = []) {
  const text = `${objective} ${capabilities.join(" ")}`.toLowerCase();
  return unique([
    /credential|token|secret|api key|password|clave/.test(text) ? "credentials" : "",
    /deploy|publish|production|push|publicar|desplegar/.test(text) ? "deploy_or_publish" : "",
    /delete|remove|borrar|eliminar/.test(text) ? "delete" : "",
    /payment|spend|buy|pagar|gastar|comprar/.test(text) ? "payment_or_spend" : "",
    /license|legal|compliance|medical|financial|licencia|legalidad/.test(text) ? "compliance" : "",
  ]);
}

function inferRisk(options = {}, capabilities = []) {
  if (options.risk) return options.risk;
  return riskSignals(options.objective || options.goal || "", capabilities).length ? "high" : "low";
}

function buildApproval(risk, signals = []) {
  return {
    required: risk === "high",
    gate: risk === "high" ? "human_approval_before_execution" : "bounded_auto_dry_run",
    reasons: signals.map((signal) => {
      if (signal === "credentials") return "requires credentials or secrets review";
      if (signal === "deploy_or_publish") return "requires deploy, publish or push approval";
      if (signal === "delete") return "requires delete approval";
      if (signal === "payment_or_spend") return "requires payment or spend approval";
      if (signal === "compliance") return "requires license, legal or compliance review";
      return signal;
    }),
  };
}

function buildMissionPacket(options = {}) {
  const objective = clean(options.objective || options.goal) || "activate KAIZEN7 action copilot";
  const capabilities = inferCapabilities(objective, options.capabilities || []);
  const signals = riskSignals(objective, capabilities);
  const risk = inferRisk({ ...options, objective }, capabilities);
  const stopRules = unique([
    ...DEFAULT_STOP_RULES,
    ...(risk === "high" ? ["stop_until_human_approval"] : []),
    ...(options.stopRules || []),
  ]);
  const expectedEvidence = unique([
    ...DEFAULT_EVIDENCE,
    ...(capabilities.includes("visual_inspection") ? ["screenshot_or_dom_snapshot"] : []),
    ...(options.expectedEvidence || []),
  ]);
  return {
    version: 1,
    status: "ready",
    mode: "k7-mission-packet",
    objective,
    project: clean(options.project) || "KAIZEN7",
    risk,
    allowedPaths: normalizePaths(options.allowedPaths?.length ? options.allowedPaths : DEFAULT_ALLOWED_PATHS),
    budget: {
      maxSteps: Number(options.maxSteps || options.budget?.maxSteps || 5),
      maxTokens: Number(options.maxTokens || options.budget?.maxTokens || 1600),
      maxMinutes: Number(options.maxMinutes || options.budget?.maxMinutes || 30),
    },
    capabilities,
    preferredExecutor: clean(options.preferredExecutor || options.executor) || "auto",
    stopRules,
    verificationCommands: unique(options.verificationCommands?.length ? options.verificationCommands : ["npm.cmd run check"]),
    expectedEvidence,
    approval: buildApproval(risk, signals),
    memoryWriteback: {
      target: clean(options.memoryTarget) || "Obsidian/Flowmatik/Kaizen7",
      kind: clean(options.memoryKind) || "Decision",
    },
  };
}

function parseArgs(argv = []) {
  const options = {
    allowedPaths: [],
    capabilities: [],
    verificationCommands: [],
  };
  const flags = new Set();
  const objectiveParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") options.project = argv[++index] || "";
    else if (arg === "--risk") options.risk = argv[++index] || "";
    else if (arg === "--executor") options.preferredExecutor = argv[++index] || "";
    else if (arg === "--path") options.allowedPaths.push(argv[++index] || "");
    else if (arg === "--capability") options.capabilities.push(argv[++index] || "");
    else if (arg === "--verify") options.verificationCommands.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else objectiveParts.push(arg);
  }
  return {
    ...options,
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    objective: objectiveParts.join(" ").trim(),
  };
}

function formatMissionPacket(packet) {
  return [
    "## K7 Mission Packet",
    "",
    `Status: ${packet.status}`,
    `Project: ${packet.project}`,
    `Objective: ${packet.objective}`,
    `Risk: ${packet.risk}`,
    `Preferred executor: ${packet.preferredExecutor}`,
    "",
    "### Allowed Paths",
    ...packet.allowedPaths.map((item) => `- ${item}`),
    "",
    "### Verification",
    ...packet.verificationCommands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const packet = buildMissionPacket(args);
  if (args.json) process.stdout.write(`${JSON.stringify(packet, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatMissionPacket(packet)}\n`);
}

module.exports = {
  buildMissionPacket,
  formatMissionPacket,
  parseArgs,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/k7-mission-packet.test.js`

Expected: PASS with `k7 mission packet tests passed`.

- [ ] **Step 5: Commit**

```powershell
git add lib/k7-mission-packet.js tests/k7-mission-packet.test.js
git commit -m "add K7 mission packets"
```

---

### Task 2: Harness Router Module

**Files:**
- Create: `lib/k7-harness-router.js`
- Create: `tests/k7-harness-router.test.js`

**Interfaces:**
- Consumes: `buildMissionPacket(options = {})` from `lib/k7-mission-packet.js`
- Produces: `routeMission(options = {}) -> HarnessRoute`
- Produces: `buildHarnessDryRun(options = {}) -> HarnessDryRun`
- Produces: `parseArgs(argv = []) -> options`
- Produces: `formatHarnessRoute(route) -> string`

- [ ] **Step 1: Write the failing test**

Create `tests/k7-harness-router.test.js`:

```js
const assert = require("node:assert/strict");
const {
  buildHarnessDryRun,
  formatHarnessRoute,
  parseArgs,
  routeMission,
} = require("../lib/k7-harness-router");

const codex = routeMission({
  objective: "mejorar THE FOCUX landing con tests",
  project: "THE FOCUX",
  capabilities: ["edit_code", "run_tests"],
});
assert.equal(codex.status, "ready");
assert.equal(codex.mode, "k7-harness-router");
assert.equal(codex.recommendedExecutor.id, "codex");
assert(codex.reason.includes("local repo"));
assert(codex.scores.codex > codex.scores.aider);
assert(codex.scores.codex > codex.scores["qwen-code"]);

const browser = routeMission({
  objective: "ver visualmente la web y sacar screenshot",
});
assert.equal(browser.recommendedExecutor.id, "browser");
assert(browser.reason.includes("visual"));

const manual = routeMission({
  objective: "deploy production and write token",
  capabilities: ["deploy", "credential_write"],
});
assert.equal(manual.recommendedExecutor.id, "manual");
assert(manual.mission.approval.required);
assert(manual.gates.includes("human_approval_before_execution"));

const aider = routeMission({
  objective: "parche quirurgico en repo map con tests",
  preferredExecutor: "aider",
  capabilities: ["edit_code", "run_tests"],
});
assert.equal(aider.recommendedExecutor.id, "aider");
assert(aider.gates.includes("external_cli_smoke_test_required"));

const qwen = routeMission({
  objective: "usar memoria automatica, subagents y MCP para proyecto modular",
  capabilities: ["memory_writeback", "mcp_tools", "subagents"],
});
assert.equal(qwen.recommendedExecutor.id, "qwen-code");
assert(qwen.gates.includes("external_cli_smoke_test_required"));

const jcode = routeMission({
  objective: "probar jcode como harness con sesiones persistentes",
  capabilities: ["session_resume"],
});
assert.equal(jcode.recommendedExecutor.id, "jcode");
assert(jcode.gates.includes("external_cli_smoke_test_required"));

const dryRun = buildHarnessDryRun({
  objective: "mejorar THE FOCUX con Codex y guardar memoria",
  project: "THE FOCUX",
  capabilities: ["edit_code", "run_tests", "memory_writeback"],
});
assert.equal(dryRun.status, "ready");
assert.equal(dryRun.mode, "k7-harness-dry-run");
assert.equal(dryRun.route.recommendedExecutor.id, "codex");
assert(dryRun.nextAction.includes("Run Codex"));
assert(dryRun.verificationCommands.includes("npm.cmd run check"));
assert(dryRun.memoryDraft.includes("THE FOCUX"));
assert(dryRun.expectedEvidence.includes("diff_summary"));

const parsed = parseArgs(["--project", "THE FOCUX", "--executor", "qwen-code", "--json", "activar", "router"]);
assert.equal(parsed.project, "THE FOCUX");
assert.equal(parsed.preferredExecutor, "qwen-code");
assert.equal(parsed.json, true);
assert.equal(parsed.objective, "activar router");

const text = formatHarnessRoute(codex);
assert(text.includes("## K7 Harness Router"));
assert(text.includes("codex"));

console.log("k7 harness router tests passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/k7-harness-router.test.js`

Expected: FAIL with `Cannot find module '../lib/k7-harness-router'`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/k7-harness-router.js`:

```js
const { buildMissionPacket, parseArgs: parseMissionArgs } = require("./k7-mission-packet");

const EXECUTORS = [
  { id: "codex", label: "Codex", installed: true, role: "local executor" },
  { id: "qwen-code", label: "Qwen Code", installed: false, role: "memory, skills, subagents and MCP reference" },
  { id: "aider", label: "Aider", installed: false, role: "focused repo patching" },
  { id: "jcode", label: "jcode", installed: false, role: "session harness candidate" },
  { id: "browser", label: "Browser Eyes", installed: true, role: "visual and web evidence" },
  { id: "manual", label: "Manual Approval", installed: true, role: "safety fallback" },
];

function clean(value = "") {
  return String(value || "").trim();
}

function unique(items = []) {
  return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}

function executorById(id) {
  return EXECUTORS.find((executor) => executor.id === id) || EXECUTORS[0];
}

function textFor(mission) {
  return `${mission.objective} ${mission.capabilities.join(" ")} ${mission.preferredExecutor}`.toLowerCase();
}

function scoreExecutor(executor, mission) {
  const text = textFor(mission);
  if (executor.id === "manual") return mission.risk === "high" ? 100 : 5;
  if (mission.risk === "high") return executor.id === "manual" ? 100 : -100;

  let score = 0;
  if (executor.installed) score += 12;
  if (mission.preferredExecutor === executor.id) score += 40;
  if (mission.preferredExecutor !== "auto" && mission.preferredExecutor !== executor.id) score -= 8;

  if (executor.id === "codex") {
    if (/code|codigo|repo|landing|test|mejorar|edit|implementar/.test(text)) score += 30;
    if (mission.capabilities.includes("edit_code")) score += 15;
    if (mission.capabilities.includes("run_tests")) score += 10;
  }
  if (executor.id === "browser") {
    if (/visual|screenshot|dom|web|browser|navegador/.test(text)) score += 50;
    if (mission.capabilities.includes("visual_inspection")) score += 25;
  }
  if (executor.id === "aider") {
    if (/aider|repo map|quirurg|patch|parche|refactor/.test(text)) score += 35;
    if (mission.capabilities.includes("edit_code") && mission.capabilities.includes("run_tests")) score += 12;
  }
  if (executor.id === "qwen-code") {
    if (/qwen|auto-memory|auto skills|subagent|subagents|mcp|skills|memoria automatica|modular/.test(text)) score += 45;
    if (mission.capabilities.includes("mcp_tools")) score += 12;
    if (mission.capabilities.includes("subagents")) score += 12;
    if (mission.capabilities.includes("memory_writeback")) score += 8;
  }
  if (executor.id === "jcode") {
    if (/jcode|harness|session|sesion|persistent|swarm/.test(text)) score += 45;
    if (mission.capabilities.includes("session_resume")) score += 15;
  }
  return score;
}

function routeMission(options = {}) {
  const mission = options.mode === "k7-mission-packet" ? options : buildMissionPacket(options);
  const scores = Object.fromEntries(EXECUTORS.map((executor) => [executor.id, scoreExecutor(executor, mission)]));
  const recommendedExecutor = executorById(Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]);
  const gates = unique([
    ...(mission.approval.required ? ["human_approval_before_execution"] : []),
    ...(!recommendedExecutor.installed && recommendedExecutor.id !== "manual" ? ["external_cli_smoke_test_required"] : []),
    "evidence_before_memory_writeback",
  ]);
  const reason = reasonFor(recommendedExecutor.id, mission);
  return {
    version: 1,
    status: "ready",
    mode: "k7-harness-router",
    mission,
    executors: EXECUTORS,
    scores,
    recommendedExecutor,
    reason,
    gates,
    policy: "KAIZEN7 decides, routes, limits, verifies and remembers; executors remain replaceable.",
  };
}

function reasonFor(id, mission) {
  if (id === "manual") return "manual approval required because risk or stop rules block execution";
  if (id === "browser") return "visual or web evidence is central to the mission";
  if (id === "aider") return "focused repo patching is requested, but requires external CLI smoke test before real execution";
  if (id === "qwen-code") return "memory, skills, subagents or MCP patterns are central, but require external CLI smoke test before real execution";
  if (id === "jcode") return "session or harness behavior is central, but requires external CLI smoke test before real execution";
  return "local repo work fits Codex as the safe default executor";
}

function commandForExecutor(executorId, mission) {
  const objective = JSON.stringify(mission.objective);
  if (executorId === "aider") return `aider --message ${objective}`;
  if (executorId === "qwen-code") return `qwen-code ${objective}`;
  if (executorId === "jcode") return `npm.cmd run k7:jcode -- ${objective}`;
  if (executorId === "browser") return `npm.cmd run k7:browser -- ${objective}`;
  if (executorId === "manual") return "request human approval before execution";
  return `npm.cmd run k7:codex -- ${objective}`;
}

function buildHarnessDryRun(options = {}) {
  const route = routeMission(options);
  const mission = route.mission;
  const executorId = route.recommendedExecutor.id;
  return {
    version: 1,
    status: "ready",
    mode: "k7-harness-dry-run",
    route,
    nextAction: nextActionFor(executorId, mission),
    command: commandForExecutor(executorId, mission),
    allowedPaths: mission.allowedPaths,
    stopRules: mission.stopRules,
    approval: mission.approval,
    verificationCommands: mission.verificationCommands,
    expectedEvidence: mission.expectedEvidence,
    memoryDraft: [
      `Project: ${mission.project}`,
      `Objective: ${mission.objective}`,
      `Executor: ${executorId}`,
      `Learning: KAIZEN7 routed the mission through a bounded dry-run before execution.`,
    ].join("\n"),
  };
}

function nextActionFor(executorId, mission) {
  if (executorId === "manual") return "Stop and request approval with risk reasons before execution.";
  if (executorId === "browser") return "Inspect the target visually and return screenshot or DOM evidence.";
  if (executorId === "aider") return "Prepare Aider command as a dry-run; require CLI smoke test before real edits.";
  if (executorId === "qwen-code") return "Prepare Qwen Code command as a dry-run; require CLI smoke test before real orchestration.";
  if (executorId === "jcode") return "Prepare jcode harness packet as a dry-run; require smoke test before real sessions.";
  return `Run Codex locally within ${mission.allowedPaths.join(", ")} and verify with ${mission.verificationCommands.join(", ")}.`;
}

function parseArgs(argv = []) {
  return parseMissionArgs(argv);
}

function formatHarnessRoute(route) {
  return [
    "## K7 Harness Router",
    "",
    `Status: ${route.status}`,
    `Objective: ${route.mission.objective}`,
    `Executor: ${route.recommendedExecutor.id}`,
    `Reason: ${route.reason}`,
    "",
    "### Gates",
    ...route.gates.map((gate) => `- ${gate}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const route = routeMission(args);
  if (args.json) process.stdout.write(`${JSON.stringify(route, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatHarnessRoute(route)}\n`);
}

module.exports = {
  buildHarnessDryRun,
  formatHarnessRoute,
  parseArgs,
  routeMission,
  scoreExecutor,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/k7-harness-router.test.js`

Expected: PASS with `k7 harness router tests passed`.

- [ ] **Step 5: Commit**

```powershell
git add lib/k7-harness-router.js tests/k7-harness-router.test.js
git commit -m "add K7 harness router"
```

---

### Task 3: Scripts, API, and Integration Tests

**Files:**
- Modify: `package.json`
- Modify: `server.js`
- Modify: `tests/server.integration.test.js`

**Interfaces:**
- Consumes: `buildMissionPacket(options)` from Task 1.
- Consumes: `routeMission(options)` and `buildHarnessDryRun(options)` from Task 2.
- Produces API endpoints:
  - `POST /api/k7/mission`
  - `POST /api/k7/harness/route`
  - `POST /api/k7/harness/dry-run`

- [ ] **Step 1: Write the failing integration test**

In `tests/server.integration.test.js`, add assertions near the other `/api/k7/*` cockpit endpoints:

```js
    const missionResponse = await fetch(`http://localhost:${port}/api/k7/mission`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "THE FOCUX",
        objective: "mejorar landing THE FOCUX con tests",
        capabilities: ["edit_code", "run_tests"],
      }),
    });
    assert.equal(missionResponse.status, 200);
    const mission = await missionResponse.json();
    assert.equal(mission.mode, "k7-mission-packet");
    assert.equal(mission.project, "THE FOCUX");
    assert.equal(mission.risk, "low");
    assert(mission.verificationCommands.includes("npm.cmd run check"));

    const routeResponse = await fetch(`http://localhost:${port}/api/k7/harness/route`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "usar memoria automatica, subagents y MCP",
        capabilities: ["memory_writeback", "subagents", "mcp_tools"],
      }),
    });
    assert.equal(routeResponse.status, 200);
    const route = await routeResponse.json();
    assert.equal(route.mode, "k7-harness-router");
    assert.equal(route.recommendedExecutor.id, "qwen-code");
    assert(route.gates.includes("external_cli_smoke_test_required"));

    const dryRunResponse = await fetch(`http://localhost:${port}/api/k7/harness/dry-run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "deploy production with token",
        capabilities: ["deploy", "credential_write"],
      }),
    });
    assert.equal(dryRunResponse.status, 200);
    const dryRun = await dryRunResponse.json();
    assert.equal(dryRun.mode, "k7-harness-dry-run");
    assert.equal(dryRun.route.recommendedExecutor.id, "manual");
    assert.equal(dryRun.approval.required, true);
```

- [ ] **Step 2: Run integration test to verify it fails**

Run: `node tests/server.integration.test.js`

Expected: FAIL with 404 or missing route data for `/api/k7/mission`.

- [ ] **Step 3: Wire server imports**

In `server.js`, add imports beside other KAIZEN7 module imports:

```js
const { buildMissionPacket } = require("./lib/k7-mission-packet");
const { buildHarnessDryRun, routeMission } = require("./lib/k7-harness-router");
```

- [ ] **Step 4: Add API routes**

In `server.js`, add these routes near the other `/api/k7/*` routes:

```js
    if (req.method === "POST" && url.pathname === "/api/k7/mission") {
      return writeJson(res, 200, buildMissionPacket({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/harness/route") {
      return writeJson(res, 200, routeMission({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/harness/dry-run") {
      return writeJson(res, 200, buildHarnessDryRun({ root, ...(await readBody(req)) }));
    }
```

- [ ] **Step 5: Add npm scripts and check coverage**

In `package.json`, add scripts:

```json
    "k7:mission": "node lib/k7-mission-packet.js",
    "k7:harness": "node lib/k7-harness-router.js",
```

In the `check` script, add:

```text
node --check lib/k7-mission-packet.js
node --check lib/k7-harness-router.js
node tests/k7-mission-packet.test.js
node tests/k7-harness-router.test.js
```

Place module checks near `lib/toolchain-router.js` and tests near `tests/toolchain-router.test.js`.

- [ ] **Step 6: Run focused verification**

Run:

```powershell
node tests/k7-mission-packet.test.js
node tests/k7-harness-router.test.js
node tests/server.integration.test.js
```

Expected:

```text
k7 mission packet tests passed
k7 harness router tests passed
K7 API approval firewall test passed
```

- [ ] **Step 7: Commit**

```powershell
git add package.json server.js tests/server.integration.test.js
git commit -m "wire K7 harness router API"
```

---

### Task 4: Production Readiness and Documentation

**Files:**
- Modify: `lib/production-readiness.js`
- Modify: `tests/production-readiness.test.js`
- Create: `docs/K7_HARNESS_ROUTER.md`
- Modify: `README.md`
- Modify: `KAIZEN7_INDEX.md`
- Modify: `docs/CHANGELOG.md`

**Interfaces:**
- Consumes API endpoints and scripts from Task 3.
- Produces user-facing discovery docs.

- [ ] **Step 1: Write readiness test additions**

In `tests/production-readiness.test.js`, add assertions matching the existing style:

```js
assert(ready.checks.some((check) => check.id === "module:k7-mission-packet" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:k7-harness-router" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-mission" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-harness-route" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-harness-dry-run" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "script:k7:mission" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "script:k7:harness" && check.status === "pass"));
```

- [ ] **Step 2: Run readiness test to verify it fails**

Run: `node tests/production-readiness.test.js`

Expected: FAIL because readiness does not include the new modules/endpoints/scripts.

- [ ] **Step 3: Update readiness module lists**

In `lib/production-readiness.js`, add:

```js
["k7-mission-packet", "lib/k7-mission-packet.js"],
["k7-harness-router", "lib/k7-harness-router.js"],
```

Add endpoint checks:

```js
["k7-mission", "/api/k7/mission"],
["k7-harness-route", "/api/k7/harness/route"],
["k7-harness-dry-run", "/api/k7/harness/dry-run"],
```

Add script checks:

```js
"k7:mission",
"k7:harness",
```

- [ ] **Step 4: Create documentation**

Create `docs/K7_HARNESS_ROUTER.md`:

```md
# K7 Harness Router

`K7 Harness Router` turns a project goal into a safe execution mission.

```text
goal -> mission packet -> executor route -> dry-run -> evidence -> memory
```

## Commands

```powershell
npm.cmd run k7:mission -- "mejorar THE FOCUX landing con tests"
npm.cmd run k7:harness -- "mejorar THE FOCUX landing con tests"
```

## API

```http
POST /api/k7/mission
POST /api/k7/harness/route
POST /api/k7/harness/dry-run
```

## Executors

- `codex`: default local executor.
- `qwen-code`: future adapter for memory, skills, subagents and MCP.
- `aider`: future adapter for focused repo patching.
- `jcode`: future adapter for session harness work.
- `browser`: visual and web evidence.
- `manual`: approval fallback.

## Safety

V1 is dry-run first. It does not install or execute external CLIs.

High-risk missions route to `manual`.
```

- [ ] **Step 5: Update discovery docs**

In `README.md`, add one short section:

```md
### K7 Harness Router

`k7:mission` and `k7:harness` turn a goal into a bounded mission packet and route it to the safest executor: Codex, Qwen Code, Aider, jcode, browser or manual approval.
```

In `KAIZEN7_INDEX.md`, add:

```md
docs/K7_HARNESS_ROUTER.md
npm.cmd run k7:mission -- "objective"
npm.cmd run k7:harness -- "objective"
POST /api/k7/mission
POST /api/k7/harness/route
POST /api/k7/harness/dry-run
```

In `docs/CHANGELOG.md`, add:

```md
- Added K7 Harness Router design surface for mission packets, executor routing and dry-run action plans.
```

- [ ] **Step 6: Run verification**

Run:

```powershell
node tests/production-readiness.test.js
npm.cmd run k7:ready
```

Expected:

```text
production readiness tests passed
```

and `k7:ready` reports pass for new modules, scripts and APIs.

- [ ] **Step 7: Commit**

```powershell
git add lib/production-readiness.js tests/production-readiness.test.js docs/K7_HARNESS_ROUTER.md README.md KAIZEN7_INDEX.md docs/CHANGELOG.md
git commit -m "document K7 harness router"
```

---

### Task 5: WebUI K7 Action Copilot

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `POST /api/k7/harness/dry-run` from Task 3.
- Produces: WebUI panel showing recommended executor, risk, stop rules, verification and memory draft.

- [ ] **Step 1: Add HTML panel**

In `index.html`, inside the existing AI Cockpit area, add:

```html
<section class="harness-panel" aria-labelledby="harnessTitle">
  <div class="panel-header">
    <div>
      <p class="eyebrow">K7 Action Copilot</p>
      <h3 id="harnessTitle">Mission Router</h3>
    </div>
    <button id="harnessDryRunBtn" class="ghost-btn" type="button">Dry Run</button>
  </div>
  <div id="harnessSummary" class="harness-summary"></div>
  <div class="harness-grid">
    <article>
      <span>Executor</span>
      <strong id="harnessExecutor">Esperando</strong>
      <small id="harnessReason">Sin mision todavia.</small>
    </article>
    <article>
      <span>Risk</span>
      <strong id="harnessRisk">-</strong>
      <small id="harnessApproval">Aprobacion pendiente de evaluar.</small>
    </article>
    <article>
      <span>Verification</span>
      <strong id="harnessVerify">-</strong>
      <small>Prueba antes de memoria.</small>
    </article>
  </div>
  <div id="harnessDetails" class="ai-list-output"></div>
</section>
```

- [ ] **Step 2: Add JS renderer**

In `app.js`, add:

```js
function renderHarnessDryRun(result) {
  const executor = result.route?.recommendedExecutor || {};
  document.querySelector("#harnessExecutor").textContent = executor.id || "manual";
  document.querySelector("#harnessReason").textContent = result.route?.reason || "Sin razon registrada.";
  document.querySelector("#harnessRisk").textContent = result.route?.mission?.risk || "unknown";
  document.querySelector("#harnessApproval").textContent = result.approval?.required ? "Requiere aprobacion humana." : "Dry-run seguro.";
  document.querySelector("#harnessVerify").textContent = asArray(result.verificationCommands).join(", ") || "npm.cmd run check";
  document.querySelector("#harnessSummary").innerHTML = `<strong>${escapeHtml(result.nextAction || "Preparar mision.")}</strong>`;
  renderAiPills(
    document.querySelector("#harnessDetails"),
    [
      `Command: ${result.command || "none"}`,
      ...asArray(result.stopRules).map((item) => `Stop: ${item}`),
      ...asArray(result.expectedEvidence).map((item) => `Evidence: ${item}`),
      result.memoryDraft ? `Memory: ${result.memoryDraft}` : "",
    ].filter(Boolean),
    "Sin dry-run.",
  );
}

async function runHarnessDryRun() {
  const mission = document.querySelector("#aiMissionInput").value.trim();
  if (!mission) {
    document.querySelector("#aiMissionInput").focus();
    return;
  }
  const result = await api("/api/k7/harness/dry-run", {
    method: "POST",
    body: JSON.stringify({
      objective: mission,
      project: document.querySelector("#aiPresetSelect").value === "flowmatik" ? "Flowmatik" : "KAIZEN7",
      capabilities: ["edit_code", "run_tests", "memory_writeback"],
    }),
  });
  renderHarnessDryRun(result);
}
```

Add event registration near existing AI Cockpit listeners:

```js
document.querySelector("#harnessDryRunBtn").addEventListener("click", runHarnessDryRun);
```

- [ ] **Step 3: Add minimal styles**

In `styles.css`, add:

```css
.harness-panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid rgba(200, 162, 74, 0.18);
  border-radius: 8px;
  background: #0d0e10;
}

.harness-summary {
  color: var(--ink);
  line-height: 1.45;
}

.harness-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.harness-grid article {
  min-height: 104px;
  padding: 13px;
  border: 1px solid rgba(200, 162, 74, 0.14);
  border-radius: 8px;
  background: #0b0c0e;
}

.harness-grid span,
.harness-grid small {
  display: block;
  color: var(--muted);
  line-height: 1.35;
}

.harness-grid strong {
  display: block;
  margin: 6px 0;
  color: var(--ink);
}

@media (max-width: 820px) {
  .harness-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Run syntax verification**

Run:

```powershell
node --check app.js
```

Expected: no output and exit code 0.

- [ ] **Step 5: Run API-backed smoke manually**

Run:

```powershell
npm.cmd run k7:harness -- "mejorar THE FOCUX landing con tests"
```

Expected output includes:

```text
## K7 Harness Router
Executor: codex
```

- [ ] **Step 6: Commit**

```powershell
git add index.html app.js styles.css
git commit -m "add K7 action copilot panel"
```

---

### Task 6: Full Verification and First Real Use

**Files:**
- No required code files.
- Optional memory update: `Obsidian/Flowmatik/Kaizen7/K7 Harness Router First Use 2026-06-30.md`

**Interfaces:**
- Consumes all prior tasks.
- Produces one verified first-use run for `Codex + KAIZEN7 + THE FOCUX`.

- [ ] **Step 1: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: all tests pass, including:

```text
k7 mission packet tests passed
k7 harness router tests passed
```

- [ ] **Step 2: Run the first THE FOCUX mission packet**

Run:

```powershell
npm.cmd run k7:mission -- --project "THE FOCUX" --capability edit_code --capability run_tests --capability memory_writeback "mejorar THE FOCUX con Codex, KAIZEN7 y evidencia"
```

Expected output includes:

```text
## K7 Mission Packet
Project: THE FOCUX
Risk: low
Preferred executor: auto
```

- [ ] **Step 3: Run the first THE FOCUX route**

Run:

```powershell
npm.cmd run k7:harness -- --project "THE FOCUX" --capability edit_code --capability run_tests --capability memory_writeback "mejorar THE FOCUX con Codex, KAIZEN7 y evidencia"
```

Expected output includes:

```text
## K7 Harness Router
Executor: codex
```

- [ ] **Step 4: Write first-use memory note**

Create `Obsidian/Flowmatik/Kaizen7/K7 Harness Router First Use 2026-06-30.md`:

```md
# K7 Harness Router First Use 2026-06-30

## Decision

KAIZEN7 starts using the Harness Router with Codex as the first real executor.

## First Mission

Project: THE FOCUX
Objective: mejorar THE FOCUX con Codex, KAIZEN7 y evidencia
Executor: codex

## Rule

External agents stay as dry-run adapters until smoke tests prove value.

## Verification

`npm.cmd run check` passed before first use.
```

- [ ] **Step 5: Commit**

```powershell
git add Obsidian/Flowmatik/Kaizen7/K7\ Harness\ Router\ First\ Use\ 2026-06-30.md
git commit -m "record K7 harness router first use"
```

---

## Self-Review

Spec coverage:

- Mission packet: Task 1.
- Router scoring: Task 2.
- Dry-run adapters: Task 2.
- API endpoints: Task 3.
- WebUI: Task 5.
- Safety gates: Tasks 1 and 2.
- Testing and readiness: Tasks 1 through 4 and Task 6.
- Obsidian memory: Task 6.

Placeholder scan:

- No placeholder markers or ambiguous placeholder sections are intentionally present.

Type consistency:

- `buildMissionPacket`, `routeMission`, `buildHarnessDryRun`, `parseArgs`, and `formatHarnessRoute` are defined before later tasks consume them.
- Executor IDs are consistently `codex`, `qwen-code`, `aider`, `jcode`, `browser`, `manual`.
