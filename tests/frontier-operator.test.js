const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildFrontierOperatorBrief,
  kindForCandidate,
} = require("../lib/frontier-operator");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-frontier-operator-"));
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), JSON.stringify([], null, 2));
fs.writeFileSync(path.join(root, "data", "frontier-watch.json"), JSON.stringify({
  version: 1,
  max_packets: 2,
  write_target: "data/signal-inbox.json",
  memory_target: "Obsidian/Flowmatik/Arquitectura/K7 Frontier Watch.md",
  rules: ["Official docs first.", "No installs."],
  targets: [
    {
      id: "agents",
      name: "OpenAI Agents SDK",
      kind: "agent",
      priority: "P0",
      source_type: "web",
      source_url: "https://developers.openai.com/api/docs/guides/agents",
      query: "agents",
      watch_for: ["guardrails"],
      adapt_to: ["adapter-registry"],
    },
    {
      id: "mcp",
      name: "MCP servers",
      kind: "mcp",
      priority: "P1",
      source_type: "github",
      query: "mcp servers",
      watch_for: ["tool schemas"],
      adapt_to: ["K7 Scope"],
    },
  ],
}, null, 2));

const emptyBrief = buildFrontierOperatorBrief({ root, date: "2026-06-27" });
assert.equal(emptyBrief.status, "ready");
assert.equal(emptyBrief.inserted, 0);
assert.equal(emptyBrief.priority, null);
assert(emptyBrief.action.command.includes("--write-signals"));

const brief = buildFrontierOperatorBrief({ root, date: "2026-06-27", writeSignals: true });
assert.equal(brief.status, "ready");
assert.equal(brief.mode, "frontier-operator");
assert.equal(brief.inserted, 2);
assert.equal(brief.inboxTotal, 2);
assert(brief.priority);
assert.equal(brief.priority.origin, "frontier-watch");
assert.equal(brief.priority.frontier.kind, "agent");
assert.equal(brief.adapterPlan.kind, "agent");
assert(brief.adapterPlan.contract.input.capabilities.includes("run_tests"));
assert(brief.action.command.includes("k7:adapt"));
assert(brief.commands.includes("node lib/hunter.js signals"));

const second = buildFrontierOperatorBrief({ root, date: "2026-06-27", writeSignals: true });
assert.equal(second.inserted, 0);
assert.equal(second.inboxTotal, 2);
assert.equal(kindForCandidate({ module: "browser_automation" }), "cli");

console.log("frontier operator tests passed");
