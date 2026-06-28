const fs = require("node:fs");
const path = require("node:path");
const { buildSupertoolPlan } = require("./supertool-orchestrator");

const CORE_METASKILLS = [
  "kaizen7-evolution-engine",
  "test-driven-development",
  "verification-before-completion",
  "obsidian-memory",
];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function buildSecondBrain(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || "use KAIZEN7 as a second brain";
  const supertool = options.supertool || ((input) => buildSupertoolPlan(input));
  const plan = supertool({
    root,
    goal,
    intent: options.intent || "",
    writeSignals: Boolean(options.writeSignals),
    execute: Boolean(options.execute),
  });
  const metaskills = unique([
    ...(plan.skills || []),
    ...CORE_METASKILLS,
  ]);
  const memoryDraft = buildMemoryDraft({ goal, plan, metaskills });
  return {
    version: 1,
    status: "ready",
    mode: "second-brain-metaskills",
    identity: "KAIZEN7 second brain for agents and code tools",
    goal,
    layers: {
      memory: {
        role: "retain decisions and reusable learning",
        stores: ["Obsidian", "data/semantic-memory.json", "data/signal-inbox.json"],
      },
      metaskills: {
        role: "select the right operating skill before action",
        selected: metaskills,
      },
      orchestration: {
        role: "route objectives through the right KAIZEN7 module",
        route: plan.route,
      },
      verification: {
        role: "prove reality before closing work",
        commands: plan.commands || [],
      },
      frontier: {
        role: "turn new external signals into verified adaptation candidates",
        enabled: ["frontier", "orchestrate"].includes(plan.intent),
      },
    },
    orchestration: {
      intent: plan.intent,
      route: plan.route,
      context: plan.context || [],
      tools: plan.tools || [],
    },
    metaskills,
    action: plan.action,
    risk: plan.risk || [],
    verification: plan.verification || [],
    commands: plan.commands || [],
    writeback: {
      requiresConfirmation: true,
      target: "Obsidian/Flowmatik/Arquitectura/K7 Second Brain.md",
      policy: "confirmed reusable learning only; no secrets",
    },
    memoryDraft,
    supertool: plan,
  };
}

function buildMemoryDraft({ goal, plan, metaskills }) {
  return [
    "## K7 Second Brain Run",
    "",
    `Objective: ${goal}`,
    `Intent: ${plan.intent}`,
    `Route: ${plan.route?.primary || "unknown"}`,
    `Action: ${plan.action || "none"}`,
    "",
    "Metaskills:",
    ...metaskills.map((skill) => `- ${skill}`),
    "",
    "Verification:",
    ...((plan.commands || []).length ? plan.commands.map((command) => `- ${command}`) : ["- npm.cmd run check"]),
    "",
    "Guardrails:",
    "- No secrets in memory.",
    "- No publish, deploy, spend, delete or credential writes without explicit approval.",
    "- No completion claim without fresh verification.",
    "",
  ].join("\n");
}

function appendMemoryDraft(brain, root = process.cwd()) {
  const target = path.join(root, brain.writeback.target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.appendFileSync(target, `\n${brain.memoryDraft}\n`);
  return target;
}

function parseArgs(argv) {
  const flags = new Set();
  const goalParts = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    execute: flags.has("--execute"),
    writeSignals: flags.has("--write-signals"),
    writeMemory: flags.has("--write-memory"),
    goal: goalParts.join(" ").trim(),
  };
}

function formatSecondBrain(brain) {
  return [
    "## KAIZEN7 Second Brain",
    "",
    `Status: ${brain.status}`,
    `Goal: ${brain.goal}`,
    `Route: ${brain.orchestration.route.primary}`,
    "",
    "### Action",
    brain.action,
    "",
    "### Metaskills",
    ...brain.metaskills.map((skill) => `- ${skill}`),
    "",
    "### Commands",
    ...brain.commands.map((command) => `- ${command}`),
    "",
    "### Writeback",
    `${brain.writeback.target} (${brain.writeback.policy})`,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const brain = buildSecondBrain(args);
  if (args.writeMemory) brain.memoryPath = appendMemoryDraft(brain);
  if (args.compact) {
    process.stdout.write(`${JSON.stringify({ status: brain.status, route: brain.orchestration.route, action: brain.action, metaskills: brain.metaskills }, null, 2)}\n`);
  } else if (args.json) {
    process.stdout.write(`${JSON.stringify(brain, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatSecondBrain(brain)}\n`);
  }
}

module.exports = {
  appendMemoryDraft,
  buildSecondBrain,
  buildMemoryDraft,
  formatSecondBrain,
  parseArgs,
};
