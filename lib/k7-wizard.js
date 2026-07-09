const readline = require("node:readline/promises");

const PROJECT_TYPES = ["repo", "agent", "tool", "video", "web", "research", "other"];
const CONNECTION_TYPES = ["local CLI", "MCP", "browser", "GitHub", "Hugging Face", "local files", "none"];
const AGENT_TYPES = ["Codex", "ChatGPT", "Claude", "local agent", "human", "other"];

const WIZARD_QUESTIONS = [
  {
    id: "objective",
    prompt: "What do you want to achieve?",
    default: "improve this project with less context and better verification",
  },
  {
    id: "project_type",
    prompt: `Project type (${PROJECT_TYPES.join(", ")})`,
    default: "repo",
  },
  {
    id: "mode",
    prompt: "Mode",
    default: "local/free-first",
  },
  {
    id: "connections",
    prompt: `Existing connections (${CONNECTION_TYPES.join(", ")})`,
    default: "none",
  },
  {
    id: "agent",
    prompt: `Who will execute it (${AGENT_TYPES.join(", ")})`,
    default: "Codex",
  },
  {
    id: "output",
    prompt: "Expected output",
    default: "verified route, next command and receipt",
  },
];

function buildWizardPlan(input = {}) {
  const answers = normalizeAnswers(input);
  const objective = answers.objective;
  const safeObjective = shellSafeText(objective);
  const needsToolForge = ["tool", "video", "web"].includes(answers.project_type)
    || /tool|video|browser|cli|mcp|api|app|repo|github|hugging face/i.test(objective);
  return {
    schema: "kaizen7.wizard_plan.v1",
    title: "KAIZEN7 Wizard Plan",
    answers,
    agent_agnostic: true,
    free_first: answers.mode.includes("free") || answers.mode.includes("local"),
    route_hint: routeForProjectType(answers.project_type),
    recommended_flow: [
      "status",
      "run",
      "commons",
      ...(needsToolForge ? ["forge"] : []),
      "trust",
      "eval",
      "receipt",
      "remember",
    ],
    commands: {
      status: "npm.cmd run k7 -- status",
      run: `npm.cmd run k7 -- run "${safeObjective}"`,
      commons: `npm.cmd run k7 -- commons "${safeObjective}"`,
      forge: `npm.cmd run k7 -- forge "${safeObjective}"`,
      trust: `npm.cmd run k7 -- trust "${safeObjective}"`,
      eval: `npm.cmd run k7 -- eval "${safeObjective}"`,
      production: `npm.cmd run k7 -- production "${safeObjective}"`,
      handoff: "npm.cmd run k7 -- handoff",
      receipt: "npm.cmd run k7 -- receipt",
      remember: "npm.cmd run k7 -- remember \"<verified-receipt-json>\"",
    },
    handoff: {
      agent: answers.agent,
      read_first: ["AGENTS.md", "KAIZEN7_CONTEXT.md", ".agents/skills/kaizen7-metaskill/SKILL.md"],
      expected_output: answers.output,
      stop_condition: "route, tool, verification and receipt are clear",
    },
    receipt_template: {
      objective,
      route: "",
      tool: "",
      verification: "",
      reuse_next_time: "",
      discard: [],
      memory_update_recommendation: "",
    },
    next_command: `npm.cmd run k7 -- run "${safeObjective}"`,
  };
}

function formatWizardPlan(plan = buildWizardPlan()) {
  return [
    "# KAIZEN7 WIZARD",
    "",
    `Objective: ${plan.answers.objective}`,
    `Project type: ${plan.answers.project_type}`,
    `Mode: ${plan.answers.mode}`,
    `Connections: ${plan.answers.connections.join(", ")}`,
    `Agent: ${plan.answers.agent}`,
    `Output: ${plan.answers.output}`,
    "",
    "## Route",
    `- ${plan.route_hint}`,
    "",
    "## Recommended Flow",
    ...plan.recommended_flow.map((step) => `- ${step}`),
    "",
    "## Commands",
    ...Object.entries(plan.commands).map(([name, command]) => `- ${name}: ${command}`),
    "",
    "## Handoff",
    `- Agent: ${plan.handoff.agent}`,
    ...plan.handoff.read_first.map((file) => `- Read first: ${file}`),
    `- Stop: ${plan.handoff.stop_condition}`,
    "",
    "## Receipt Template",
    ...Object.keys(plan.receipt_template).map((key) => `${key}:`),
    "",
    "## Next",
    `- ${plan.next_command}`,
    "",
  ].join("\n");
}

async function runInteractiveWizard(options = {}) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  const rl = readline.createInterface({ input, output });
  const answers = {};
  try {
    output.write("# KAIZEN7 WIZARD\n\n");
    output.write("Press Enter to accept defaults.\n\n");
    for (const question of WIZARD_QUESTIONS) {
      const raw = await rl.question(`${question.prompt} [${question.default}]: `);
      answers[question.id] = raw.trim() || question.default;
    }
  } finally {
    rl.close();
  }
  const plan = buildWizardPlan(answers);
  output.write(`\n${formatWizardPlan(plan)}\n`);
  return plan;
}

function parseWizardInput(args = []) {
  const answersIndex = args.indexOf("--answers");
  if (answersIndex >= 0 && args[answersIndex + 1]) {
    return JSON.parse(args[answersIndex + 1]);
  }
  const objective = args.filter((arg) => !arg.startsWith("--")).join(" ").trim();
  return objective ? { objective } : {};
}

function normalizeAnswers(input = {}) {
  const objective = clean(input.objective, "improve this project with less context and better verification");
  return {
    objective,
    project_type: normalizeChoice(input.project_type || input.projectType, PROJECT_TYPES, inferProjectType(objective)),
    mode: clean(input.mode, "local/free-first").toLowerCase(),
    connections: normalizeList(input.connections, ["none"]),
    agent: clean(input.agent, "Codex"),
    output: clean(input.output, "verified route, next command and receipt"),
  };
}

function inferProjectType(objective = "") {
  const text = objective.toLowerCase();
  if (/video|render|clip|ffmpeg|remotion/.test(text)) return "video";
  if (/browser|web|site|app sin api|sin api|api/.test(text)) return "web";
  if (/tool|herramienta|cli|mcp|adapter|adaptador/.test(text)) return "tool";
  if (/agent|agente|codex|chatgpt|claude/.test(text)) return "agent";
  if (/research|investig|source|fuente|paper/.test(text)) return "research";
  return "repo";
}

function routeForProjectType(type = "repo") {
  const routes = {
    repo: "repo improvement route: minimal context, tests, receipt",
    agent: "agent booster route: handoff, context, trust, eval",
    tool: "tool forge route: commons, forge, trust, eval, receipt",
    video: "video tool route: commons, forge video lane, artifact verification",
    web: "browser/API escape route: anything, forge, trust, eval",
    research: "source briefing route: radar, evidence, summary, receipt",
    other: "general KAIZEN7 route: run, commons, trust, eval, receipt",
  };
  return routes[type] || routes.other;
}

function normalizeChoice(value, choices, fallback) {
  const normalized = clean(value, fallback).toLowerCase();
  return choices.includes(normalized) ? normalized : fallback;
}

function normalizeList(value, fallback = []) {
  if (Array.isArray(value)) return value.map((item) => clean(item, "")).filter(Boolean);
  const text = clean(value, "");
  if (!text) return fallback;
  return text.split(",").map((item) => item.trim()).filter(Boolean);
}

function clean(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  PROJECT_TYPES,
  WIZARD_QUESTIONS,
  buildWizardPlan,
  formatWizardPlan,
  inferProjectType,
  normalizeAnswers,
  parseWizardInput,
  runInteractiveWizard,
};
