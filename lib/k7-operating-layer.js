const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildK7OperatingLayer(options = {}) {
  return buildLitePlan("k7-operating-layer", {
    ...options,
    action: "Keep KAIZEN7 centered on intent, capability, provider and verification.",
    verification: ["intent_present", "capability_route_present", "verification_gate_present"],
    risks: [],
  });
}

function formatK7OperatingLayer(plan) {
  return formatLitePlan(plan, "KAIZEN7 Operating Layer");
}

if (require.main === module) runLiteCli(buildK7OperatingLayer, formatK7OperatingLayer);

module.exports = { buildK7OperatingLayer, formatK7OperatingLayer };
