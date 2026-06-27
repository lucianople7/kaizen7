const assert = require("node:assert/strict");
const {
  buildCodexRealizerReport,
  parseArgs,
} = require("../lib/codex-realizer");

const calls = [];
const report = buildCodexRealizerReport({
  goal: "hacer KAIZEN7 real con Codex",
  run: (command) => {
    calls.push(command);
    if (command === "npm.cmd run check") return { status: "pass", command, exitCode: 0, stdout: "tests passed", stderr: "" };
    if (command === "npm.cmd run k7:ready") return { status: "pass", command, exitCode: 0, stdout: "Status: ready", stderr: "" };
    if (command.startsWith("npm.cmd run k7:codex")) return { status: "pass", command, exitCode: 0, stdout: "KAIZEN7 Codex Bridge", stderr: "" };
    if (command.startsWith("npm.cmd run k7:frontier:brief")) return { status: "pass", command, exitCode: 0, stdout: "Frontier Operator", stderr: "" };
    throw new Error(`unexpected command: ${command}`);
  },
});

assert.equal(report.status, "real");
assert.equal(report.mode, "codex-realizer");
assert.equal(report.goal, "hacer KAIZEN7 real con Codex");
assert.deepEqual(calls, [
  "npm.cmd run k7:codex -- --frontier --write-signals \"hacer KAIZEN7 real con Codex\"",
  "npm.cmd run k7:ready",
  "npm.cmd run k7:frontier:brief -- --write-signals --compact",
  "npm.cmd run check",
]);
assert.equal(report.checks.length, 4);
assert(report.checks.every((check) => check.status === "pass"));
assert(report.evidence.some((item) => item.includes("npm.cmd run check")));
assert(report.nextAction.includes("Keep using Codex Realizer"));
assert(report.gates.some((gate) => gate.includes("No publish")));

const blocked = buildCodexRealizerReport({
  goal: "fallo controlado",
  run: (command) => {
    if (command === "npm.cmd run check") return { status: "fail", command, exitCode: 1, stdout: "", stderr: "failed" };
    return { status: "pass", command, exitCode: 0, stdout: "ok", stderr: "" };
  },
});
assert.equal(blocked.status, "blocked");
assert.equal(blocked.failed.command, "npm.cmd run check");
assert(blocked.nextAction.includes("Fix the first failing check"));

const args = parseArgs(["--no-frontier", "--compact", "objetivo"]);
assert.equal(args.frontier, false);
assert.equal(args.compact, true);
assert.equal(args.goal, "objetivo");

assert.equal(
  report.checks[0].command,
  'npm.cmd run k7:codex -- --frontier --write-signals "hacer KAIZEN7 real con Codex"',
);

console.log("codex realizer tests passed");
