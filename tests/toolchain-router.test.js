const assert = require("node:assert/strict");
const {
  buildToolchainPlan,
  evaluateToolchainResult,
  parseArgs,
} = require("../lib/toolchain-router");

const codingPlan = buildToolchainPlan({
  goal: "use OpenHands to improve KAIZEN7 cockpit with tests",
  capabilities: ["read_files", "edit_files", "run_tests"],
});

assert.equal(codingPlan.status, "ready");
assert.equal(codingPlan.mode, "toolchain-router");
assert.deepEqual(codingPlan.toolchain.map((tool) => tool.id), [
  "semantic-memory",
  "openhands-worker",
  "k7-eval-firewall",
]);
assert(codingPlan.blockedTools.includes("publish"));
assert(codingPlan.blockedTools.includes("credential_write"));
assert(codingPlan.commands.includes("npm.cmd run k7:openhands -- \"use OpenHands to improve KAIZEN7 cockpit with tests\""));
assert(codingPlan.evalFirewall.requiredEvidence.includes("tests"));
assert(codingPlan.evalFirewall.claimRubric.some((item) => item.id === "tests_passed"));

const mcpPlan = buildToolchainPlan({
  goal: "evaluate MCP tools and choose the smallest safe toolchain",
  capabilities: ["tool_call"],
});
assert(mcpPlan.toolchain.some((tool) => tool.id === "adapter-registry"));
assert(mcpPlan.toolchain.some((tool) => tool.id === "mcp-tool-router"));
assert.equal(mcpPlan.approvalRequired, true);

const passed = evaluateToolchainResult({
  claims: ["changed files are scoped", "tests passed", "risks reported"],
  evidence: {
    diff: "patch",
    tests: "npm.cmd run check passed",
    risks: ["no deploy"],
  },
});
assert.equal(passed.verdict, "pass");
assert(passed.satisfiedClaims.includes("tests_passed"));

const blocked = evaluateToolchainResult({
  claims: ["implemented change"],
  evidence: {
    diff: "patch",
  },
});
assert.equal(blocked.verdict, "block");
assert(blocked.missingClaims.includes("tests_passed"));
assert(blocked.gates.some((gate) => gate.includes("Do not accept")));

const parsed = parseArgs(["--capability", "run_tests", "--json", "mejorar", "cockpit"]);
assert.equal(parsed.json, true);
assert.deepEqual(parsed.capabilities, ["run_tests"]);
assert.equal(parsed.goal, "mejorar cockpit");

console.log("toolchain router tests passed");
