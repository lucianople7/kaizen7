const assert = require("node:assert/strict");
const {
  buildEvalHarness,
  formatEvalHarness,
  parseArgs,
} = require("../lib/eval-harness");

const report = buildEvalHarness({
  project: "The Focus",
  objective: "crear un proyecto enfocado a creacion de contenido",
  context: "repo local KAIZEN7",
  capabilities: ["run_tests", "web_research"],
});

assert.equal(report.status, "ready");
assert.equal(report.mode, "eval-harness");
assert.equal(report.project, "The Focus");
assert(report.objective.includes("creacion de contenido"));
assert.equal(report.comparison.baseline.name, "agent-alone");
assert.equal(report.comparison.kaizen.name, "kaizen7-guided");
assert(report.comparison.kaizen.cockpit.metaskillBoot.activationOrder.length > 0);
assert(report.comparison.kaizen.cockpit.toolchain.toolchain.length > 0);
assert(report.metrics.estimatedTokenReductionPct >= 30);
assert(report.metrics.stepsReduced >= 2);
assert(report.firstRun.commands.some((item) => item.includes("k7:cockpit")));
assert(report.firstRun.commands.some((item) => item.includes("k7:eval")));
assert(report.firstRun.deliverables.some((item) => item.includes("The Focus")));
assert(report.evidenceRequired.includes("commands_run"));
assert(report.stopRules.some((item) => item.includes("sin evidencia")));

const formatted = formatEvalHarness(report);
assert(formatted.includes("KAIZEN7 Eval Harness"));
assert(formatted.includes("The Focus"));
assert(formatted.includes("Estimated token reduction"));

const parsed = parseArgs([
  "--project",
  "The Focus",
  "--context",
  "repo local",
  "--capability",
  "run_tests",
  "crear",
  "sistema",
]);
assert.equal(parsed.project, "The Focus");
assert.equal(parsed.context, "repo local");
assert.deepEqual(parsed.capabilities, ["run_tests"]);
assert.equal(parsed.objective, "crear sistema");

console.log("eval harness tests passed");
