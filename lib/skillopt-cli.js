#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const adapterModule = require("./skillopt-adapter");
const {
  appendSkillOptReceipt,
  evaluateSkillOptEvidence,
  skillOptFingerprint,
} = require("./skillopt-gate");

const MODE_FLAGS = new Map([
  ["--status", "status"],
  ["--fixture", "fixture"],
  ["--smoke", "smoke"],
  ["--prepare", "prepare"],
  ["--evaluate", "evaluate"],
]);

function parseSkillOptArgs(argv = []) {
  let mode = null;
  let target = null;
  let compact = false;
  let write = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--compact") {
      compact = true;
      continue;
    }
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (!MODE_FLAGS.has(arg)) throw new Error(`Unknown option or argument: ${arg}`);
    if (mode) throw new Error("Choose exactly one SkillOpt mode.");
    mode = MODE_FLAGS.get(arg);
    if ((mode === "prepare" || mode === "evaluate") && argv[index + 1] && !argv[index + 1].startsWith("--")) {
      target = argv[index + 1];
      index += 1;
    }
  }

  if (!mode) throw new Error("Choose exactly one SkillOpt mode: --status, --fixture, --smoke, --prepare, or --evaluate.");
  if (mode === "evaluate" && !target) throw new Error("--evaluate requires a run directory.");
  if (write && mode !== "evaluate") throw new Error("--write is only valid with --evaluate.");
  return { mode, compact, write, target };
}

function buildFixtureEvidence() {
  return {
    skilloptVersion: "0.2.0",
    sourceHash: "a".repeat(64),
    currentSourceHash: "a".repeat(64),
    baselineHash: "b".repeat(64),
    candidateHash: "c".repeat(64),
    validation: { baseline: 0.6, candidate: 0.7 },
    test: { baseline: 0.61, candidate: 0.62 },
    metrics: {
      baseline: { failures: 0, tokens: 1000, latencyMs: 100 },
      candidate: { failures: 0, tokens: 900, latencyMs: 95 },
    },
    splitIds: { train: ["train-1"], validation: ["val-1"], test: ["test-1"] },
    commands: [{ command: "skillopt-sleep run --fixture", exitCode: 0 }],
    productionWrites: [],
  };
}

function readJsonFile(file, label) {
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("must be a JSON object");
    return value;
  } catch (error) {
    throw new Error(`Invalid ${label}: ${error.message}`);
  }
}

function evaluateRunDirectory(runDirectory, options = {}) {
  const root = fs.realpathSync(path.resolve(options.root || process.cwd()));
  const adapter = { ...adapterModule, ...(options.adapter || {}) };
  const runPath = adapter.assertWorkspacePath(runDirectory, { root });
  if (!fs.statSync(runPath).isDirectory()) throw new Error("SkillOpt run directory must be a directory.");

  const manifestPath = adapter.assertWorkspacePath(path.join(runPath, "manifest.json"), { root: runPath });
  const evidencePath = adapter.assertWorkspacePath(path.join(runPath, "evidence.json"), { root: runPath });
  const manifest = readJsonFile(manifestPath, "SkillOpt run manifest");
  const upstreamEvidence = readJsonFile(evidencePath, "SkillOpt evidence");
  if (manifest.schema !== "kaizen7.skillopt_run.v1") throw new Error("Unsupported SkillOpt run manifest schema.");
  if (upstreamEvidence.schema !== "kaizen7.skillopt_evidence.v1") throw new Error("Unsupported SkillOpt evidence schema.");

  const sourcePath = adapter.assertWorkspacePath(path.join(root, manifest.sourceSkill || ""), { root });
  const baselinePath = adapter.assertWorkspacePath(path.join(runPath, manifest.baselineSkill || ""), { root: runPath });
  const candidatePath = adapter.assertWorkspacePath(path.join(runPath, manifest.candidateSkill || ""), { root: runPath });
  const currentSourceHash = adapter.sha256File(sourcePath);
  const baselineHash = adapter.sha256File(baselinePath);
  const candidateHash = adapter.sha256File(candidatePath);
  if (manifest.baselineHash !== baselineHash) throw new Error("SkillOpt baseline hash does not match the staged baseline.");
  if (manifest.candidateHash && manifest.candidateHash !== candidateHash) throw new Error("SkillOpt candidate hash does not match the manifest.");

  const productionWrites = [
    ...(Array.isArray(manifest.productionWrites) ? manifest.productionWrites : []),
    ...(Array.isArray(upstreamEvidence.productionWrites) ? upstreamEvidence.productionWrites : []),
  ];
  const input = {
    skilloptVersion: upstreamEvidence.skilloptVersion === manifest.skilloptVersion ? manifest.skilloptVersion : "",
    sourceHash: manifest.sourceHash,
    currentSourceHash,
    baselineHash,
    candidateHash,
    validation: upstreamEvidence.validation,
    test: upstreamEvidence.test,
    metrics: upstreamEvidence.metrics,
    splitIds: manifest.splits,
    commands: manifest.commands,
    productionWrites,
  };
  const baseReport = evaluateSkillOptEvidence(input);
  const reportManifest = {
    ...manifest,
    candidateHash,
    observedCurrentSourceHash: currentSourceHash,
  };
  const report = { ...baseReport, manifest: reportManifest };
  return { ...report, fingerprint: skillOptFingerprint(report) };
}

async function runSkillOptCommand(options = {}) {
  const args = options.args || parseSkillOptArgs([]);
  const root = path.resolve(options.root || process.cwd());
  const env = options.env || process.env;
  const adapter = { ...adapterModule, ...(options.adapter || {}) };

  if (args.mode === "fixture") {
    return { mode: "fixture", report: evaluateSkillOptEvidence(buildFixtureEvidence(), { simulated: true }), receipt: null };
  }
  if (args.mode === "status") {
    const runtime = await adapter.detectSkillOpt({ root, env, python: options.python, runner: options.runner });
    return {
      schema: "kaizen7.skillopt_status.v1",
      mode: "status",
      runtime,
      nextAction: runtime.status === "ready"
        ? "Run the credential-free SkillOpt smoke proof."
        : "Install the pinned optional SkillOpt 0.2.0 dependency in an isolated environment.",
    };
  }
  if (args.mode === "smoke") {
    const smoke = await adapter.runSkillOptSmoke({ root, env, python: options.python, runner: options.runner });
    return { mode: "smoke", smoke, nextAction: smoke.status === "passed" ? "Prepare the copied target skill." : "Keep SkillOpt disabled and inspect the smoke evidence." };
  }
  if (args.mode === "prepare") {
    const preparation = adapter.prepareSkillOptRun(args.target || undefined, { root, now: options.now });
    return { mode: "prepare", preparation, nextAction: "Populate the staged candidate and evidence files, then run --evaluate on this run directory." };
  }

  const report = evaluateRunDirectory(args.target, { root, adapter });
  const receipt = args.write ? appendSkillOptReceipt(report, { root, now: options.now }) : null;
  return { mode: "evaluate", report, receipt };
}

async function main() {
  try {
    const args = parseSkillOptArgs(process.argv.slice(2));
    const result = await runSkillOptCommand({ args });
    process.stdout.write(`${JSON.stringify(result, null, args.compact ? 0 : 2)}\n`);
  } catch (error) {
    process.stderr.write(`${adapterModule.redactProcessText(error.message)}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  buildFixtureEvidence,
  evaluateRunDirectory,
  parseSkillOptArgs,
  runSkillOptCommand,
};
