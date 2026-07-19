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
assert.equal(task.loop.profile, "general");
assert(task.loop.stages.includes("verify"));
assert.equal(task.loop.autonomy, "controlled_constructor");
assert(task.loop.stop_conditions.includes("approval_required"));

const researchTask = buildTaskContract({
  id: "k7t_research_001",
  goal: "find a current model",
  expected_output: "verified comparison",
  owner: "work",
  route: "research_primary_sources",
  status: "approved",
  next_action: "search primary sources",
  loop: {
    profile: "research",
    stages: ["question", "search", "filter", "verify", "learn"],
    max_iterations: 3,
    max_failures: 2,
    token_budget: 900,
  },
});
assert.equal(researchTask.loop.profile, "research");
assert.equal(researchTask.loop.max_iterations, 3);
assert.equal(researchTask.loop.token_budget, 900);

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
