const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildCodexBridge,
  buildCodexPrompt,
  parseArgs,
} = require("../lib/codex-bridge");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-codex-bridge-"));
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "---\nname: repo-hunter-github\ndescription: repository discovery\n---\n");
fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({ modules: {} }, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), JSON.stringify([], null, 2));
fs.writeFileSync(path.join(root, "data", "frontier-watch.json"), JSON.stringify({
  version: 1,
  max_packets: 1,
  write_target: "data/signal-inbox.json",
  targets: [{
    id: "agents",
    name: "OpenAI Agents SDK",
    kind: "agent",
    priority: "P0",
    source_type: "web",
    source_url: "https://developers.openai.com/api/docs/guides/agents",
    query: "agents",
    watch_for: ["guardrails"],
    adapt_to: ["codex"],
  }],
}, null, 2));

const args = parseArgs(["--frontier", "--write-signals", "--budget", "900", "implementar adaptador con tests"]);
assert.equal(args.frontier, true);
assert.equal(args.writeSignals, true);
assert.equal(args.contextBudget, 900);
assert.equal(args.goal, "implementar adaptador con tests");

const bridge = buildCodexBridge({
  root,
  goal: "implementar adaptador con tests",
  frontier: true,
  writeSignals: true,
  contextBudget: 900,
});

assert.equal(bridge.status, "ready");
assert.equal(bridge.mode, "codex-bridge");
assert.equal(bridge.capabilityPacket.mode, "k7-execution-packet");
assert.equal(bridge.capabilityPacket.agent_contract.schema, "kaizen7.agent_contract.v1");
assert.equal(Object.hasOwn(bridge.capabilityPacket.agent_contract, "commands"), false);
assert(bridge.capabilityPacket.forbidden_actions.includes("credential_write"));
assert.equal(bridge.agent, "codex");
assert(bridge.codex.skills.includes("test-driven-development"));
assert(bridge.codex.commands.includes("npm.cmd run check"));
assert(bridge.codex.avoid.some((item) => item.includes("secrets")));
assert.equal(bridge.frontier.mode, "frontier-operator");
assert(bridge.frontier.priority);

const prompt = buildCodexPrompt(bridge);
assert(prompt.includes("KAIZEN7 Codex Bridge"));
assert(prompt.includes("First action"));
assert(prompt.includes("Frontier priority"));

console.log("codex bridge tests passed");
