const assert = require("node:assert/strict");
const {
  FORGE_LANES,
  buildToolForgePlan,
  formatToolForgePlan,
  selectForgeLane,
} = require("../lib/k7-tool-forge");

assert(FORGE_LANES.length >= 5);
assert.equal(selectForgeLane("herramienta de video en Hugging Face").id, "video-tool");
assert.equal(selectForgeLane("controlar una app browser sin API con clicks").id, "browser-tool");
assert.equal(selectForgeLane("buscar repos libres y absorber patrones").id, "repo-tool");
assert.equal(selectForgeLane("crear comando CLI para desktop").id, "cli-tool");
assert.equal(selectForgeLane("usar memoria y aprender contexto").id, "memory-tool");

const plan = buildToolForgePlan("necesito herramienta de video libre que aprenda patron");
assert.equal(plan.schema, "kaizen7.tool_forge_plan.v1");
assert.equal(plan.agent_agnostic, true);
assert.equal(plan.free_first, true);
assert.equal(plan.selected_lane.id, "video-tool");
assert(plan.loop.some((step) => step.step === "learn_pattern"));
assert(plan.loop.some((step) => step.step === "forge_adapter"));
assert(plan.loop.some((step) => step.step === "remember"));
assert.equal(plan.adapter_contract.cost, "free | user-provided | paid-approved");
assert.equal(plan.adapter_contract.receipt_required, true);
assert.equal(plan.promotion_gate.promote_after_verified_receipts, 3);
assert(plan.promotion_gate.promote_to.includes("skill"));
assert(plan.promotion_gate.do_not_promote_when.includes("paid-only dependency"));

const formatted = formatToolForgePlan(plan);
assert(formatted.includes("# KAIZEN7 TOOL FORGE"));
assert(formatted.includes("## Search Zones"));
assert(formatted.includes("## Promotion Gate"));

console.log("k7 tool forge tests passed");
