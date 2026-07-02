const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildHeadroomAdapterPlan(options = {}) {
  const budget = Number(options.budget || options.headroomBudget || 900);
  return {
    ...buildLitePlan("headroom-adapter", {
      ...options,
      action: "Compress context to the smallest useful operational memory before execution.",
      verification: ["budget_present", "compressed_context_rule_present"],
      risks: [],
    }),
    budget,
    compressionRule: "keep decisions, constraints, evidence and next action; drop raw noise",
  };
}

function formatHeadroomAdapterPlan(plan) {
  return formatLitePlan(plan, "KAIZEN7 Headroom Adapter");
}

if (require.main === module) runLiteCli(buildHeadroomAdapterPlan, formatHeadroomAdapterPlan);

module.exports = { buildHeadroomAdapterPlan, formatHeadroomAdapterPlan };
