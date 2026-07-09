const { buildActivationCockpit } = require("./activation-cockpit");
const { buildEvalHarness, capabilityArgs } = require("./eval-harness");
const { buildWisdomFilter } = require("./wisdom-filter");

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalize(value = "") {
  return String(value || "").trim();
}

function buildQuestion() {
  return {
    id: "objective",
    prompt: "En que vas a trabajar?",
    choices: [
      "arrancar un proyecto",
      "mejorar un repo existente",
      "crear contenido",
    ],
  };
}

function buildMisterKaizenPacket({ objective = "", project = "" } = {}) {
  return {
    version: 1,
    mode: "prompt-to-action-wisdom-filter",
    identity: {
      name: "Mister Kaizen",
      role: "operational persona for KAIZEN7 judgment",
      promise: "respect, legality and construction before efficacy",
    },
    project: project || "unspecified",
    objective,
    supremeFilter: {
      hierarchy: ["respect", "legality", "construction", "efficacy"],
      rule: "If a request fails respect, legality or construction, transform it into the nearest safe, legal and constructive alternative.",
    },
    sevenSkills: [
      "prompt_alchemy",
      "objective_compression",
      "memory_discipline",
      "skill_selection",
      "connection_judgment",
      "evidence_gate",
      "learning_writeback",
    ],
    codexInstructions: [
      "Do not execute the raw prompt directly.",
      "Compress the request into one objective and one stop condition.",
      "Use only memory, skills and connections that reduce steps, risk or tokens.",
      "Block publish, deploy, delete, spend and credential_write without approval.",
      "Return evidence before claiming completion.",
      "Write back only reusable learning; never write secrets.",
    ],
    evidenceGate: {
      required: true,
      accepts: ["commands_run", "files_changed", "tests_or_checks", "risks_logged", "memory_writeback"],
    },
  };
}

function buildStartHub(options = {}) {
  const objective = normalize(options.objective || options.goal);
  const project = normalize(options.project || options.name);
  const context = normalize(options.context || options.projectContext) || "contexto minimo";
  const capabilities = unique(options.capabilities || []);

  if (!objective) {
    return {
      version: 1,
      status: "needs_input",
      mode: "start-hub",
      question: buildQuestion(),
      commands: ["npm.cmd run k7:start"],
      tokenPolicy: "no cargar memoria, conectores ni metaskills hasta tener objetivo",
    };
  }

  const cockpit = buildActivationCockpit({ goal: objective, context, capabilities });
  const misterKaizen = buildMisterKaizenPacket({ objective, project });
  const wisdom = buildWisdomFilter({
    objective,
    project,
    capabilities,
    connections: ["obsidian", "local_files", "tests"],
  });
  const evalReport = project
    ? buildEvalHarness({ project, objective, context, capabilities })
    : null;
  const capabilityPart = capabilityArgs(capabilities);
  const capabilitySegment = capabilityPart ? ` ${capabilityPart}` : "";
  const startCommand = project
    ? `npm.cmd run k7:start -- --project ${JSON.stringify(project)} --context ${JSON.stringify(context)}${capabilitySegment} ${JSON.stringify(objective)}`
    : `npm.cmd run k7:start -- --context ${JSON.stringify(context)}${capabilitySegment} ${JSON.stringify(objective)}`;
  const evalCommands = evalReport?.firstRun?.commands || [];

  return {
    version: 1,
    status: "ready",
    mode: "start-hub",
    project: project || "unspecified",
    objective,
    context,
    startLoop: ["Objective", "Wisdom filter", "Minimal context", "Metaskill boot", "Toolchain", "First action", "Evidence", "Memory"],
    misterKaizen,
    wisdom,
    cockpit,
    eval: evalReport,
    editorPacket: {
      name: "KAIZEN7 Start Packet",
      instructions: [
        ...misterKaizen.codexInstructions,
        wisdom.masterPrompt,
        ...cockpit.metaskillBoot.editorPacket.instructions,
        "Treat this packet as the working boundary for the editor or agent.",
      ],
      stopRules: [
        ...cockpit.metaskillBoot.editorPacket.stopRules,
        "No ejecutar publish, deploy, delete, spend o credential_write sin aprobacion.",
      ],
    },
    firstAction: cockpit.nextAction,
    commands: unique([
      startCommand,
      ...cockpit.commands,
      ...evalCommands,
    ]),
    evidenceRequired: unique([
      "commands_run",
      "files_changed",
      "tests_or_checks",
      "risks_logged",
      ...cockpit.verification,
    ]),
    stopRules: [
      "No ejecutar acciones fuera del paquete de arranque.",
      "No ampliar contexto si no cambia la siguiente decision.",
      "No cerrar sin evidencia fresca.",
    ],
    writeback: cockpit.writeback,
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

function formatStartHub(result) {
  if (result.status === "needs_input") {
    return [
      "## KAIZEN7 Start",
      "",
      `Status: ${result.status}`,
      `Question: ${result.question.prompt}`,
      "",
    ].join("\n");
  }

  return [
    "## KAIZEN7 Start",
    "",
    `Status: ${result.status}`,
    `Project: ${result.project}`,
    `Objective: ${result.objective}`,
    "",
    "### Metaskills",
    ...result.cockpit.metaskillBoot.activationOrder.map((item) => `- ${item}`),
    "",
    "### First Action",
    result.firstAction.command,
    "",
    "### Commands",
    ...result.commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = buildStartHub(args);
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`${formatStartHub(result)}\n`);
}

module.exports = {
  buildStartHub,
  buildMisterKaizenPacket,
  formatStartHub,
  parseArgs,
};
