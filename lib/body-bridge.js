const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildBridgePacket(options = {}) {
  return {
    ...buildLitePlan("body-bridge", {
      ...options,
      action: "Bridge a human objective into a bounded KAIZEN7 execution packet.",
      verification: ["objective_present", "gates_present"],
      risks: [],
    }),
    packet: {
      objective: options.goal || options.objective || "continue KAIZEN7 work",
      expectedReturn: ["summary", "evidence", "risks", "memory_draft"],
    },
  };
}

function formatBridgePacket(plan) {
  return formatLitePlan(plan, "KAIZEN7 Body Bridge");
}

if (require.main === module) runLiteCli(buildBridgePacket, formatBridgePacket);

module.exports = { buildBridgePacket, formatBridgePacket };
