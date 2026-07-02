const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildContextCapsule,
  saveContextEvidence,
  searchContextEvidence,
} = require("../lib/context-firewall");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-context-firewall-"));
const heavyOutput = Array.from({ length: 80 }, (_, index) => `line ${index} provider whisper transcript evidence`).join("\n");

const saved = saveContextEvidence("whisper probe output", heavyOutput, { root, source: "test" });
assert.equal(saved.schema, "kaizen7.context_evidence_ref.v1");
assert.equal(saved.kind, "context_evidence");
assert(saved.id.includes("whisper-probe-output"));
assert(fs.existsSync(saved.file));
assert(saved.bytes > saved.summary.length);
assert(saved.summary.includes("whisper"));

const capsule = buildContextCapsule("whisper probe output", heavyOutput, { root, source: "test" });
assert.equal(capsule.schema, "kaizen7.context_capsule.v1");
assert.equal(capsule.mode, "reference_not_raw_dump");
assert.equal(capsule.ref.id, saved.id);
assert(capsule.prompt_payload.length < heavyOutput.length / 4);
assert(capsule.prompt_payload.includes("Evidence saved"));
assert(capsule.prompt_payload.includes(saved.id));

const results = searchContextEvidence("transcript whisper", { root });
assert.equal(results[0].id, saved.id);
assert(results[0].score > 0);

console.log("context firewall tests passed");
