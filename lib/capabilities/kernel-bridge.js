const { buildCapabilityPacket } = require("./packet");

const COMPATIBLE_CONTEXTS = ["code", "content", "commerce", "research", "operations"];

function buildKernelBridge(objective = "", options = {}) {
  const packet = options.packet || buildCapabilityPacket(objective, options);

  return {
    schema: "kaizen7.kernel_bridge.v1",
    version: 1,
    consumer: options.consumer || options.platform || "any_agent",
    project: options.project || "universal",
    objective: packet.objective || objective,
    compatible_contexts: COMPATIBLE_CONTEXTS,
    interface: {
      input: "objective_plus_optional_result_evidence",
      output: "agent_cycle_or_repair_request",
    },
    kernel_objects: [
      "kaizen7.agent_contract.v1",
      "kaizen7.agent_brief.v1",
      "kaizen7.agent_handoff.v1",
      "kaizen7.agent_readiness.v1",
      "kaizen7.agent_receipt.v1",
      "kaizen7.agent_cycle.v1",
    ],
    guarantees: [
      "agent_language_contract",
      "schema_validation",
      "readiness_check",
      "evidence_gated_completion",
      "memory_draft_only",
    ],
    route: [
      "create_packet",
      "check_readiness",
      "run_work",
      "return_receipt",
      "verify_evidence",
      "draft_memory",
    ],
    readiness: packet.agent_readiness,
    next_action: packet.agent_readiness?.verdict === "pass" ? "run_cycle" : "repair_packet",
  };
}

module.exports = {
  buildKernelBridge,
};
