# Work–KAIZEN7 Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a compact KAIZEN7 preflight that lets ChatGPT Work reuse valid memory, request current research, ask Luciano only when necessary, and hand verified work to Codex.

**Architecture:** Add small CommonJS contract and preflight modules beside the existing KAIZEN7 CLI modules. Reuse the JSONL receipt ledger, add deterministic freshness, expose one `k7 preflight` command, and reject domain-mismatched recommendations before they reach Work. Keep Flowmatik and THE FOCUX behind contracts; this plan changes only the KAIZEN7 kernel.

**Tech Stack:** Node.js 20+, CommonJS, built-in `node:assert/strict`, JSONL receipt storage, existing `lib/k7-cli.js` command surface.

## Global Constraints

- First pass reads at most 5 memory items and 7 files.
- Compact coordination output targets 300 tokens or fewer without adding a tokenizer dependency.
- Technical currentness research uses primary sources only.
- Publishing, spending, deployment, deletion, credentials, health claims, legal outputs and commerce effects require explicit human approval.
- Existing receipts without `expires_at` remain readable for backward compatibility.
- No new agent framework, database, vector store, paid API or external service enters this delivery.
- Every task follows failing test -> minimal implementation -> focused test -> commit.

---

## File Map

| File | Responsibility |
| --- | --- |
| `lib/k7-work-contracts.js` | Build and validate `PreflightCard`, `TaskContract` and `OutcomeReceipt`. |
| `lib/k7-preflight.js` | Classify a Work question, recall receipts, decide research/approval, evaluate recommendation fit and format compact output. |
| `lib/k7-receipt-ledger.js` | Persist expiry metadata and separate fresh from stale recall matches. |
| `lib/k7-cli.js` | Expose `k7 preflight`, alias `pf`, budget/candidate flags and doctor coverage. |
| `tests/k7-work-contracts.test.js` | Contract normalization and validation tests. |
| `tests/k7-preflight.test.js` | Routing, relevance, budget and eval-case tests. |
| `tests/k7-receipt-ledger.test.js` | Deterministic freshness and backward-compatibility tests. |
| `tests/k7-cli.test.js` | CLI command, alias, JSON output and invalid-budget tests. |
| `data/preflight-eval-cases.json` | Versioned known-decision cases for regression evaluation. |
| `docs/WORK_KAIZEN7_PREFLIGHT.md` | Work/Codex operator contract and examples. |
| `README.md` | Public entry point for the new command. |
| `KAIZEN7_CONTEXT.md` | Canonical communication route and memory rule. |
| `package.json` | Include focused tests in the full `check` script. |

### Task 1: Work/K7 contracts

**Files:**

- Create: `lib/k7-work-contracts.js`
- Create: `tests/k7-work-contracts.test.js`
- Modify: `package.json`

**Interfaces:**

- Produces: `buildPreflightCard(input) -> PreflightCard`
- Produces: `buildTaskContract(input) -> TaskContract`
- Produces: `buildOutcomeReceipt(input) -> OutcomeReceipt`
- Produces: `estimateTokens(value) -> number`
- Consumes: plain JavaScript objects only.

- [ ] **Step 1: Write the failing contract test**

Create `tests/k7-work-contracts.test.js`:

```js
const assert = require("node:assert/strict");
const {
  buildOutcomeReceipt,
  buildPreflightCard,
  buildTaskContract,
  estimateTokens,
} = require("../lib/k7-work-contracts");

const preflight = buildPreflightCard({
  objective: "elegir el mejor modelo actual para subtitulos",
  route: "research_primary_sources",
  memory_reused: [],
  research_needed: true,
  recommendation: "Comparar documentación y benchmarks actuales.",
  reason: "La oferta de modelos cambia.",
  approval_needed: false,
  verification: "Citar fuentes primarias y fecha.",
  expires_at: "2026-08-01T00:00:00.000Z",
});
assert.equal(preflight.schema, "kaizen7.preflight_card.v1");
assert.equal(preflight.research_needed, true);
assert(estimateTokens(preflight) > 0);

const task = buildTaskContract({
  id: "k7t_preflight_001",
  goal: "crear el preflight compacto",
  expected_output: "comando k7 preflight verificado",
  owner: "codex",
  route: "code.change",
  context_refs: ["docs/superpowers/specs/2026-07-18-kaizen7-flowmatik-work-codex-design.md"],
  constraints: ["no external effects"],
  approval_gates: [],
  acceptance_checks: ["node tests/k7-preflight.test.js"],
  status: "approved",
  next_action: "write the failing test",
});
assert.equal(task.schema, "kaizen7.task_contract.v1");
assert.equal(task.owner, "codex");

const receipt = buildOutcomeReceipt({
  task_id: task.id,
  status: "completed",
  result: "preflight implemented",
  evidence: ["node tests/k7-preflight.test.js: pass"],
  files_changed: ["lib/k7-preflight.js"],
  risks: [],
  reuse_next_time: "Run k7 preflight before asking a strategic question.",
  discard: ["Do not trust domain-mismatched candidates."],
  next_action: "use from Work",
  verified_at: "2026-07-18T00:00:00.000Z",
  expires_at: "2026-08-18T00:00:00.000Z",
});
assert.equal(receipt.schema, "kaizen7.outcome_receipt.v1");
assert.equal(receipt.status, "completed");
assert.throws(() => buildPreflightCard({}), /objective is required/);
assert.throws(() => buildTaskContract({ goal: "x", status: "unknown" }), /invalid task status/);
assert.throws(() => buildOutcomeReceipt({ task_id: "x", status: "running" }), /invalid receipt status/);

console.log("k7 work contract tests passed");
```

- [ ] **Step 2: Run the test and confirm the module is missing**

Run:

```bash
node tests/k7-work-contracts.test.js
```

Expected: FAIL with `Cannot find module '../lib/k7-work-contracts'`.

- [ ] **Step 3: Implement the contract builders**

Create `lib/k7-work-contracts.js`:

```js
const TASK_STATUSES = new Set(["proposed", "approved", "running", "blocked", "verifying", "completed"]);
const RECEIPT_STATUSES = new Set(["completed", "blocked"]);

function text(value = "") {
  return String(value || "").trim();
}

function list(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(text).filter(Boolean);
}

function required(value, label) {
  const normalized = text(value);
  if (!normalized) throw new Error(`${label} is required`);
  return normalized;
}

function estimateTokens(value) {
  return Math.ceil(JSON.stringify(value || {}).length / 4);
}

function buildPreflightCard(input = {}) {
  return {
    schema: "kaizen7.preflight_card.v1",
    objective: required(input.objective, "objective"),
    route: required(input.route, "route"),
    memory_reused: list(input.memory_reused),
    research_needed: input.research_needed === true,
    recommendation: required(input.recommendation, "recommendation"),
    reason: text(input.reason),
    approval_needed: input.approval_needed === true,
    verification: required(input.verification, "verification"),
    expires_at: text(input.expires_at),
  };
}

function buildTaskContract(input = {}) {
  const status = text(input.status || "proposed");
  if (!TASK_STATUSES.has(status)) throw new Error(`invalid task status: ${status}`);
  return {
    schema: "kaizen7.task_contract.v1",
    id: required(input.id, "id"),
    goal: required(input.goal, "goal"),
    expected_output: required(input.expected_output, "expected_output"),
    owner: required(input.owner, "owner"),
    route: required(input.route, "route"),
    context_refs: list(input.context_refs),
    constraints: list(input.constraints),
    approval_gates: list(input.approval_gates),
    acceptance_checks: list(input.acceptance_checks),
    status,
    next_action: required(input.next_action, "next_action"),
  };
}

function buildOutcomeReceipt(input = {}) {
  const status = text(input.status);
  if (!RECEIPT_STATUSES.has(status)) throw new Error(`invalid receipt status: ${status}`);
  return {
    schema: "kaizen7.outcome_receipt.v1",
    task_id: required(input.task_id, "task_id"),
    status,
    result: text(input.result),
    evidence: list(input.evidence),
    files_changed: list(input.files_changed),
    risks: list(input.risks),
    reuse_next_time: text(input.reuse_next_time),
    discard: list(input.discard),
    next_action: required(input.next_action, "next_action"),
    verified_at: required(input.verified_at, "verified_at"),
    expires_at: text(input.expires_at),
  };
}

module.exports = {
  buildOutcomeReceipt,
  buildPreflightCard,
  buildTaskContract,
  estimateTokens,
};
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
node tests/k7-work-contracts.test.js
```

Expected: PASS with `k7 work contract tests passed`.

- [ ] **Step 5: Add the test to the full check and commit**

In the `package.json` `check` script, append this command before `tests/k7-cli.test.js`:

```text
&& node tests/k7-work-contracts.test.js
```

Run:

```bash
git diff --check
git add lib/k7-work-contracts.js tests/k7-work-contracts.test.js package.json
git commit -m "feat: add Work coordination contracts"
```

Expected: commit succeeds with exactly those three files.

### Task 2: Receipt freshness and expiry

**Files:**

- Modify: `lib/k7-receipt-ledger.js`
- Modify: `tests/k7-receipt-ledger.test.js`

**Interfaces:**

- Consumes: existing `buildReceiptRecord(input)` and `buildReceiptRecall(objective, options)`.
- Produces: receipt fields `verified_at`, `expires_at` and recall fields `stale_matches`, `fresh_matches`.
- Preserves: receipts without `expires_at` remain fresh.

- [ ] **Step 1: Add failing deterministic freshness tests**

Add after the existing `record` assertions in `tests/k7-receipt-ledger.test.js`:

```js
const expiring = buildReceiptRecord({
  ...receipt,
  id: "fresh-route",
  verified_at: "2026-07-18T00:00:00.000Z",
  expires_at: "2026-08-18T00:00:00.000Z",
});
assert.equal(expiring.expires_at, "2026-08-18T00:00:00.000Z");

const freshnessRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-ledger-freshness-"));
appendReceipt({
  ...receipt,
  id: "stale-route",
  objective: "elegir agente browser actual",
  reuse_next_time: "Use the old browser route.",
  expires_at: "2026-07-01T00:00:00.000Z",
}, { root: freshnessRoot });

const freshness = buildReceiptRecall("agente browser actual", {
  root: freshnessRoot,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(freshness.stale_matches.length, 1);
assert(!freshness.reuse_candidates.includes("Use the old browser route."));
assert(freshness.refresh_reasons.some((reason) => reason.includes("expired")));
```

- [ ] **Step 2: Run the test and confirm freshness fields are absent**

Run:

```bash
node tests/k7-receipt-ledger.test.js
```

Expected: FAIL because `expires_at`, `stale_matches` or `refresh_reasons` is missing.

- [ ] **Step 3: Extend normalized receipts and recall**

In `buildReceiptRecord`, add after `recorded_at`:

```js
verified_at: String(record.verified_at || record.recorded_at || new Date().toISOString()),
expires_at: String(record.expires_at || ""),
```

Add before `buildReceiptRecall`:

```js
function isReceiptFresh(record = {}, now = new Date().toISOString()) {
  if (!record.expires_at) return true;
  const expiry = Date.parse(record.expires_at);
  const current = Date.parse(now);
  return Number.isFinite(expiry) && Number.isFinite(current) && expiry > current;
}
```

Replace the return construction in `buildReceiptRecall` with fresh/stale separation:

```js
const now = options.now || new Date().toISOString();
const freshMatches = matches.filter((record) => isReceiptFresh(record, now));
const staleMatches = matches.filter((record) => !isReceiptFresh(record, now));
return {
  schema: "kaizen7.receipt_recall.v1",
  objective: objective || "unspecified objective",
  ledger_path: LEDGER_RELATIVE_PATH.replaceAll("\\", "/"),
  total_receipts: receipts.length,
  matches,
  fresh_matches: freshMatches,
  stale_matches: staleMatches,
  reuse_candidates: freshMatches.map((record) => record.reuse_next_time).filter(Boolean),
  discard_warnings: matches.flatMap((record) => record.discard || []),
  refresh_reasons: staleMatches.map((record) => `Receipt ${record.id || "unknown"} expired at ${record.expires_at}.`),
  next_command: freshMatches.length
    ? "Use the highest-scoring fresh receipt before opening broad context."
    : staleMatches.length
      ? "Matching receipts are expired. Refresh evidence before reuse."
      : "No matching local receipt yet. After verification, run k7 remember with a compact receipt.",
};
```

Export `isReceiptFresh` from `module.exports`.

- [ ] **Step 4: Run focused and compatibility tests**

Run:

```bash
node tests/k7-receipt-ledger.test.js
node tests/k7-agent-memory.test.js
```

Expected: both PASS; the original receipt without expiry remains reusable.

- [ ] **Step 5: Commit**

```bash
git diff --check
git add lib/k7-receipt-ledger.js tests/k7-receipt-ledger.test.js
git commit -m "feat: expire stale KAIZEN7 receipts"
```

### Task 3: Compact preflight router and relevance gate

**Files:**

- Create: `lib/k7-preflight.js`
- Create: `tests/k7-preflight.test.js`
- Create: `data/preflight-eval-cases.json`
- Modify: `package.json`

**Interfaces:**

- Consumes: `buildReceiptRecall(objective, { root, now, limit })`.
- Consumes: `buildPreflightCard(input)` and `estimateTokens(value)`.
- Produces: `buildPreflight(objective, options) -> PreflightCard plus candidate_fit and estimated_tokens`.
- Produces: `evaluateRecommendationFit(objective, candidate) -> { accepted, score, reason }`.
- Produces: `formatPreflight(card, { budget }) -> string`.

- [ ] **Step 1: Create versioned eval cases**

Create `data/preflight-eval-cases.json`:

```json
{
  "schema": "kaizen7.preflight_eval_cases.v1",
  "cases": [
    {
      "id": "current-model",
      "objective": "¿Cuál es el mejor modelo actual para subtítulos?",
      "expected_route": "research_primary_sources",
      "research_needed": true,
      "approval_needed": false
    },
    {
      "id": "human-preference",
      "objective": "¿Prefieres que la marca use negro o blanco?",
      "expected_route": "ask_user",
      "research_needed": false,
      "approval_needed": true
    },
    {
      "id": "external-action",
      "objective": "Publica el vídeo y paga la campaña",
      "expected_route": "approval_gate",
      "research_needed": false,
      "approval_needed": true
    },
    {
      "id": "safe-code",
      "objective": "Añade una prueba del parser sin cambiar la API",
      "expected_route": "codex_execute",
      "research_needed": false,
      "approval_needed": false
    }
  ]
}
```

- [ ] **Step 2: Write the failing router tests**

Create `tests/k7-preflight.test.js`:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cases = require("../data/preflight-eval-cases.json");
const { appendReceipt } = require("../lib/k7-receipt-ledger");
const {
  buildPreflight,
  evaluateRecommendationFit,
  formatPreflight,
} = require("../lib/k7-preflight");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-preflight-"));
for (const item of cases.cases) {
  const card = buildPreflight(item.objective, {
    root,
    now: "2026-07-18T00:00:00.000Z",
    budget: 300,
  });
  assert.equal(card.route, item.expected_route, item.id);
  assert.equal(card.research_needed, item.research_needed, item.id);
  assert.equal(card.approval_needed, item.approval_needed, item.id);
  assert(card.estimated_tokens <= 300, item.id);
}

appendReceipt({
  objective: "elegir plantilla de vídeo vertical",
  route: "flowmatik.template_selection",
  verification: "10 renders passed",
  reuse_next_time: "Reuse template urban-gold-v1.",
  expires_at: "2026-08-18T00:00:00.000Z",
}, { root });
const reused = buildPreflight("elegir plantilla de vídeo vertical", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(reused.route, "reuse_receipt");
assert(reused.memory_reused.includes("Reuse template urban-gold-v1."));

const mismatch = evaluateRecommendationFit(
  "decidir cuándo preguntar al usuario en un workflow",
  "prototipar BAAI/bge-m3 como modelo de embeddings",
);
assert.equal(mismatch.accepted, false);

const match = evaluateRecommendationFit(
  "crear memoria semántica con embeddings",
  "prototipar un modelo de embeddings local",
);
assert.equal(match.accepted, true);

const text = formatPreflight(reused, { budget: 300 });
assert(text.includes("Route: reuse_receipt"));
assert(text.length <= 1200);

console.log("k7 preflight tests passed");
```

- [ ] **Step 3: Run the tests and confirm the module is missing**

Run:

```bash
node tests/k7-preflight.test.js
```

Expected: FAIL with `Cannot find module '../lib/k7-preflight'`.

- [ ] **Step 4: Implement the deterministic preflight**

Create `lib/k7-preflight.js`:

```js
const { buildReceiptRecall } = require("./k7-receipt-ledger");
const { buildPreflightCard, estimateTokens } = require("./k7-work-contracts");

const STOPWORDS = new Set([
  "para", "como", "cuando", "donde", "desde", "este", "esta", "esto", "hacer",
  "crear", "decidir", "usuario", "mejor", "the", "and", "with", "from", "that",
]);

const DOMAIN_PATTERNS = {
  process: /\b(workflow|proceso|preguntar|aprobacion|ruta|preflight|coordinar)\b/,
  memory: /\b(memoria|receipt|recall|contexto|embedding|embeddings|semantica)\b/,
  model: /\b(modelo|model|bge|llm|ollama|qwen|embedding|embeddings)\b/,
  video: /\b(video|remotion|ffmpeg|subtitulo|plantilla|flowmatik)\b/,
  browser: /\b(browser|playwright|navegador|web)\b/,
  commerce: /\b(comercio|ecommerce|shopify|producto|campana|paga)\b/,
  code: /\b(codigo|code|parser|test|prueba|api|cli|repositorio)\b/,
};

function normalize(value = "") {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function tokens(value = "") {
  return normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function domains(value = "") {
  const normalized = normalize(value);
  return Object.entries(DOMAIN_PATTERNS)
    .filter(([, pattern]) => pattern.test(normalized))
    .map(([name]) => name);
}

function evaluateRecommendationFit(objective = "", candidate = "") {
  if (!String(candidate || "").trim()) return { accepted: true, score: 1, reason: "no external candidate supplied" };
  const goalTokens = new Set(tokens(objective));
  const candidateTokens = tokens(candidate);
  const overlap = candidateTokens.filter((token) => goalTokens.has(token)).length;
  const goalDomains = domains(objective);
  const candidateDomains = domains(candidate);
  const domainOverlap = candidateDomains.some((domain) => goalDomains.includes(domain));
  const score = Math.min(1, (overlap / Math.max(1, Math.min(goalTokens.size, 5))) + (domainOverlap ? 0.5 : 0));
  return {
    accepted: domainOverlap || score >= 0.4,
    score: Number(score.toFixed(2)),
    reason: domainOverlap || score >= 0.4
      ? "candidate matches the objective domain"
      : `domain mismatch: objective=${goalDomains.join(",") || "unknown"}; candidate=${candidateDomains.join(",") || "unknown"}`,
  };
}

function classify(objective = "") {
  const value = normalize(objective);
  if (/\b(publica|publish|paga|payment|compra|borra|delete|deploy|credencial|oauth|claim|salud|legal)\b/.test(value)) return "sensitive";
  if (/\b(prefieres|prefiero|quiero|gusta|color|estetica|opcion)\b/.test(value)) return "preference";
  if (/\b(actual|hoy|ultimo|ultima|mercado|precio|modelo|ley|normativa|existe)\b/.test(value)) return "current";
  return "technical";
}

function addDays(iso, days) {
  const value = new Date(iso);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString();
}

function buildPreflight(objective = "", options = {}) {
  const goal = String(objective || "").trim();
  if (!goal) throw new Error("objective is required");
  const now = options.now || new Date().toISOString();
  const budget = Number.isInteger(options.budget) ? options.budget : 300;
  if (budget < 120 || budget > 600) throw new Error("budget must be an integer between 120 and 600");
  const recall = buildReceiptRecall(goal, { root: options.root, now, limit: 5 });
  const fit = evaluateRecommendationFit(goal, options.candidate || "");
  const kind = classify(goal);

  let decision;
  if (recall.reuse_candidates.length) {
    decision = {
      route: "reuse_receipt",
      memory_reused: recall.reuse_candidates.slice(0, 5),
      research_needed: false,
      recommendation: recall.reuse_candidates[0],
      reason: "A matching verified receipt is still fresh.",
      approval_needed: false,
      verification: "Confirm the receipt still matches the requested output.",
      expires_at: recall.fresh_matches[0]?.expires_at || "",
    };
  } else if (kind === "sensitive") {
    decision = {
      route: "approval_gate",
      memory_reused: [],
      research_needed: false,
      recommendation: "Stop before external effects and request explicit approval.",
      reason: "The objective includes a sensitive external action.",
      approval_needed: true,
      verification: "Record the approved scope and verify the external result.",
      expires_at: addDays(now, 1),
    };
  } else if (kind === "preference") {
    decision = {
      route: "ask_user",
      memory_reused: [],
      research_needed: false,
      recommendation: "Ask one short preference question with a recommended option.",
      reason: "Only Luciano can define this preference.",
      approval_needed: true,
      verification: "Record the selected option as a decision receipt.",
      expires_at: "",
    };
  } else if (kind === "current" || recall.stale_matches.length) {
    decision = {
      route: "research_primary_sources",
      memory_reused: [],
      research_needed: true,
      recommendation: "Check current primary sources, compare the smallest viable set, then recommend one route.",
      reason: recall.stale_matches.length ? "Matching memory is expired." : "The answer may have changed.",
      approval_needed: false,
      verification: "Cite primary sources and record the evidence date.",
      expires_at: addDays(now, 30),
    };
  } else {
    decision = {
      route: "codex_execute",
      memory_reused: [],
      research_needed: false,
      recommendation: "Create a bounded task contract and let Codex execute with focused tests.",
      reason: "The objective is technical, stable and within the existing architecture.",
      approval_needed: false,
      verification: "Run the focused test and return an outcome receipt.",
      expires_at: addDays(now, 30),
    };
  }

  if (!fit.accepted) {
    decision.reason = `${decision.reason} Rejected candidate: ${fit.reason}.`;
  }
  const card = buildPreflightCard({ objective: goal, ...decision });
  return { ...card, candidate_fit: fit, estimated_tokens: estimateTokens(card), budget };
}

function formatPreflight(card = {}, options = {}) {
  const budget = options.budget || card.budget || 300;
  const lines = [
    "# KAIZEN7 PREFLIGHT",
    `Objective: ${card.objective}`,
    `Route: ${card.route}`,
    `Memory: ${(card.memory_reused || []).join(" | ") || "none"}`,
    `Research: ${card.research_needed ? "yes" : "no"}`,
    `Approval: ${card.approval_needed ? "yes" : "no"}`,
    `Recommendation: ${card.recommendation}`,
    `Verification: ${card.verification}`,
  ];
  const maxChars = budget * 4;
  const output = `${lines.join("\n")}\n`;
  return output.length <= maxChars ? output : `${output.slice(0, maxChars - 16).trimEnd()}\n[truncated]\n`;
}

module.exports = {
  buildPreflight,
  classify,
  evaluateRecommendationFit,
  formatPreflight,
};
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
node tests/k7-preflight.test.js
node tests/k7-work-contracts.test.js
node tests/k7-receipt-ledger.test.js
```

Expected: all PASS.

- [ ] **Step 6: Add the test to the full check and commit**

In the `package.json` `check` script, append before `tests/k7-cli.test.js`:

```text
&& node tests/k7-preflight.test.js
```

Then run:

```bash
git diff --check
git add lib/k7-preflight.js tests/k7-preflight.test.js data/preflight-eval-cases.json package.json
git commit -m "feat: route Work questions through KAIZEN7 preflight"
```

### Task 4: CLI, doctor and Work/Codex handoff

**Files:**

- Modify: `lib/k7-cli.js`
- Modify: `tests/k7-cli.test.js`
- Create: `docs/WORK_KAIZEN7_PREFLIGHT.md`
- Modify: `README.md`
- Modify: `KAIZEN7_CONTEXT.md`

**Interfaces:**

- Consumes: `buildPreflight(objective, { root, budget, candidate })`.
- Produces: `npm.cmd run k7 -- preflight --budget 300 "objective"`.
- Produces alias: `npm.cmd run k7 -- pf "objective"`.
- Produces JSON contract: `kaizen7.preflight_card.v1` plus `candidate_fit`, `estimated_tokens`, `budget`.

- [ ] **Step 1: Add failing CLI tests**

In `tests/k7-cli.test.js`, add these command-surface assertions beside the existing `run` assertions:

```js
assert(tool.commands.some((command) => command.name === "preflight"));
assert(help.includes("npm.cmd run k7 -- preflight"));
```

Then add these tests before the unknown-command test:

```js
const preflight = runK7ToolCommand([
  "preflight",
  "--budget", "240",
  "mejor modelo actual para subtitulos",
  "--json",
]);
assert.equal(preflight.exitCode, 0);
const preflightPacket = JSON.parse(preflight.output);
assert.equal(preflightPacket.schema, "kaizen7.preflight_card.v1");
assert.equal(preflightPacket.route, "research_primary_sources");
assert.equal(preflightPacket.budget, 240);

const rejectedCandidate = runK7ToolCommand([
  "pf",
  "--candidate", "BAAI/bge-m3 embeddings",
  "decidir cuando preguntar al usuario en un workflow",
  "--json",
]);
assert.equal(rejectedCandidate.exitCode, 0);
assert.equal(JSON.parse(rejectedCandidate.output).candidate_fit.accepted, false);

const badBudget = runK7ToolCommand(["preflight", "--budget", "20", "pregunta tecnica"]);
assert.equal(badBudget.exitCode, 2);
assert(badBudget.output.includes("budget must be an integer between 120 and 600"));
assert.equal(resolveCommandName("pf"), "preflight");
```

- [ ] **Step 2: Run the CLI test and confirm the command is unknown**

Run:

```bash
node tests/k7-cli.test.js
```

Expected: FAIL because `preflight` is not registered.

- [ ] **Step 3: Register and execute the command**

At the top of `lib/k7-cli.js`, import:

```js
const { buildPreflight, formatPreflight } = require("./k7-preflight");
```

Add this entry to `COMMANDS` immediately after `run`:

```js
{
  name: "preflight",
  usage: "npm.cmd run k7 -- preflight --budget 300 \"<objective>\"",
  aliases: ["pf"],
  value: "Reuse memory, decide research or approval, reject irrelevant candidates and return one compact Work/Codex route.",
},
```

Add helpers after `commandText`:

```js
function flagValue(args = [], name = "") {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function commandTextWithoutValueFlags(args = [], flags = []) {
  const skipped = new Set();
  for (const flag of flags) {
    const index = args.indexOf(flag);
    if (index >= 0) {
      skipped.add(index);
      skipped.add(index + 1);
    }
  }
  return args.filter((arg, index) => !skipped.has(index) && !arg.startsWith("--")).join(" ").trim();
}
```

Add this branch immediately after the existing `run` branch:

```js
if (parsed.command === "preflight") {
  try {
    const budgetValue = flagValue(parsed.args, "--budget");
    const budget = budgetValue === undefined ? 300 : Number(budgetValue);
    if (!Number.isInteger(budget)) throw new Error("budget must be an integer between 120 and 600");
    const goal = commandTextWithoutValueFlags(parsed.args, ["--budget", "--candidate"]);
    const card = buildPreflight(goal, {
      root,
      budget,
      candidate: flagValue(parsed.args, "--candidate") || "",
    });
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(card, null, 2)}\n` : formatPreflight(card, { budget }),
    };
  } catch (error) {
    return {
      exitCode: 2,
      output: `Invalid preflight: ${error.message}\n`,
    };
  }
}
```

Add `"preflight"` to the `requiredCommands` array. Add this object beside the existing contract checks in `buildDoctorReport`:

```js
{
  ok: buildPreflight("stable code test", { root }).schema === "kaizen7.preflight_card.v1",
  label: "Work preflight contract",
},
```

Export `buildPreflight`, `formatPreflight`, `flagValue`, and `commandTextWithoutValueFlags` from `module.exports`.

- [ ] **Step 4: Run CLI and doctor tests**

Run:

```bash
node tests/k7-cli.test.js
node lib/k7-cli.js doctor
node lib/k7-cli.js preflight --budget 300 "mejor modelo actual para subtitulos"
```

Expected: tests PASS, doctor reports PASS, and output contains `Route: research_primary_sources`.

- [ ] **Step 5: Write the operator handoff**

Create `docs/WORK_KAIZEN7_PREFLIGHT.md` with this exact operational contract:

````markdown
# Work–KAIZEN7 Preflight

ChatGPT Work is the frontend. KAIZEN7 coordinates. Codex executes. Flowmatik and THE FOCUX remain external projects connected by task contracts and outcome receipts.

## Before asking Luciano

Run:

```powershell
npm.cmd run k7 -- preflight --budget 300 "the technical or strategic question" --json
```

Follow the returned route:

- `reuse_receipt`: reuse the fresh decision and verify fit.
- `research_primary_sources`: research current primary sources, then recommend one route.
- `ask_user`: ask one short preference question.
- `approval_gate`: stop before external effects and request exact authority.
- `codex_execute`: create a bounded task contract with focused tests.

Do not ask Luciano merely because context is missing. Ask only when his preference or authority changes the result.

## Candidate check

When another router proposes a tool or model, test its fit:

```powershell
npm.cmd run k7 -- preflight --candidate "candidate name and purpose" "objective" --json
```

Rejected candidates do not enter the task contract.

## Closeout

After verification, store an outcome receipt with evidence, reuse rule, discard rule, verification date and expiry date. The next preflight may reuse only fresh matching receipts.
````

- [ ] **Step 6: Update canonical entry points**

In `README.md`, add under `Core commands`:

````markdown
### Work/Codex preflight

```powershell
npm.cmd run k7 -- preflight --budget 300 "your technical or strategic question"
```

This checks fresh receipts first, requests current research only when needed, asks the human only for preference or authority, and rejects unrelated tool/model suggestions.
````

In `KAIZEN7_CONTEXT.md`, add under `Communication Protocol`:

```markdown
Before ChatGPT asks Luciano a technical or strategic question, it runs `k7 preflight --budget 300`. The preflight reuses fresh receipts, requests primary-source research for changing decisions, and asks Luciano only when preference or authority changes the result.
```

- [ ] **Step 7: Run the full verification**

Run:

```bash
git diff --check
node tests/k7-work-contracts.test.js
node tests/k7-receipt-ledger.test.js
node tests/k7-preflight.test.js
node tests/k7-cli.test.js
npm run check
```

Expected: every command exits 0 and `npm run check` ends with the existing test success messages, including `k7 preflight tests passed` and `k7 cli tests passed`.

- [ ] **Step 8: Commit the integration**

```bash
git add lib/k7-cli.js tests/k7-cli.test.js docs/WORK_KAIZEN7_PREFLIGHT.md README.md KAIZEN7_CONTEXT.md
git commit -m "feat: expose KAIZEN7 preflight to Work and Codex"
```

Expected: the commit includes only CLI, tests and operator documentation.

## Final Review Gate

After all four task commits:

```bash
git status --short
git log -5 --oneline
node lib/k7-cli.js preflight --budget 300 "decidir cuando preguntar a Luciano" --json
node lib/k7-cli.js preflight --candidate "BAAI/bge-m3 embeddings" "decidir cuando preguntar a Luciano" --json
npm run check
```

Accept only when:

- the worktree is clean;
- the first preflight chooses `codex_execute` or `ask_user` based on explicit preference wording, never an unrelated model;
- the BGE-M3 candidate is rejected for a process question;
- fresh receipts are reused and expired receipts force refresh;
- output honors the 120–600 token budget contract;
- the complete existing suite remains green.
