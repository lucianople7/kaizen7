const { listAnythingTools } = require("./anything-tool-registry");

function inferCapability(objective = "") {
  const text = String(objective).toLowerCase();
  if (/transcri|audio|podcast|srt|caption|subtit/.test(text)) return "audio.transcribe";
  if (/clip|video|reel|short|render/.test(text)) return "superclip.create";
  if (/pdf|ocr|document/.test(text)) return "document.extract";
  if (/proveedor|supplier|competidor|research|investig/.test(text)) return "research.pattern_intake";
  if (/web|app|frontend|site/.test(text)) return "code.scaffold";
  return "capability.forge";
}

function mapForgeCapabilityToProviderCapabilities(capability) {
  const map = {
    "audio.transcribe": ["audio.transcribe", "caption.generate"],
    "superclip.create": ["media.pipeline", "video.render", "audio.mix", "caption.generate", "media.probe"],
    "document.extract": ["document.ocr", "document.parse", "audio.transcribe"],
    "research.pattern_intake": ["research.web", "model.local", "text.generate"],
    "code.scaffold": ["code.scaffold", "text.generate", "model.local"],
    "capability.forge": ["model.local", "text.generate", "media.pipeline"],
  };
  return map[capability] || [capability];
}

function inferFit(tool = {}) {
  const risk = String(tool.risk || "").toLowerCase();
  const kind = String(tool.kind || "").toLowerCase();
  return {
    cost: risk.includes("paid") ? "paid_optional" : "free_first",
    license: tool.license || "open_source_or_verify",
    hardware: risk.includes("gpu") ? "gpu_optional" : "cpu_first",
    locality: risk.includes("cloud") ? "cloud_optional" : "local_first_when_practical",
    agent_surface: kind === "service" ? ["http_or_service"] : ["cli_or_file"],
  };
}

function scoreProvider(tool = {}, providerCapabilities = []) {
  const risk = String(tool.risk || "").toLowerCase();
  let score = 0;
  if ((tool.capabilities || []).some((capability) => providerCapabilities.includes(capability))) score += 100;
  if (tool.available) score += 40;
  if (!risk.includes("paid")) score += 20;
  if (!risk.includes("cloud")) score += 15;
  if (!risk.includes("gpu")) score += 15;
  if (tool.commands && Object.keys(tool.commands).length > 0) score += 10;
  if (tool.evidence && tool.evidence.length > 0) score += 10;
  if (risk.includes("manual")) score -= 20;
  if (risk.includes("optional")) score -= 10;
  if (risk.includes("paid")) score -= 30;
  if (risk.includes("cloud")) score -= 25;
  if (risk.includes("gpu")) score -= 20;
  return score;
}

function buildProviderRadar(capability, options = {}) {
  const providerCapabilities = mapForgeCapabilityToProviderCapabilities(capability);
  const tools = options.tools || listAnythingTools(options);
  const candidates = tools
    .filter((tool) => (tool.capabilities || []).some((item) => providerCapabilities.includes(item)))
    .map((tool) => ({
      id: tool.id,
      capabilities: tool.capabilities || [],
      kind: tool.kind,
      available: Boolean(tool.available),
      commands: tool.commands || {},
      evidence: tool.evidence || [],
      risk: tool.risk || "unknown",
      fit: inferFit(tool),
      score: scoreProvider(tool, providerCapabilities),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const selected = candidates.find((candidate) => candidate.available) || candidates[0] || null;
  const decision = selected ? (selected.available ? "use_provider" : "adapt_provider") : "absorb_pattern";
  const nextAction = {
    use_provider: "create_execution_packet",
    adapt_provider: "prepare_manifest_or_start_provider",
    absorb_pattern: "search_and_absorb_pattern",
  }[decision];
  return {
    schema: "kaizen7.provider_radar.v1",
    version: 1,
    capability,
    provider_capabilities: providerCapabilities,
    policy: {
      cost: "free_first",
      license: "open_source_first",
      hardware: "cpu_first",
      locality: "local_first_when_practical",
    },
    decision,
    selected,
    candidates,
    next_action: nextAction,
  };
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
  const providerRadar = buildProviderRadar(capability, options);
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
    provider_radar: providerRadar,
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
  buildProviderRadar,
  buildUniversalCapabilityForgePacket,
  inferCapability,
};
