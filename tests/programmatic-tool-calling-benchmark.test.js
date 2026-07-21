const assert = require("node:assert/strict");
const {
  appendBenchmarkReceipt,
  checkProgrammaticToolCapability,
  judgeDiscoveryOutput,
  normalizeUsage,
  redactError,
  reportFingerprint,
  runProgrammaticToolBenchmark,
} = require("../lib/benchmarks/programmatic-tool-calling");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildFixtureExecutors,
  parseBenchmarkArgs,
  runBenchmarkCommand,
} = require("../lib/programmatic-tool-benchmark-cli");

const unavailable = checkProgrammaticToolCapability({
  version: "0.13.5",
  exports: { Agent() {}, run() {} },
});
assert.equal(unavailable.status, "unavailable");
assert.equal(unavailable.stable, true);

const prerelease = checkProgrammaticToolCapability({
  version: "0.14.0-beta.1",
  exports: { programmaticToolCallingTool() {} },
});
assert.equal(prerelease.status, "blocked");
assert.equal(prerelease.stable, false);

const ready = checkProgrammaticToolCapability({
  version: "0.14.0",
  exports: { programmaticToolCallingTool() {} },
});
assert.equal(ready.status, "ready");
assert.equal(ready.exportName, "programmaticToolCallingTool");

const invalid = checkProgrammaticToolCapability({
  version: "latest",
  exports: { programmaticToolCallingTool() {} },
});
assert.equal(invalid.status, "blocked");

const judged = judgeDiscoveryOutput({
  findings: [
    { source: "github", url: "https://github.com/org/repo", license: "MIT" },
    { source: "huggingface", url: "https://huggingface.co/org/model", license: "apache-2.0" },
  ],
  nextAction: "Run one local benchmark.",
});
assert.equal(judged.score, 100);
assert.equal(judged.licenseCoverage, 1);
assert.equal(judged.checks.githubPresent, true);
assert.equal(judged.checks.huggingFacePresent, true);

const incomplete = judgeDiscoveryOutput({
  findings: [
    { source: "github", url: "http://example.com/repo", license: "" },
  ],
  nextAction: ["First", "Second"],
});
assert(incomplete.score < 100);
assert.equal(incomplete.licenseCoverage, 0);
assert.equal(incomplete.checks.allUrlsVerified, false);
assert.equal(incomplete.checks.exactlyOneNextAction, false);

assert.deepEqual(normalizeUsage({}), {
  inputTokens: null,
  outputTokens: null,
  totalTokens: null,
});
assert.deepEqual(normalizeUsage({ input_tokens: 80, output_tokens: 20 }), {
  inputTokens: 80,
  outputTokens: 20,
  totalTokens: 100,
});
const redacted = redactError(new Error("Authorization: Bearer secret-token sk-project_123456789"));
assert.doesNotMatch(redacted, /secret-token|sk-project/);
assert.match(redacted, /REDACTED/);

const completeOutput = {
  findings: [
    { source: "github", url: "https://github.com/org/repo", license: "MIT", recommended: true },
    { source: "huggingface", url: "https://huggingface.co/org/model", license: "apache-2.0" },
  ],
  nextAction: "Run one local benchmark.",
};

function laneResult({ output = completeOutput, totalTokens, modelTurns, toolFailures = 0, elapsedMs }) {
  return {
    output,
    metrics: {
      usage: totalTokens === undefined ? {} : { totalTokens },
      modelTurns,
      toolCalls: 3,
      toolFailures,
      elapsedMs,
    },
  };
}

function benchmarkClock(values = [0, 100, 100, 190]) {
  let index = 0;
  return () => values[index++];
}

async function delayedLane(delayMs, options) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return laneResult(options);
}

const readyCapability = checkProgrammaticToolCapability({
  version: "0.14.0",
  exports: { programmaticToolCallingTool() {} },
});

assert.deepEqual(parseBenchmarkArgs([]), { mode: "dry-run", write: false, compact: false });
assert.deepEqual(parseBenchmarkArgs(["--live", "--compact"]), { mode: "live", write: false, compact: true });
assert.throws(() => parseBenchmarkArgs(["--fixture", "--live"]), /one benchmark mode/);
assert.throws(() => parseBenchmarkArgs(["--fixture", "--write"]), /requires --live/);
assert.throws(() => parseBenchmarkArgs(["--network"]), /Unknown option/);

const fixtureExecutors = buildFixtureExecutors();
assert.equal(typeof fixtureExecutors.baselineExecutor, "function");
assert.equal(typeof fixtureExecutors.candidateExecutor, "function");

(async () => {
  const fixtureCommandA = await runBenchmarkCommand({
    args: parseBenchmarkArgs(["--fixture"]),
    env: {},
  });
  const fixtureCommandB = await runBenchmarkCommand({
    args: parseBenchmarkArgs(["--fixture"]),
    env: {},
  });
  assert.equal(fixtureCommandA.report.fingerprint, fixtureCommandB.report.fingerprint);
  assert.equal(fixtureCommandA.report.simulated, true);
  assert.equal(fixtureCommandA.report.eligibleForPromotion, false);
  assert.match(fixtureCommandA.report.nextAction, /simulation/i);
  assert.doesNotMatch(fixtureCommandA.report.nextAction, /completed live receipt/i);
  assert.deepEqual(fixtureCommandA.report.baseline.output.findings.map((finding) => finding.source), ["github", "huggingface"]);
  assert(fixtureCommandA.report.baseline.output.findings.every((finding) => finding.license));

  let liveAdapterCalls = 0;
  const blockedLive = await runBenchmarkCommand({
    args: parseBenchmarkArgs(["--live"]),
    env: {},
    sdkInfo: { version: "0.13.5", exports: { Agent() {}, run() {} } },
    liveAdapter: async () => {
      liveAdapterCalls += 1;
      return buildFixtureExecutors();
    },
  });
  assert.equal(blockedLive.report.blocked, true);
  assert.equal(liveAdapterCalls, 0);

  const missingKey = await runBenchmarkCommand({
    args: parseBenchmarkArgs(["--live"]),
    env: {},
    sdkInfo: { version: "0.14.0", exports: { programmaticToolCallingTool() {} } },
    liveAdapter: async () => {
      liveAdapterCalls += 1;
      return buildFixtureExecutors();
    },
  });
  assert.equal(missingKey.report.blocked, true);
  assert.match(missingKey.report.reason, /OPENAI_API_KEY/);
  assert.equal(liveAdapterCalls, 0);

  const adopted = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mission: { objective: "Compare the same discovery mission." },
    mode: "live",
    baselineExecutor: async () => delayedLane(30, { totalTokens: 1000, modelTurns: 5, elapsedMs: 1 }),
    candidateExecutor: async () => delayedLane(30, { totalTokens: 800, modelTurns: 4, elapsedMs: 1 }),
    now: () => "2026-07-21T09:00:00.000Z",
  });
  assert.equal(adopted.verdict, "adopt");
  assert.equal(adopted.deltas.totalTokensPercent, -20);
  assert.equal(adopted.deltas.modelTurnsPercent, -20);
  assert.equal(adopted.eligibleForPromotion, true);

  const measuredRegression = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "live",
    baselineExecutor: async () => delayedLane(20, { totalTokens: 1000, modelTurns: 5, elapsedMs: 1 }),
    candidateExecutor: async () => delayedLane(70, { totalTokens: 700, modelTurns: 3, elapsedMs: 1 }),
    clock: benchmarkClock([0, 100, 100, 101]),
  });
  assert(measuredRegression.candidate.metrics.elapsedMs >= 50);
  assert.equal(measuredRegression.verdict, "hold");

  const githubOnlyOutput = {
    findings: [
      { source: "github", url: "https://github.com/org/repo", license: "MIT" },
    ],
    nextAction: "Run one local benchmark.",
  };
  const missionInvalid = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "live",
    baselineExecutor: async () => laneResult({ output: githubOnlyOutput, totalTokens: 1000, modelTurns: 5 }),
    candidateExecutor: async () => laneResult({ output: githubOnlyOutput, totalTokens: 700, modelTurns: 3 }),
    clock: benchmarkClock(),
  });
  assert.equal(missionInvalid.verdict, "reject");
  assert.equal(missionInvalid.eligibleForPromotion, false);

  const unknownFailures = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "live",
    baselineExecutor: async () => laneResult({ totalTokens: 1000, modelTurns: 5 }),
    candidateExecutor: async () => ({
      output: completeOutput,
      metrics: {
        usage: { totalTokens: 700 },
        modelTurns: 3,
        toolCalls: 3,
      },
    }),
    clock: benchmarkClock(),
  });
  assert.equal(unknownFailures.candidate.metrics.toolFailures, null);
  assert.equal(unknownFailures.verdict, "reject");
  assert.equal(unknownFailures.eligibleForPromotion, false);

  let fakeCapabilityCalls = 0;
  const fakeStableCapability = {
    status: "ready",
    version: "fixture-only",
    stable: true,
    exportName: "programmaticToolCallingTool",
    reason: "Caller-declared capability.",
  };
  const fakeLive = await runProgrammaticToolBenchmark({
    capability: fakeStableCapability,
    mode: "live",
    baselineExecutor: async () => {
      fakeCapabilityCalls += 1;
      return laneResult({ totalTokens: 1000, modelTurns: 5 });
    },
    candidateExecutor: async () => {
      fakeCapabilityCalls += 1;
      return laneResult({ totalTokens: 700, modelTurns: 3 });
    },
  });
  assert.equal(fakeLive.verdict, "waiting_for_stable_sdk");
  assert.equal(fakeCapabilityCalls, 0);

  const missingLicenseOutput = {
    ...completeOutput,
    findings: completeOutput.findings.map((finding, index) => index === 1 ? { ...finding, license: "" } : finding),
  };
  const rejectedLicense = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "fixture",
    baselineExecutor: async () => laneResult({ totalTokens: 1000, modelTurns: 5, elapsedMs: 100 }),
    candidateExecutor: async () => laneResult({ output: missingLicenseOutput, totalTokens: 700, modelTurns: 3, elapsedMs: 80 }),
    clock: benchmarkClock(),
  });
  assert.equal(rejectedLicense.verdict, "reject");

  const rejectedFailure = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "fixture",
    baselineExecutor: async () => laneResult({ totalTokens: 1000, modelTurns: 5, elapsedMs: 100 }),
    candidateExecutor: async () => laneResult({ totalTokens: 700, modelTurns: 3, toolFailures: 1, elapsedMs: 80 }),
    clock: benchmarkClock(),
  });
  assert.equal(rejectedFailure.verdict, "reject");

  let executorCalls = 0;
  const waiting = await runProgrammaticToolBenchmark({
    capability: unavailable,
    baselineExecutor: async () => { executorCalls += 1; },
    candidateExecutor: async () => { executorCalls += 1; },
  });
  assert.equal(waiting.verdict, "waiting_for_stable_sdk");
  assert.equal(executorCalls, 0);

  const unknownUsage = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "fixture",
    baselineExecutor: async () => laneResult({ modelTurns: 5, elapsedMs: 100 }),
    candidateExecutor: async () => laneResult({ modelTurns: 5, elapsedMs: 100 }),
    clock: benchmarkClock([0, 100, 100, 200]),
  });
  assert.equal(unknownUsage.baseline.metrics.usage.totalTokens, null);
  assert.equal(unknownUsage.deltas.totalTokensPercent, null);

  const fixture = await runProgrammaticToolBenchmark({
    capability: readyCapability,
    mode: "fixture",
    baselineExecutor: async () => laneResult({ totalTokens: 1000, modelTurns: 5, elapsedMs: 100 }),
    candidateExecutor: async () => laneResult({ totalTokens: 800, modelTurns: 4, elapsedMs: 90 }),
    clock: benchmarkClock(),
  });
  assert.equal(fixture.verdict, "adopt");
  assert.equal(fixture.simulated, true);
  assert.equal(fixture.eligibleForPromotion, false);
  assert.throws(() => appendBenchmarkReceipt(fixture), /completed live benchmark/);

  const tamperedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-ptc-tampered-"));
  assert.throws(
    () => appendBenchmarkReceipt({ ...adopted, verdict: "hold" }, { root: tamperedRoot }),
    /fingerprint integrity/i,
  );
  assert.throws(
    () => appendBenchmarkReceipt({ ...adopted, fingerprint: "forged" }, { root: tamperedRoot }),
    /fingerprint integrity/i,
  );
  const invalidCapabilityReport = {
    ...adopted,
    capability: fakeStableCapability,
    fingerprint: null,
  };
  invalidCapabilityReport.fingerprint = reportFingerprint(invalidCapabilityReport);
  assert.throws(
    () => appendBenchmarkReceipt(invalidCapabilityReport, { root: tamperedRoot }),
    /invariants.*invalid/i,
  );
  const unsafeActionReport = {
    ...adopted,
    nextAction: "Deploy immediately without review.",
    fingerprint: null,
  };
  unsafeActionReport.fingerprint = reportFingerprint(unsafeActionReport);
  assert.throws(
    () => appendBenchmarkReceipt(unsafeActionReport, { root: tamperedRoot }),
    /next action.*inconsistent/i,
  );
  assert.equal(fs.existsSync(path.join(tamperedRoot, "data", "benchmarks", "programmatic-tool-calling.jsonl")), false);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-ptc-receipt-"));
  const firstWrite = appendBenchmarkReceipt(adopted, { root });
  const secondWrite = appendBenchmarkReceipt(adopted, { root });
  assert.equal(firstWrite.status, "stored");
  assert.equal(secondWrite.status, "duplicate");
  assert.equal(firstWrite.path, "data/benchmarks/programmatic-tool-calling.jsonl");
  const lines = fs.readFileSync(path.join(root, firstWrite.path), "utf8").trim().split("\n");
  assert.equal(lines.length, 1);

  console.log("programmatic tool calling benchmark tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
