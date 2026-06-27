const { execFileSync } = require("node:child_process");

function quote(value) {
  return `"${String(value || "").replace(/"/g, '\\"')}"`;
}

function defaultRunner(command) {
  try {
    const stdout = execFileSync("cmd.exe", ["/d", "/s", "/c", command], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: "pass", command, exitCode: 0, stdout, stderr: "" };
  } catch (error) {
    return {
      status: "fail",
      command,
      exitCode: error.status || 1,
      stdout: error.stdout?.toString() || "",
      stderr: error.stderr?.toString() || error.message,
    };
  }
}

function commandsFor({ goal, frontier = true } = {}) {
  const commands = [
    frontier
      ? `npm.cmd run k7:codex -- --frontier --write-signals ${quote(goal)}`
      : `npm.cmd run k7:codex -- ${quote(goal)}`,
    "npm.cmd run k7:ready",
  ];
  if (frontier) commands.push("npm.cmd run k7:frontier:brief -- --write-signals --compact");
  commands.push("npm.cmd run check");
  return commands;
}

function buildCodexRealizerReport(options = {}) {
  const goal = options.goal || "make KAIZEN7 real with Codex";
  const frontier = options.frontier !== false;
  const runner = options.run || defaultRunner;
  const checks = [];
  for (const command of commandsFor({ goal, frontier })) {
    const result = runner(command);
    checks.push(result);
    if (result.status !== "pass" || result.exitCode !== 0) {
      return {
        version: 1,
        status: "blocked",
        mode: "codex-realizer",
        goal,
        frontier,
        checks,
        failed: result,
        evidence: checks.map((check) => `${check.status}: ${check.command}`),
        nextAction: `Fix the first failing check: ${result.command}`,
        gates: safetyGates(),
      };
    }
  }
  return {
    version: 1,
    status: "real",
    mode: "codex-realizer",
    goal,
    frontier,
    checks,
    evidence: checks.map((check) => `${check.status}: ${check.command}`),
    nextAction: "Keep using Codex Realizer before KAIZEN7 changes and ship only verified deltas.",
    gates: safetyGates(),
  };
}

function safetyGates() {
  return [
    "No publish, push, deploy, spend, delete or credential writes without explicit approval.",
    "No completion claim without a fresh verification command.",
    "No memory writeback with secrets or unverified claims.",
    "Fix the first failing check before expanding scope.",
  ];
}

function parseArgs(argv) {
  const flags = new Set();
  const goalParts = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    compact: flags.has("--compact"),
    json: flags.has("--json"),
    frontier: !flags.has("--no-frontier"),
    goal: goalParts.join(" ").trim(),
  };
}

function formatReport(report) {
  return [
    "## KAIZEN7 Codex Realizer",
    "",
    `Status: ${report.status}`,
    `Goal: ${report.goal}`,
    "",
    "### Checks",
    ...report.checks.map((check) => `- ${check.status}: ${check.command}`),
    "",
    "### Next Action",
    report.nextAction,
    "",
    "### Gates",
    ...report.gates.map((gate) => `- ${gate}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const report = buildCodexRealizerReport(args);
  if (args.compact) process.stdout.write(`${JSON.stringify({ status: report.status, nextAction: report.nextAction, failed: report.failed || null }, null, 2)}\n`);
  else if (args.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatReport(report)}\n`);
  process.exitCode = report.status === "real" ? 0 : 1;
}

module.exports = {
  buildCodexRealizerReport,
  commandsFor,
  formatReport,
  parseArgs,
};
