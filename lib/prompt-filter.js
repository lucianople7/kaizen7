const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildPromptFilter(options = {}) {
  const prompt = options.prompt || options.goal || options.objective || "";
  return {
    ...buildLitePlan("prompt-filter", {
      ...options,
      action: "Convert a raw prompt into objective, constraints, risks and next action.",
      verification: ["objective_present", "risks_reported"],
      risks: [],
    }),
    objective: String(prompt).trim() || "continue",
    constraints: ["smallest useful action", "verify before completion"],
  };
}

function formatPromptFilter(plan) {
  return formatLitePlan(plan, "KAIZEN7 Prompt Filter");
}

if (require.main === module) runLiteCli(buildPromptFilter, formatPromptFilter);

module.exports = { buildPromptFilter, formatPromptFilter };
