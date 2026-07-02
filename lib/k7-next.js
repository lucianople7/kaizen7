const fs = require("node:fs");
const path = require("node:path");
const { buildK7State } = require("./k7-state");
const { buildActionQueueTickets } = require("./action-queue-tickets");

function parseArgs(argv = []) {
  const flags = new Set();
  const goalParts = [];
  let project = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    compact: flags.has("--compact"),
    json: flags.has("--json"),
    project,
    goal: goalParts.join(" ").trim(),
  };
}

function loadSignals(root) {
  const filePath = path.join(root, "data", "signal-inbox.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function buildNextAction(state, tickets = {}, context = {}) {
  if (state.status !== "ready") {
    return {
      type: "fix_readiness",
      priority: "P0",
      title: "Fix KAIZEN7 readiness blockers",
      stopCondition: "stop_when_readiness_is_ready",
    };
  }
  return {
    type: "ticket",
    priority: "P0",
    title: tickets.recommended?.title || context.goal || "Do the smallest useful next action",
    lane: tickets.recommended?.lane || "strength",
    stopCondition: tickets.recommended?.stopCondition || "stop_if_credentials_required_or_scope_expands",
  };
}

function buildK7Next(options = {}) {
  const root = options.root || process.cwd();
  const project = options.project || "KAIZEN7";
  const goal = options.goal || options.objective || "decide next best action";
  const state = buildK7State({ root });
  const signals = loadSignals(root);
  const tickets = buildActionQueueTickets({
    root,
    goal: signals[0]?.content?.title || goal,
    lane: "strength",
  });
  const next = buildNextAction(state, tickets, { goal });

  return {
    version: 1,
    mode: "k7-next",
    status: state.status,
    project,
    goal,
    signals: signals.slice(0, 5),
    tickets,
    next,
    gates: [
      "do_only_this_now",
      "stop_if_credentials_required_or_scope_expands",
      "verify_before_memory_writeback",
    ],
    commands: ["npm.cmd run k7:state", "npm.cmd run k7:next", "npm.cmd run check"],
  };
}

function formatK7Next(packet) {
  return [
    "## KAIZEN7 Next",
    "",
    `Status: ${packet.status}`,
    `Project: ${packet.project}`,
    `Goal: ${packet.goal}`,
    "",
    "### Do This Now",
    `- ${packet.next.priority} ${packet.next.title}`,
    `- Lane: ${packet.next.lane || packet.next.type}`,
    `- Stop: ${packet.next.stopCondition}`,
    "",
    "### Gates",
    ...packet.gates.map((gate) => `- ${gate}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const packet = buildK7Next(args);
  if (args.json) process.stdout.write(`${JSON.stringify(packet, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatK7Next(packet)}\n`);
  process.exitCode = packet.status === "ready" ? 0 : 1;
}

module.exports = {
  buildK7Next,
  buildNextAction,
  formatK7Next,
  parseArgs,
};
