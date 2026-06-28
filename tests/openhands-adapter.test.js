const assert = require("node:assert/strict");
const {
  buildOpenHandsAdapterPlan,
  parseArgs,
} = require("../lib/openhands-adapter");

const plan = buildOpenHandsAdapterPlan({
  root: process.cwd(),
  goal: "use OpenHands to improve KAIZEN7 cockpit",
  allowedPaths: ["lib", "tests"],
});

assert.equal(plan.status, "ready");
assert.equal(plan.mode, "openhands-adapter");
assert.equal(plan.adapter.kind, "remote_worker");
assert(plan.kaizenAuthority.includes("KAIZEN7 decides"));
assert.equal(plan.sandboxRecommendation.preferred, "docker");
assert(plan.sandboxRecommendation.warning.includes("Do not mount home directories"));
assert.deepEqual(plan.workerPacket.allowedPaths, ["lib", "tests"]);
assert(plan.workerPacket.forbiddenActions.includes("merge_directly"));
assert(plan.workerPacket.verificationCommands.includes("npm.cmd run check"));
assert(plan.gates.some((gate) => gate.includes("Docker sandbox")));
assert(plan.externalIntelligence.recommendations.some((item) => item.id === "openhands-control-center"));

const parsed = parseArgs([
  "--name", "OpenHands",
  "--path", "lib",
  "--path", "tests",
  "--verify", "npm.cmd run check",
  "delegate", "work",
]);
assert.equal(parsed.name, "OpenHands");
assert.deepEqual(parsed.allowedPaths, ["lib", "tests"]);
assert.deepEqual(parsed.verificationCommands, ["npm.cmd run check"]);
assert.equal(parsed.goal, "delegate work");

console.log("openhands adapter tests passed");
