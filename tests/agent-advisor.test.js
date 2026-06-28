const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildAgentAdvice,
  buildAdviceSummary,
  formatAdviceBrief,
  parseAdviseArgs,
} = require("../lib/agent-advisor");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-agent-advisor-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "test-driven-development"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), "# Semaforo\n");
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura", "Advisor.md"), [
  "# Advisor",
  "KAIZEN7 advisor helps agents read less context, choose skills and avoid risky external actions.",
].join("\n"));
fs.writeFileSync(path.join(root, ".agents", "skills", "test-driven-development", "SKILL.md"), [
  "---",
  "name: test-driven-development",
  "description: Use when implementing any feature or bugfix before writing implementation code.",
  "---",
].join("\n"));
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), [
  "---",
  "name: repo-hunter-github",
  "description: Buscar repositorios, modelos y herramientas para agentes.",
  "---",
].join("\n"));
fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({
  modules: {
    browser_automation: {
      status: "approved_for_prototype",
      primary: {
        source: "github",
        id: "browser-use/browser-use",
        license: "mit",
        verdict: "adopt_now",
        reason: "Browser automation for agents",
      },
    },
  },
}, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), JSON.stringify([], null, 2));

const parsed = parseAdviseArgs([
  "--agent", "codex",
  "--budget", "900",
  "--capability", "read_files",
  "--capability", "edit_files",
  "--risk", "low",
  "--json",
  "implementar endpoint API con tests",
]);
assert.equal(parsed.agent, "codex");
assert.equal(parsed.contextBudget, 900);
assert.deepEqual(parsed.capabilities, ["read_files", "edit_files"]);
assert.equal(parsed.riskTolerance, "low");
assert.equal(parsed.flags.has("--json"), true);
assert.equal(parsed.goal, "implementar endpoint API con tests");

const advice = buildAgentAdvice({
  root,
  date: "2026-06-26",
  agent: "codex",
  goal: "implementar endpoint API con tests",
  capabilities: ["read_files", "edit_files", "run_tests"],
  contextBudget: 900,
  riskTolerance: "low",
});

assert.equal(advice.version, 1);
assert.equal(advice.mode, "agent-advisor");
assert.equal(advice.agent, "codex");
assert.equal(advice.status, "ready");
assert.equal(advice.contextBudget, 900);
assert(advice.advice.read.length <= 3);
assert(advice.advice.skills.includes("test-driven-development"));
assert(advice.advice.action.includes("test"));
assert(advice.advice.avoid.some((item) => item.includes("external publish")));
assert(advice.advice.avoid.some((item) => item.includes("spend")));
assert(advice.advice.tokenPolicy.includes("900"));
assert(advice.advice.commands.includes("npm.cmd run check"));
assert(advice.sources.memory.length <= 3);
assert(advice.sources.hunter.some((item) => item.includes("browser_automation")));

const summary = buildAdviceSummary(advice);
assert.deepEqual(Object.keys(summary), ["status", "agent", "goal", "advice"]);
assert.equal(summary.advice.action, advice.advice.action);

const brief = formatAdviceBrief(advice);
assert(brief.includes("KAIZEN7 Agent Advisor"));
assert(brief.includes("codex"));
assert(brief.includes("Read"));

console.log("agent advisor tests passed");
