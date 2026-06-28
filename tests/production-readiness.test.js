const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  checkProductionReadiness,
  summarizeReadiness,
} = require("../lib/production-readiness");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-readiness-"));
fs.mkdirSync(path.join(root, "lib"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "k7-self-evolution-loop"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7"), { recursive: true });

for (const file of [
  "agent-advisor.js",
  "agent-runner.js",
  "codex-bridge.js",
  "codex-realizer.js",
  "connector-kernel.js",
  "onboarding.js",
  "self-improvement-loop.js",
  "supertool-orchestrator.js",
  "second-brain.js",
  "activation-demo.js",
  "activation-cockpit.js",
  "eval-harness.js",
  "start-hub.js",
  "runtime-init.js",
  "setup-status.js",
  "hunter.js",
  "github-adapter.js",
  "huggingface-adapter.js",
  "signal-ingestion.js",
  "skill-router.js",
  "adapter-registry.js",
  "openhands-adapter.js",
  "toolchain-router.js",
  "frontier-operator.js",
  "semantic-memory.js",
  "agent-loop.js",
  "openai-agent-adapter.js",
  "model-gateway.js",
  "smart-crons.js",
  "cron-doctor.js",
]) {
  fs.writeFileSync(path.join(root, "lib", file), "module.exports = {};\n");
}

fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({ modules: { semantic_memory: {} } }, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), JSON.stringify([], null, 2));
fs.writeFileSync(path.join(root, "data", "smart-crons.json"), JSON.stringify({
  policy: "propose-by-default",
  crons: [{ id: "hunter-daily", title: "Hunter", cadence: "daily", mode: "propose", description: "ok" }],
}, null, 2));
fs.writeFileSync(path.join(root, "data", "frontier-watch.json"), JSON.stringify({
  version: 1,
  targets: [{ id: "agents", name: "Agents", priority: "P0", query: "agents" }],
}, null, 2));
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "---\nname: repo-hunter-github\ndescription: ok\n---\n");
fs.writeFileSync(path.join(root, ".agents", "skills", "k7-self-evolution-loop", "SKILL.md"), "---\nname: k7-self-evolution-loop\ndescription: ok\n---\n");
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), "# Semaforo\n");
fs.writeFileSync(path.join(root, ".env.example"), "OPENAI_API_KEY=\nMETA_ACCESS_TOKEN=\n");
fs.writeFileSync(path.join(root, "server.js"), "app.get('/api/k7/setup', handler);\napp.post('/api/k7/run', handler);\napp.post('/api/k7/advise', handler);\napp.post('/api/k7/codex', handler);\napp.post('/api/k7/realize', handler);\napp.post('/api/k7/connect', handler);\napp.post('/api/k7/onboard', handler);\napp.post('/api/k7/improve', handler);\napp.post('/api/k7/super', handler);\napp.post('/api/k7/brain', handler);\napp.post('/api/k7/frontier', handler);\napp.post('/api/k7/openai/activate', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/activate', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/cockpit', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/start', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/eval', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/loop', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/handoff/validate', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.get('/api/k7/models', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/adapters/plan', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/openhands', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/toolchain', handler);\n");
fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
  scripts: {
    check: "node tests/test.js",
    "k7:init": "node lib/runtime-init.js",
    "k7:setup": "node lib/setup-status.js",
    "k7:start": "node lib/start-hub.js",
    "k7:super": "node lib/supertool-orchestrator.js",
    "k7:brain": "node lib/second-brain.js",
    "k7:activate": "node lib/activation-demo.js",
    "k7:cockpit": "node lib/activation-cockpit.js",
    "k7:eval": "node lib/eval-harness.js",
    "k7:agent": "node lib/agent-loop.js",
    "k7:advise": "node lib/agent-advisor.js",
    "k7:codex": "node lib/codex-bridge.js",
    "k7:real": "node lib/codex-realizer.js",
    "k7:connect": "node lib/connector-kernel.js",
    "k7:onboard": "node lib/onboarding.js",
    "k7:improve": "node lib/self-improvement-loop.js",
    "k7:adapt": "node lib/adapter-registry.js",
    "k7:openhands": "node lib/openhands-adapter.js",
    "k7:toolchain": "node lib/toolchain-router.js",
    "k7:openai": "node lib/openai-agent-adapter.js activate",
    "k7:models": "node lib/model-gateway.js",
    "k7:run": "node lib/agent-runner.js",
    "k7:hunter": "node lib/hunter.js roadmap",
    "k7:frontier": "node lib/smart-crons.js frontier-watch",
    "k7:frontier:brief": "node lib/frontier-operator.js",
    "k7:github": "node lib/github-adapter.js",
    "k7:hf": "node lib/huggingface-adapter.js",
    "k7:signal": "node lib/signal-ingestion.js",
  },
}, null, 2));

const ready = checkProductionReadiness({ root });
assert.equal(ready.status, "ready");
assert.equal(ready.blockers.length, 0);
assert(ready.checks.some((check) => check.id === "module:agent-advisor" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:agent-runner" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:codex-bridge" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:codex-realizer" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:connector-kernel" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:onboarding" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:self-improvement-loop" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:supertool-orchestrator" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:second-brain" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:activation-demo" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:activation-cockpit" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:eval-harness" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:start-hub" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:runtime-init" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:setup-status" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:agent-loop" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:model-gateway" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:github-adapter" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:huggingface-adapter" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:signal-ingestion" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:adapter-registry" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:openhands-adapter" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:toolchain-router" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:frontier-operator" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "data:frontier-watch" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-setup" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-activate" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-cockpit" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-start" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-eval" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-loop" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-handoff-validate" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-models" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-run" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-advise" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-codex" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-realize" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-connect" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-onboard" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-improve" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-super" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-brain" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-adapters-plan" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-openhands" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-toolchain" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-frontier" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-openai-activate" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "skill:k7-self-evolution-loop" && check.status === "pass"));
assert(ready.warnings.some((warning) => warning.id === "env:OPENAI_API_KEY"), "empty env examples should warn, not block");

const summary = summarizeReadiness(ready);
assert(summary.includes("Status: ready"));
assert(summary.includes("Warnings:"));

fs.rmSync(path.join(root, "lib", "agent-loop.js"));
const blocked = checkProductionReadiness({ root });
assert.equal(blocked.status, "blocked");
assert(blocked.blockers.some((blocker) => blocker.id === "module:agent-loop"));

fs.writeFileSync(path.join(root, "lib", "agent-loop.js"), "module.exports = {};\n");
fs.rmSync(path.join(root, "data", "signal-inbox.json"));
const readyWithoutRuntimeInbox = checkProductionReadiness({ root });
assert.equal(readyWithoutRuntimeInbox.status, "ready");
assert(readyWithoutRuntimeInbox.warnings.some((warning) => warning.id === "runtime:signal-inbox"));

console.log("production readiness tests passed");
