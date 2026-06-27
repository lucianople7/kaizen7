const assert = require("node:assert/strict");
const {
  buildAdapterPlan,
  listAdapterKinds,
  parseArgs,
} = require("../lib/adapter-registry");

const kinds = listAdapterKinds();
assert(kinds.some((item) => item.kind === "api"));
assert(kinds.some((item) => item.kind === "agent"));
assert(kinds.some((item) => item.kind === "mcp"));

const apiPlan = buildAdapterPlan({
  name: "Composio",
  kind: "api",
  goal: "connect toolkits to KAIZEN7",
  capabilities: ["publish"],
  authEnv: ["COMPOSIO_API_KEY"],
});

assert.equal(apiPlan.status, "ready");
assert.equal(apiPlan.name, "Composio");
assert.equal(apiPlan.kind, "api");
assert.equal(apiPlan.risk, "high");
assert.equal(apiPlan.role, "supervised-execution-adapter");
assert.equal(apiPlan.connectToK7.advise, "POST /api/k7/advise");
assert.equal(apiPlan.connectToK7.adapterPlan, "POST /api/k7/adapters/plan");
assert(apiPlan.gates.some((gate) => gate.includes("Require human approval")));
assert(apiPlan.gates.some((gate) => gate.includes("approved environment variables")));
assert(apiPlan.memoryPolicy.neverStore.includes("API keys"));

const agentPlan = buildAdapterPlan({
  name: "External Builder",
  kind: "agent",
  capabilities: ["run_tests"],
});
assert(agentPlan.contract.input.capabilities.includes("read_files"));
assert(agentPlan.contract.input.capabilities.includes("run_tests"));
assert(agentPlan.nextSteps.some((step) => step.includes("smoke test")));

const parsed = parseArgs(["--name", "GitHub", "--kind", "api", "--capability", "read_external", "--env", "GITHUB_TOKEN", "mejorar repos"]);
assert.equal(parsed.name, "GitHub");
assert.equal(parsed.kind, "api");
assert.deepEqual(parsed.capabilities, ["read_external"]);
assert.deepEqual(parsed.authEnv, ["GITHUB_TOKEN"]);
assert.equal(parsed.goal, "mejorar repos");

console.log("adapter registry tests passed");
