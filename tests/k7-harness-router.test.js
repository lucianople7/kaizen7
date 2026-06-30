const assert = require("node:assert/strict");
const {
  buildHarnessDryRun,
  formatHarnessRoute,
  parseArgs,
  routeMission,
} = require("../lib/k7-harness-router");

const codex = routeMission({
  objective: "mejorar THE FOCUX landing con tests",
  project: "THE FOCUX",
  capabilities: ["edit_code", "run_tests"],
});
assert.equal(codex.status, "ready");
assert.equal(codex.mode, "k7-harness-router");
assert.equal(codex.recommendedExecutor.id, "codex");
assert(codex.reason.includes("local repo"));
assert(codex.scores.codex > codex.scores.aider);
assert(codex.scores.codex > codex.scores["qwen-code"]);

const browser = routeMission({
  objective: "ver visualmente la web y sacar screenshot",
});
assert.equal(browser.recommendedExecutor.id, "browser");
assert(browser.reason.includes("visual"));

const manual = routeMission({
  objective: "deploy production and write token",
  capabilities: ["deploy", "credential_write"],
});
assert.equal(manual.recommendedExecutor.id, "manual");
assert(manual.mission.approval.required);
assert(manual.gates.includes("human_approval_before_execution"));

const aider = routeMission({
  objective: "parche quirurgico en repo map con tests",
  preferredExecutor: "aider",
  capabilities: ["edit_code", "run_tests"],
});
assert.equal(aider.recommendedExecutor.id, "aider");
assert(aider.gates.includes("external_cli_smoke_test_required"));

const qwen = routeMission({
  objective: "usar memoria automatica, subagents y MCP para proyecto modular",
  capabilities: ["memory_writeback", "mcp_tools", "subagents"],
});
assert.equal(qwen.recommendedExecutor.id, "qwen-code");
assert(qwen.gates.includes("external_cli_smoke_test_required"));

const jcode = routeMission({
  objective: "probar jcode como harness con sesiones persistentes",
  capabilities: ["session_resume"],
});
assert.equal(jcode.recommendedExecutor.id, "jcode");
assert(jcode.gates.includes("external_cli_smoke_test_required"));

const dryRun = buildHarnessDryRun({
  objective: "mejorar THE FOCUX con Codex y guardar memoria",
  project: "THE FOCUX",
  capabilities: ["edit_code", "run_tests", "memory_writeback"],
});
assert.equal(dryRun.status, "ready");
assert.equal(dryRun.mode, "k7-harness-dry-run");
assert.equal(dryRun.route.recommendedExecutor.id, "codex");
assert(dryRun.nextAction.includes("Run Codex"));
assert(dryRun.verificationCommands.includes("npm.cmd run check"));
assert(dryRun.memoryDraft.includes("THE FOCUX"));
assert(dryRun.expectedEvidence.includes("diff_summary"));

const parsed = parseArgs(["--project", "THE FOCUX", "--executor", "qwen-code", "--json", "activar", "router"]);
assert.equal(parsed.project, "THE FOCUX");
assert.equal(parsed.preferredExecutor, "qwen-code");
assert.equal(parsed.json, true);
assert.equal(parsed.objective, "activar router");

const text = formatHarnessRoute(codex);
assert(text.includes("## K7 Harness Router"));
assert(text.includes("codex"));

console.log("k7 harness router tests passed");
