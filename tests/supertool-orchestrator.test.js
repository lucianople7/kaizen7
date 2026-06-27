const assert = require("node:assert/strict");
const {
  buildSupertoolPlan,
  detectIntent,
  parseArgs,
} = require("../lib/supertool-orchestrator");

assert.equal(detectIntent("implementar endpoint con tests").intent, "code");
assert.equal(detectIntent("conectar Shopify API como herramienta").intent, "adapter");
assert.equal(detectIntent("buscar lo mas puntero de agentes hoy").intent, "frontier");
assert.equal(detectIntent("recuperar memoria sobre THE FOCUX").intent, "memory");

const codePlan = buildSupertoolPlan({
  goal: "implementar endpoint con tests",
  execute: true,
  codexBridge: () => ({
    status: "ready",
    codex: {
      read: ["docs/CODEX_BRIDGE.md"],
      skills: ["test-driven-development"],
      avoid: ["do not touch credentials"],
      action: "write the smallest failing test first",
      commands: ["npm.cmd run check"],
      verification: ["Run tests"],
    },
  }),
  realizer: () => ({ status: "real", checks: [{ status: "pass", command: "npm.cmd run check" }] }),
});

assert.equal(codePlan.status, "ready");
assert.equal(codePlan.mode, "supertool-orchestrator");
assert.equal(codePlan.intent, "code");
assert.equal(codePlan.route.primary, "codex");
assert.equal(codePlan.action, "write the smallest failing test first");
assert(codePlan.skills.includes("test-driven-development"));
assert(codePlan.commands.includes("npm.cmd run check"));
assert(codePlan.verification.some((item) => item.includes("Run tests")));
assert.equal(codePlan.realizer.status, "real");

const adapterPlan = buildSupertoolPlan({
  goal: "conectar GitHub MCP como herramienta",
  adapterPlanner: () => ({
    status: "ready",
    kind: "mcp",
    contract: { input: { capabilities: ["tool_call"] } },
    gates: ["Require human approval"],
    nextSteps: ["Create thin adapter"],
  }),
});

assert.equal(adapterPlan.intent, "adapter");
assert.equal(adapterPlan.route.primary, "adapter-registry");
assert(adapterPlan.tools.includes("adapter-registry"));
assert(adapterPlan.risk.some((item) => item.includes("approval")));

const frontierPlan = buildSupertoolPlan({
  goal: "buscar lo mas puntero de agentes hoy",
  frontier: () => ({
    status: "ready",
    priority: { candidate: "OpenAI Agents SDK", module: "agent_evaluation" },
    action: { title: "Turn OpenAI Agents SDK into adapter", command: "npm.cmd run k7:adapt" },
    commands: ["npm.cmd run k7:frontier:brief -- --write-signals"],
    gates: ["Verify license"],
  }),
});

assert.equal(frontierPlan.intent, "frontier");
assert.equal(frontierPlan.route.primary, "frontier-operator");
assert(frontierPlan.action.includes("OpenAI Agents SDK"));

const defaultFrontierPlan = buildSupertoolPlan({
  goal: "buscar señales actuales del mercado de agentes",
});

assert.equal(defaultFrontierPlan.intent, "frontier");
assert.equal(defaultFrontierPlan.route.primary, "frontier-operator");
assert(defaultFrontierPlan.tools.includes("frontier-operator"));

const args = parseArgs(["--json", "--execute", "crear", "sistema"]);
assert.equal(args.json, true);
assert.equal(args.execute, true);
assert.equal(args.goal, "crear sistema");

const cliFrontierPlan = buildSupertoolPlan(parseArgs(["buscar", "lo", "mas", "puntero", "de", "agentes", "hoy"]));
assert.equal(cliFrontierPlan.intent, "frontier");
assert.equal(cliFrontierPlan.route.primary, "frontier-operator");

console.log("supertool orchestrator tests passed");
