const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  appendSkillOptReceipt,
  evaluateSkillOptEvidence,
  normalizeSkillOptEvidence,
  skillOptFingerprint,
} = require("../lib/skillopt-gate");

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);
const HASH_C = "c".repeat(64);

function completeEvidence(overrides = {}) {
  return {
    skilloptVersion: "0.2.0",
    sourceHash: HASH_A,
    currentSourceHash: HASH_A,
    baselineHash: HASH_B,
    candidateHash: HASH_C,
    validation: { baseline: 0.6, candidate: 0.7 },
    test: { baseline: 0.61, candidate: 0.61 },
    metrics: {
      baseline: { failures: 0, tokens: 1000, latencyMs: 100 },
      candidate: { failures: 0, tokens: 900, latencyMs: 95 },
    },
    splitIds: { train: ["train-1"], validation: ["val-1"], test: ["test-1"] },
    commands: [{ command: "skillopt-sleep run", exitCode: 0 }],
    productionWrites: [],
    ...overrides,
  };
}

const normalized = normalizeSkillOptEvidence(completeEvidence({
  metrics: {
    baseline: { failures: 0 },
    candidate: { failures: 0, tokens: "unknown", latencyMs: -1 },
  },
}));
assert.equal(normalized.metrics.baseline.tokens, null);
assert.equal(normalized.metrics.candidate.tokens, null);
assert.equal(normalized.metrics.candidate.latencyMs, null);

const promotable = evaluateSkillOptEvidence(completeEvidence());
assert.equal(promotable.schema, "kaizen7.skillopt_evaluation.v1");
assert.equal(promotable.verdict, "promotable");
assert.equal(promotable.eligibleForPromotion, true);
assert.equal(typeof promotable.nextAction, "string");
assert(promotable.nextAction.length > 0);

const simulated = evaluateSkillOptEvidence(completeEvidence(), { simulated: true });
assert.equal(simulated.verdict, "promotable");
assert.equal(simulated.simulated, true);
assert.equal(simulated.eligibleForPromotion, false);
assert.match(simulated.nextAction, /simulation/i);

const hold = evaluateSkillOptEvidence(completeEvidence({
  validation: { baseline: 0.6, candidate: 0.6 },
}));
assert.equal(hold.verdict, "hold");
assert.equal(hold.eligibleForPromotion, false);

for (const rejected of [
  completeEvidence({ test: { baseline: 0.61, candidate: 0.5 } }),
  completeEvidence({ currentSourceHash: "d".repeat(64) }),
  completeEvidence({ metrics: { baseline: { failures: 0 }, candidate: { failures: 1 } } }),
  completeEvidence({ commands: [{ command: "skillopt-sleep run", exitCode: 1 }] }),
  completeEvidence({ productionWrites: [".agents/skills/k7-self-evolution-loop/SKILL.md"] }),
]) {
  const report = evaluateSkillOptEvidence(rejected);
  assert.equal(report.verdict, "reject");
  assert.equal(report.eligibleForPromotion, false);
}

for (const incomplete of [
  completeEvidence({ skilloptVersion: "0.3.0" }),
  completeEvidence({ validation: { baseline: null, candidate: null } }),
  completeEvidence({ candidateHash: "" }),
  completeEvidence({ splitIds: undefined }),
  completeEvidence({ commands: [] }),
  completeEvidence({ productionWrites: undefined }),
]) {
  assert.equal(evaluateSkillOptEvidence(incomplete).verdict, "incomplete");
}

assert.match(promotable.fingerprint, /^k7so_[a-f0-9]{16}$/);
assert.equal(skillOptFingerprint(promotable), promotable.fingerprint);

const receiptRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-skillopt-gate-"));
const firstReceipt = appendSkillOptReceipt(promotable, { root: receiptRoot });
const duplicateReceipt = appendSkillOptReceipt(promotable, { root: receiptRoot });
assert.equal(firstReceipt.status, "stored");
assert.equal(duplicateReceipt.status, "duplicate");
assert.equal(fs.readFileSync(firstReceipt.path, "utf8").trim().split(/\r?\n/).length, 1);
assert.throws(() => appendSkillOptReceipt(simulated, { root: receiptRoot }), /simulated/i);
assert.throws(() => appendSkillOptReceipt(
  { ...promotable, fingerprint: "k7so_0000000000000000" },
  { root: receiptRoot },
), /fingerprint/i);

console.log("skillopt gate tests passed");
