const { buildActivationCockpit } = require("./activation-cockpit");

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalize(value = "") {
  return String(value || "").trim();
}

function capabilityArgs(capabilities = []) {
  return unique(capabilities).map((item) => `--capability ${item}`).join(" ");
}

function buildBaseline(objective, project) {
  return {
    name: "agent-alone",
    project,
    likelyStart: [
      "ask for broad project context",
      "scan repository or memory before route is clear",
      "choose tools after reading",
      "verify at the end if remembered",
    ],
    friction: {
      contextLoads: 8,
      toolChoices: 6,
      stepsBeforeAction: 7,
      evidenceGates: 1,
    },
    risks: [
      "broad_context_spend",
      "tool_overselection",
      "weak_completion_evidence",
    ],
    objective,
  };
}

function scoreKaizen(cockpit) {
  return {
    contextLoads: cockpit.readingPlan.length,
    toolChoices: cockpit.toolchain.toolchain.length,
    stepsBeforeAction: 4,
    evidenceGates: cockpit.verification.length,
  };
}

function estimateMetrics(baseline, cockpit) {
  const kaizen = scoreKaizen(cockpit);
  const savedContextLoads = Math.max(0, baseline.friction.contextLoads - kaizen.contextLoads);
  const savedToolChoices = Math.max(0, baseline.friction.toolChoices - kaizen.toolChoices);
  const stepsReduced = Math.max(0, baseline.friction.stepsBeforeAction - kaizen.stepsBeforeAction);
  const estimatedTokenReductionPct = Math.min(70, Math.max(30, (savedContextLoads * 8) + (savedToolChoices * 4) + (stepsReduced * 6)));

  return {
    baseline: baseline.friction,
    kaizen,
    savedContextLoads,
    savedToolChoices,
    stepsReduced,
    estimatedTokenReductionPct,
    note: "Estimate based on reduced initial context, fewer tool choices and earlier evidence gates; provider token logs are required for exact measurement.",
  };
}

function buildFirstRun(options) {
  const project = normalize(options.project) || "Proyecto KAIZEN7";
  const objective = normalize(options.objective || options.goal) || `arrancar ${project}`;
  const context = normalize(options.context) || "contexto minimo";
  const capabilities = unique(options.capabilities || []);
  const capabilityPart = capabilityArgs(capabilities);
  const capabilitySegment = capabilityPart ? ` ${capabilityPart}` : "";
  return {
    project,
    objective,
    commands: unique([
      `npm.cmd run k7:eval -- --project ${JSON.stringify(project)} --context ${JSON.stringify(context)}${capabilitySegment} ${JSON.stringify(objective)}`,
      `npm.cmd run k7:cockpit -- --context ${JSON.stringify(context)}${capabilitySegment} ${JSON.stringify(objective)}`,
    ]),
    deliverables: [
      `${project} objective packet`,
      `${project} metaskill boot`,
      `${project} minimal toolchain`,
      `${project} first verified action`,
    ],
    memoryTarget: "Obsidian/Flowmatik/Kaizen7/YYYY-MM-DD.md",
  };
}

function buildEvalHarness(options = {}) {
  const project = normalize(options.project) || "KAIZEN7 Project";
  const objective = normalize(options.objective || options.goal) || `crear ${project}`;
  const context = normalize(options.context || options.projectContext) || "contexto minimo";
  const capabilities = unique(options.capabilities || []);
  const cockpit = buildActivationCockpit({ goal: objective, context, capabilities });
  const baseline = buildBaseline(objective, project);
  const metrics = estimateMetrics(baseline, cockpit);

  return {
    version: 1,
    status: "ready",
    mode: "eval-harness",
    project,
    objective,
    context,
    comparison: {
      baseline,
      kaizen: {
        name: "kaizen7-guided",
        cockpit,
        operatingLoop: cockpit.activationLoop,
      },
    },
    metrics,
    firstRun: buildFirstRun({ project, objective, context, capabilities }),
    evidenceRequired: [
      "commands_run",
      "files_changed",
      "tests_or_checks",
      "risks_logged",
      "memory_writeback",
    ],
    stopRules: [
      "No declarar ahorro sin evidencia de comandos ejecutados.",
      "No ampliar contexto si el objetivo no lo exige.",
      "No activar herramientas fuera de la toolchain minima.",
    ],
  };
}

function parseArgs(argv = []) {
  const capabilities = [];
  const objectiveParts = [];
  let project = "";
  let context = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg === "--context") context = argv[++index] || "";
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (!arg.startsWith("--")) objectiveParts.push(arg);
  }
  return {
    project,
    context,
    capabilities: unique(capabilities),
    objective: objectiveParts.join(" ").trim(),
  };
}

function formatEvalHarness(report) {
  return [
    "## KAIZEN7 Eval Harness",
    "",
    `Status: ${report.status}`,
    `Project: ${report.project}`,
    `Objective: ${report.objective}`,
    "",
    "### Estimated Impact",
    `Estimated token reduction: ${report.metrics.estimatedTokenReductionPct}%`,
    `Steps reduced: ${report.metrics.stepsReduced}`,
    `Context loads saved: ${report.metrics.savedContextLoads}`,
    "",
    "### First Run",
    ...report.firstRun.commands.map((item) => `- ${item}`),
    "",
    "### Metaskills",
    ...report.comparison.kaizen.cockpit.metaskillBoot.activationOrder.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const report = buildEvalHarness(args);
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatEvalHarness(report)}\n`);
}

module.exports = {
  buildEvalHarness,
  capabilityArgs,
  formatEvalHarness,
  parseArgs,
};
