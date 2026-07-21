const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { appendReceipt, readLedger } = require("../lib/k7-receipt-ledger");
const { profileFor, runActionReactionLoop } = require("../lib/k7-action-reaction-loop");
const { loadLoopPolicy } = require("../lib/k7-loop-system");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-action-loop-"));
const objective = "añadir una prueba estable al parser";
assert.equal(profileFor({ objective: "buscar tendencias actuales", route: "research_primary_sources" }), "research");
assert.equal(profileFor({ objective: "mejorar margen ecommerce", route: "codex_execute" }), "commerce");
assert.equal(profileFor({ objective: "crear guion de video", route: "codex_execute" }), "creative");
assert.equal(profileFor({ objective: "probar un nuevo MCP", route: "codex_execute" }), "tool");
assert.equal(profileFor({ objective: "reutilizar memoria", route: "reuse_receipt" }), "memory");
assert.equal(profileFor({ objective: "implementar parser", route: "codex_execute" }), "technical");
assert.equal(profileFor({ objective: "ordenar prioridades", route: "other" }), "general");
const completed = runActionReactionLoop(objective, {
  root,
  now: "2026-07-18T00:00:00.000Z",
  persist: true,
  executor: (task) => ({
    result: `executed ${task.owner}`,
    evidence: ["node tests/parser.test.js: pass"],
    files_changed: ["tests/parser.test.js"],
    next_action: "Run preflight for the next bounded objective.",
  }),
  verifier: (execution) => ({ passed: execution.evidence.length > 0 }),
});
assert.equal(completed.schema, "kaizen7.action_reaction_loop.v1");
assert.equal(completed.system_id, "kaizen7-loop-os");
assert.equal(completed.status, "completed");
assert.equal(completed.task.owner, "codex");
assert.equal(completed.task.loop.profile, "technical");
assert.equal(completed.receipt.status, "completed");
assert.equal(completed.next_action, "Run preflight for the next bounded objective.");
assert.deepEqual(completed.states, ["preflight", "ready", "executing", "verifying", "learning", "next_action", "completed"]);
assert.equal(completed.attempts.length, 1);
assert.equal(readLedger({ root }).length, 1);

const approval = runActionReactionLoop("publica el vídeo y paga la campaña", {
  root,
  now: "2026-07-18T00:00:00.000Z",
  executor: () => { throw new Error("must not execute"); },
});
assert.equal(approval.status, "approval_required");
assert.equal(approval.task, null);
assert(approval.next_action.includes("explicit approval"));

const research = runActionReactionLoop("cuál es el modelo actual para subtítulos", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(research.status, "ready");
assert.equal(research.preflight.route, "research_primary_sources");
assert.equal(research.task.owner, "work");
assert.equal(research.task.loop.profile, "research");

const creative = runActionReactionLoop("crear plantilla creativa de vídeo vertical", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(creative.task.owner, "flowmatik");
assert.equal(creative.task.loop.profile, "creative");

const retryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-action-loop-retry-"));
const retryContexts = [];
let retryAttempt = 0;
const retried = runActionReactionLoop("ajustar parser hasta pasar la prueba", {
  root: retryRoot,
  now: "2026-07-18T00:00:00.000Z",
  persist: true,
  maxIterations: 3,
  executor: (_task, context) => {
    retryContexts.push(context);
    retryAttempt += 1;
    return retryAttempt === 1
      ? { result: "first draft", evidence: ["parser test: fail"], token_usage: 20 }
      : { result: "corrected draft", evidence: ["parser test: pass"], token_usage: 20 };
  },
  verifier: (execution) => execution.result === "corrected draft"
    ? { passed: true, confidence: 0.95 }
    : { passed: false, confidence: 0.4, correction: "handle empty input" },
});
assert.equal(retried.status, "completed");
assert.equal(retried.attempts.length, 2);
assert.equal(retried.attempts[0].verification.correction, "handle empty input");
assert.equal(retryContexts[1].iteration, 2);
assert.equal(retryContexts[1].correction, "handle empty input");
assert.equal(retryContexts[1].previous_execution.result, "first draft");
assert(retried.states.includes("adjusting"));
assert.equal(readLedger({ root: retryRoot }).length, 1);

const failedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-action-loop-fail-"));
const failed = runActionReactionLoop("cambiar el parser de entrada", {
  root: failedRoot,
  now: "2026-07-18T00:00:00.000Z",
  persist: true,
  executor: () => ({ result: "changed", evidence: ["test output"] }),
  verifier: () => ({ passed: false, reason: "regression" }),
});
assert.equal(failed.status, "blocked");
assert.equal(failed.receipt, null);
assert.equal(failed.attempts.length, 2);
assert.equal(readLedger({ root: failedRoot }).length, 0);

let hardFailExecutions = 0;
const hardFailed = runActionReactionLoop("cambiar parser con fallo irreversible", {
  root: failedRoot,
  maxIterations: 5,
  executor: () => {
    hardFailExecutions += 1;
    return { result: "unsafe", evidence: ["crash"] };
  },
  verifier: () => ({ passed: false, hard_fail: true, correction: "requires authority" }),
});
assert.equal(hardFailed.status, "blocked");
assert.equal(hardFailed.stop_reason, "hard_failure");
assert.equal(hardFailExecutions, 1);

assert.throws(
  () => runActionReactionLoop("no ejecutar con cero intentos", { root, maxIterations: 0 }),
  /maxIterations must be a positive integer/,
);

assert.throws(
  () => runActionReactionLoop("no aceptar cero fallos", { root, maxFailures: 0 }),
  /maxFailures must be a positive integer/,
);

for (const invalidTokenUsage of [-1, Number.POSITIVE_INFINITY, "not-a-number"]) {
  const invalidUsage = runActionReactionLoop("bloquear consumo de tokens invalido", {
    root,
    executor: () => ({ result: "untrusted", evidence: ["output"], token_usage: invalidTokenUsage }),
    verifier: () => ({ passed: true }),
  });
  assert.equal(invalidUsage.status, "blocked");
  assert.equal(invalidUsage.stop_reason, "invalid_token_usage");
  assert.equal(invalidUsage.receipt, null);
}

const bounded = runActionReactionLoop("añadir test de cli", {
  root,
  now: "2026-07-18T00:00:00.000Z",
  maxIterations: 2,
  executor: () => ({ result: "should not finish", evidence: ["pass"] }),
  verifier: () => ({ passed: false, correction: "still incomplete" }),
});
assert.equal(bounded.status, "budget_exhausted");
assert.equal(bounded.receipt, null);
assert.equal(bounded.attempts.length, 2);

const promotionRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-action-loop-promotion-"));
for (let index = 0; index < 2; index += 1) {
  appendReceipt({
    objective: "optimizar el parser seguro",
    route: "codex_execute",
    worked: true,
    verification: `verified pass ${index}`,
    reuse_next_time: "Use focused parser tests.",
    verified_at: `2026-07-${16 + index}T00:00:00.000Z`,
    expires_at: "2026-08-18T00:00:00.000Z",
  }, { root: promotionRoot });
}
const promoted = runActionReactionLoop("optimizar el parser seguro", {
  root: promotionRoot,
  now: "2026-07-18T00:00:00.000Z",
  persist: true,
  executor: () => ({
    result: "optimized",
    evidence: ["parser benchmark and tests pass"],
    next_action: "Use focused parser tests.",
  }),
  verifier: () => ({ passed: true }),
});
assert.equal(promoted.learning.promoted, true);
assert.equal(promoted.learning.verified_uses, 3);

const strictPolicy = structuredClone(loadLoopPolicy());
strictPolicy.learning.minimum_verified_uses = 4;
const notPromoted = runActionReactionLoop("optimizar el parser seguro", {
  root: promotionRoot,
  now: "2026-07-18T00:00:00.000Z",
  policy: strictPolicy,
  executor: () => ({ result: "checked", evidence: ["pass"] }),
  verifier: () => true,
});
assert.equal(notPromoted.learning.promoted, false);
assert(notPromoted.learning.rule.includes("4 verified"));

console.log("k7 action reaction loop tests passed");
