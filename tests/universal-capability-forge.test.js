const assert = require("node:assert/strict");
const {
  buildProviderRadar,
  buildUniversalCapabilityForgePacket,
  inferCapability,
} = require("../lib/universal-capability-forge");

assert.equal(inferCapability("necesito transcribir audio local sin GPU"), "audio.transcribe");
assert.equal(inferCapability("crear superclip vertical sin GPU"), "superclip.create");
assert.equal(inferCapability("organizar PDFs con OCR"), "document.extract");
assert.equal(inferCapability("analizar proveedores europeos"), "research.pattern_intake");

const radarReady = buildProviderRadar("audio.transcribe", {
  tools: [
    {
      id: "whisper-cpu",
      capabilities: ["audio.transcribe", "caption.generate"],
      kind: "binary",
      available: true,
      risk: "local_audio_processing",
      evidence: ["transcript_exists"],
      commands: { transcribe: "whisper-cpu <audio>" },
    },
    {
      id: "cloud-transcriber",
      capabilities: ["audio.transcribe"],
      kind: "service",
      available: true,
      risk: "paid_cloud_optional",
      evidence: ["transcript_exists"],
    },
  ],
});
assert.equal(radarReady.schema, "kaizen7.provider_radar.v1");
assert.equal(radarReady.capability, "audio.transcribe");
assert.equal(radarReady.decision, "use_provider");
assert.equal(radarReady.selected.id, "whisper-cpu");
assert.equal(radarReady.selected.fit.cost, "free_first");
assert.equal(radarReady.selected.fit.hardware, "cpu_first");
assert(radarReady.selected.score > radarReady.candidates[1].score);

const radarMissing = buildProviderRadar("image.generate", {
  tools: [
    {
      id: "comfyui",
      capabilities: ["image.generate"],
      kind: "service",
      available: false,
      risk: "local_service_optional",
      evidence: ["asset_exists"],
    },
  ],
});
assert.equal(radarMissing.decision, "adapt_provider");
assert.equal(radarMissing.next_action, "prepare_manifest_or_start_provider");

const radarUnsupported = buildProviderRadar("document.extract", { tools: [] });
assert.equal(radarUnsupported.decision, "absorb_pattern");
assert.equal(radarUnsupported.next_action, "search_and_absorb_pattern");

const packet = buildUniversalCapabilityForgePacket("necesito una herramienta para una app nueva");
assert.equal(packet.schema, "kaizen7.forge_packet.v1");
assert.equal(packet.policy.cost, "free_first");
assert.equal(packet.policy.license, "open_source_first");
assert.equal(packet.policy.hardware, "cpu_first");
assert(packet.allowed_actions.includes("absorb_patterns"));
assert(packet.approval_required.includes("use_paid_api"));
assert(packet.evidence_required.includes("memory_writeback_draft"));
assert.equal(packet.provider_radar.schema, "kaizen7.provider_radar.v1");
assert(["create_execution_packet", "create_or_update_provider_manifest", "search_and_absorb_pattern"].includes(packet.agent_packet.first_move));
assert.equal(packet.next_action, "prepare_agent_execution_packet");

const adaptPacket = buildUniversalCapabilityForgePacket("necesito transcribir audio local sin GPU", {
  tools: [
    {
      id: "whisper",
      capabilities: ["audio.transcribe", "caption.generate"],
      kind: "binary",
      available: false,
      risk: "local_audio_processing",
      commands: { transcribe: "whisper <audio> --language Spanish" },
      evidence: ["transcript_exists", "timestamps_present"],
    },
  ],
});
assert.equal(adaptPacket.provider_radar.decision, "adapt_provider");
assert.equal(adaptPacket.adapter_manifest.schema, "kaizen7.adapter_manifest_plan.v1");
assert.equal(adaptPacket.adapter_manifest.provider_id, "whisper");
assert.equal(adaptPacket.adapter_manifest.capability, "audio.transcribe");
assert.equal(adaptPacket.adapter_manifest.action, "create_or_update_manifest");
assert.deepEqual(adaptPacket.adapter_manifest.verify_command, ["whisper", "--help"]);
assert(adaptPacket.adapter_manifest.approval_required.includes("install_binary"));
assert(adaptPacket.adapter_manifest.evidence_expected.includes("transcript_exists"));
assert.equal(adaptPacket.agent_packet.first_move, "create_or_update_provider_manifest");

console.log("universal capability forge tests passed");
