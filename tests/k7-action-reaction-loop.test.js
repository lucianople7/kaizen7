const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { appendReceipt, readLedger } = require("../lib/k7-receipt-ledger");
const { runActionReactionLoop } = require("../lib/k7-action-reaction-loop");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-action-loop-"));
const objective = "añadir una prueba estable al parser";
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
assert.equal(completed.status, "completed");
assert.equal(completed.task.owner, "codex");
assert.equal(completed.receipt.status, "completed");
assert.equal(completed.next_action, "Run preflight for the next bounded objective.");
assert.deepEqual(completed.states, ["preflight", "ready", "executing", "verifying", "learning", "next_action", "completed"]);
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
assert.equal(research.task.owner, "flowmatik");

const creative = runActionReactionLoop("crear plantilla creativa de vídeo vertical", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(creative.task.owner, "flowmatik");

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
assert.equal(readLedger({ root: failedRoot }).length, 0);

const bounded = runActionReactionLoop("añadir test de cli", {
  root,
  now: "2026-07-18T00:00:00.000Z",
  maxIterations: 2,
  executor: () => ({ result: "should not finish", evidence: ["pass"] }),
});
assert.equal(bounded.status, "budget_exhausted");
assert.equal(bounded.receipt, null);
assert(bounded.states.length <= 2);

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

console.log("k7 action reaction loop tests passed");
