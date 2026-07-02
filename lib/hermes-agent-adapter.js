const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildHermesAgentAdapterPlan(options = {}) {
  return buildLitePlan("hermes-agent-adapter", {
    ...options,
    action: "Prepare a Hermes-style agent plan with KAIZEN7 evidence gates.",
    verification: ["agent_role_present", "receipt_required"],
  });
}

function formatHermesAgentAdapterPlan(plan) {
  return formatLitePlan(plan, "KAIZEN7 Hermes Agent Adapter");
}

if (require.main === module) runLiteCli(buildHermesAgentAdapterPlan, formatHermesAgentAdapterPlan);

module.exports = { buildHermesAgentAdapterPlan, formatHermesAgentAdapterPlan };
