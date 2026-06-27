const path = require("node:path");
const { buildAdapterPlan } = require("./adapter-registry");
const { buildSignalQueue, loadSignalInbox } = require("./hunter");
const { runSmartCron } = require("./smart-crons");

function kindForCandidate(candidate = {}) {
  if (candidate.frontier?.kind) return candidate.frontier.kind;
  if (candidate.module === "browser_automation") return "cli";
  if (candidate.module === "agent_evaluation") return "agent";
  if (candidate.module === "prototyping_runtime") return "sdk";
  if (candidate.source === "github" && /mcp/i.test(candidate.candidate || "")) return "mcp";
  return candidate.source === "huggingface" ? "sdk" : "api";
}

function capabilitiesForCandidate(candidate = {}) {
  const capabilities = ["read_external"];
  if (candidate.module === "browser_automation") capabilities.push("run_command");
  if (candidate.module === "agent_evaluation") capabilities.push("run_tests");
  if (candidate.frontier?.kind === "mcp") capabilities.push("tool_call");
  return capabilities;
}

function buildProductiveAction(candidate) {
  if (!candidate) {
    return {
      title: "Run frontier watch with --write-signals",
      command: "npm.cmd run k7:frontier -- --write-signals",
      reason: "No frontier signals are available in the inbox yet.",
    };
  }
  return {
    title: `Turn ${candidate.candidate} into a KAIZEN7 adapter plan`,
    command: `npm.cmd run k7:adapt -- --name "${candidate.candidate}" --kind ${kindForCandidate(candidate)} "${candidate.nextAction || "connect safely"}"`,
    reason: candidate.reason || candidate.nextAction || "Top Hunter frontier signal.",
  };
}

function buildFrontierOperatorBrief(options = {}) {
  const root = options.root || process.cwd();
  const date = options.date || new Date().toISOString().slice(0, 10);
  const writeSignals = Boolean(options.writeSignals);
  const limit = Math.max(1, Math.min(Number(options.limit) || 5, 10));
  const report = runSmartCron("frontier-watch", { root, date, writeSignals });
  const inboxPath = path.join(root, "data", "signal-inbox.json");
  const inbox = loadSignalInbox(inboxPath);
  const queue = buildSignalQueue(inbox, { limit }).filter((candidate) => candidate.origin === "frontier-watch");
  const top = queue[0] || null;
  const adapterPlan = top ? buildAdapterPlan({
    name: top.candidate,
    kind: kindForCandidate(top),
    goal: top.nextAction || top.reason || "connect this frontier signal to KAIZEN7",
    capabilities: capabilitiesForCandidate(top),
    risk: top.frontier?.kind === "cli" ? "medium" : "",
  }) : null;
  return {
    version: 1,
    status: "ready",
    mode: "frontier-operator",
    date,
    writeSignals,
    inserted: report.writeResult?.inserted || 0,
    inboxTotal: report.writeResult?.total || inbox.length,
    proposedPackets: report.actions.length,
    priority: top,
    action: buildProductiveAction(top),
    adapterPlan,
    queue,
    commands: [
      "npm.cmd run k7:frontier -- --write-signals",
      "node lib/hunter.js signals",
      top ? `npm.cmd run k7:adapt -- --name "${top.candidate}" --kind ${kindForCandidate(top)} "${top.nextAction || "connect safely"}"` : "npm.cmd run k7:adapt -- --name \"selected system\" --kind agent \"connect safely\"",
    ],
    gates: [
      "Use sourceable packets before implementation.",
      "Verify license and maintenance before adding dependencies.",
      "No installs, deploys, paid resources or credential writes without explicit approval.",
      "Write only confirmed reusable learning to memory.",
    ],
  };
}

function parseArgs(argv) {
  return {
    writeSignals: argv.includes("--write-signals"),
    limit: Number(argv[argv.indexOf("--limit") + 1] || 5),
    compact: argv.includes("--compact"),
  };
}

function formatFrontierOperatorBrief(brief) {
  return [
    "## KAIZEN7 Frontier Operator",
    "",
    `Date: ${brief.date}`,
    `Inserted: ${brief.inserted}`,
    `Inbox total: ${brief.inboxTotal}`,
    "",
    "### Priority",
    brief.priority ? `${brief.priority.module}: ${brief.priority.candidate}` : "No frontier signal selected.",
    "",
    "### Action",
    brief.action.title,
    `Command: ${brief.action.command}`,
    "",
    "### Gates",
    ...brief.gates.map((gate) => `- ${gate}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const brief = buildFrontierOperatorBrief(args);
  if (args.compact) process.stdout.write(`${JSON.stringify({ status: brief.status, action: brief.action, priority: brief.priority }, null, 2)}\n`);
  else if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(brief, null, 2)}\n`);
  else process.stdout.write(`${formatFrontierOperatorBrief(brief)}\n`);
}

module.exports = {
  buildFrontierOperatorBrief,
  capabilitiesForCandidate,
  formatFrontierOperatorBrief,
  kindForCandidate,
  parseArgs,
};
