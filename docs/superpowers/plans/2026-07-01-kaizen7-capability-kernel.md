# KAIZEN7 Capability Kernel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first useful KAIZEN7 Capability Kernel: registry, resolver, Codex execution packet builder, evidence verifier, CLI, docs, and tests.

**Architecture:** Keep the kernel file-based and deterministic. `data/capabilities.json` stores capability contracts; `lib/capabilities/*` loads, validates, resolves, builds packets, and verifies evidence; existing `k7:start` and `k7:codex` remain stable until the kernel is proven through CLI/tests.

**Tech Stack:** Node.js CommonJS, built-in `fs`/`path`, existing test style with `node tests/*.test.js`, no new dependencies.

## Global Constraints

- KAIZEN7 is a small kernel, not a mega-agent or graph framework.
- No new dependencies in Phase 1.
- No external publishing, deployment, spending, deletion, dependency installation, credential handling, or secret storage.
- THE FOCUX, Flowmatik, and Mr. Kaizen are represented as capability packs or contracts, not merged into the core.
- Every new capability must be data + test + evidence path.
- `npm.cmd run check` must pass before completion.
- Memory writeback in Phase 1 returns drafts only; it does not write Obsidian notes automatically.

---

## File Structure

- Create `data/capabilities.json`: canonical v1 capability registry with kernel, Codex, Mr. Kaizen, Flowmatik, THE FOCUX, and research contracts.
- Create `lib/capabilities/registry.js`: load, normalize, validate, list, and find capabilities.
- Create `lib/capabilities/resolver.js`: infer domain and select capability chains from objectives.
- Create `lib/capabilities/packet.js`: build Codex execution packets from selected capabilities.
- Create `lib/capabilities/verifier.js`: verify evidence against selected capability requirements.
- Create `lib/capabilities/cli.js`: CLI surface for list, plan, packet, and verify.
- Create `lib/capabilities/index.js`: public module exports.
- Create `tests/capabilities.test.js`: end-to-end kernel tests.
- Create `docs/CAPABILITY_KERNEL.md`: operator documentation.
- Modify `package.json`: add `k7:capabilities` script and include new files/tests in `check`.

---

### Task 1: Registry Contract And Loader

**Files:**
- Create: `data/capabilities.json`
- Create: `lib/capabilities/registry.js`
- Create: `lib/capabilities/index.js`
- Test: `tests/capabilities.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `loadCapabilityRegistry(root?: string): object`
- Produces: `validateCapabilityRegistry(registry: object): string[]`
- Produces: `listCapabilities(options?: { root?: string, domain?: string, includeBlocked?: boolean }): object[]`
- Produces: `getCapability(id: string, options?: { root?: string }): object | null`
- Later tasks consume these functions from `lib/capabilities`.

- [ ] **Step 1: Write the failing registry test**

Add this first block to `tests/capabilities.test.js`:

```js
const assert = require("node:assert/strict");
const {
  getCapability,
  listCapabilities,
  loadCapabilityRegistry,
  validateCapabilityRegistry,
} = require("../lib/capabilities");

const registry = loadCapabilityRegistry();

assert.equal(registry.schema, "kaizen7.capabilities.v1");
assert.equal(validateCapabilityRegistry(registry).length, 0);
assert(listCapabilities().length >= 12);
assert(listCapabilities().some((capability) => capability.id === "kernel.capability_registry"));
assert(listCapabilities({ domain: "content" }).some((capability) => capability.id === "content.reel.script"));
assert.equal(getCapability("code.change").domain, "code");
assert.equal(getCapability("missing.capability"), null);

console.log("capability kernel tests passed");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests\capabilities.test.js`

Expected: FAIL with `Cannot find module '../lib/capabilities'`.

- [ ] **Step 3: Create the initial registry data**

Create `data/capabilities.json`:

```json
{
  "schema": "kaizen7.capabilities.v1",
  "version": 1,
  "default_operator": "codex",
  "capabilities": [
    {
      "id": "kernel.capability_registry",
      "domain": "kernel",
      "purpose": "Load, validate and list KAIZEN7 capability contracts.",
      "status": "active",
      "inputs": ["objective"],
      "outputs": ["capability_list", "validation_errors"],
      "requires": [],
      "tools": ["local"],
      "approval": [],
      "verification": ["registry_valid", "tests_passed"],
      "writeback": "kernel_learning",
      "keywords": ["capability", "registry", "kernel", "contracts"]
    },
    {
      "id": "kernel.capability_resolver",
      "domain": "kernel",
      "purpose": "Resolve an objective to the smallest useful capability or chain.",
      "status": "active",
      "inputs": ["objective", "constraints"],
      "outputs": ["capability_plan"],
      "requires": ["kernel.capability_registry"],
      "tools": ["local"],
      "approval": [],
      "verification": ["plan_has_capability", "risks_reported"],
      "writeback": "kernel_learning",
      "keywords": ["resolve", "route", "objective", "plan"]
    },
    {
      "id": "code.change",
      "domain": "code",
      "purpose": "Make a scoped code change with tests.",
      "status": "active",
      "inputs": ["objective", "allowed_files", "context"],
      "outputs": ["diff", "tests", "risks"],
      "requires": ["kernel.capability_resolver"],
      "tools": ["codex"],
      "approval": ["delete", "credential_write", "install_dependencies"],
      "verification": ["diff_present", "tests_passed", "risks_reported"],
      "writeback": "code_learning",
      "keywords": ["code", "implement", "fix", "tests", "refactor", "codex"]
    },
    {
      "id": "code.review",
      "domain": "code",
      "purpose": "Review code changes for bugs, risks and missing tests.",
      "status": "active",
      "inputs": ["diff", "objective"],
      "outputs": ["findings", "risk_summary"],
      "requires": [],
      "tools": ["codex"],
      "approval": [],
      "verification": ["findings_grounded", "risks_reported"],
      "writeback": "review_learning",
      "keywords": ["review", "bugs", "risk", "tests"]
    },
    {
      "id": "content.reel.script",
      "domain": "content",
      "purpose": "Create a short-form script that can be verified before production.",
      "status": "active",
      "inputs": ["objective", "brand", "audience", "constraints"],
      "outputs": ["script", "shot_list", "claims"],
      "requires": ["memory.brand", "judge.claims"],
      "tools": ["codex"],
      "approval": ["medical_claims", "publish"],
      "verification": ["script_has_hook", "claims_checked", "risks_reported"],
      "writeback": "content_learning",
      "keywords": ["reel", "script", "short", "mr kaizen", "content", "guion"]
    },
    {
      "id": "content.storyboard",
      "domain": "content",
      "purpose": "Convert a script into a compact shot list and storyboard plan.",
      "status": "active",
      "inputs": ["script", "visual_style", "duration"],
      "outputs": ["shot_list", "asset_brief"],
      "requires": ["content.reel.script"],
      "tools": ["codex"],
      "approval": [],
      "verification": ["shot_list_present", "asset_brief_present"],
      "writeback": "content_learning",
      "keywords": ["storyboard", "shots", "visual", "flowmatik"]
    },
    {
      "id": "video.render_plan",
      "domain": "video",
      "purpose": "Plan a renderable video package without executing publishing or paid tools.",
      "status": "active",
      "inputs": ["shot_list", "assets", "duration"],
      "outputs": ["render_plan", "asset_manifest"],
      "requires": ["content.storyboard"],
      "tools": ["codex", "local"],
      "approval": ["publish"],
      "verification": ["render_plan_present", "risks_reported"],
      "writeback": "video_learning",
      "keywords": ["video", "render", "flowmatik", "assets"]
    },
    {
      "id": "persona.voice",
      "domain": "content",
      "purpose": "Apply Mr. Kaizen voice, tone and narrative constraints to content.",
      "status": "active",
      "inputs": ["objective", "brand_memory"],
      "outputs": ["voice_rules", "tone_constraints"],
      "requires": ["memory.brand"],
      "tools": ["codex"],
      "approval": [],
      "verification": ["voice_rules_present"],
      "writeback": "content_learning",
      "keywords": ["mr kaizen", "voice", "persona", "tone"]
    },
    {
      "id": "claims.check",
      "domain": "commerce",
      "purpose": "Check product, supplement and wellness claims before content or commerce use.",
      "status": "active",
      "inputs": ["claims", "market", "evidence"],
      "outputs": ["allowed_claims", "blocked_claims", "risk_notes"],
      "requires": [],
      "tools": ["codex"],
      "approval": ["medical_claims"],
      "verification": ["blocked_claims_reported", "sources_reported"],
      "writeback": "claims_learning",
      "keywords": ["claims", "the focux", "supplement", "medical", "regulation"]
    },
    {
      "id": "commerce.product_page",
      "domain": "commerce",
      "purpose": "Draft a product page from verified product and claims inputs.",
      "status": "active",
      "inputs": ["product_brief", "allowed_claims", "audience"],
      "outputs": ["product_page_draft", "claims_used"],
      "requires": ["claims.check"],
      "tools": ["codex"],
      "approval": ["publish", "commerce_write"],
      "verification": ["claims_checked", "risks_reported"],
      "writeback": "commerce_learning",
      "keywords": ["product page", "the focux", "commerce", "shopify"]
    },
    {
      "id": "research.pattern_intake",
      "domain": "research",
      "purpose": "Turn external repos, models or tools into sourceable KAIZEN7 adaptation decisions.",
      "status": "active",
      "inputs": ["source", "objective"],
      "outputs": ["patterns", "verdict", "risks"],
      "requires": [],
      "tools": ["github", "huggingface", "codex"],
      "approval": [],
      "verification": ["sources_reported", "risks_reported", "verdict_present"],
      "writeback": "architecture_decision",
      "keywords": ["research", "github", "huggingface", "repo", "pattern"]
    },
    {
      "id": "memory.writeback_draft",
      "domain": "memory",
      "purpose": "Draft reusable learning without writing secrets or raw transcripts.",
      "status": "active",
      "inputs": ["evidence", "decision", "risks"],
      "outputs": ["memory_draft"],
      "requires": [],
      "tools": ["local"],
      "approval": [],
      "verification": ["no_secrets", "decision_present"],
      "writeback": "memory_learning",
      "keywords": ["memory", "writeback", "obsidian", "learning"]
    }
  ]
}
```

- [ ] **Step 4: Implement registry loader**

Create `lib/capabilities/registry.js`:

```js
const fs = require("fs");
const path = require("path");

const REQUIRED_FIELDS = [
  "id",
  "domain",
  "purpose",
  "status",
  "inputs",
  "outputs",
  "requires",
  "tools",
  "approval",
  "verification",
  "writeback",
];

const VALID_STATUSES = new Set(["active", "experimental", "deprecated", "blocked"]);

function registryPath(root = process.cwd()) {
  return path.join(root, "data", "capabilities.json");
}

function loadCapabilityRegistry(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(registryPath(root), "utf8"));
}

function validateCapability(capability) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!(field in capability)) errors.push(`${capability.id || "unknown"} missing ${field}`);
  }
  if (capability.id && !/^[a-z0-9]+(\.[a-z0-9_]+)+$/.test(capability.id)) errors.push(`${capability.id} has invalid id`);
  if (capability.status && !VALID_STATUSES.has(capability.status)) errors.push(`${capability.id} has invalid status`);
  for (const field of ["inputs", "outputs", "requires", "tools", "approval", "verification"]) {
    if (field in capability && !Array.isArray(capability[field])) errors.push(`${capability.id} ${field} must be an array`);
  }
  return errors;
}

function validateCapabilityRegistry(registry = {}) {
  const errors = [];
  if (registry.schema !== "kaizen7.capabilities.v1") errors.push("registry schema must be kaizen7.capabilities.v1");
  if (!Array.isArray(registry.capabilities)) errors.push("registry capabilities must be an array");
  const ids = new Set();
  for (const capability of registry.capabilities || []) {
    errors.push(...validateCapability(capability));
    if (ids.has(capability.id)) errors.push(`${capability.id} duplicated`);
    ids.add(capability.id);
  }
  for (const capability of registry.capabilities || []) {
    for (const required of capability.requires || []) {
      if (required.includes(".") && !required.startsWith("memory.") && !required.startsWith("judge.") && !ids.has(required)) {
        errors.push(`${capability.id} requires missing capability ${required}`);
      }
    }
  }
  return errors;
}

function listCapabilities(options = {}) {
  const registry = options.registry || loadCapabilityRegistry(options.root);
  return (registry.capabilities || [])
    .filter((capability) => options.includeBlocked || capability.status !== "blocked")
    .filter((capability) => !options.domain || capability.domain === options.domain);
}

function getCapability(id, options = {}) {
  return listCapabilities({ ...options, includeBlocked: true }).find((capability) => capability.id === id) || null;
}

module.exports = {
  getCapability,
  listCapabilities,
  loadCapabilityRegistry,
  registryPath,
  validateCapabilityRegistry,
};
```

- [ ] **Step 5: Export module**

Create `lib/capabilities/index.js`:

```js
module.exports = {
  ...require("./registry"),
};
```

- [ ] **Step 6: Add package script and check entries**

Modify `package.json`:

```json
"k7:capabilities": "node lib/capabilities/cli.js"
```

Also insert these into `check` after `lib/smart-crons.js` syntax checks and before tests:

```text
node --check lib/capabilities/registry.js && node --check lib/capabilities/index.js && node tests/capabilities.test.js
```

- [ ] **Step 7: Run registry test**

Run: `node tests\capabilities.test.js`

Expected: PASS with `capability kernel tests passed`.

- [ ] **Step 8: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add data/capabilities.json lib/capabilities/registry.js lib/capabilities/index.js tests/capabilities.test.js package.json
git commit -m "add capability registry"
```

---

### Task 2: Capability Resolver

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/resolver.js`
- Modify: `lib/capabilities/index.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `listCapabilities(options)`
- Produces: `inferCapabilityDomain(objective: string): string`
- Produces: `resolveCapabilities(objective: string, options?: { root?: string, limit?: number }): object`
- Later tasks consume `resolveCapabilities()`.

- [ ] **Step 1: Add failing resolver tests**

Append before the final `console.log` in `tests/capabilities.test.js`:

```js
const {
  inferCapabilityDomain,
  resolveCapabilities,
} = require("../lib/capabilities");

assert.equal(inferCapabilityDomain("crear reel de Mr Kaizen para foco"), "content");
assert.equal(inferCapabilityDomain("arreglar bug con tests en KAIZEN7"), "code");
assert.equal(inferCapabilityDomain("revisar claims de THE FOCUX para producto premium"), "commerce");

const codePlan = resolveCapabilities("implementar cambio con tests en KAIZEN7");
assert.equal(codePlan.status, "ready");
assert.equal(codePlan.inferredDomain, "code");
assert.equal(codePlan.selected[0].id, "code.change");
assert(codePlan.approvalGates.includes("delete"));
assert(codePlan.verification.includes("tests_passed"));

const reelPlan = resolveCapabilities("crear reel de Mr Kaizen sobre foco en Bangkok");
assert.equal(reelPlan.inferredDomain, "content");
assert(reelPlan.selected.some((capability) => capability.id === "content.reel.script"));
assert(reelPlan.selected.some((capability) => capability.id === "persona.voice"));

const claimsPlan = resolveCapabilities("comprobar claims de THE FOCUX antes de publicar");
assert.equal(claimsPlan.inferredDomain, "commerce");
assert.equal(claimsPlan.selected[0].id, "claims.check");
assert(claimsPlan.approvalGates.includes("medical_claims"));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests\capabilities.test.js`

Expected: FAIL because `inferCapabilityDomain` is not a function.

- [ ] **Step 3: Implement resolver**

Create `lib/capabilities/resolver.js`:

```js
const { listCapabilities } = require("./registry");

const DOMAIN_HINTS = {
  code: [/code|codigo|bug|test|tests|implementar|fix|refactor|kaizen7/i],
  content: [/reel|script|guion|mr kaizen|content|contenido|storyboard|video|flowmatik|bangkok/i],
  commerce: [/claim|claims|focux|producto|product|commerce|shopify|formula|supplier|proveedor/i],
  research: [/research|github|hugging|repo|modelo|paper|pattern|patron/i],
  memory: [/memory|memoria|obsidian|writeback|learning|aprendizaje/i],
};

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function tokenize(text = "") {
  return String(text).toLowerCase().split(/[^a-z0-9_áéíóúñ]+/i).filter(Boolean);
}

function inferCapabilityDomain(objective = "") {
  for (const [domain, patterns] of Object.entries(DOMAIN_HINTS)) {
    if (patterns.some((pattern) => pattern.test(objective))) return domain;
  }
  return "kernel";
}

function scoreCapability(tokens, capability, inferredDomain) {
  let score = 0;
  if (capability.domain === inferredDomain) score += 20;
  if (capability.status === "active") score += 5;
  const haystack = [
    capability.id,
    capability.domain,
    capability.purpose,
    ...(capability.keywords || []),
    ...(capability.inputs || []),
    ...(capability.outputs || []),
  ].join(" ").toLowerCase();
  for (const token of tokens) {
    if (token.length < 3) continue;
    if (haystack.includes(token)) score += 4;
  }
  return score;
}

function expandRequires(selected, capabilitiesById) {
  const expanded = [];
  for (const capability of selected) {
    for (const required of capability.requires || []) {
      const dependency = capabilitiesById.get(required);
      if (dependency) expanded.push(dependency);
    }
    expanded.push(capability);
  }
  return unique(expanded.map((item) => item.id)).map((id) => capabilitiesById.get(id));
}

function resolveCapabilities(objective = "", options = {}) {
  const inferredDomain = options.domain || inferCapabilityDomain(objective);
  const tokens = tokenize(objective);
  const capabilities = listCapabilities(options);
  const capabilitiesById = new Map(capabilities.map((capability) => [capability.id, capability]));
  const ranked = capabilities
    .map((capability) => ({ capability, score: scoreCapability(tokens, capability, inferredDomain) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.capability.id.localeCompare(b.capability.id))
    .slice(0, options.limit || 3)
    .map((item) => item.capability);
  const selected = expandRequires(ranked.length ? ranked : [capabilitiesById.get("kernel.capability_resolver")].filter(Boolean), capabilitiesById);
  return {
    version: 1,
    status: selected.length ? "ready" : "needs_capability",
    mode: "capability-plan",
    objective,
    inferredDomain,
    selected,
    approvalGates: unique(selected.flatMap((capability) => capability.approval || [])),
    verification: unique(selected.flatMap((capability) => capability.verification || [])),
    tools: unique(selected.flatMap((capability) => capability.tools || [])),
    missingInputs: unique(selected.flatMap((capability) => capability.inputs || [])).filter((input) => input !== "objective"),
    writeback: unique(selected.map((capability) => capability.writeback)),
  };
}

module.exports = {
  inferCapabilityDomain,
  resolveCapabilities,
  scoreCapability,
  tokenize,
};
```

- [ ] **Step 4: Export resolver**

Modify `lib/capabilities/index.js`:

```js
module.exports = {
  ...require("./registry"),
  ...require("./resolver"),
};
```

- [ ] **Step 5: Add resolver to check**

Modify `package.json` check syntax section:

```text
node --check lib/capabilities/registry.js && node --check lib/capabilities/resolver.js && node --check lib/capabilities/index.js
```

- [ ] **Step 6: Run resolver test**

Run: `node tests\capabilities.test.js`

Expected: PASS.

- [ ] **Step 7: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add lib/capabilities/resolver.js lib/capabilities/index.js tests/capabilities.test.js package.json
git commit -m "resolve objectives to capabilities"
```

---

### Task 3: Codex Execution Packet Builder

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/packet.js`
- Modify: `lib/capabilities/index.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `resolveCapabilities(objective, options)`
- Produces: `buildCapabilityPacket(objective: string, options?: { root?: string, allowedFiles?: string[], context?: string[] }): object`
- Later CLI/API tasks consume `buildCapabilityPacket()`.

- [ ] **Step 1: Add failing packet tests**

Append before the final `console.log`:

```js
const { buildCapabilityPacket } = require("../lib/capabilities");

const packet = buildCapabilityPacket("implementar cambio con tests en KAIZEN7", {
  allowedFiles: ["lib/capabilities/registry.js", "tests/capabilities.test.js"],
  context: ["docs/ARCHITECTURE.md"],
});
assert.equal(packet.mode, "k7-execution-packet");
assert.equal(packet.operator, "codex");
assert.equal(packet.capabilities[0], "code.change");
assert(packet.allowed_files.includes("lib/capabilities/registry.js"));
assert(packet.context.includes("docs/ARCHITECTURE.md"));
assert(packet.forbidden_actions.includes("credential_write"));
assert(packet.commands.includes("node tests/capabilities.test.js"));
assert(packet.commands.includes("npm.cmd run check"));
assert(packet.evidence_required.includes("tests"));
assert.equal(packet.writeback.rule, "write only reusable learning; no secrets");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests\capabilities.test.js`

Expected: FAIL because `buildCapabilityPacket` is not a function.

- [ ] **Step 3: Implement packet builder**

Create `lib/capabilities/packet.js`:

```js
const { resolveCapabilities } = require("./resolver");

const FORBIDDEN_ACTIONS = [
  "publish",
  "deploy",
  "delete",
  "spend",
  "credential_write",
  "install_dependencies_without_approval",
];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function defaultAllowedFiles(plan) {
  if (plan.inferredDomain === "code" || plan.inferredDomain === "kernel") {
    return ["lib/capabilities/", "tests/capabilities.test.js", "data/capabilities.json"];
  }
  return ["data/capabilities.json", "docs/CAPABILITY_KERNEL.md"];
}

function buildCapabilityPacket(objective = "", options = {}) {
  const plan = options.plan || resolveCapabilities(objective, options);
  return {
    version: 1,
    mode: "k7-execution-packet",
    objective,
    operator: options.operator || "codex",
    capabilities: plan.selected.map((capability) => capability.id),
    capability_plan: {
      inferred_domain: plan.inferredDomain,
      approval_gates: plan.approvalGates,
      verification: plan.verification,
      missing_inputs: plan.missingInputs,
    },
    allowed_files: unique(options.allowedFiles || defaultAllowedFiles(plan)),
    context: unique(options.context || [
      "docs/ARCHITECTURE.md",
      "docs/superpowers/specs/2026-07-01-kaizen7-capability-kernel-design.md",
      "Obsidian/Flowmatik/Arquitectura/KAIZEN7 Clean Start Method 2026-07-01.md",
    ]),
    forbidden_actions: FORBIDDEN_ACTIONS,
    commands: unique([
      "node tests/capabilities.test.js",
      "npm.cmd run check",
    ]),
    evidence_required: ["diff", "tests", "risks"],
    expected_output: {
      claims: "What changed and why.",
      evidence: "Exact commands and results.",
      risks: "Remaining risks or approvals.",
      memory_draft: "Reusable learning only.",
    },
    writeback: {
      target: "Obsidian/Flowmatik/Arquitectura/",
      rule: "write only reusable learning; no secrets",
      mode: "draft_only",
    },
  };
}

module.exports = {
  FORBIDDEN_ACTIONS,
  buildCapabilityPacket,
};
```

- [ ] **Step 4: Export packet builder**

Modify `lib/capabilities/index.js`:

```js
module.exports = {
  ...require("./registry"),
  ...require("./resolver"),
  ...require("./packet"),
};
```

- [ ] **Step 5: Add packet file to check**

Modify `package.json` check syntax section:

```text
node --check lib/capabilities/packet.js
```

- [ ] **Step 6: Run packet test**

Run: `node tests\capabilities.test.js`

Expected: PASS.

- [ ] **Step 7: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add lib/capabilities/packet.js lib/capabilities/index.js tests/capabilities.test.js package.json
git commit -m "build capability execution packets"
```

---

### Task 4: Evidence Verifier

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/verifier.js`
- Modify: `lib/capabilities/index.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: packet objects from `buildCapabilityPacket()`
- Produces: `verifyCapabilityEvidence(packet: object, evidence: object): object`
- CLI task consumes verifier.

- [ ] **Step 1: Add failing verifier tests**

Append before the final `console.log`:

```js
const { verifyCapabilityEvidence } = require("../lib/capabilities");

const blockedVerification = verifyCapabilityEvidence(packet, {
  claims: ["changed files are scoped"],
  evidence: { diff: ["lib/capabilities/registry.js"] },
});
assert.equal(blockedVerification.verdict, "block");
assert(blockedVerification.missing.includes("tests"));
assert(blockedVerification.missing.includes("risks"));

const passedVerification = verifyCapabilityEvidence(packet, {
  claims: ["changed files are scoped", "tests passed", "risks reported"],
  evidence: {
    diff: ["lib/capabilities/registry.js"],
    tests: "node tests/capabilities.test.js passed",
    risks: ["no external effects"],
  },
});
assert.equal(passedVerification.verdict, "pass");
assert.equal(passedVerification.missing.length, 0);
assert(passedVerification.acceptedClaims.includes("tests passed"));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests\capabilities.test.js`

Expected: FAIL because `verifyCapabilityEvidence` is not a function.

- [ ] **Step 3: Implement verifier**

Create `lib/capabilities/verifier.js`:

```js
function hasEvidence(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value || "").trim());
}

function verifyCapabilityEvidence(packet = {}, result = {}) {
  const evidence = result.evidence || {};
  const required = packet.evidence_required || ["diff", "tests", "risks"];
  const missing = required.filter((item) => !hasEvidence(evidence[item]));
  const claims = (result.claims || []).map((claim) => String(claim || ""));
  return {
    version: 1,
    mode: "capability-evidence-verification",
    verdict: missing.length ? "block" : "pass",
    capability: packet.capabilities?.[0] || "unknown",
    required,
    missing,
    acceptedClaims: missing.length ? [] : claims,
    gates: missing.length
      ? [`Missing evidence: ${missing.join(", ")}`]
      : ["Evidence satisfies required capability packet contract."],
  };
}

module.exports = {
  verifyCapabilityEvidence,
};
```

- [ ] **Step 4: Export verifier**

Modify `lib/capabilities/index.js`:

```js
module.exports = {
  ...require("./registry"),
  ...require("./resolver"),
  ...require("./packet"),
  ...require("./verifier"),
};
```

- [ ] **Step 5: Add verifier to check**

Modify `package.json` check syntax section:

```text
node --check lib/capabilities/verifier.js
```

- [ ] **Step 6: Run verifier test**

Run: `node tests\capabilities.test.js`

Expected: PASS.

- [ ] **Step 7: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add lib/capabilities/verifier.js lib/capabilities/index.js tests/capabilities.test.js package.json
git commit -m "verify capability evidence"
```

---

### Task 5: CLI Surface

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/cli.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: public functions from `lib/capabilities`
- Produces CLI:
  - `npm.cmd run k7:capabilities -- --list`
  - `npm.cmd run k7:capabilities -- --plan "<objective>"`
  - `npm.cmd run k7:capabilities -- --packet "<objective>"`

- [ ] **Step 1: Add CLI tests**

Append before final `console.log`:

```js
const { spawnSync } = require("node:child_process");

const listCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--list"], { encoding: "utf8" });
assert.equal(listCli.status, 0);
assert(listCli.stdout.includes("kernel.capability_registry"));

const planCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--plan", "crear reel de Mr Kaizen"], { encoding: "utf8" });
assert.equal(planCli.status, 0);
assert(planCli.stdout.includes("content.reel.script"));

const packetCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--packet", "implementar cambio con tests"], { encoding: "utf8" });
assert.equal(packetCli.status, 0);
assert(packetCli.stdout.includes("k7-execution-packet"));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests\capabilities.test.js`

Expected: FAIL because `lib/capabilities/cli.js` does not exist.

- [ ] **Step 3: Implement CLI**

Create `lib/capabilities/cli.js`:

```js
const {
  buildCapabilityPacket,
  listCapabilities,
  resolveCapabilities,
  verifyCapabilityEvidence,
} = require("./index");

function parseArgs(argv = []) {
  const flags = new Set();
  const parts = [];
  let evidence = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--evidence") evidence = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
    else parts.push(arg);
  }
  return { flags, objective: parts.join(" ").trim(), evidence };
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.flags.has("--list")) {
    printJson({ status: "ready", capabilities: listCapabilities().map((capability) => capability.id) });
    return;
  }
  if (args.flags.has("--plan")) {
    printJson(resolveCapabilities(args.objective));
    return;
  }
  if (args.flags.has("--packet")) {
    printJson(buildCapabilityPacket(args.objective));
    return;
  }
  if (args.flags.has("--verify")) {
    const packet = buildCapabilityPacket(args.objective);
    const result = args.evidence ? JSON.parse(args.evidence) : {};
    printJson(verifyCapabilityEvidence(packet, result));
    return;
  }
  printJson({
    status: "needs_input",
    usage: [
      "node lib/capabilities/cli.js --list",
      "node lib/capabilities/cli.js --plan \"<objective>\"",
      "node lib/capabilities/cli.js --packet \"<objective>\"",
      "node lib/capabilities/cli.js --verify \"<objective>\" --evidence \"<json>\"",
    ],
  });
}

if (require.main === module) run();

module.exports = {
  parseArgs,
  run,
};
```

- [ ] **Step 4: Add package script and check**

Modify `package.json` scripts:

```json
"k7:capabilities": "node lib/capabilities/cli.js"
```

Add to `check`:

```text
node --check lib/capabilities/cli.js
```

- [ ] **Step 5: Run CLI tests**

Run: `node tests\capabilities.test.js`

Expected: PASS.

- [ ] **Step 6: Run manual CLI checks**

Run:

```powershell
npm.cmd run k7:capabilities -- --list
npm.cmd run k7:capabilities -- --plan "crear reel de Mr Kaizen"
npm.cmd run k7:capabilities -- --packet "implementar cambio con tests"
```

Expected:

- first output includes `kernel.capability_registry`,
- second output includes `content.reel.script`,
- third output includes `k7-execution-packet`.

- [ ] **Step 7: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add lib/capabilities/cli.js package.json tests/capabilities.test.js
git commit -m "add capability kernel cli"
```

---

### Task 6: Operator Documentation

**Files:**
- Create: `docs/CAPABILITY_KERNEL.md`
- Modify: `docs/ARCHITECTURE.md`
- Test: `npm.cmd run check`

**Interfaces:**
- Produces human-facing docs for using the kernel.
- No JS API changes.

- [ ] **Step 1: Create docs**

Create `docs/CAPABILITY_KERNEL.md`:

```md
# KAIZEN7 Capability Kernel

The Capability Kernel turns an objective into a capability plan, a Codex execution packet, and an evidence gate.

## Rule

KAIZEN7 is a small kernel. Domain projects such as Flowmatik, THE FOCUX, and Mr. Kaizen live as capability packs or consumers, not as core.

## Commands

```powershell
npm.cmd run k7:capabilities -- --list
npm.cmd run k7:capabilities -- --plan "crear reel de Mr Kaizen"
npm.cmd run k7:capabilities -- --packet "implementar cambio con tests"
```

## Flow

```text
Objective -> Capability Plan -> Execution Packet -> Evidence Gate -> Memory Draft
```

## Capability Contract

Every capability has:

- id
- domain
- purpose
- status
- inputs
- outputs
- requires
- tools
- approval
- verification
- writeback

## Evidence

KAIZEN7 does not accept claims without evidence. A result must include:

- diff
- tests
- risks

Research work also needs sources. Visual work also needs artifacts or screenshots.
```

- [ ] **Step 2: Update architecture doc**

In `docs/ARCHITECTURE.md`, add one bullet under Main Modules:

```md
- `lib/capabilities/` - file-based Capability Kernel: registry, resolver, execution packets and evidence verification.
```

Add this to Data Flow after `activation cockpit`:

```text
  -> capability kernel
  -> execution packet
```

- [ ] **Step 3: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add docs/CAPABILITY_KERNEL.md docs/ARCHITECTURE.md
git commit -m "document capability kernel"
```

---

### Task 7: API Wiring

**Files:**
- Modify: `server.js`
- Modify: `tests/server.integration.test.js`
- Modify: `package.json` only if check needs new syntax entries, which it should not after earlier tasks.

**Interfaces:**
- Consumes: `resolveCapabilities`, `buildCapabilityPacket`, `verifyCapabilityEvidence`
- Produces:
  - `POST /api/k7/capabilities/plan`
  - `POST /api/k7/capabilities/packet`
  - `POST /api/k7/capabilities/verify`

- [ ] **Step 1: Add failing integration assertions**

In `tests/server.integration.test.js`, after the `/api/k7/start` block, add:

```js
    const capabilityPlanResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "crear reel de Mr Kaizen" }),
    });
    assert.equal(capabilityPlanResponse.status, 200);
    const capabilityPlan = await capabilityPlanResponse.json();
    assert.equal(capabilityPlan.mode, "capability-plan");
    assert(capabilityPlan.selected.some((capability) => capability.id === "content.reel.script"));

    const capabilityPacketResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/packet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityPacketResponse.status, 200);
    const capabilityPacket = await capabilityPacketResponse.json();
    assert.equal(capabilityPacket.mode, "k7-execution-packet");

    const capabilityVerifyResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "implementar cambio con tests",
        result: { claims: ["changed files are scoped"], evidence: { diff: ["x"] } },
      }),
    });
    assert.equal(capabilityVerifyResponse.status, 200);
    const capabilityVerify = await capabilityVerifyResponse.json();
    assert.equal(capabilityVerify.verdict, "block");
```

- [ ] **Step 2: Run integration test to verify it fails**

Run: `node tests\server.integration.test.js`

Expected: FAIL with 404 for `/api/k7/capabilities/plan`.

- [ ] **Step 3: Import capability functions**

In `server.js`, add near other imports:

```js
const {
  buildCapabilityPacket,
  resolveCapabilities,
  verifyCapabilityEvidence,
} = require("./lib/capabilities");
```

- [ ] **Step 4: Add API routes**

In `server.js`, near other `/api/k7/*` routes, add:

```js
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/plan") {
      const body = await readBody(req);
      return writeJson(res, 200, resolveCapabilities(body.objective || body.goal || "", { root }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/packet") {
      const body = await readBody(req);
      return writeJson(res, 200, buildCapabilityPacket(body.objective || body.goal || "", {
        root,
        allowedFiles: body.allowedFiles,
        context: body.context,
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/verify") {
      const body = await readBody(req);
      const packet = body.packet || buildCapabilityPacket(body.objective || body.goal || "", { root });
      return writeJson(res, 200, verifyCapabilityEvidence(packet, body.result || {}));
    }
```

- [ ] **Step 5: Run integration test**

Run: `node tests\server.integration.test.js`

Expected: PASS.

- [ ] **Step 6: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add server.js tests/server.integration.test.js
git commit -m "expose capability kernel api"
```

---

### Task 8: Start/Codex Packet Integration

**Files:**
- Modify: `lib/start-hub.js`
- Modify: `lib/codex-bridge.js`
- Modify: `tests/start-hub.test.js`
- Modify: `tests/codex-bridge.test.js`

**Interfaces:**
- Consumes: `buildCapabilityPacket(objective, options)`
- Produces: `start.capabilityPacket`
- Produces: `bridge.capabilityPacket`

- [ ] **Step 1: Add failing start-hub assertion**

In `tests/start-hub.test.js`, add after existing `report` assertions:

```js
assert.equal(report.capabilityPacket.mode, "k7-execution-packet");
assert(report.capabilityPacket.capabilities.length > 0);
assert(report.capabilityPacket.commands.includes("npm.cmd run check"));
```

- [ ] **Step 2: Add failing codex bridge assertion**

In `tests/codex-bridge.test.js`, add after `assert.equal(bridge.mode, "codex-bridge");`:

```js
assert.equal(bridge.capabilityPacket.mode, "k7-execution-packet");
assert(bridge.capabilityPacket.forbidden_actions.includes("credential_write"));
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
node tests\start-hub.test.js
node tests\codex-bridge.test.js
```

Expected: FAIL because `capabilityPacket` is undefined.

- [ ] **Step 4: Add packet to start hub**

In `lib/start-hub.js`, import:

```js
const { buildCapabilityPacket } = require("./capabilities");
```

Inside `buildStartHub()` after `evalCommands`:

```js
  const capabilityPacket = buildCapabilityPacket(objective, {
    root: options.root || process.cwd(),
    context: [
      "docs/ARCHITECTURE.md",
      "docs/CAPABILITY_KERNEL.md",
    ],
  });
```

Add to returned object:

```js
    capabilityPacket,
```

- [ ] **Step 5: Add packet to codex bridge**

In `lib/codex-bridge.js`, import:

```js
const { buildCapabilityPacket } = require("./capabilities");
```

Inside `buildCodexBridge()` after `frontier`:

```js
  const capabilityPacket = buildCapabilityPacket(goal, {
    root,
    operator: "codex",
  });
```

Add to returned object:

```js
    capabilityPacket,
```

- [ ] **Step 6: Run focused tests**

Run:

```powershell
node tests\start-hub.test.js
node tests\codex-bridge.test.js
```

Expected: PASS.

- [ ] **Step 7: Run full check**

Run: `npm.cmd run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add lib/start-hub.js lib/codex-bridge.js tests/start-hub.test.js tests/codex-bridge.test.js
git commit -m "attach capability packets to start and codex"
```

---

## Final Verification

- [ ] Run: `npm.cmd run check`
- [ ] Run: `npm.cmd run k7:capabilities -- --list`
- [ ] Run: `npm.cmd run k7:capabilities -- --plan "crear reel de Mr Kaizen sobre foco"`
- [ ] Run: `npm.cmd run k7:capabilities -- --packet "implementar cambio con tests en KAIZEN7"`
- [ ] Confirm `git status --short` contains only intentional changes or is clean after commits.

## Plan Self-Review

- Spec coverage: Tasks cover registry, resolver, packet builder, verifier, CLI, docs, API, and Codex/start integration.
- Placeholder scan: No `TBD`, `TODO`, or incomplete implementation instructions remain.
- Type consistency: Public functions are introduced in this order: registry -> resolver -> packet -> verifier -> CLI/API/integrations.
