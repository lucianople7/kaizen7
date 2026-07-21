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

const creative = runOneDoor("crear una plantilla creativa de vídeo vertical", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(creative.executor, "flowmatik");
assert.equal(creative.task_contract.loop.profile, "creative");

const gated = runOneDoor("publica el vídeo y paga la campaña", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(gated.status, "approval_required");
assert.equal(gated.executor, "human");
assert.equal(gated.task_contract, null);

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
