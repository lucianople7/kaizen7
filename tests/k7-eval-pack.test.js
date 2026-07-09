const assert = require("node:assert/strict");
const {
  buildEvalPack,
  formatEvalPack,
} = require("../lib/k7-eval-pack");

const pack = buildEvalPack("conectar un MCP con seguridad y bajo coste");

assert.equal(pack.schema, "kaizen7.eval_pack.v1");
assert.equal(pack.agent_agnostic, true);
assert(pack.acceptance_tests.includes("route and executor are named before action"));
assert(pack.regression_tests.includes("unsafe tool request is blocked by trust gate"));
assert(pack.observability_fields.includes("estimated_tokens"));
assert.equal(pack.cost_budget.max_first_pass_files, 7);
assert(pack.cost_budget.stop_if.includes("tool trust is block"));
assert.equal(pack.receipt_expected.objective, "conectar un MCP con seguridad y bajo coste");
assert(pack.commands.some((command) => command.includes("k7 -- trust")));

const formatted = formatEvalPack(pack);
assert(formatted.includes("# KAIZEN7 EVAL PACK"));
assert(formatted.includes("## Acceptance Tests"));
assert(formatted.includes("## Observability Fields"));

console.log("k7 eval pack tests passed");
