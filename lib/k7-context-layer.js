const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildK7ContextLayer(options = {}) {
  return {
    ...buildLitePlan("k7-context-layer", {
      ...options,
      action: "Build a compact context capsule for the current project and objective.",
      verification: ["project_present", "objective_present", "boundaries_present"],
      risks: [],
    }),
    contextCapsule: {
      project: options.project || "KAIZEN7",
      objective: options.goal || options.objective || "continue",
      boundaries: ["no secrets", "no external effect without approval"],
    },
  };
}

function formatK7ContextLayer(plan) {
  return formatLitePlan(plan, "KAIZEN7 Context Layer");
}

if (require.main === module) runLiteCli(buildK7ContextLayer, formatK7ContextLayer);

module.exports = { buildK7ContextLayer, formatK7ContextLayer };
