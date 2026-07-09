const { buildEvalPack } = require("./k7-eval-pack");
const { buildMarketMap } = require("./k7-market-map");
const { buildOpenCommonsPack } = require("./k7-open-commons");
const { buildTrustGate } = require("./k7-trust-gate");

function buildProductionPack(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "prepare an agentic workflow for production";
  const safeGoal = shellSafeText(goal);
  const market = buildMarketMap(goal, options);
  const commons = buildOpenCommonsPack(goal, options);
  const trust = buildTrustGate(goal, options);
  const evalPack = buildEvalPack(goal, options);
  const stack = chooseStack(goal);

  return {
    schema: "kaizen7.production_pack.v1",
    objective: goal,
    identity: "KAIZEN7 production readiness pack",
    thesis: "Production agent work needs route choice, trust gate, evals, observability, memory and receipts before execution.",
    agent_agnostic: true,
    free_first: true,
    recommended_stack: stack,
    open_commons: {
      schema: commons.schema,
      doctrine: commons.doctrine,
      top_candidate: commons.ranked_candidates[0],
      bring_your_own_connections: commons.bring_your_own_connections,
      paid_services_policy: commons.paid_services_policy,
    },
    market_problem: market.ranked_problems[0],
    trust_gate: {
      schema: trust.schema,
      decision: trust.decision,
      findings: trust.findings,
    },
    eval_pack: {
      schema: evalPack.schema,
      acceptance_tests: evalPack.acceptance_tests,
      observability_fields: evalPack.observability_fields,
      cost_budget: evalPack.cost_budget,
    },
    production_checklist: [
      "route selected and justified",
      "tool trust decision recorded",
      "dry-run evidence captured",
      "acceptance and regression tests named",
      "observability fields available",
      "human approval boundary stated",
      "receipt and context memory updated after verification",
    ],
    framework_selector: [
      {
        use_when: "long-running, stateful workflow",
        choose: "durable workflow pattern; bring LangGraph, AutoGen GraphFlow, custom runner or any compatible free runtime",
      },
      {
        use_when: "lightweight execution with guardrails, sessions, handoffs or sandbox",
        choose: "guarded runtime pattern; bring OpenAI Agents SDK, local harness or any compatible executor",
      },
      {
        use_when: "role-based team of specialist agents",
        choose: "role team pattern; bring CrewAI, AutoGen teams, custom scripts or any compatible orchestration",
      },
      {
        use_when: "multi-agent coordination or experimental agent teams",
        choose: "multi-agent coordination pattern; keep the coordinator replaceable",
      },
      {
        use_when: "no stable API or direct integration exists",
        choose: "KAIZEN7 Anything CLI adapter route",
      },
    ],
    observability_strategy: {
      default: "emit neutral JSON trace first",
      can_export_to: ["Langfuse", "Arize Phoenix", "Braintrust", "OpenTelemetry"],
      do_not_build_yet: "full observability backend",
    },
    next_commands: [
      `npm.cmd run k7 -- trust "${safeGoal}"`,
      `npm.cmd run k7 -- eval "${safeGoal}"`,
      `npm.cmd run k7 -- run "${safeGoal}"`,
      "npm.cmd run k7:check",
    ],
  };
}

function chooseStack(goal = "") {
  const value = goal.toLowerCase();
  if (value.includes("long") || value.includes("state") || value.includes("durable") || value.includes("workflow")) {
    return "durable workflow pattern (free-runtime compatible)";
  }
  if (value.includes("guardrail") || value.includes("handoff") || value.includes("sandbox") || value.includes("session")) {
    return "guarded runtime pattern (bring your own executor)";
  }
  if (value.includes("crew") || value.includes("team") || value.includes("role") || value.includes("research")) {
    return "role-team pattern (framework optional)";
  }
  if (value.includes("multi-agent") || value.includes("autogen") || value.includes("graphflow")) {
    return "multi-agent coordination pattern (framework optional)";
  }
  if (value.includes("api") || value.includes("browser") || value.includes("desktop") || value.includes("cli")) {
    return "KAIZEN7 Anything CLI adapter route";
  }
  return "KAIZEN7 preflight plus lightweight guarded executor";
}

function formatProductionPack(pack = buildProductionPack()) {
  return [
    "# KAIZEN7 PRODUCTION PACK",
    "",
    `Objective: ${pack.objective}`,
    `Free first: ${pack.free_first}`,
    `Recommended stack: ${pack.recommended_stack}`,
    `Trust decision: ${pack.trust_gate.decision}`,
    "",
    "## Open Commons",
    `- Doctrine: ${pack.open_commons.doctrine}`,
    `- Top candidate: ${pack.open_commons.top_candidate.id}`,
    `- Paid default: ${pack.open_commons.paid_services_policy.default}`,
    "",
    "## Market Problem",
    `- ${pack.market_problem.id}: ${pack.market_problem.problem}`,
    "",
    "## Production Checklist",
    ...pack.production_checklist.map((item) => `- ${item}`),
    "",
    "## Framework Selector",
    ...pack.framework_selector.map((item) => `- ${item.use_when}: ${item.choose}`),
    "",
    "## Observability",
    `- Default: ${pack.observability_strategy.default}`,
    `- Export: ${pack.observability_strategy.can_export_to.join(", ")}`,
    `- Do not build yet: ${pack.observability_strategy.do_not_build_yet}`,
    "",
    "## Eval Acceptance Tests",
    ...pack.eval_pack.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Next Commands",
    ...pack.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  buildProductionPack,
  chooseStack,
  formatProductionPack,
};
