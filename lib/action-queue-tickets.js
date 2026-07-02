const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildActionQueueTickets(options = {}) {
  const goal = options.goal || options.objective || "choose next KAIZEN7 action";
  const tickets = [
    {
      id: "k7-next-action",
      priority: "P0",
      lane: options.lane || "strength",
      title: goal,
      stopCondition: "stop_if_credentials_required_or_scope_expands",
      verification: ["npm.cmd run check"],
    },
  ];
  return {
    ...buildLitePlan("action-queue-tickets", {
      ...options,
      action: "Convert the next useful action into a small ticket with stop rules.",
      verification: ["ticket_present", "stop_condition_present"],
      risks: [],
    }),
    tickets,
    recommended: tickets[0],
  };
}

function formatActionQueueTickets(plan) {
  return [
    formatLitePlan(plan, "KAIZEN7 Action Queue"),
    "### Recommended",
    `- ${plan.recommended.priority} ${plan.recommended.title}`,
  ].join("\n");
}

if (require.main === module) runLiteCli(buildActionQueueTickets, formatActionQueueTickets);

module.exports = { buildActionQueueTickets, formatActionQueueTickets };
