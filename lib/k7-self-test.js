const { spawnSync } = require("node:child_process");
const { buildK7State } = require("./k7-state");

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", shell: false });
  return {
    command: [command, ...args].join(" "),
    status: result.status,
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function buildK7SelfTest(options = {}) {
  const root = options.root || process.cwd();
  const checks = [
    run(process.execPath, ["--check", "lib/k7-state.js"]),
    run(process.execPath, ["--check", "lib/k7-next.js"]),
    run(process.execPath, ["--check", "lib/k7-self-test.js"]),
  ];
  const state = buildK7State({ root });
  return {
    version: 1,
    mode: "k7-self-test",
    status: checks.every((check) => check.ok) && state.status === "ready" ? "ready" : "blocked",
    checks,
    state: {
      status: state.status,
      blockers: state.readiness.blockers.length,
    },
  };
}

function formatK7SelfTest(report) {
  return [
    "## KAIZEN7 Self Test",
    "",
    `Status: ${report.status}`,
    `Readiness blockers: ${report.state.blockers}`,
    "",
    "### Checks",
    ...report.checks.map((check) => `- ${check.ok ? "pass" : "block"} ${check.command}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const report = buildK7SelfTest();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatK7SelfTest(report)}\n`);
  process.exitCode = report.status === "ready" ? 0 : 1;
}

module.exports = {
  buildK7SelfTest,
  formatK7SelfTest,
};
