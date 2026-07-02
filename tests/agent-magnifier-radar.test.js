const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildMacroSearchPacket,
  getMagnifierRadar,
  writeMacroSearchPacket,
} = require("../lib/agent-magnifier-radar");

const ranked = getMagnifierRadar({ limit: 5 });
assert.equal(ranked.length, 5);
assert(ranked[0].score >= ranked[1].score);
assert(ranked.some((candidate) => candidate.id === "projectmem"));
assert(ranked.some((candidate) => candidate.layer === "K7 Scope"));

const packet = buildMacroSearchPacket({ limit: 3 });
assert.equal(packet.schema, "kaizen7.agent_magnifier_radar.v1");
assert.equal(packet.ranked.length, 3);
assert.equal(packet.next_build_order.length, 3);
assert(packet.filters.includes("security_gate_before_untrusted_run"));

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-agent-magnifier-"));
const file = writeMacroSearchPacket(root);
assert(fs.existsSync(file));
const saved = JSON.parse(fs.readFileSync(file, "utf8"));
assert.equal(saved.schema, "kaizen7.agent_magnifier_radar.v1");
assert(saved.ranked.length >= 5);

console.log("agent magnifier radar tests passed");
