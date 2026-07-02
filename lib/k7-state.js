const fs = require("node:fs");
const path = require("node:path");
const { checkProductionReadiness } = require("./production-readiness");

function listAvailableScripts(pkg = {}) {
  return Object.keys(pkg.scripts || {})
    .filter((script) => script.startsWith("k7:"))
    .sort();
}

function readPackage(root) {
  const filePath = path.join(root, "package.json");
  if (!fs.existsSync(filePath)) return { scripts: {} };
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function moduleNamesFromReadiness(readiness) {
  return readiness.checks
    .filter((check) => check.id.startsWith("module:") && check.status === "pass")
    .map((check) => check.id.replace("module:", ""))
    .sort();
}

function apiNamesFromReadiness(readiness) {
  return readiness.checks
    .filter((check) => check.id.startsWith("api:") && check.status === "pass")
    .map((check) => check.id.replace("api:", ""))
    .sort();
}

function buildK7State(options = {}) {
  const root = options.root || process.cwd();
  const pkg = readPackage(root);
  const readiness = checkProductionReadiness({ root });
  const scripts = listAvailableScripts(pkg);
  const criticalScripts = ["k7:state", "k7:next", "k7:self-test", "k7:ready", "k7:check"];
  const missingCriticalScripts = criticalScripts.filter((script) => !scripts.includes(script));
  const status = readiness.status === "ready" && missingCriticalScripts.length === 0 ? "ready" : "blocked";

  return {
    version: 1,
    mode: "k7-state",
    status,
    readiness,
    capabilities: {
      scripts,
      modules: moduleNamesFromReadiness(readiness),
      apis: apiNamesFromReadiness(readiness),
      missingCriticalScripts,
    },
    gates: [
      "Rule #0: inspect current repo state before acting.",
      "Do not trust stale repo memory over current files.",
      "Stop if credentials, publishing, deploy or spend are required.",
      "Finish only with fresh verification evidence.",
    ],
    decision:
      status === "ready"
        ? "ready_for_scoped_work_with_verification"
        : "fix_readiness_before_new_work",
  };
}

function formatK7State(state) {
  return [
    "## KAIZEN7 State",
    "",
    `Status: ${state.status}`,
    `Blockers: ${state.readiness.blockers.length}`,
    `Scripts: ${state.capabilities.scripts.length}`,
    `Modules: ${state.capabilities.modules.length}`,
    "",
    "### Gates",
    ...state.gates.map((gate) => `- ${gate}`),
    "",
    "### Decision",
    state.decision,
    "",
  ].join("\n");
}

if (require.main === module) {
  const state = buildK7State();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
  else process.stdout.write(`${formatK7State(state)}\n`);
  process.exitCode = state.status === "ready" ? 0 : 1;
}

module.exports = {
  buildK7State,
  formatK7State,
  listAvailableScripts,
};
