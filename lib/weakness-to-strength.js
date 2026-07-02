const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildWeaknessToStrengthPlan(options = {}) {
  const plan = buildLitePlan("weakness-to-strength", {
    ...options,
    action: "Turn repeated friction into one small improvement ticket.",
    verification: ["weakness_named", "strength_action_present", "owner_or_next_step_present"],
    risks: [],
  });
  return {
    ...plan,
    weakness: options.weakness || options.goal || "unknown friction",
    strength: options.strength || "small repeatable capability improvement",
    lane: "strength",
  };
}

function formatWeaknessToStrengthPlan(plan) {
  return formatLitePlan(plan, "KAIZEN7 Weakness To Strength");
}

if (require.main === module) runLiteCli(buildWeaknessToStrengthPlan, formatWeaknessToStrengthPlan);

module.exports = { buildWeaknessToStrengthPlan, formatWeaknessToStrengthPlan };
