const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  evaluateRunDirectory,
  parseSkillOptArgs,
  runSkillOptCommand,
} = require("../lib/skillopt-cli");
const {
  assertWorkspacePath,
  prepareSkillOptRun,
  sha256File,
} = require("../lib/skillopt-adapter");

assert.deepEqual(parseSkillOptArgs(["--status"]), {
  mode: "status", compact: false, write: false, target: null,
});
assert.deepEqual(parseSkillOptArgs(["--fixture", "--compact"]), {
  mode: "fixture", compact: true, write: false, target: null,
});
assert.deepEqual(parseSkillOptArgs(["--prepare"]), {
  mode: "prepare", compact: false, write: false, target: null,
});
assert.deepEqual(parseSkillOptArgs(["--prepare", ".agents/skills/example/SKILL.md"]), {
  mode: "prepare", compact: false, write: false, target: ".agents/skills/example/SKILL.md",
});
assert.deepEqual(parseSkillOptArgs(["--evaluate", "data/skillopt/runs/a", "--write"]), {
  mode: "evaluate", compact: false, write: true, target: "data/skillopt/runs/a",
});
assert.throws(() => parseSkillOptArgs([]), /exactly one/i);
assert.throws(() => parseSkillOptArgs(["--status", "--smoke"]), /exactly one/i);
assert.throws(() => parseSkillOptArgs(["--evaluate"]), /requires a run directory/i);
assert.throws(() => parseSkillOptArgs(["--status", "--write"]), /only valid with --evaluate/i);
assert.throws(() => parseSkillOptArgs(["--network"]), /unknown option/i);

(async () => {
  let pythonCalls = 0;
  const fixture = await runSkillOptCommand({
    args: parseSkillOptArgs(["--fixture"]),
    adapter: {
      detectSkillOpt: async () => { pythonCalls += 1; },
      runSkillOptSmoke: async () => { pythonCalls += 1; },
      prepareSkillOptRun: () => { pythonCalls += 1; },
    },
  });
  assert.equal(pythonCalls, 0);
  assert.equal(fixture.report.simulated, true);
  assert.equal(fixture.report.verdict, "promotable");
  assert.equal(fixture.report.eligibleForPromotion, false);
  assert.equal(typeof fixture.report.nextAction, "string");

  const status = await runSkillOptCommand({
    args: parseSkillOptArgs(["--status"]),
    adapter: { detectSkillOpt: async () => ({ status: "ready", skilloptVersion: "0.2.0" }) },
  });
  assert.equal(status.runtime.status, "ready");

  const smoke = await runSkillOptCommand({
    args: parseSkillOptArgs(["--smoke"]),
    adapter: { runSkillOptSmoke: async () => ({ status: "passed" }) },
  });
  assert.equal(smoke.smoke.status, "passed");

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-skillopt-cli-"));
  const source = path.join(root, ".agents", "skills", "k7-self-evolution-loop", "SKILL.md");
  fs.mkdirSync(path.dirname(source), { recursive: true });
  fs.writeFileSync(source, "# Baseline\n\nUse verified evidence.\n", "utf8");

  const preparedCommand = await runSkillOptCommand({
    args: parseSkillOptArgs(["--prepare"]),
    root,
  });
  assert.equal(preparedCommand.preparation.status, "prepared");
  assert.equal(fs.readFileSync(source, "utf8"), "# Baseline\n\nUse verified evidence.\n");

  const runDirectory = preparedCommand.preparation.runDirectory;
  const candidateDirectory = path.join(runDirectory, "candidate");
  fs.mkdirSync(candidateDirectory, { recursive: true });
  const candidatePath = path.join(candidateDirectory, "best_skill.md");
  fs.writeFileSync(candidatePath, "# Candidate\n\nUse verified evidence and stop on regression.\n", "utf8");
  fs.writeFileSync(path.join(runDirectory, "evidence.json"), `${JSON.stringify({
    schema: "kaizen7.skillopt_evidence.v1",
    skilloptVersion: "0.2.0",
    validation: { baseline: 0.6, candidate: 0.7 },
    test: { baseline: 0.61, candidate: 0.62 },
    metrics: {
      baseline: { failures: 0, tokens: 1000, latencyMs: 100 },
      candidate: { failures: 0, tokens: 900, latencyMs: 95 },
    },
    productionWrites: [],
  }, null, 2)}\n`, "utf8");

  assert.equal(evaluateRunDirectory(runDirectory, { root }).verdict, "incomplete");
  const manifestPath = path.join(runDirectory, "manifest.json");
  const completedManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  completedManifest.splits = { train: ["train-1"], validation: ["val-1"], test: ["test-1"] };
  completedManifest.commands = [{ command: "skillopt-sleep run --reviewed-task-file", exitCode: 0 }];
  fs.writeFileSync(manifestPath, `${JSON.stringify(completedManifest, null, 2)}\n`, "utf8");

  const evaluated = evaluateRunDirectory(runDirectory, { root });
  assert.equal(evaluated.verdict, "promotable");
  assert.equal(evaluated.eligibleForPromotion, true);
  assert.equal(evaluated.evidence.candidateHash, sha256File(candidatePath));
  assert.equal(evaluated.manifest.runId, preparedCommand.preparation.runId);
  assert.equal(typeof evaluated.nextAction, "string");
  assert.equal(fs.existsSync(path.join(root, "data", "skillopt", "receipts.jsonl")), false);

  const evaluatedCommand = await runSkillOptCommand({
    args: parseSkillOptArgs(["--evaluate", runDirectory]),
    root,
  });
  assert.equal(evaluatedCommand.report.verdict, "promotable");
  assert.equal(evaluatedCommand.receipt, null);

  const writtenCommand = await runSkillOptCommand({
    args: parseSkillOptArgs(["--evaluate", runDirectory, "--write"]),
    root,
  });
  assert.equal(writtenCommand.receipt.status, "stored");

  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "k7-skillopt-cli-outside-"));
  const outsideCandidate = path.join(outside, "best_skill.md");
  fs.writeFileSync(outsideCandidate, "outside candidate", "utf8");
  fs.unlinkSync(candidatePath);
  fs.symlinkSync(outsideCandidate, candidatePath);
  assert.throws(() => evaluateRunDirectory(runDirectory, { root }), /outside workspace/i);

  assert.equal(assertWorkspacePath(source, { root }), source);
  assert.equal(prepareSkillOptRun(source, { root }).status, "existing");

  console.log("skillopt cli tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
