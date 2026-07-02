const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildJcodeAdapterPlan(options = {}) {
  return buildLitePlan("jcode-adapter", {
    ...options,
    action: "Prepare jcode as a session harness candidate without assuming it is installed.",
    verification: ["session_packet_present", "smoke_test_required"],
  });
}

function formatJcodeAdapterPlan(plan) {
  return formatLitePlan(plan, "KAIZEN7 jcode Adapter");
}

if (require.main === module) runLiteCli(buildJcodeAdapterPlan, formatJcodeAdapterPlan);

module.exports = { buildJcodeAdapterPlan, formatJcodeAdapterPlan };
