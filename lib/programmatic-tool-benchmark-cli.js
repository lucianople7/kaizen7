#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const {
  DEFAULT_MISSION,
  REQUIRED_EXPORT,
  appendBenchmarkReceipt,
  checkProgrammaticToolCapability,
  redactError,
  runProgrammaticToolBenchmark,
} = require("./benchmarks/programmatic-tool-calling");

function parseBenchmarkArgs(argv = []) {
  const allowed = new Set(["--dry-run", "--fixture", "--live", "--write", "--compact"]);
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown option: ${arg}`);
  }
  const modes = ["--dry-run", "--fixture", "--live"].filter((flag) => argv.includes(flag));
  if (modes.length > 1) throw new Error("Choose exactly one benchmark mode.");
  const mode = modes[0] ? modes[0].slice(2) : "dry-run";
  const write = argv.includes("--write");
  if (write && mode !== "live") throw new Error("--write requires --live.");
  return { mode, write, compact: argv.includes("--compact") };
}

function findPackageJson(entryPath) {
  let directory = path.dirname(entryPath);
  while (directory !== path.dirname(directory)) {
    const candidate = path.join(directory, "package.json");
    if (fs.existsSync(candidate)) return candidate;
    directory = path.dirname(directory);
  }
  return null;
}

async function loadInstalledAgentsSdk() {
  try {
    const entryPath = require.resolve("@openai/agents");
    const packagePath = findPackageJson(entryPath);
    if (!packagePath) throw new Error("Installed @openai/agents package metadata was not found.");
    const metadata = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    const exports = await import("@openai/agents");
    return { version: metadata.version, exports, loadError: null };
  } catch (error) {
    return { version: null, exports: null, loadError: redactError(error) };
  }
}

function fixtureOutput() {
  return {
    findings: [
      {
        source: "github",
        url: "https://github.com/openai/openai-agents-js",
        license: "MIT",
        recommended: true,
      },
      {
        source: "huggingface",
        url: "https://huggingface.co/openai",
        license: "explicit-license-state",
        recommended: false,
      },
    ],
    nextAction: "Wait for stable SDK evidence before a live benchmark.",
  };
}

function buildFixtureExecutors() {
  return {
    baselineExecutor: async () => ({
      output: fixtureOutput(),
      metrics: {
        elapsedMs: 100,
        modelTurns: 5,
        usage: { inputTokens: 850, outputTokens: 150, totalTokens: 1000 },
        toolCalls: 3,
        toolFailures: 0,
      },
    }),
    candidateExecutor: async () => ({
      output: fixtureOutput(),
      metrics: {
        elapsedMs: 90,
        modelTurns: 4,
        usage: { inputTokens: 680, outputTokens: 120, totalTokens: 800 },
        toolCalls: 3,
        toolFailures: 0,
      },
    }),
  };
}

function fixtureClock() {
  const values = [0, 100, 100, 190];
  let index = 0;
  return () => values[index++];
}

function blockedLiveReport(capability, reason) {
  return {
    schema: "kaizen7.programmatic_tool_benchmark.live_gate.v1",
    mode: "live",
    blocked: true,
    simulated: false,
    eligibleForPromotion: false,
    capability,
    baseline: null,
    candidate: null,
    deltas: null,
    verdict: capability.status === "ready" ? "hold" : "waiting_for_stable_sdk",
    reason,
    nextAction: capability.status === "ready"
      ? "Keep live execution disabled until its explicit safety requirement is satisfied."
      : `Wait for a stable SDK exposing ${REQUIRED_EXPORT}.`,
  };
}

function dryRunReport(capability) {
  return {
    schema: "kaizen7.programmatic_tool_benchmark.readiness.v1",
    mode: "dry-run",
    blocked: capability.status !== "ready",
    simulated: false,
    eligibleForPromotion: false,
    mission: DEFAULT_MISSION,
    capability,
    contract: {
      sources: ["github", "huggingface"],
      requiresLicenseEvidence: true,
      adoptionThresholdPercent: 20,
      maximumElapsedRegressionPercent: 25,
    },
    verdict: capability.status === "ready" ? "hold" : "waiting_for_stable_sdk",
    nextAction: capability.status === "ready"
      ? "Implement the live adapter against the documented stable API under TDD."
      : `Wait for a stable SDK exposing ${REQUIRED_EXPORT}.`,
  };
}

async function runBenchmarkCommand(options = {}) {
  const args = options.args || parseBenchmarkArgs([]);
  const env = options.env || process.env;

  if (args.mode === "fixture") {
    const capability = {
      status: "ready",
      version: "fixture-only",
      stable: true,
      exportName: REQUIRED_EXPORT,
      reason: "Deterministic fixture capability; not SDK evidence.",
    };
    const report = await runProgrammaticToolBenchmark({
      capability,
      mode: "fixture",
      mission: DEFAULT_MISSION,
      ...buildFixtureExecutors(),
      clock: fixtureClock(),
      now: () => "2026-07-21T09:00:00.000Z",
    });
    return { report, receipt: null };
  }

  const sdkInfo = options.sdkInfo || await loadInstalledAgentsSdk();
  const capability = checkProgrammaticToolCapability(sdkInfo);
  if (args.mode === "dry-run") return { report: dryRunReport(capability), receipt: null };

  if (capability.status !== "ready") {
    return { report: blockedLiveReport(capability, capability.reason), receipt: null };
  }
  if (!env.OPENAI_API_KEY) {
    return { report: blockedLiveReport(capability, "OPENAI_API_KEY is required for an explicit live run."), receipt: null };
  }
  if (typeof options.liveAdapter !== "function") {
    return {
      report: blockedLiveReport(
        capability,
        "The live adapter remains disabled until the stable API is documented and implemented under TDD.",
      ),
      receipt: null,
    };
  }

  const executors = await options.liveAdapter({ sdkInfo, capability, mission: DEFAULT_MISSION });
  const report = await runProgrammaticToolBenchmark({
    capability,
    mode: "live",
    mission: DEFAULT_MISSION,
    baselineExecutor: executors.baselineExecutor,
    candidateExecutor: executors.candidateExecutor,
  });
  const receipt = args.write ? appendBenchmarkReceipt(report, { root: options.root }) : null;
  return { report, receipt };
}

async function main() {
  try {
    const args = parseBenchmarkArgs(process.argv.slice(2));
    const result = await runBenchmarkCommand({ args });
    process.stdout.write(`${JSON.stringify(result, null, args.compact ? 0 : 2)}\n`);
  } catch (error) {
    process.stderr.write(`${redactError(error)}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = {
  buildFixtureExecutors,
  loadInstalledAgentsSdk,
  parseBenchmarkArgs,
  runBenchmarkCommand,
};
