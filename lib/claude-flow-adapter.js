const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildClaudeFlowAdapterPlan(options = {}) {
  return buildLitePlan("claude-flow-adapter", {
    ...options,
    action: "Prepare a Claude Flow delegation plan while KAIZEN7 keeps scope and verification.",
    verification: ["handoff_contract_present", "external_cli_smoke_required"],
  });
}

function formatClaudeFlowAdapterPlan(plan) {
  return formatLitePlan(plan, "KAIZEN7 Claude Flow Adapter");
}

if (require.main === module) runLiteCli(buildClaudeFlowAdapterPlan, formatClaudeFlowAdapterPlan);

module.exports = { buildClaudeFlowAdapterPlan, formatClaudeFlowAdapterPlan };
