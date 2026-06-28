const { buildConnectorKernel } = require("./connector-kernel");
const { buildFrontierOperatorBrief } = require("./frontier-operator");
const { buildCodexRealizerReport } = require("./codex-realizer");

const DEFAULT_MARKET_SIGNALS = [
  {
    id: "mcp-tools",
    source: "Model Context Protocol",
    pattern: "standard tool contracts for agents",
    adaptation: "keep MCP as a first-class Connector Kernel recommendation",
  },
  {
    id: "coding-agents",
    source: "GitHub cloud coding agents",
    pattern: "agents receive tasks, work in branches and surface reviewable changes",
    adaptation: "make KAIZEN7 return one action, commands and verification before edits",
  },
  {
    id: "gradio-spaces",
    source: "Hugging Face Spaces / Gradio",
    pattern: "fast demos for agent tools and operator workflows",
    adaptation: "recommend HF Spaces only for demos, not as core runtime",
  },
];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function buildSelfImprovementLoop(options = {}) {
  const root = options.root || process.cwd();
  const goal = String(options.goal || options.objective || "mejorar KAIZEN7 usando KAIZEN7").trim();
  const connectorBuilder = options.connector || buildConnectorKernel;
  const frontierBuilder = options.frontier || buildFrontierOperatorBrief;
  const realizerBuilder = options.realizer || ((input) => (
    options.verify === true ? buildCodexRealizerReport(input) : { status: "pending", reason: "run k7:real explicitly before shipping" }
  ));
  const marketSignals = options.marketSignals?.length ? options.marketSignals : DEFAULT_MARKET_SIGNALS;

  const connector = connectorBuilder({
    root,
    project: "KAIZEN7",
    kind: "project",
    domain: "agent-orchestration",
    goal,
    capabilities: ["run_tests"],
  });
  const frontier = frontierBuilder({ root, writeSignals: false, limit: 3 });
  const realizer = realizerBuilder({ goal: `validar self improvement: ${goal}`, frontier: false });
  const commands = unique([
    ...(connector.commands || []),
    "npm.cmd run k7:frontier:brief -- --write-signals",
    "npm.cmd run k7:connect -- --project \"KAIZEN7\" --kind project \"<improvement-goal>\"",
    "npm.cmd run check",
  ]);

  return {
    version: 1,
    status: realizer.status === "blocked" ? "blocked" : "ready",
    mode: "self-improvement-loop",
    subject: "KAIZEN7",
    goal,
    verdict: "adapt_pattern",
    connector,
    frontier,
    realizer,
    marketSignals,
    actions: [
      "Improve Connector Kernel and adapter recommendations before adding autonomous browsing.",
      "Use Repo Hunter only after a concrete capability gap is named.",
      "Convert every adopted pattern into a test, doc update and Obsidian decision.",
    ],
    commands,
    gates: [
      "No installs, OAuth, deploys, paid resources or credential writes without explicit approval.",
      "No external pattern enters core without Ponytail and Evolution Engine gates.",
      "Run npm.cmd run check and k7:real before calling the improvement real.",
    ],
    memory: {
      target: "Obsidian/Flowmatik/Evolution/intakes/YYYY-MM-DD-kaizen7-self-improvement.md",
      writeMode: "draft",
    },
    nextAction: "Pick one connector or market signal, ingest it as a sourceable packet, then adapt only the smallest useful pattern.",
  };
}

function parseArgs(argv = []) {
  const flags = new Set();
  const goalParts = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    verify: flags.has("--verify"),
    goal: goalParts.join(" ").trim(),
  };
}

function formatList(items, fallback = "- none") {
  return items?.length ? items.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`) : [fallback];
}

function formatSelfImprovementLoop(loop) {
  return [
    "## KAIZEN7 Self Improvement Loop",
    "",
    `Status: ${loop.status}`,
    `Verdict: ${loop.verdict}`,
    `Goal: ${loop.goal}`,
    "",
    "### Market Signals",
    ...formatList(loop.marketSignals.map((signal) => `${signal.id}: ${signal.adaptation}`)),
    "",
    "### Actions",
    ...formatList(loop.actions),
    "",
    "### Commands",
    ...formatList(loop.commands),
    "",
    "### Gates",
    ...formatList(loop.gates),
    "",
    "### Memory",
    loop.memory.target,
    "",
    "### Next Action",
    loop.nextAction,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const loop = buildSelfImprovementLoop(args);
  if (args.compact) {
    process.stdout.write(`${JSON.stringify({
      status: loop.status,
      verdict: loop.verdict,
      actions: loop.actions,
      commands: loop.commands,
      nextAction: loop.nextAction,
    }, null, 2)}\n`);
  } else if (args.json) {
    process.stdout.write(`${JSON.stringify(loop, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatSelfImprovementLoop(loop)}\n`);
  }
}

module.exports = {
  buildSelfImprovementLoop,
  formatSelfImprovementLoop,
  parseArgs,
};
