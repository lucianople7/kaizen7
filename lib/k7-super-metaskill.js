const { buildAnythingRoute } = require("./k7-anything-next");
const { buildImprovementRadar } = require("./k7-improvement-radar");
const { buildMarketAdaptationPack } = require("./k7-market-adaptation-pack");
const { buildMetaskillCard } = require("./k7-metaskill-card");
const { buildToolMeshPack } = require("./k7-tool-mesh-pack");
const { buildMissionControl } = require("./mission-control");

function buildSuperMetaskillRun(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "improve this project with less context and better verification";
  const safeGoal = shellSafeText(goal);
  const metaskill = buildMetaskillCard(goal, options);
  const radar = buildImprovementRadar(goal, options);
  const adapt = buildMarketAdaptationPack(goal, options);
  const mesh = buildToolMeshPack(goal, options);
  const anything = buildAnythingRoute(goal, options);
  const mission = buildMissionControl({ goal });

  return {
    schema: "kaizen7.super_metaskill_run.v1",
    objective: goal,
    identity: "KAIZEN7 super-metaskill runtime",
    mode: "preflight",
    promise: "Give any agent the smallest useful context, current tool radar, modular route, verification plan and reusable receipt before execution.",
    doctrine: [
      "Decide before executing.",
      "Read less before acting.",
      "Search for better current routes before hardening.",
      "Prefer proven receipts over hype.",
      "Verify before claiming.",
      "Teach the next run.",
    ],
    agent_agnostic: true,
    compressed_brief: {
      goal,
      route: metaskill.primary_route,
      output_type: metaskill.output_type,
      growth_lane: mission.growth_gate?.lane || "KAIZEN7 Execution Quality",
      stop_condition: "route, executor, safety gates, verification and receipt are clear",
    },
    minimal_context: {
      read_first: metaskill.context_budget.required_first_reads,
      read_only_if_needed: metaskill.context_budget.read_only_if_needed,
      max_files_first_pass: metaskill.context_budget.max_files_first_pass,
      max_memory_items: metaskill.context_budget.max_memory_items,
      do_not_load: [
        "broad repo history",
        "external project implementation",
        "credentials or private config",
        "unrelated product docs",
      ],
    },
    decision_pipeline: [
      {
        step: "compress",
        output: "one objective, one route, one stop condition",
      },
      {
        step: "recall",
        output: "working receipts, discarded routes and relevant skills only",
      },
      {
        step: "radar",
        output: "keep, refresh, replace, retire or watch current route candidates",
      },
      {
        step: "adapt",
        output: "open connector contract and refresh/retire gates",
      },
      {
        step: "mesh",
        output: "tool graph, adapter pack and scoring model",
      },
      {
        step: "execute",
        output: "dry-run first, scoped action second",
      },
      {
        step: "verify",
        output: "focused check plus KAIZEN7 check surface",
      },
      {
        step: "learn",
        output: "receipt with reuse and discard rules",
      },
    ],
    currentness_radar: {
      required: radar.currentness_required,
      reminder: radar.reminder_rule,
      scan_targets: radar.scan_targets,
      scorecard: radar.candidate_scorecard,
      output_contract: radar.output_contract,
    },
    connection_strategy: {
      open_to: adapt.connection_policy.open_to,
      blocked_without_approval: adapt.connection_policy.closed_to_without_approval,
      contract: adapt.connection_policy.connection_contract,
      evolution_gates: adapt.evolution_gates,
    },
    tool_strategy: {
      ladder: metaskill.tool_ladder,
      anything_route: {
        schema: anything.schema,
        route: anything.route,
        output_type: anything.output_type,
        next_command: anything.next_command,
        safety_gates: anything.safety_gates,
      },
      mesh_build_order: mesh.build_order,
      scoring_fields: mesh.scoring_model.fields,
    },
    execution_card: {
      first_action: `npm.cmd run k7 -- radar "${safeGoal}"`,
      route_command: `npm.cmd run k7 -- anything "${safeGoal}"`,
      verification_commands: ["npm.cmd run k7 -- check", "npm.cmd run k7:check"],
      receipt_command: "npm.cmd run k7 -- receipt",
      external_effects: "blocked until approval, dry-run and verification contract exist",
    },
    receipt_contract: {
      objective: goal,
      route: "",
      radar_decision: "keep | refresh | replace | retire | watch",
      memory_reused: [],
      connector_used: "",
      command: "",
      verification: "",
      reuse_next_time: "",
      discard: [],
      memory_update_recommendation: "",
    },
    success_metrics: [
      "fewer steps than direct agent execution",
      "less context loaded before first action",
      "lower repeated decision cost",
      "clearer current-tool decision",
      "verifiable artifact or blocker",
      "receipt improves the next run",
    ],
    next_commands: [
      `npm.cmd run k7 -- run "${safeGoal}" --json`,
      `npm.cmd run k7 -- radar "${safeGoal}"`,
      `npm.cmd run k7 -- adapt "${safeGoal}"`,
      `npm.cmd run k7 -- anything "${safeGoal}"`,
    ],
  };
}

function formatSuperMetaskillRun(run = buildSuperMetaskillRun()) {
  return [
    "# KAIZEN7 SUPER-METASKILL RUN",
    "",
    `Objective: ${run.objective}`,
    `Mode: ${run.mode}`,
    `Promise: ${run.promise}`,
    "",
    "## Doctrine",
    ...run.doctrine.map((item) => `- ${item}`),
    "",
    "## Compressed Brief",
    `- Route: ${run.compressed_brief.route}`,
    `- Output type: ${run.compressed_brief.output_type}`,
    `- Growth lane: ${run.compressed_brief.growth_lane}`,
    `- Stop: ${run.compressed_brief.stop_condition}`,
    "",
    "## Minimal Context",
    ...run.minimal_context.read_first.map((item) => `- ${item}`),
    "",
    "## Decision Pipeline",
    ...run.decision_pipeline.map((item) => `- ${item.step}: ${item.output}`),
    "",
    "## Currentness Radar",
    `- Required: ${run.currentness_radar.required}`,
    `- Reminder: ${run.currentness_radar.reminder}`,
    "",
    "## Connection Strategy",
    ...run.connection_strategy.open_to.map((item) => `- ${item}`),
    "",
    "## Tool Strategy",
    ...run.tool_strategy.ladder.map((item) => `- ${item.rank}. ${item.route}: ${item.use_when}`),
    "",
    "## Execution Card",
    `- First action: ${run.execution_card.first_action}`,
    `- Route: ${run.execution_card.route_command}`,
    ...run.execution_card.verification_commands.map((item) => `- Verify: ${item}`),
    `- Receipt: ${run.execution_card.receipt_command}`,
    `- External effects: ${run.execution_card.external_effects}`,
    "",
    "## Receipt Contract",
    ...Object.keys(run.receipt_contract).map((key) => `${key}:`),
    "",
    "## Success Metrics",
    ...run.success_metrics.map((item) => `- ${item}`),
    "",
    "## Next Commands",
    ...run.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  buildSuperMetaskillRun,
  formatSuperMetaskillRun,
};
