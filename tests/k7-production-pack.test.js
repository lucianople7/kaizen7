const assert = require("node:assert/strict");
const {
  buildProductionPack,
  chooseStack,
  formatProductionPack,
} = require("../lib/k7-production-pack");

assert.equal(chooseStack("long running durable workflow"), "LangGraph-style durable workflow");
assert.equal(chooseStack("guardrails handoff sandbox session"), "OpenAI Agents SDK-style guarded runtime");
assert.equal(chooseStack("research team with roles"), "CrewAI-style role team");
assert.equal(chooseStack("browser cli app sin API"), "KAIZEN7 Anything CLI adapter route");

const pack = buildProductionPack("crear workflow largo con observability y memoria");

assert.equal(pack.schema, "kaizen7.production_pack.v1");
assert.equal(pack.agent_agnostic, true);
assert(pack.recommended_stack.includes("LangGraph"));
assert.equal(pack.trust_gate.schema, "kaizen7.trust_gate.v1");
assert.equal(pack.eval_pack.schema, "kaizen7.eval_pack.v1");
assert(pack.production_checklist.includes("tool trust decision recorded"));
assert(pack.framework_selector.some((item) => item.choose.includes("OpenAI Agents SDK")));
assert(pack.observability_strategy.can_export_to.includes("Langfuse"));
assert(pack.next_commands.some((command) => command.includes("k7 -- eval")));

const formatted = formatProductionPack(pack);
assert(formatted.includes("# KAIZEN7 PRODUCTION PACK"));
assert(formatted.includes("## Framework Selector"));
assert(formatted.includes("## Observability"));

console.log("k7 production pack tests passed");
