const assert = require("node:assert/strict");
const {
  buildLoopSystemDefinition,
  loadLoopPolicy,
  validateLoopPolicy,
} = require("../lib/k7-loop-system");

const policy = loadLoopPolicy();
assert.equal(policy.schema, "kaizen7.loop_policy.v1");
assert.equal(policy.system.id, "kaizen7-loop-os");
assert.equal(policy.roles.coordinator, "kaizen7");
assert.equal(policy.roles.technical_executor, "codex");
assert.equal(policy.roles.creative_executor, "flowmatik");
assert.equal(policy.learning.minimum_verified_uses, 3);
assert.equal(policy.limits.max_iterations, 8);
assert(policy.human_gates.includes("spending"));
assert(policy.human_gates.includes("publishing"));
assert.doesNotThrow(() => validateLoopPolicy(policy));
assert.throws(
  () => validateLoopPolicy({ ...policy, learning: { minimum_verified_uses: 0 } }),
  /minimum_verified_uses/,
);

const system = buildLoopSystemDefinition(policy);
assert.equal(system.schema, "kaizen7.loop_system.v1");
assert.equal(system.status, "defined");
assert.deepEqual(system.flow, [
  "objective",
  "preflight",
  "task_contract",
  "execution",
  "verification",
  "outcome_receipt",
  "learning_gate",
  "next_action",
]);
assert.equal(system.autonomy.operational_doubts, "kaizen7_first");
assert.equal(system.autonomy.human_intervention, "preference_or_authority_only");

console.log("k7 loop system tests passed");
