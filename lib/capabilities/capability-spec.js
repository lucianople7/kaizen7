const { getCapability } = require("./registry");

function routeFor(capability = {}) {
  if (capability.domain === "agent") {
    return ["create_handoff", "run_work", "return_receipt", "verify_evidence", "draft_memory"];
  }
  if (capability.domain === "app") {
    return ["map_permissions", "plan_integration", "request_approval", "verify_no_external_effect"];
  }
  if (capability.domain === "project") {
    return ["read_context", "summarize_boundaries", "select_capabilities", "draft_project_brief"];
  }
  return ["understand_scope", "run_capability", "verify_evidence", "draft_memory"];
}

function buildCapabilitySpec(idOrCapability, options = {}) {
  const capability = typeof idOrCapability === "string" ? getCapability(idOrCapability, options) : idOrCapability;
  if (!capability) {
    return {
      schema: "kaizen7.capability_spec.v1",
      status: "missing",
      id: String(idOrCapability || ""),
    };
  }

  return {
    schema: "kaizen7.capability_spec.v1",
    version: 1,
    id: capability.id,
    domain: capability.domain,
    purpose: capability.purpose,
    status: capability.status,
    interface: {
      input: capability.inputs || [],
      output: capability.outputs || [],
    },
    requires: capability.requires || [],
    tools: capability.tools || [],
    approval: capability.approval || [],
    evidence: {
      required: capability.verification || [],
      writeback: capability.writeback || "",
    },
    agent_contract: {
      route: routeFor(capability),
      stop_when: "required_evidence_is_present",
      return: ["result_summary", "evidence", "risks", "memory_draft"],
    },
  };
}

module.exports = {
  buildCapabilitySpec,
};
