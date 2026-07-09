const assert = require("node:assert/strict");
const {
  buildWizardPlan,
  formatWizardPlan,
  inferProjectType,
  normalizeAnswers,
  parseWizardInput,
} = require("../lib/k7-wizard");

const answers = normalizeAnswers({
  objective: "crear adaptador de video local",
  project_type: "video",
  mode: "local/free-first",
  connections: "GitHub, Hugging Face, local CLI",
  agent: "Codex",
  output: "adapter contract",
});

assert.equal(answers.objective, "crear adaptador de video local");
assert.equal(answers.project_type, "video");
assert.deepEqual(answers.connections, ["GitHub", "Hugging Face", "local CLI"]);
assert.equal(inferProjectType("controlar browser sin API"), "web");
assert.equal(inferProjectType("mejorar agente codex"), "agent");

const plan = buildWizardPlan(answers);
assert.equal(plan.schema, "kaizen7.wizard_plan.v1");
assert.equal(plan.agent_agnostic, true);
assert.equal(plan.free_first, true);
assert(plan.route_hint.includes("video"));
assert(plan.recommended_flow.includes("commons"));
assert(plan.recommended_flow.includes("forge"));
assert.equal(plan.commands.run, "npm.cmd run k7 -- run \"crear adaptador de video local\"");
assert.equal(plan.commands.remember, "npm.cmd run k7 -- remember \"<verified-receipt-json>\"");
assert(plan.handoff.read_first.includes("AGENTS.md"));
assert.equal(plan.receipt_template.objective, "crear adaptador de video local");

const parsed = parseWizardInput([
  "--answers",
  JSON.stringify({
    objective: "mejorar agente",
    project_type: "agent",
    connections: ["MCP"],
  }),
]);
assert.equal(parsed.objective, "mejorar agente");
assert.equal(parsed.project_type, "agent");
assert.deepEqual(parsed.connections, ["MCP"]);

const formatted = formatWizardPlan(plan);
assert(formatted.includes("# KAIZEN7 WIZARD"));
assert(formatted.includes("## Recommended Flow"));
assert(formatted.includes("## Receipt Template"));

console.log("k7 wizard tests passed");
