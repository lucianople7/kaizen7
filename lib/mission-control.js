const { buildMissionBrief } = require("./capabilities/mission-brief");
const { buildMissionOutcomeReceipt } = require("./capabilities/mission-outcome-receipt");
const { resolveMissionContext } = require("./capabilities/resolver");

function clean(value = "") {
  return String(value || "").trim();
}

function inferGrowthLane(mission = {}) {
  const text = `${mission.project || ""} ${mission.goal || ""} ${mission.why || ""}`.toLowerCase();
  if (/kaizen7|kernel|route|skill|metaskill|mission|brief|receipt|friccion|contexto|verificacion/.test(text)) return "KAIZEN7 Execution Quality";
  if (/focux|supplement|nootrop|claim|commerce|shopify|venta|lead/.test(text)) return "THE FOCUX Growth";
  if (/flowmatik|video|render|asset|clip|studio|remotion|produccion/.test(text)) return "Flowmatik Production";
  if (/mr kaizen|audiencia|reel|short|contenido|guion|podcast|viral/.test(text)) return "Mr. Kaizen Audience";
  return "needs_growth_lane";
}

function inferGrowthOutput(mission = {}) {
  const text = `${mission.goal || ""} ${mission.why || ""} ${(mission.expected_output || []).join(" ")}`.toLowerCase();
  if (/publicar|post|reel|short|contenido/.test(text)) return "published_content";
  if (/lead|lista|email|captacion|audiencia/.test(text)) return "lead_or_audience_action";
  if (/asset|activo|plantilla|template|pack|video|brief|dossier/.test(text)) return "reusable_asset";
  if (/decision|validar|estrategia|proveedor|comparar/.test(text)) return "validated_decision";
  if (/producto|venta|checkout|oferta|commerce/.test(text)) return "product_or_sale";
  if (/ahorrar|automatizar|friccion|tiempo|contexto|verificacion|tests/.test(text)) return "time_or_friction_reduction";
  return "unclear_output";
}

function buildGrowthGate(mission = {}) {
  const lane = inferGrowthLane(mission);
  const output = inferGrowthOutput(mission);
  const executable = lane !== "needs_growth_lane" && output !== "unclear_output";
  return {
    question: "What can we launch today that grows the ecosystem?",
    lane,
    output,
    executable,
    decision: executable ? "execute" : "discard_or_rewrite",
    reason: executable
      ? "Mission has a growth lane and a valid output."
      : "Mission must identify a growth lane and produce content, asset, decision, lead, product, sale, time saved or friction reduced.",
  };
}

function parseArgs(argv = []) {
  const flags = new Set();
  const goalParts = [];
  let project = "";
  let route = "";
  let priority = "";
  let estimatedScope = "";

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg === "--route" || arg === "--capability") route = argv[++index] || "";
    else if (arg === "--priority") priority = argv[++index] || "";
    else if (arg === "--scope") estimatedScope = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }

  return {
    flags,
    mission: {
      goal: goalParts.join(" ").trim(),
      project,
      route,
      capability: route,
      priority,
      estimated_scope: estimatedScope,
    },
  };
}

function buildMissionControl(rawMission = {}, options = {}) {
  const mission = {
    goal: clean(rawMission.goal || rawMission.objective) || "prepare KAIZEN7 mission",
    why: clean(rawMission.why),
    project: clean(rawMission.project),
    route: clean(rawMission.route || rawMission.capability),
    capability: clean(rawMission.route || rawMission.capability),
    context_files: rawMission.context_files || rawMission.contextFiles || [],
    constraints: rawMission.constraints || [],
    acceptance_tests: rawMission.acceptance_tests || rawMission.acceptanceTests || [],
    risks: rawMission.risks || [],
    expected_output: rawMission.expected_output || rawMission.expectedOutput || [],
    priority: clean(rawMission.priority) || "P2 - normal",
    estimated_scope: clean(rawMission.estimated_scope || rawMission.estimatedScope) || "S - focused change",
  };
  const growthGate = buildGrowthGate(mission);
  const resolution = resolveMissionContext(mission, options);
  const brief = buildMissionBrief(mission, { ...options, resolution });
  const outcomeTemplate = buildMissionOutcomeReceipt({
    mission_brief: brief,
    result: {
      goal_completed: false,
      files_changed: [],
      tests: [],
      constraints_respected: true,
      follow_up: "Execute the Mission Brief, then replace this template with real evidence.",
    },
  });

  return {
    schema: "kaizen7.mission_control.v1",
    status: "ready",
    identity: {
      name: options.name || "KAIZEN7 Mission Control",
      principle: "Human decides. KAIZEN7 coordinates. Agents execute. Projects grow.",
      role: "prepare, limit, verify and remember without becoming the executor",
    },
    route: [
      "Growth Gate",
      "K7 Mission",
      "Route Resolver",
      "Mission Brief",
      "Agent Execution",
      "Mission Outcome Receipt",
      "PR/Review",
      "Memory Recommendation",
    ],
    mission,
    growth_gate: growthGate,
    resolution,
    mission_brief: brief,
    outcome_receipt_template: outcomeTemplate,
    commands: {
      mission_brief: "node lib/capabilities/cli.js --mission-brief --evidence \"<mission-json>\"",
      mission_outcome: "node lib/capabilities/cli.js --mission-outcome --evidence \"<outcome-json>\"",
      readiness: "npm.cmd run k7:ready",
    },
    next_action: growthGate.executable ? "hand_mission_brief_to_agent" : "rewrite_mission_for_growth_output",
  };
}

function formatMissionControl(control) {
  return [
    "# KAIZEN7 Mission Control",
    "",
    control.identity.principle,
    "",
    `Status: ${control.status}`,
    `Goal: ${control.mission.goal}`,
    `Growth lane: ${control.growth_gate.lane}`,
    `Growth output: ${control.growth_gate.output}`,
    `Route: ${control.mission_brief.route || control.mission_brief.capability}`,
    `Next action: ${control.next_action}`,
    "",
    "## Route",
    ...control.route.map((step) => `- ${step}`),
    "",
    "## Files To Read",
    ...control.mission_brief.files_to_read.map((file) => `- ${file}`),
    "",
    "## Stop Conditions",
    ...control.mission_brief.stop_conditions.map((condition) => `- ${condition}`),
    "",
    "## Close With",
    "- Mission Outcome Receipt",
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const control = buildMissionControl(args.mission);
  if (args.flags.has("--json")) process.stdout.write(`${JSON.stringify(control, null, 2)}\n`);
  else process.stdout.write(`${formatMissionControl(control)}\n`);
}

module.exports = {
  buildMissionControl,
  formatMissionControl,
  parseArgs,
};
