const { resolveCapabilities } = require("./resolver");

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function buildWorldInteractionPlan(objective = "", options = {}) {
  const plan = resolveCapabilities(objective, { ...options, domain: "world", limit: 4 });
  const selectedIds = plan.selected.map((capability) => capability.id);
  const requested = [
    options.target === "mcp" ? "world.mcp_tool_plan" : "",
    options.target === "connector" ? "world.app_connector_plan" : "",
    options.artifact === "clip" ? "world.clip_intake" : "",
    options.artifact ? "world.artifact_export_plan" : "",
  ];
  const capabilities = unique([...selectedIds, ...requested]);

  return {
    schema: "kaizen7.world_interaction_plan.v1",
    version: 1,
    objective,
    verdict: "plan_only",
    capabilities,
    approval_gates: unique([...plan.approvalGates, "external_write"]),
    evidence_contract: unique([
      ...plan.verification,
      "receipt_schema_valid",
      "no_unapproved_external_effect",
      "approval_state_reported",
    ]),
    handoff: {
      expected_receipt_schema: "kaizen7.agent_receipt.v1",
      rule: "prepare_external_action_then_wait_for_approval_when_needed",
    },
    boundaries: [
      "no_secret_collection",
      "no_external_write_without_approval",
      "no_publish_without_approval",
    ],
    next_action: "prepare_handoff_or_request_approval",
  };
}

module.exports = {
  buildWorldInteractionPlan,
};
