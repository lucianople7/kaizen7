const assert = require("node:assert/strict");
const { buildFlowmatikRenderPlan } = require("../lib/flowmatik-render");

const plan = buildFlowmatikRenderPlan();

assert.equal(plan.status, "ready");
assert.equal(plan.mode, "flowmatik-remotion-render");
assert.equal(plan.composition, "MrKaizenFirstFlow");
assert.equal(plan.format.ratio, "9:16");
assert(plan.commands.render.includes("remotion render"));
assert(plan.inputs[0].includes("mr_kaizen_bangkok_energy_first_flow.json"));

console.log("flowmatik render tests passed");
