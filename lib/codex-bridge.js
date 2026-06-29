const { buildAgentAdvice, buildAdviceSummary } = require("./agent-advisor");
const { buildFrontierOperatorBrief } = require("./frontier-operator");
const { buildMisterKaizenPacket } = require("./start-hub");

const DEFAULT_CODEX_CAPABILITIES = ["read_files", "edit_files", "run_tests"];

function parseArgs(argv) {
  const flags = new Set();
  const capabilities = [];
  const goalParts = [];
  let contextBudget = 1200;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--budget") contextBudget = Number(argv[++index] || 1200);
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    compact: flags.has("--compact"),
    json: flags.has("--json"),
    frontier: flags.has("--frontier"),
    writeSignals: flags.has("--write-signals"),
    contextBudget: Number.isFinite(contextBudget) ? contextBudget : 1200,
    capabilities: capabilities.filter(Boolean),
    goal: goalParts.join(" ").trim(),
  };
}

function buildCodexBridge(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || "connect Codex to KAIZEN7";
  const capabilities = options.capabilities?.length ? options.capabilities : DEFAULT_CODEX_CAPABILITIES;
  const advice = buildAgentAdvice({
    root,
    agent: "codex",
    goal,
    capabilities,
    contextBudget: Number(options.contextBudget || options.budget || 1200),
    riskTolerance: options.riskTolerance || options.risk || "low",
  });
  const frontier = options.frontier
    ? buildFrontierOperatorBrief({ root, writeSignals: Boolean(options.writeSignals), limit: options.frontierLimit || 3 })
    : null;
  const misterKaizen = buildMisterKaizenPacket({ objective: goal, project: "KAIZEN7" });
  return {
    version: 1,
    status: "ready",
    mode: "codex-bridge",
    agent: "codex",
    goal,
    contract: {
      use: "Run this before Codex edits files, installs packages, writes memory or connects tools.",
      input: "objective plus optional capabilities and context budget",
      output: "read list, skills, avoid list, first action, verification commands and optional frontier priority",
    },
    misterKaizen,
    codex: {
      read: advice.advice.read,
      skills: advice.advice.skills,
      avoid: advice.advice.avoid,
      action: advice.advice.action,
      tokenPolicy: advice.advice.tokenPolicy,
      commands: advice.advice.commands,
      verification: [
        "Run the smallest relevant test or check before claiming completion.",
        "Report exact command and result.",
        "Do not publish, push, deploy, spend, delete or write credentials without approval.",
      ],
    },
    sources: advice.sources,
    frontier,
  };
}

function buildCodexPrompt(bridge) {
  const frontier = bridge.frontier?.priority
    ? [
      "",
      "Frontier priority:",
      `- ${bridge.frontier.priority.module}: ${bridge.frontier.priority.candidate}`,
      `- Next: ${bridge.frontier.action.command}`,
    ]
    : [];
  return [
    "## KAIZEN7 Codex Bridge",
    "",
    `Goal: ${bridge.goal}`,
    "",
    "Mister Kaizen:",
    `- ${bridge.misterKaizen.identity.promise}`,
    "- Respect -> Legality -> Construction -> Efficacy",
    ...bridge.misterKaizen.codexInstructions.map((item) => `- ${item}`),
    "",
    "Read:",
    ...(bridge.codex.read.length ? bridge.codex.read.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Skills:",
    ...(bridge.codex.skills.length ? bridge.codex.skills.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Avoid:",
    ...bridge.codex.avoid.map((item) => `- ${item}`),
    "",
    "First action:",
    bridge.codex.action,
    "",
    "Verification:",
    ...bridge.codex.verification.map((item) => `- ${item}`),
    "",
    "Commands:",
    ...bridge.codex.commands.map((item) => `- ${item}`),
    ...frontier,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const bridge = buildCodexBridge(args);
  if (args.compact) process.stdout.write(`${JSON.stringify({ status: bridge.status, codex: bridge.codex }, null, 2)}\n`);
  else if (args.json) process.stdout.write(`${JSON.stringify(bridge, null, 2)}\n`);
  else process.stdout.write(`${buildCodexPrompt(bridge)}\n`);
}

module.exports = {
  buildCodexBridge,
  buildCodexPrompt,
  buildAdviceSummary,
  parseArgs,
};
