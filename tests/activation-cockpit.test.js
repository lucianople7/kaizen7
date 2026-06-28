const assert = require("node:assert/strict");
const {
  buildActivationCockpit,
  parseArgs,
} = require("../lib/activation-cockpit");

const needsObjective = buildActivationCockpit({});
assert.equal(needsObjective.status, "needs_input");
assert.equal(needsObjective.question.id, "objective");
assert.equal(needsObjective.question.prompt, "Que quieres conseguir ahora?");
assert.deepEqual(needsObjective.readingPlan, []);
assert.deepEqual(needsObjective.commands, []);

const needsContext = buildActivationCockpit({
  goal: "mejorar el proyecto con OpenHands",
});
assert.equal(needsContext.status, "needs_input");
assert.equal(needsContext.question.id, "context");
assert(needsContext.question.prompt.includes("contexto minimo"));
assert(needsContext.options.some((item) => item.id === "continue_minimal"));
assert(needsContext.tokenPolicy.includes("no leer todo"));

const ready = buildActivationCockpit({
  goal: "mejorar el proyecto con OpenHands",
  context: "repo local KAIZEN7",
  capabilities: ["run_tests"],
});
assert.equal(ready.status, "ready");
assert.equal(ready.mode, "activation-cockpit");
assert.equal(ready.goal, "mejorar el proyecto con OpenHands");
assert(ready.activationLoop.includes("Objective"));
assert.equal(ready.questions.length, 0);
assert(ready.readingPlan.length <= 5);
assert(ready.toolchain.toolchain.some((item) => item.id === "openhands-worker"));
assert(ready.nextAction.command.includes("k7:openhands"));
assert(ready.verification.includes("npm.cmd run check"));
assert(ready.writeback.target.includes("Obsidian"));
assert(ready.stopRules.some((item) => item.includes("Si falta evidencia")));

const parsed = parseArgs(["--capability", "run_tests", "--context", "repo local", "crear", "cockpit"]);
assert.equal(parsed.goal, "crear cockpit");
assert.equal(parsed.context, "repo local");
assert.deepEqual(parsed.capabilities, ["run_tests"]);

console.log("activation cockpit tests passed");
