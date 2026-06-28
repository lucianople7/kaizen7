const assert = require("node:assert/strict");
const {
  activateMetaskills,
  buildMetaskillTelemetry,
  scoreMetaskillFitness,
} = require("../lib/metaskill-activation");

const activations = activateMetaskills({
  goal: "fix failing tests in the browser adapter and verify before completion",
  route: { name: "code" },
  capabilities: ["read_files", "edit_files", "run_tests"],
});

assert(activations.some((item) => item.skill === "systematic-debugging"));
assert(activations.some((item) => item.skill === "test-driven-development"));
assert(activations.some((item) => item.skill === "verification-before-completion"));
assert(activations.every((item) => item.trigger));
assert(activations.every((item) => item.instructions.includes("Load")));
assert(activations.every((item) => item.verification));
assert(activations.length <= 5, "activation packet should stay compact");

const telemetry = buildMetaskillTelemetry({
  objectiveType: "bugfix",
  activations,
  outcome: {
    stepsBeforeFix: 4,
    testsPassed: true,
    reworkNeeded: false,
    confidenceAfter: 0.91,
    reusedContext: true,
    riskReduced: true,
  },
});

assert.equal(telemetry.objectiveType, "bugfix");
assert.equal(telemetry.activated.length, activations.length);
assert(telemetry.fitnessScore > 0.8);
assert(telemetry.signals.includes("tests_passed"));
assert(telemetry.signals.includes("no_rework"));
assert(telemetry.memoryWriteback.includes("Metaskill fitness"));

const lowerFitness = scoreMetaskillFitness({
  stepsBeforeFix: 14,
  testsPassed: false,
  reworkNeeded: true,
  confidenceAfter: 0.25,
  reusedContext: false,
  riskReduced: false,
});

assert(lowerFitness < telemetry.fitnessScore);

const historyRanked = activateMetaskills({
  goal: "implement new connector feature",
  route: { name: "code" },
  objectiveType: "implementation",
  ledger: {
    version: 1,
    outcomes: [
      {
        objectiveType: "implementation",
        activated: ["verification-before-completion"],
        fitnessScore: 0.95,
      },
      {
        objectiveType: "implementation",
        activated: ["test-driven-development"],
        fitnessScore: 0.61,
      },
    ],
  },
});

assert.equal(historyRanked[0].skill, "verification-before-completion");
assert.equal(historyRanked[0].fitness.averageFitness, 0.95);
assert.equal(historyRanked[0].fitness.source, "metaskill-ledger");

console.log("metaskill activation tests passed");
