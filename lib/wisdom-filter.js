const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildWisdomFilter(options = {}) {
  return {
    ...buildLitePlan("wisdom-filter", {
      ...options,
      action: "Keep the durable lesson and discard raw conversational noise.",
      verification: ["lesson_present", "no_secrets"],
      risks: [],
    }),
    lesson: options.lesson || options.goal || "Prefer small verified capabilities over broad tool accumulation.",
  };
}

function formatWisdomFilter(plan) {
  return formatLitePlan(plan, "KAIZEN7 Wisdom Filter");
}

if (require.main === module) runLiteCli(buildWisdomFilter, formatWisdomFilter);

module.exports = { buildWisdomFilter, formatWisdomFilter };
