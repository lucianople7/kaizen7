const { buildCapabilitySpec } = require("./capability-spec");
const { listCapabilities } = require("./registry");

function superCapabilities(options = {}) {
  return listCapabilities(options)
    .filter((capability) => capability.domain === "super")
    .sort((left, right) => left.id.localeCompare(right.id));
}

function buildSuperCapabilitySystem(objective = "", options = {}) {
  const capabilities = superCapabilities(options);
  const pieces = capabilities.map((capability) => ({
    id: capability.id,
    purpose: capability.purpose,
    requires: capability.requires,
    outputs: capability.outputs,
    verification: capability.verification,
    spec: buildCapabilitySpec(capability),
  }));

  return {
    schema: "kaizen7.super_capability_system.v1",
    version: 1,
    objective,
    pieces,
    guarantees: [
      "less_steps_less_tokens",
      "compose_small_capabilities",
      "no_mega_infrastructure",
      "evidence_gated_completion",
      "portable_across_agents_projects_apps",
    ],
    orchestration_rule: "compose_small_capabilities_before_forging_or_expanding_the_kernel",
    operating_order: [
      "select_super_capability",
      "read_spec",
      "build_bridge_or_packet",
      "run_cycle",
      "verify_evidence",
      "teach_next_agent",
    ],
    next_action: "select_super_capability",
  };
}

module.exports = {
  buildSuperCapabilitySystem,
  superCapabilities,
};
