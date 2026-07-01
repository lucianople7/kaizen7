# Agent Language Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a semantic AI-to-AI contract layer so KAIZEN7 guides agents with intent, boundaries, evidence and done rules instead of command-centric instructions.

**Architecture:** Add a focused `lib/capabilities/agent-contract.js` module that consumes the existing capability resolver and produces `kaizen7.agent_contract.v1` objects. Existing execution packets remain compatible but gain an `agent_contract` field; CLI/API/start/Codex expose the semantic contract without making it dependent on any operating system or runtime.

**Tech Stack:** Node.js CommonJS, existing file-based capability registry, existing CLI/API server, existing no-framework test style using `node:assert`.

## Global Constraints

- Keep the kernel small; do not add a new runtime, workflow engine, or domain-specific content volume.
- The public contract must not depend on Windows, Linux, shell syntax, package managers, or a specific agent runtime.
- Commands may exist only as optional runtime hints or compatibility fields, not as required agent-language fields.
- Every contract must include `objective`, `intent`, `route`, `capabilities`, `boundary`, `context`, `evidence`, `done`, and `memory`.
- Every result must remain blocked until required semantic evidence is present.
- Existing `k7-execution-packet`, CLI, API, start hub, and Codex bridge compatibility must continue to work.
- All implementation follows TDD with focused tests first and a commit after each task.

---

## File Structure

- `lib/capabilities/agent-contract.js`: creates the semantic agent contract and exports vocabulary helpers.
- `lib/capabilities/packet.js`: embeds the agent contract into the existing execution packet.
- `lib/capabilities/verifier.js`: accepts semantic evidence aliases such as `changed_surface`, `verification_result`, and `remaining_risks`.
- `lib/capabilities/cli.js`: adds `--contract`.
- `lib/capabilities/index.js`: exports the new module.
- `server.js`: adds `POST /api/k7/capabilities/contract`.
- `lib/start-hub.js`: exposes `agentContract` through `capabilityPacket.agent_contract`.
- `lib/codex-bridge.js`: exposes `agentContract` through `capabilityPacket.agent_contract`.
- `docs/AGENT_LANGUAGE.md`: operator and agent-facing documentation.
- Tests:
  - `tests/capabilities.test.js`
  - `tests/server.integration.test.js`
  - `tests/start-hub.test.js`
  - `tests/codex-bridge.test.js`

---

### Task 1: Semantic Agent Contract Builder

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/agent-contract.js`
- Modify: `lib/capabilities/index.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `resolveCapabilities(objective: string, options?: object): object`
- Produces: `buildAgentContract(objective: string, options?: { plan?: object, context?: string[] }): object`
- Produces: `inferAgentIntent(plan: object, objective?: string): string`
- Produces: `buildAgentRoute(plan: object): string[]`

- [ ] **Step 1: Write the failing tests**

In `tests/capabilities.test.js`, update the import block:

```js
const {
  buildAgentContract,
  buildCapabilityPacket,
  getCapability,
  inferAgentIntent,
  inferCapabilityDomain,
  listCapabilities,
  loadCapabilityRegistry,
  resolveCapabilities,
  verifyCapabilityEvidence,
  validateCapabilityRegistry,
} = require("../lib/capabilities");
```

Append before the existing packet assertions:

```js
const agentContract = buildAgentContract("implementar cambio con tests en KAIZEN7", {
  context: ["docs/CAPABILITY_KERNEL.md"],
});
assert.equal(agentContract.schema, "kaizen7.agent_contract.v1");
assert.equal(agentContract.intent, "code_change");
assert.deepEqual(agentContract.route, ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"]);
assert(agentContract.capabilities.includes("modify_code"));
assert.equal(agentContract.boundary.scope, "smallest_useful_change");
assert(agentContract.boundary.avoid.includes("secrets"));
assert.deepEqual(agentContract.context.references, ["docs/CAPABILITY_KERNEL.md"]);
assert(agentContract.evidence.required.includes("changed_surface"));
assert.equal(agentContract.done.rule, "do_not_complete_until_required_evidence_is_present");
assert.equal(agentContract.memory.rule, "draft_reusable_learning_only");
assert.equal(Object.hasOwn(agentContract, "commands"), false);
assert.equal(inferAgentIntent(codePlan, "implementar cambio con tests"), "code_change");
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests\capabilities.test.js
```

Expected: FAIL with `buildAgentContract is not a function`.

- [ ] **Step 3: Implement the minimal contract builder**

Create `lib/capabilities/agent-contract.js`:

```js
const { resolveCapabilities } = require("./resolver");

const DOMAIN_INTENTS = {
  code: "code_change",
  content: "content_creation",
  commerce: "commerce_work",
  research: "research_intake",
  memory: "memory_writeback",
  video: "video_planning",
  kernel: "kernel_improvement",
};

const DOMAIN_CAPABILITIES = {
  code: ["modify_code", "verify_result", "report_risks"],
  content: ["shape_content", "check_claims", "report_risks"],
  commerce: ["check_claims", "shape_offer", "report_risks"],
  research: ["inspect_sources", "extract_patterns", "report_risks"],
  memory: ["draft_memory", "avoid_secrets"],
  video: ["plan_artifacts", "report_risks"],
  kernel: ["improve_kernel", "verify_result", "report_risks"],
};

const DEFAULT_ROUTE = ["understand_scope", "act_within_boundary", "verify_result", "report_risks", "draft_memory"];
const CODE_ROUTE = ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"];
const CONTENT_ROUTE = ["understand_scope", "shape_content", "check_claims", "report_risks", "draft_memory"];
const RESEARCH_ROUTE = ["understand_scope", "inspect_sources", "extract_patterns", "report_risks", "draft_memory"];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function inferAgentIntent(plan = {}, objective = "") {
  const domain = plan.inferredDomain || "";
  if (/kernel|capabilit|contract|kaizen7/i.test(objective) && domain === "code") return "kernel_improvement";
  return DOMAIN_INTENTS[domain] || "general_work";
}

function buildAgentRoute(plan = {}) {
  if (plan.inferredDomain === "code" || plan.inferredDomain === "kernel") return CODE_ROUTE;
  if (plan.inferredDomain === "content" || plan.inferredDomain === "commerce" || plan.inferredDomain === "video") return CONTENT_ROUTE;
  if (plan.inferredDomain === "research") return RESEARCH_ROUTE;
  return DEFAULT_ROUTE;
}

function buildBoundary(plan = {}) {
  return {
    scope: "smallest_useful_change",
    avoid: unique([
      "broad_refactor",
      "secrets",
      "external_publish",
      "unapproved_delete",
      ...(plan.approvalGates || []).map((gate) => `unapproved_${gate}`),
    ]),
  };
}

function buildAgentContract(objective = "", options = {}) {
  const plan = options.plan || resolveCapabilities(objective, options);
  const domain = plan.inferredDomain || "general";
  return {
    schema: "kaizen7.agent_contract.v1",
    version: 1,
    objective,
    intent: inferAgentIntent(plan, objective),
    route: buildAgentRoute(plan),
    capabilities: unique(DOMAIN_CAPABILITIES[domain] || ["act_within_boundary", "verify_result", "report_risks"]),
    boundary: buildBoundary(plan),
    context: {
      mode: "minimal",
      references: unique(options.context || ["docs/CAPABILITY_KERNEL.md", "docs/AGENT_LANGUAGE.md"]),
    },
    evidence: {
      required: ["changed_surface", "verification_result", "remaining_risks"],
    },
    done: {
      rule: "do_not_complete_until_required_evidence_is_present",
    },
    memory: {
      rule: "draft_reusable_learning_only",
    },
  };
}

module.exports = {
  buildAgentContract,
  buildAgentRoute,
  inferAgentIntent,
};
```

- [ ] **Step 4: Export the builder**

Modify `lib/capabilities/index.js`:

```js
module.exports = {
  ...require("./registry"),
  ...require("./resolver"),
  ...require("./agent-contract"),
  ...require("./packet"),
  ...require("./verifier"),
};
```

- [ ] **Step 5: Add syntax check**

Modify `package.json` `check` script so the capabilities syntax section includes:

```text
node --check lib/capabilities/agent-contract.js
```

Place it after `node --check lib/capabilities/resolver.js`.

- [ ] **Step 6: Run focused tests**

Run:

```powershell
node tests\capabilities.test.js
node --check lib\capabilities\agent-contract.js
```

Expected: PASS.

- [ ] **Step 7: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add lib/capabilities/agent-contract.js lib/capabilities/index.js tests/capabilities.test.js package.json
git commit -m "add agent language contract builder"
```

---

### Task 2: Embed Agent Contract In Existing Packets

**Files:**
- Modify: `tests/capabilities.test.js`
- Modify: `lib/capabilities/packet.js`

**Interfaces:**
- Consumes: `buildAgentContract(objective, options)`
- Produces: `packet.agent_contract: object`
- Keeps: `packet.commands` for backwards compatibility only.

- [ ] **Step 1: Write the failing packet assertions**

In `tests/capabilities.test.js`, after:

```js
assert.equal(packet.mode, "k7-execution-packet");
```

add:

```js
assert.equal(packet.agent_contract.schema, "kaizen7.agent_contract.v1");
assert.equal(packet.agent_contract.intent, "code_change");
assert(packet.agent_contract.evidence.required.includes("verification_result"));
assert.equal(Object.hasOwn(packet.agent_contract, "commands"), false);
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests\capabilities.test.js
```

Expected: FAIL because `packet.agent_contract` is undefined.

- [ ] **Step 3: Embed the contract**

Modify `lib/capabilities/packet.js`:

```js
const { buildAgentContract } = require("./agent-contract");
const { resolveCapabilities } = require("./resolver");
```

Inside `buildCapabilityPacket()` after `const plan = ...`:

```js
  const agentContract = options.agentContract || buildAgentContract(objective, { ...options, plan });
```

Add to the returned object immediately after `operator`:

```js
    agent_contract: agentContract,
```

- [ ] **Step 4: Run focused tests**

Run:

```powershell
node tests\capabilities.test.js
node --check lib\capabilities\packet.js
```

Expected: PASS.

- [ ] **Step 5: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/capabilities/packet.js tests/capabilities.test.js
git commit -m "embed agent contract in packets"
```

---

### Task 3: Semantic Evidence Verification

**Files:**
- Modify: `tests/capabilities.test.js`
- Modify: `lib/capabilities/verifier.js`

**Interfaces:**
- Consumes: `packet.agent_contract.evidence.required`
- Keeps compatibility with existing `packet.evidence_required`.
- Produces: verifier output with semantic missing evidence names.

- [ ] **Step 1: Write failing semantic evidence tests**

Append after the existing `passedVerification` assertions:

```js
const semanticBlocked = verifyCapabilityEvidence(packet, {
  claims: ["changed surface reported"],
  evidence: {
    changed_surface: ["lib/capabilities/agent-contract.js"],
  },
});
assert.equal(semanticBlocked.verdict, "block");
assert(semanticBlocked.missing.includes("verification_result"));
assert(semanticBlocked.missing.includes("remaining_risks"));

const semanticPassed = verifyCapabilityEvidence(packet, {
  claims: ["changed surface reported", "verification passed", "risks listed"],
  evidence: {
    changed_surface: ["lib/capabilities/agent-contract.js"],
    verification_result: "capability tests passed",
    remaining_risks: ["none known"],
  },
});
assert.equal(semanticPassed.verdict, "pass");
assert.equal(semanticPassed.missing.length, 0);
assert(semanticPassed.acceptedClaims.includes("verification passed"));
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests\capabilities.test.js
```

Expected: FAIL because the verifier still requires concrete legacy evidence names.

- [ ] **Step 3: Add semantic required evidence support**

Modify `lib/capabilities/verifier.js`:

```js
const LEGACY_EVIDENCE_ALIASES = {
  changed_surface: ["changed_surface", "diff", "files_changed"],
  verification_result: ["verification_result", "tests", "tests_result", "checks"],
  remaining_risks: ["remaining_risks", "risks", "risk_summary"],
};

function evidenceValue(evidence = {}, key = "") {
  const aliases = LEGACY_EVIDENCE_ALIASES[key] || [key];
  return aliases.map((alias) => evidence[alias]).find(hasEvidence);
}

function requiredEvidence(packet = {}) {
  return packet.agent_contract?.evidence?.required || packet.evidence_required || ["diff", "tests", "risks"];
}
```

Then replace:

```js
  const required = packet.evidence_required || ["diff", "tests", "risks"];
  const missing = required.filter((item) => !hasEvidence(evidence[item]));
```

with:

```js
  const required = requiredEvidence(packet);
  const missing = required.filter((item) => !hasEvidence(evidenceValue(evidence, item)));
```

Export the helpers:

```js
module.exports = {
  evidenceValue,
  hasEvidence,
  requiredEvidence,
  verifyCapabilityEvidence,
};
```

- [ ] **Step 4: Run focused tests**

Run:

```powershell
node tests\capabilities.test.js
node --check lib\capabilities\verifier.js
```

Expected: PASS.

- [ ] **Step 5: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/capabilities/verifier.js tests/capabilities.test.js
git commit -m "verify semantic agent evidence"
```

---

### Task 4: CLI Contract Surface

**Files:**
- Modify: `tests/capabilities.test.js`
- Modify: `lib/capabilities/cli.js`

**Interfaces:**
- Produces CLI command: `node lib/capabilities/cli.js --contract "<objective>"`
- Keeps existing `--list`, `--plan`, `--packet`, `--verify`.

- [ ] **Step 1: Write failing CLI tests**

In `tests/capabilities.test.js`, after the `packetCli` assertions, add:

```js
const contractCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--contract", "implementar cambio con tests"], {
  encoding: "utf8",
});
assert.equal(contractCli.status, 0);
assert(contractCli.stdout.includes("kaizen7.agent_contract.v1"));
assert(!contractCli.stdout.includes("npm.cmd"));
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node tests\capabilities.test.js
```

Expected: FAIL because the CLI usage output does not include the agent contract schema.

- [ ] **Step 3: Implement `--contract`**

Modify the import in `lib/capabilities/cli.js`:

```js
const {
  buildAgentContract,
  buildCapabilityPacket,
  listCapabilities,
  resolveCapabilities,
  verifyCapabilityEvidence,
} = require("./index");
```

Add this branch before `--packet`:

```js
  if (args.flags.has("--contract")) {
    printJson(buildAgentContract(args.objective));
    return;
  }
```

Add this usage line:

```js
      "node lib/capabilities/cli.js --contract \"<objective>\"",
```

- [ ] **Step 4: Run focused CLI checks**

Run:

```powershell
node tests\capabilities.test.js
npm.cmd run k7:capabilities -- --contract "implementar cambio con tests"
```

Expected: PASS and output includes `kaizen7.agent_contract.v1` but not `npm.cmd`.

- [ ] **Step 5: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/capabilities/cli.js tests/capabilities.test.js
git commit -m "add agent contract cli"
```

---

### Task 5: API Contract Surface

**Files:**
- Modify: `tests/server.integration.test.js`
- Modify: `server.js`

**Interfaces:**
- Produces: `POST /api/k7/capabilities/contract`
- Response: `buildAgentContract(body.objective || body.goal || "", body)`

- [ ] **Step 1: Write failing integration assertions**

In `tests/server.integration.test.js`, after the capability plan assertions, add:

```js
    const capabilityContractResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/contract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityContractResponse.status, 200);
    const capabilityContract = await capabilityContractResponse.json();
    assert.equal(capabilityContract.schema, "kaizen7.agent_contract.v1");
    assert.equal(capabilityContract.intent, "code_change");
    assert.equal(Object.hasOwn(capabilityContract, "commands"), false);
```

- [ ] **Step 2: Run the integration test to verify it fails**

Run:

```powershell
node tests\server.integration.test.js
```

Expected: FAIL with status `404 == 200`.

- [ ] **Step 3: Wire the API route**

Modify the capability import in `server.js`:

```js
const {
  buildAgentContract,
  buildCapabilityPacket,
  resolveCapabilities,
  verifyCapabilityEvidence,
} = require("./lib/capabilities");
```

Add this route before `/api/k7/capabilities/packet`:

```js
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/contract") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentContract(body.objective || body.goal || "", body));
    }
```

- [ ] **Step 4: Run focused integration tests**

Run:

```powershell
node tests\server.integration.test.js
node --check server.js
```

Expected: PASS.

- [ ] **Step 5: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add server.js tests/server.integration.test.js
git commit -m "expose agent contract api"
```

---

### Task 6: Start And Codex Contract Assertions

**Files:**
- Modify: `tests/start-hub.test.js`
- Modify: `tests/codex-bridge.test.js`

**Interfaces:**
- Consumes: existing `capabilityPacket.agent_contract` from Task 2.
- Confirms start/Codex now expose the semantic contract through their packet.

- [ ] **Step 1: Add start-hub assertions**

In `tests/start-hub.test.js`, after:

```js
assert.equal(report.capabilityPacket.mode, "k7-execution-packet");
```

add:

```js
assert.equal(report.capabilityPacket.agent_contract.schema, "kaizen7.agent_contract.v1");
assert.equal(Object.hasOwn(report.capabilityPacket.agent_contract, "commands"), false);
```

- [ ] **Step 2: Add codex bridge assertions**

In `tests/codex-bridge.test.js`, after:

```js
assert.equal(bridge.capabilityPacket.mode, "k7-execution-packet");
```

add:

```js
assert.equal(bridge.capabilityPacket.agent_contract.schema, "kaizen7.agent_contract.v1");
assert.equal(Object.hasOwn(bridge.capabilityPacket.agent_contract, "commands"), false);
```

- [ ] **Step 3: Run focused tests**

Run:

```powershell
node tests\start-hub.test.js
node tests\codex-bridge.test.js
```

Expected: PASS because Task 2 already embedded the contract.

- [ ] **Step 4: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add tests/start-hub.test.js tests/codex-bridge.test.js
git commit -m "assert agent contracts in start and codex"
```

---

### Task 7: Agent Language Documentation

**Files:**
- Create: `docs/AGENT_LANGUAGE.md`
- Modify: `docs/CAPABILITY_KERNEL.md`
- Test: `npm.cmd run check`

**Interfaces:**
- Produces human and agent-facing documentation for `kaizen7.agent_contract.v1`.

- [ ] **Step 1: Create docs**

Create `docs/AGENT_LANGUAGE.md`:

```md
# KAIZEN7 Agent Language

KAIZEN7 speaks to agents through semantic contracts, not command lists.

## Contract

The stable schema is `kaizen7.agent_contract.v1`.

```json
{
  "schema": "kaizen7.agent_contract.v1",
  "objective": "improve the capability kernel",
  "intent": "code_change",
  "route": ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"],
  "capabilities": ["modify_code", "verify_result", "report_risks"],
  "boundary": {
    "scope": "smallest_useful_change",
    "avoid": ["broad_refactor", "secrets", "external_publish", "unapproved_delete"]
  },
  "evidence": {
    "required": ["changed_surface", "verification_result", "remaining_risks"]
  },
  "done": {
    "rule": "do_not_complete_until_required_evidence_is_present"
  },
  "memory": {
    "rule": "draft_reusable_learning_only"
  }
}
```

## Agent Rule

Read the contract as the working boundary. Choose your own runtime actions. Do not claim completion until the required evidence exists.

## Evidence Terms

- `changed_surface`: what changed or was produced.
- `verification_result`: what was checked and the outcome.
- `remaining_risks`: what is uncertain, blocked or needs approval.
- `sources`: research sources.
- `artifacts`: visual, video or generated deliverables.
- `approval_state`: status for external effects.

## Commands

Commands are runtime hints or compatibility fields. They are not the agent language.
```

- [ ] **Step 2: Link from capability docs**

Append to `docs/CAPABILITY_KERNEL.md`:

```md
## Agent Language

The semantic agent-facing contract is documented in `docs/AGENT_LANGUAGE.md`.
Execution packets may include commands for compatibility, but agents should treat `agent_contract` as the primary working boundary.
```

- [ ] **Step 3: Run full check**

Run:

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add docs/AGENT_LANGUAGE.md docs/CAPABILITY_KERNEL.md
git commit -m "document agent language contract"
```

---

## Final Verification

- [ ] Run: `npm.cmd run check`
- [ ] Run: `npm.cmd run k7:capabilities -- --contract "implementar cambio con tests"`
- [ ] Run: `npm.cmd run k7:capabilities -- --packet "implementar cambio con tests en KAIZEN7"`
- [ ] Confirm the contract output includes `kaizen7.agent_contract.v1`.
- [ ] Confirm the contract output does not include `npm.cmd`, `PowerShell`, `bash`, `Windows`, or `Linux`.
- [ ] Confirm `git status --short` is clean after commits.

## Plan Self-Review

- Spec coverage: Tasks cover the contract builder, semantic vocabulary, packet compatibility, semantic evidence aliases, CLI/API exposure, start/Codex surfaces, and documentation.
- Placeholder scan: No `TBD`, `TODO`, `implement later`, or vague implementation steps remain.
- Type consistency: Public names are consistent across tasks: `buildAgentContract`, `inferAgentIntent`, `buildAgentRoute`, `agent_contract`, and `kaizen7.agent_contract.v1`.
- Scope check: The plan does not add a runtime, workflow engine, or domain content volume. It only adds the semantic agent-language layer.
