const { buildImprovementRadar } = require("./k7-improvement-radar");
const { buildMarketAdaptationPack } = require("./k7-market-adaptation-pack");
const { buildReceiptRecall } = require("./k7-receipt-ledger");
const { buildToolMeshPack } = require("./k7-tool-mesh-pack");

const MARKET_PROBLEMS = [
  {
    id: "agent_route_confusion",
    problem: "Teams have many agent frameworks, CLIs, MCP servers and browser tools, but no neutral way to choose the right route.",
    constant_signal: "Tool choice changes faster than project teams can hard-code best practices.",
    kaizen7_answer: "Route selection before execution.",
    command: "npm.cmd run k7 -- solve \"<objective>\"",
    proof: "The agent receives one route, one first action, one verifier and one receipt shape.",
  },
  {
    id: "tool_trust_gap",
    problem: "MCPs, CLIs and adapters can introduce prompt injection, tool poisoning, broad permissions or unapproved side effects.",
    constant_signal: "Every new connector increases the permission and provenance surface.",
    kaizen7_answer: "Trust gate and sandbox-first adapter ladder.",
    command: "npm.cmd run k7 -- mesh \"<objective>\"",
    proof: "Risky credentials, billing, publishing and destructive writes are blocked before execution.",
  },
  {
    id: "context_token_waste",
    problem: "Agents repeatedly load broad context, repeat searches and spend tokens rediscovering routes.",
    constant_signal: "Context windows grow, but operational discipline still decides cost and reliability.",
    kaizen7_answer: "Minimal context plus receipt recall.",
    command: "npm.cmd run k7 -- recall \"<objective>\"",
    proof: "A mission starts from previous receipts and discard rules before broad repo reading.",
  },
  {
    id: "pilot_to_production_gap",
    problem: "Agent pilots are easy; repeatable production workflows need ownership, verification and handoff contracts.",
    constant_signal: "Organizations stall when they cannot explain, govern or reproduce agent work.",
    kaizen7_answer: "Mission Brief, execution card and outcome receipt.",
    command: "npm.cmd run k7 -- mission \"<objective>\"",
    proof: "The output has acceptance tests, risks, expected output and closeout receipt fields.",
  },
  {
    id: "agent_reliability_gap",
    problem: "Agents may pass once but fail unpredictably across runs, tools, permissions or changed environments.",
    constant_signal: "Reliability requires consistency, robustness, predictability and bounded failure, not a single success metric.",
    kaizen7_answer: "Eval pack and verification-before-claiming loop.",
    command: "npm.cmd run k7 -- check",
    proof: "Every mission names focused verification plus the broader KAIZEN7 readiness check.",
  },
  {
    id: "market_obsolescence",
    problem: "A good agent, browser, model, CLI or MCP route can become obsolete within weeks.",
    constant_signal: "The agentic market is shifting too fast for fixed provider choices.",
    kaizen7_answer: "Currentness radar with refresh, replace, retire and watch decisions.",
    command: "npm.cmd run k7 -- radar \"<objective>\"",
    proof: "A route is treated as a candidate with expiry and discard conditions, not permanent truth.",
  },
  {
    id: "api_blocked_work",
    problem: "Useful tools often have missing, unstable, expensive or blocked APIs.",
    constant_signal: "Real work still lives in desktop apps, browsers, files and local tools.",
    kaizen7_answer: "Anything CLI and adapter forge route.",
    command: "npm.cmd run k7 -- anything \"<objective>\"",
    proof: "KAIZEN7 returns a controlled non-API route with dry-run, verification and receipt requirements.",
  },
  {
    id: "learning_not_reused",
    problem: "Agents finish work but the reusable learning is not captured in a form the next agent can use.",
    constant_signal: "Without compact receipts, every run starts from conversation instead of proof.",
    kaizen7_answer: "Append-only receipt ledger and promotion rules.",
    command: "npm.cmd run k7 -- remember \"<receipt-json>\"",
    proof: "The next run can recall what worked, what failed and what to discard.",
  },
];

function buildMarketMap(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "make KAIZEN7 valuable for real agentic project improvement";
  const safeGoal = shellSafeText(goal);
  const radar = buildImprovementRadar(goal, options);
  const adapt = buildMarketAdaptationPack(goal, options);
  const mesh = buildToolMeshPack(goal, options);
  const recall = buildReceiptRecall(goal, options);
  const rankedProblems = rankProblems(goal);

  return {
    schema: "kaizen7.market_map.v1",
    objective: goal,
    identity: "KAIZEN7 market problem map",
    thesis: "KAIZEN7 should own the pre-execution layer: choose the route, reduce context, trust the tool, verify the result and remember the receipt.",
    not_competing_with: [
      "agent frameworks",
      "model providers",
      "MCP servers",
      "browser agents",
      "RPA suites",
      "IDE copilots",
    ],
    owns: [
      "objective compression",
      "route selection",
      "tool trust gates",
      "context and token budgets",
      "adapter ladder",
      "verification contract",
      "receipt memory",
      "market refresh decisions",
    ],
    ranked_problems: rankedProblems,
    fused_runtime: {
      recall: {
        schema: recall.schema,
        total_receipts: recall.total_receipts,
        matches: recall.matches.length,
        next: recall.next_command,
      },
      radar: {
        required: radar.currentness_required,
        scan_targets: radar.scan_targets,
        decision: radar.output_contract.selected_action,
      },
      adaptation: {
        doctrine: adapt.doctrine,
        open_connections: adapt.connection_policy.open_to,
        promote_when: adapt.evolution_gates.promote_to_skill_when,
        retire_when: adapt.evolution_gates.retire_when,
      },
      mesh: {
        schema: mesh.schema,
        build_order: mesh.build_order,
        scoring_fields: mesh.scoring_model.fields,
        reject_if: mesh.scoring_model.reject_if,
      },
    },
    product_moves: [
      {
        move: "diagnose",
        command: `npm.cmd run k7 -- opportunity "${safeGoal}"`,
        output: "market problem, route, risk and proof map",
      },
      {
        move: "choose_route",
        command: `npm.cmd run k7 -- solve "${safeGoal}"`,
        output: "minimal route and metaskill card",
      },
      {
        move: "trust_tool",
        command: `npm.cmd run k7 -- mesh "${safeGoal}"`,
        output: "tool graph, scoring fields and reject rules",
      },
      {
        move: "stay_current",
        command: `npm.cmd run k7 -- radar "${safeGoal}"`,
        output: "keep, refresh, replace, retire or watch decision",
      },
      {
        move: "learn",
        command: "npm.cmd run k7 -- remember \"<receipt-json>\"",
        output: "reusable memory for the next agent",
      },
    ],
    acceptance_tests: [
      "Given a broad agentic objective, returns a ranked market problem and matching KAIZEN7 command.",
      "Given a tool or connector choice, exposes trust and rejection rules before execution.",
      "Given a fast-changing market, requires radar before hardening a route.",
      "Given prior receipts, starts from recall before broad context loading.",
      "Given a finished mission, requires rememberable proof instead of narrative memory.",
    ],
    next_commands: [
      `npm.cmd run k7 -- run "${safeGoal}"`,
      `npm.cmd run k7 -- opportunity "${safeGoal}" --json`,
      `npm.cmd run k7 -- radar "${safeGoal}"`,
      `npm.cmd run k7 -- recall "${safeGoal}"`,
    ],
  };
}

function rankProblems(goal = "") {
  const terms = tokenize(goal);
  return MARKET_PROBLEMS
    .map((item) => ({
      ...item,
      score: scoreProblem(item, terms),
    }))
    .sort((left, right) => right.score - left.score)
    .map((item, index) => ({
      rank: index + 1,
      id: item.id,
      score: item.score,
      problem: item.problem,
      constant_signal: item.constant_signal,
      kaizen7_answer: item.kaizen7_answer,
      command: item.command,
      proof: item.proof,
    }));
}

function scoreProblem(problem, terms) {
  if (!terms.length) return 1;
  const haystack = [
    problem.id,
    problem.problem,
    problem.constant_signal,
    problem.kaizen7_answer,
    problem.command,
    problem.proof,
  ].join(" ").toLowerCase();
  return terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0) || 1;
}

function formatMarketMap(map = buildMarketMap()) {
  return [
    "# KAIZEN7 MARKET MAP",
    "",
    `Objective: ${map.objective}`,
    `Thesis: ${map.thesis}`,
    "",
    "## Owns",
    ...map.owns.map((item) => `- ${item}`),
    "",
    "## Top Market Problems",
    ...map.ranked_problems.slice(0, 5).map((item) => [
      `- ${item.rank}. ${item.id}: ${item.problem}`,
      `  Answer: ${item.kaizen7_answer}`,
      `  Command: ${item.command}`,
      `  Proof: ${item.proof}`,
    ].join("\n")),
    "",
    "## Fused Runtime",
    `- Recall: ${map.fused_runtime.recall.matches} matches from ${map.fused_runtime.recall.total_receipts} receipts`,
    `- Radar: required=${map.fused_runtime.radar.required}`,
    `- Adaptation: ${map.fused_runtime.adaptation.doctrine}`,
    `- Mesh build order: ${map.fused_runtime.mesh.build_order.join(", ")}`,
    "",
    "## Product Moves",
    ...map.product_moves.map((item) => `- ${item.move}: ${item.command} -> ${item.output}`),
    "",
    "## Acceptance Tests",
    ...map.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Next Commands",
    ...map.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  MARKET_PROBLEMS,
  buildMarketMap,
  formatMarketMap,
  rankProblems,
};
