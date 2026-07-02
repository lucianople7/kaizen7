const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildK7ControlPlane(options = {}) {
  return {
    ...buildLitePlan("k7-control-plane", {
      ...options,
      action: "Centralize approvals, stop rules and evidence gates before providers execute.",
      verification: ["approval_gates_present", "stop_rules_present"],
      risks: [],
    }),
    stopRules: ["credentials_required", "publish_requested", "scope_expands", "destructive_action"],
  };
}

function formatK7ControlPlane(plan) {
  return formatLitePlan(plan, "KAIZEN7 Control Plane");
}

if (require.main === module) runLiteCli(buildK7ControlPlane, formatK7ControlPlane);

module.exports = { buildK7ControlPlane, formatK7ControlPlane };
