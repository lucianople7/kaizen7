const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildK7Next,
  buildNextAction,
  formatK7Next,
  parseArgs,
} = require("../lib/k7-next");

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-next-"));
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
  "weakness-to-strength.js",
  "evolution-inbox.js",
  "action-queue-tickets.js",
  "supertool-orchestrator.js",
  "second-brain.js",
  "activation-demo.js",
  "activation-cockpit.js",
  "eval-harness.js",
  "wisdom-filter.js",
  "start-hub.js",
  "body-bridge.js",
  "runtime-init.js",
  "setup-status.js",
  "hunter.js",
  "github-adapter.js",
  "huggingface-adapter.js",
  "signal-ingestion.js",
  "skill-router.js",
  "adapter-registry.js",
  "openhands-adapter.js",
  "claude-flow-adapter.js",
  "hermes-agent-adapter.js",
  "jcode-adapter.js",
  "jcode-smoke.js",
  "k7-operating-layer.js",
  "headroom-adapter.js",
  "k7-context-layer.js",
  "paperclip-adapter.js",
  "k7-control-plane.js",
  "k7-state.js",
  "k7-next.js",
  "k7-self-test.js",
  "toolchain-router.js",
  "k7-mission-packet.js",
  "k7-harness-router.js",
  "prompt-filter.js",
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

writeJson(path.join(root, "data", "hunter-registry.json"), { modules: {} });
writeJson(path.join(root, "data", "smart-crons.json"), {
  policy: "propose-by-default",
  crons: [{ id: "daily", mode: "propose" }],
});
writeJson(path.join(root, "data", "frontier-watch.json"), { version: 1, targets: [] });
writeJson(path.join(root, "data", "signal-inbox.json"), [{
  id: "prompt-self-test",
  source: { type: "text" },
  confidence: "high",
  destination: "task",
  content: {
    title: "prompt-filter no detecta self_test",
    summary: "Friccion repetible que debe fortalecerse.",
  },
  signals: { hasNext: true, tools: ["prompt-filter"], risks: [] },
}]);

fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "---\nname: repo-hunter-github\ndescription: ok\n---\n");
fs.writeFileSync(path.join(root, ".agents", "skills", "k7-self-evolution-loop", "SKILL.md"), "---\nname: k7-self-evolution-loop\ndescription: ok\n---\n");
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), "# Semaforo\n");
fs.writeFileSync(path.join(root, ".env.example"), "OPENAI_API_KEY=\nMETA_ACCESS_TOKEN=\nSHOPIFY_ADMIN_TOKEN=\n");
fs.writeFileSync(path.join(root, "server.js"), [
  "/api/k7/setup", "/api/k7/activate", "/api/k7/cockpit", "/api/k7/start", "/api/k7/bridge",
  "/api/k7/strength", "/api/k7/evolve", "/api/k7/tickets", "/api/k7/eval", "/api/k7/loop",
  "/api/k7/handoff/validate", "/api/k7/models", "/api/k7/run", "/api/k7/advise", "/api/k7/codex",
  "/api/k7/realize", "/api/k7/connect", "/api/k7/onboard", "/api/k7/improve", "/api/k7/super",
  "/api/k7/brain", "/api/k7/adapters/plan", "/api/k7/openhands", "/api/k7/claude-flow",
  "/api/k7/hermes", "/api/k7/jcode", "/api/k7/operating", "/api/k7/headroom", "/api/k7/context",
  "/api/k7/paperclip", "/api/k7/control", "/api/k7/toolchain", "/api/k7/frontier",
  "/api/k7/mission", "/api/k7/harness/route", "/api/k7/harness/dry-run",
  "/api/k7/openai/activate",
].join("\n"));

const scripts = {
  check: "node tests/test.js",
  "k7:state": "node lib/k7-state.js",
  "k7:next": "node lib/k7-next.js",
  "k7:self-test": "node lib/k7-self-test.js",
  "k7:ready": "node lib/production-readiness.js",
  "k7:check": "npm run check && npm run k7:ready",
};
for (const name of [
  "init", "setup", "start", "bridge", "strength", "evolve", "tickets", "super", "brain", "activate",
  "cockpit", "eval", "prompt", "wisdom", "agent", "advise", "codex", "real", "connect", "onboard",
  "improve", "adapt", "openhands", "claude-flow", "hermes", "jcode", "operating", "headroom",
  "jcode:smoke",
  "context", "paperclip", "control", "toolchain", "openai", "models", "run", "hunter", "frontier",
  "mission", "harness",
  "frontier:brief", "github", "hf", "signal",
]) {
  scripts[`k7:${name}`] = `node lib/${name}.js`;
}
writeJson(path.join(root, "package.json"), {
  name: "kaizen7-test",
  version: "1.0.0",
  private: true,
  scripts,
});

const args = parseArgs(["--compact", "--project", "KAIZEN7", "que", "hago"]);
assert.equal(args.compact, true);
assert.equal(args.project, "KAIZEN7");
assert.equal(args.goal, "que hago");

const packet = buildK7Next({ root, project: "KAIZEN7", goal: "que hago ahora?" });
assert.equal(packet.status, "ready");
assert.equal(packet.mode, "k7-next");
assert.equal(packet.tickets.recommended.lane, "strength");
assert.equal(packet.next.type, "ticket");
assert.equal(packet.next.priority, "P0");
assert(packet.next.stopCondition.includes("stop_if_credentials_required"));
assert(packet.gates.includes("do_only_this_now"));
assert(packet.commands.includes("npm.cmd run k7:next"));

const blockedNext = buildNextAction({ status: "blocked" }, {}, {});
assert.equal(blockedNext.type, "fix_readiness");

const formatted = formatK7Next(packet);
assert(formatted.includes("## KAIZEN7 Next"));
assert(formatted.includes("Do This Now"));

console.log("k7 next tests passed");
