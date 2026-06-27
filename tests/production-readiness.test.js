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
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7"), { recursive: true });

for (const file of [
  "agent-advisor.js",
  "agent-runner.js",
  "codex-bridge.js",
  "codex-realizer.js",
  "supertool-orchestrator.js",
  "second-brain.js",
  "hunter.js",
  "github-adapter.js",
  "huggingface-adapter.js",
  "signal-ingestion.js",
  "skill-router.js",
  "adapter-registry.js",
  "frontier-operator.js",
  "semantic-memory.js",
  "agent-loop.js",
  "openai-agent-adapter.js",
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
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), "# Semaforo\n");
fs.writeFileSync(path.join(root, ".env.example"), "OPENAI_API_KEY=\nMETA_ACCESS_TOKEN=\n");
fs.writeFileSync(path.join(root, "server.js"), "app.post('/api/k7/run', handler);\napp.post('/api/k7/advise', handler);\napp.post('/api/k7/codex', handler);\napp.post('/api/k7/realize', handler);\napp.post('/api/k7/super', handler);\napp.post('/api/k7/brain', handler);\napp.post('/api/k7/frontier', handler);\napp.post('/api/k7/openai/activate', handler);\n");
fs.appendFileSync(path.join(root, "server.js"), "app.post('/api/k7/adapters/plan', handler);\n");
fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
  scripts: {
    check: "node tests/test.js",
    "k7:super": "node lib/supertool-orchestrator.js",
    "k7:brain": "node lib/second-brain.js",
    "k7:agent": "node lib/agent-loop.js",
    "k7:advise": "node lib/agent-advisor.js",
    "k7:codex": "node lib/codex-bridge.js",
    "k7:real": "node lib/codex-realizer.js",
    "k7:adapt": "node lib/adapter-registry.js",
    "k7:openai": "node lib/openai-agent-adapter.js activate",
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
assert(ready.checks.some((check) => check.id === "module:supertool-orchestrator" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:second-brain" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:agent-loop" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:github-adapter" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:huggingface-adapter" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:signal-ingestion" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:adapter-registry" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "module:frontier-operator" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "data:signal-inbox" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "data:frontier-watch" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-run" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-advise" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-codex" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-realize" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-super" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-brain" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-adapters-plan" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-frontier" && check.status === "pass"));
assert(ready.checks.some((check) => check.id === "api:k7-openai-activate" && check.status === "pass"));
assert(ready.warnings.some((warning) => warning.id === "env:OPENAI_API_KEY"), "empty env examples should warn, not block");

const summary = summarizeReadiness(ready);
assert(summary.includes("Status: ready"));
assert(summary.includes("Warnings:"));

fs.rmSync(path.join(root, "lib", "agent-loop.js"));
const blocked = checkProductionReadiness({ root });
assert.equal(blocked.status, "blocked");
assert(blocked.blockers.some((blocker) => blocker.id === "module:agent-loop"));

console.log("production readiness tests passed");
