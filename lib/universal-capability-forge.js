function inferCapability(objective = "") {
  const text = String(objective).toLowerCase();
  if (/transcri|audio|podcast|srt|caption|subtit/.test(text)) return "audio.transcribe";
  if (/clip|video|reel|short|render/.test(text)) return "superclip.create";
  if (/pdf|ocr|document/.test(text)) return "document.extract";
  if (/proveedor|supplier|competidor|research|investig/.test(text)) return "research.pattern_intake";
  if (/web|app|frontend|site/.test(text)) return "code.scaffold";
  return "capability.forge";
}

function buildSelectedPath(capability) {
  const paths = {
    "audio.transcribe": ["provider.radar", "cpu_first_transcriber", "adapter.forge", "evidence.source_map"],
    "superclip.create": ["provider.radar", "content.script", "audio.tts", "caption.generate", "video.compose", "media.probe"],
    "document.extract": ["provider.radar", "document.ocr", "document.parse", "adapter.forge", "evidence.source_map"],
    "research.pattern_intake": ["provider.radar", "source.scan", "pattern.absorb", "evidence.source_map"],
    "code.scaffold": ["provider.radar", "pattern.absorb", "codex.execution_packet", "test.verify"],
    "capability.forge": ["provider.radar", "pattern.absorb", "adapter.forge", "evidence.guard"],
  };
  return paths[capability] || paths["capability.forge"];
}

function buildUniversalCapabilityForgePacket(objective = "", options = {}) {
  const capability = options.capability || inferCapability(objective);
  return {
    schema: "kaizen7.forge_packet.v1",
    version: 1,
    objective,
    capability,
    policy: {
      cost: "free_first",
      license: "open_source_first",
      hardware: "cpu_first",
      locality: "local_first_when_practical",
      provider_bias: "agent_readable_interfaces",
    },
    selected_path: buildSelectedPath(capability),
    allowed_actions: [
      "search_memory",
      "search_public_sources",
      "compare_providers",
      "absorb_patterns",
      "create_manifest",
      "create_adapter",
      "create_execution_packet",
      "run_workspace_tests",
      "write_memory_draft",
    ],
    approval_required: [
      "install_binary",
      "download_model",
      "start_persistent_service",
      "use_gpu_heavy_job",
      "use_paid_api",
      "publish_external",
      "delete_user_assets",
      "change_credentials",
    ],
    evidence_required: [
      "capability_selected",
      "provider_decision_recorded",
      "approval_gates_listed",
      "execution_packet_created",
      "verification_command_reported",
      "memory_writeback_draft",
    ],
    agent_packet: {
      role: "agent_execution_direction",
      first_move: "resolve_provider_or_absorb_pattern",
      avoid: ["broad_refactor", "paid_default", "gpu_default", "unapproved_install", "credential_touch"],
      return: ["selected_path", "changed_surface", "verification_result", "remaining_risks", "memory_draft"],
    },
    next_action: "prepare_agent_execution_packet",
  };
}

module.exports = {
  buildUniversalCapabilityForgePacket,
  inferCapability,
};
