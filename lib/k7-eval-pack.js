const { buildTrustGate } = require("./k7-trust-gate");

function buildEvalPack(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "verify an agentic mission before production";
  const safeGoal = shellSafeText(goal);
  const trust = buildTrustGate(goal, options);

  return {
    schema: "kaizen7.eval_pack.v1",
    objective: goal,
    identity: "KAIZEN7 production eval pack",
    purpose: "Define the minimum evidence an agent must produce before a mission can be trusted.",
    agent_agnostic: true,
    trust_decision: trust.decision,
    acceptance_tests: [
      "objective is restated in one sentence",
      "route and executor are named before action",
      "context read list is bounded",
      "risky permissions are blocked or explicitly approved",
      "artifact or blocker is verifiable",
      "receipt includes reuse and discard rules",
    ],
    regression_tests: [
      "known working route still resolves",
      "known discard rule is not repeated",
      "unsafe tool request is blocked by trust gate",
      "resume/context output does not require broad history",
    ],
    observability_fields: [
      "trace_id",
      "objective",
      "agent",
      "route",
      "tool",
      "inputs",
      "outputs",
      "latency_ms",
      "estimated_tokens",
      "verification",
      "risk_decision",
      "receipt_id",
    ],
    cost_budget: {
      max_first_pass_files: 7,
      max_context_events: 6,
      stop_if: [
        "route cannot be named",
        "tool trust is block",
        "verification cannot be defined",
        "human approval is required",
      ],
    },
    receipt_expected: {
      objective: goal,
      route: "",
      tool: "",
      command: "",
      verification: "",
      worked: true,
      reuse_next_time: "",
      discard: [],
      memory_update_recommendation: "",
    },
    commands: [
      `npm.cmd run k7 -- trust "${safeGoal}"`,
      `npm.cmd run k7 -- context "${safeGoal}"`,
      "npm.cmd run k7 -- check",
      "npm.cmd run k7:check",
    ],
  };
}

function formatEvalPack(pack = buildEvalPack()) {
  return [
    "# KAIZEN7 EVAL PACK",
    "",
    `Objective: ${pack.objective}`,
    `Trust decision: ${pack.trust_decision}`,
    "",
    "## Acceptance Tests",
    ...pack.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Regression Tests",
    ...pack.regression_tests.map((item) => `- ${item}`),
    "",
    "## Observability Fields",
    ...pack.observability_fields.map((item) => `- ${item}`),
    "",
    "## Cost Budget",
    `- Max first pass files: ${pack.cost_budget.max_first_pass_files}`,
    `- Max context events: ${pack.cost_budget.max_context_events}`,
    ...pack.cost_budget.stop_if.map((item) => `- Stop if: ${item}`),
    "",
    "## Receipt Expected",
    ...Object.keys(pack.receipt_expected).map((key) => `${key}:`),
    "",
    "## Commands",
    ...pack.commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  buildEvalPack,
  formatEvalPack,
};
