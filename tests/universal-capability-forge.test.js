const assert = require("node:assert/strict");
const {
  buildUniversalCapabilityForgePacket,
  inferCapability,
} = require("../lib/universal-capability-forge");

assert.equal(inferCapability("necesito transcribir audio local sin GPU"), "audio.transcribe");
assert.equal(inferCapability("crear superclip vertical sin GPU"), "superclip.create");
assert.equal(inferCapability("organizar PDFs con OCR"), "document.extract");
assert.equal(inferCapability("analizar proveedores europeos"), "research.pattern_intake");

const packet = buildUniversalCapabilityForgePacket("necesito una herramienta para una app nueva");
assert.equal(packet.schema, "kaizen7.forge_packet.v1");
assert.equal(packet.policy.cost, "free_first");
assert.equal(packet.policy.license, "open_source_first");
assert.equal(packet.policy.hardware, "cpu_first");
assert(packet.allowed_actions.includes("absorb_patterns"));
assert(packet.approval_required.includes("use_paid_api"));
assert(packet.evidence_required.includes("memory_writeback_draft"));
assert.equal(packet.agent_packet.first_move, "resolve_provider_or_absorb_pattern");
assert.equal(packet.next_action, "prepare_agent_execution_packet");

console.log("universal capability forge tests passed");
