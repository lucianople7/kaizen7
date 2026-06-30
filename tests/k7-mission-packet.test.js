const assert = require("node:assert/strict");
const {
  buildMissionPacket,
  formatMissionPacket,
  parseArgs,
} = require("../lib/k7-mission-packet");

const packet = buildMissionPacket({
  objective: "mejorar landing THE FOCUX con tests",
  project: "THE FOCUX",
  capabilities: ["edit_code", "run_tests"],
});

assert.equal(packet.status, "ready");
assert.equal(packet.mode, "k7-mission-packet");
assert.equal(packet.project, "THE FOCUX");
assert.equal(packet.objective, "mejorar landing THE FOCUX con tests");
assert.equal(packet.risk, "low");
assert.deepEqual(packet.allowedPaths, ["lib", "tests", "docs", "Obsidian/Flowmatik/Kaizen7"]);
assert.deepEqual(packet.budget, { maxSteps: 5, maxTokens: 1600, maxMinutes: 30 });
assert(packet.capabilities.includes("edit_code"));
assert(packet.capabilities.includes("run_tests"));
assert.equal(packet.preferredExecutor, "auto");
assert(packet.stopRules.includes("stop_if_credentials_required"));
assert(packet.stopRules.includes("stop_if_publish_deploy_payment_or_delete_is_needed"));
assert(packet.verificationCommands.includes("npm.cmd run check"));
assert(packet.expectedEvidence.includes("diff_summary"));
assert.equal(packet.memoryWriteback.target, "Obsidian/Flowmatik/Kaizen7");
assert.equal(packet.memoryWriteback.kind, "Decision");

const highRisk = buildMissionPacket({
  objective: "deploy production and write API token to notes",
  capabilities: ["deploy", "credential_write"],
});
assert.equal(highRisk.risk, "high");
assert(highRisk.stopRules.includes("stop_until_human_approval"));
assert(highRisk.approval.required);
assert(highRisk.approval.reasons.some((reason) => reason.includes("credentials")));
assert(highRisk.approval.reasons.some((reason) => reason.includes("deploy")));

const browserPacket = buildMissionPacket({
  objective: "revisar visualmente la web de THE FOCUX y sacar screenshot",
});
assert(browserPacket.capabilities.includes("visual_inspection"));
assert(browserPacket.expectedEvidence.includes("screenshot_or_dom_snapshot"));

const parsed = parseArgs([
  "--project", "THE FOCUX",
  "--risk", "medium",
  "--executor", "codex",
  "--path", "site",
  "--capability", "edit_code",
  "--verify", "npm.cmd run check",
  "--json",
  "activar", "copilot",
]);
assert.equal(parsed.json, true);
assert.equal(parsed.project, "THE FOCUX");
assert.equal(parsed.risk, "medium");
assert.equal(parsed.preferredExecutor, "codex");
assert.deepEqual(parsed.allowedPaths, ["site"]);
assert.deepEqual(parsed.capabilities, ["edit_code"]);
assert.deepEqual(parsed.verificationCommands, ["npm.cmd run check"]);
assert.equal(parsed.objective, "activar copilot");

const text = formatMissionPacket(packet);
assert(text.includes("## K7 Mission Packet"));
assert(text.includes("THE FOCUX"));
assert(text.includes("mejorar landing THE FOCUX con tests"));

console.log("k7 mission packet tests passed");
