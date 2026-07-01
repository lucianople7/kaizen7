const assert = require("node:assert/strict");
const {
  buildStartHub,
  formatStartHub,
  parseArgs,
} = require("../lib/start-hub");

const question = buildStartHub({});
assert.equal(question.status, "needs_input");
assert.equal(question.mode, "start-hub");
assert.equal(question.question.id, "objective");
assert(question.commands.includes("npm.cmd run k7:start"));

const report = buildStartHub({
  project: "THE FOCUX",
  objective: "crear dossier NEUROCITY verificable",
  context: "repo THE FOCUX separado",
  capabilities: ["run_tests"],
});

assert.equal(report.status, "ready");
assert.equal(report.mode, "start-hub");
assert.equal(report.project, "THE FOCUX");
assert.equal(report.objective, "crear dossier NEUROCITY verificable");
assert.equal(report.startLoop[0], "Objective");
assert(report.cockpit.metaskillBoot.activationOrder.includes("verification-before-completion"));
assert.equal(report.eval.mode, "eval-harness");
assert(report.commands.some((item) => item.includes("k7:cockpit")));
assert(report.commands.some((item) => item.includes("k7:eval")));
assert(report.commands.some((item) => item.includes("k7:start")));
assert(report.commands.some((item) => item.includes("--capability run_tests")));
assert(report.editorPacket.instructions.some((item) => item.includes("Load")));
assert(report.firstAction.command.includes("k7:"));
assert(report.evidenceRequired.includes("tests_or_checks"));
assert(report.stopRules.some((item) => item.includes("No ejecutar")));
assert.equal(report.capabilityPacket.mode, "k7-execution-packet");
assert.equal(report.capabilityPacket.agent_contract.schema, "kaizen7.agent_contract.v1");
assert.equal(Object.hasOwn(report.capabilityPacket.agent_contract, "commands"), false);
assert(report.capabilityPacket.capabilities.length > 0);
assert(report.capabilityPacket.commands.includes("npm.cmd run check"));

const formatted = formatStartHub(report);
assert(formatted.includes("KAIZEN7 Start"));
assert(formatted.includes("THE FOCUX"));
assert(formatted.includes("Metaskills"));

const parsed = parseArgs([
  "--project",
  "THE FOCUX",
  "--context",
  "repo separado",
  "--capability",
  "run_tests",
  "crear",
  "dossier",
]);
assert.equal(parsed.project, "THE FOCUX");
assert.equal(parsed.context, "repo separado");
assert.deepEqual(parsed.capabilities, ["run_tests"]);
assert.equal(parsed.objective, "crear dossier");

const selfStart = buildStartHub({
  project: "KAIZEN7",
  objective: "KAIZEN7 contra KAIZEN7 cinco pasadas para autoevaluarse y automejorarse",
  context: "repo local KAIZEN7",
  capabilities: ["run_tests"],
});
assert.equal(selfStart.cockpit.metaskillBoot.activationOrder[0], "k7-self-evolution-loop");
assert(selfStart.editorPacket.instructions[0].includes("k7-self-evolution-loop"));
assert(selfStart.firstAction.command.includes("KAIZEN7"));
assert(selfStart.firstAction.command.includes("repo local KAIZEN7"));
assert(selfStart.firstAction.command.includes("--capability run_tests"));

console.log("start hub tests passed");
