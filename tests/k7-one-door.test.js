const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  normalizeOneDoorInput,
  runOneDoor,
} = require("../lib/k7-one-door");

const normalized = normalizeOneDoorInput({
  objective: "implementar K7 One Door para Work y Flowmatik",
  project: "KAIZEN7",
  constraints: ["backward compatible"],
  authority: [],
  budget: { iterations: 8, tokens: 1200 },
});
assert.equal(normalized.schema, "kaizen7.one_door_input.v1");
assert.equal(normalized.project, "KAIZEN7");
assert.deepEqual(normalized.constraints, ["backward compatible"]);

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-one-door-"));
const technical = runOneDoor(normalized, {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(technical.schema, "kaizen7.one_door.v1");
assert.equal(technical.system_id, "kaizen7-loop-os");
assert.equal(technical.status, "ready");
assert.equal(technical.executor, "codex");
assert.equal(technical.task_contract.owner, "codex");
assert.equal(technical.task_contract.loop.profile, "technical");
assert.equal(technical.evidence.length, 0);
assert.deepEqual(technical.attempts, []);
assert(technical.next_action.includes("codex"));
assert.equal(
  technical.operator_contract.principal.name,
  "Luciano López Barba",
);
assert.equal(
  technical.operator_contract.principal.role,
  "final_human_authority",
);
assert.equal(
  technical.operator_contract.intent,
  "Cuanto mejor va el proyecto, mejor va mi vida.",
);
assert.equal(
  technical.operator_contract.recommendation_policy,
  "recommend_best_supported_route_first",
);
assert.equal(
  technical.operator_contract.ecosystem_roles.KAIZEN7,
  "canonical_coordinator_memory_and_decision_system",
);

const creative = runOneDoor("crear una plantilla creativa de vídeo vertical", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(creative.executor, "flowmatik");
assert.equal(creative.task_contract.loop.profile, "creative");
assert.equal(
  creative.operator_contract.ecosystem_roles["Flowmatik Studio"],
  "creative_factory_and_audiovisual_execution",
);
assert.equal(
  creative.operator_contract.ecosystem_roles["THE FOCUX"],
  "public_brand_and_business_value_receiver",
);

const gated = runOneDoor("publica el vídeo y paga la campaña", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(gated.status, "approval_required");
assert.equal(gated.executor, "human");
assert.equal(gated.task_contract, null);
assert.equal(
  gated.operator_contract.principal.role,
  "final_human_authority",
);
assert(gated.operator_contract.authority_gates.includes("spend"));
assert(gated.operator_contract.authority_gates.includes("publish"));
assert.equal(gated.executor, "human");

const completed = runOneDoor("añadir una prueba estable al parser", {
  root,
  now: "2026-07-18T00:00:00.000Z",
  executor: () => ({
    result: "test added",
    evidence: ["node tests/parser.test.js: pass"],
    next_action: "Select the next objective.",
  }),
  verifier: () => ({ passed: true }),
});
assert.equal(completed.status, "completed");
assert.equal(completed.executor, "codex");
assert.deepEqual(completed.evidence, ["node tests/parser.test.js: pass"]);
assert.equal(completed.outcome_receipt.status, "completed");
assert.equal(completed.attempts.length, 1);
assert.equal(completed.next_action, "Select the next objective.");

assert.throws(() => normalizeOneDoorInput({}), /objective is required/);

console.log("k7 one door tests passed");
