const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildK7State, formatK7State, listAvailableScripts } = require("../lib/k7-state");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-state-"));
fs.mkdirSync(path.join(root, "lib"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "k7-self-evolution-loop"), { recursive: true });

const modules = [
  "agent-advisor", "agent-runner", "codex-bridge", "codex-realizer", "connector-kernel", "onboarding",
  "self-improvement-loop", "weakness-to-strength", "evolution-inbox", "action-queue-tickets", "supertool-orchestrator",
  "second-brain", "activation-demo", "activation-cockpit", "eval-harness", "wisdom-filter", "start-hub",
  "body-bridge", "runtime-init", "setup-status", "hunter", "github-adapter", "huggingface-adapter",
  "signal-ingestion", "skill-router", "adapter-registry", "openhands-adapter", "claude-flow-adapter",
  "hermes-agent-adapter", "jcode-adapter", "k7-operating-layer", "headroom-adapter", "k7-context-layer",
  "jcode-smoke",
  "paperclip-adapter", "k7-control-plane", "k7-state", "k7-next", "k7-self-test", "toolchain-router", "frontier-operator", "prompt-filter",
  "k7-mission-packet", "k7-harness-router",
  "semantic-memory", "agent-loop", "openai-agent-adapter", "model-gateway", "smart-crons", "cron-doctor",
];
for (const moduleName of modules) {
  fs.writeFileSync(path.join(root, "lib", `${moduleName}.js`), "module.exports = {};\n");
}

fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), "{}\n");
fs.writeFileSync(path.join(root, "data", "smart-crons.json"), JSON.stringify({
  policy: "propose-by-default",
  crons: [{ id: "daily", mode: "propose" }],
}));
fs.writeFileSync(path.join(root, "data", "frontier-watch.json"), "{}\n");
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "# repo hunter\n");
fs.writeFileSync(path.join(root, ".agents", "skills", "k7-self-evolution-loop", "SKILL.md"), "# loop\n");
fs.writeFileSync(path.join(root, "server.js"), [
  "/api/k7/setup", "/api/k7/activate", "/api/k7/cockpit", "/api/k7/start", "/api/k7/bridge",
  "/api/k7/strength", "/api/k7/evolve", "/api/k7/tickets", "/api/k7/eval", "/api/k7/loop", "/api/k7/handoff/validate",
  "/api/k7/models", "/api/k7/run", "/api/k7/advise", "/api/k7/codex", "/api/k7/realize",
  "/api/k7/connect", "/api/k7/onboard", "/api/k7/improve", "/api/k7/super", "/api/k7/brain",
  "/api/k7/adapters/plan", "/api/k7/openhands", "/api/k7/claude-flow", "/api/k7/hermes",
  "/api/k7/jcode", "/api/k7/operating", "/api/k7/headroom", "/api/k7/context", "/api/k7/paperclip",
  "/api/k7/control", "/api/k7/toolchain", "/api/k7/frontier", "/api/k7/openai/activate",
  "/api/k7/mission", "/api/k7/harness/route", "/api/k7/harness/dry-run",
].join("\n"));
fs.writeFileSync(path.join(root, ".env.example"), "OPENAI_API_KEY=\nMETA_ACCESS_TOKEN=\nSHOPIFY_ADMIN_TOKEN=\n");

const scripts = {
  check: "node tests/test.js",
  "k7:state": "node lib/k7-state.js",
  "k7:next": "node lib/k7-next.js",
  "k7:self-test": "node lib/k7-self-test.js",
  "k7:ready": "node lib/production-readiness.js",
  "k7:check": "npm run check && npm run k7:ready",
};
for (const name of [
  "init", "setup", "start", "bridge", "strength", "evolve", "tickets", "super", "brain", "activate", "cockpit",
  "eval", "prompt", "wisdom", "agent", "advise", "codex", "real", "connect", "onboard", "improve",
  "adapt", "openhands", "claude-flow", "hermes", "jcode", "operating", "headroom", "context",
  "jcode:smoke",
  "paperclip", "control", "toolchain", "openai", "models", "run", "hunter", "frontier",
  "mission", "harness",
  "frontier:brief", "github", "hf", "signal",
]) {
  scripts[`k7:${name}`] = `node lib/${name}.js`;
}
fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
  name: "kaizen7-test",
  version: "1.0.0",
  private: true,
  scripts,
}, null, 2));

assert.deepEqual(listAvailableScripts({ scripts: { "k7:z": "", test: "", "k7:a": "" } }), ["k7:a", "k7:z"]);

const state = buildK7State({ root });
assert.equal(state.status, "ready");
assert.equal(state.mode, "k7-state");
assert.equal(state.readiness.blockers.length, 0);
assert.equal(state.capabilities.missingCriticalScripts.length, 0);
assert(state.capabilities.scripts.includes("k7:state"));
assert(state.capabilities.modules.includes("k7-control-plane"));
assert(state.capabilities.apis.includes("k7-control"));
assert.equal(state.decision, "ready_for_scoped_work_with_verification");
assert(state.gates.some((gate) => gate.includes("stale repo")));

const formatted = formatK7State(state);
assert(formatted.includes("## KAIZEN7 State"));
assert(formatted.includes("Rule #0"));
assert(formatted.includes("Blockers: 0"));

console.log("k7 state tests passed");
