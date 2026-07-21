const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const REQUIRED_EXPORT = "programmaticToolCallingTool";
const RECEIPT_RELATIVE_PATH = path.join("data", "benchmarks", "programmatic-tool-calling.jsonl");
const DEFAULT_MISSION = Object.freeze({
  objective: "Find one GitHub signal and one Hugging Face signal, verify both licenses, and return one next action.",
  sources: Object.freeze(["github", "huggingface"]),
});

function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function metric(value) {
  return isNonNegativeNumber(value) ? value : null;
}

function isStableSemver(version) {
  return typeof version === "string"
    && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version.trim());
}

function capabilityIsStableReady(capability) {
  return capability?.status === "ready"
    && capability.stable === true
    && isStableSemver(capability.version)
    && capability.exportName === REQUIRED_EXPORT;
}

function checkProgrammaticToolCapability(input = {}) {
  const version = typeof input.version === "string" ? input.version.trim() : "";
  const stableVersion = isStableSemver(version);
  const prereleaseVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-[0-9A-Za-z.-]+$/.test(version);

  if (input.loadError) {
    return {
      status: "blocked",
      version: version || null,
      stable: false,
      exportName: REQUIRED_EXPORT,
      reason: "The installed SDK could not be inspected safely.",
    };
  }

  if (!stableVersion) {
    return {
      status: "blocked",
      version: version || null,
      stable: false,
      exportName: REQUIRED_EXPORT,
      reason: prereleaseVersion
        ? "Prerelease SDK versions are not eligible for this benchmark."
        : "The installed SDK version is missing or invalid.",
    };
  }

  if (!input.exports || typeof input.exports !== "object") {
    return {
      status: "blocked",
      version,
      stable: true,
      exportName: REQUIRED_EXPORT,
      reason: "The installed SDK public export shape is invalid.",
    };
  }

  if (typeof input.exports[REQUIRED_EXPORT] !== "function") {
    return {
      status: "unavailable",
      version,
      stable: true,
      exportName: REQUIRED_EXPORT,
      reason: `Stable SDK ${version} does not expose ${REQUIRED_EXPORT}.`,
    };
  }

  return {
    status: "ready",
    version,
    stable: true,
    exportName: REQUIRED_EXPORT,
    reason: `Stable SDK ${version} exposes ${REQUIRED_EXPORT}.`,
  };
}

function normalizeUsage(usage = {}) {
  const inputTokens = metric(usage.inputTokens ?? usage.input_tokens);
  const outputTokens = metric(usage.outputTokens ?? usage.output_tokens);
  const suppliedTotal = metric(usage.totalTokens ?? usage.total_tokens);
  const totalTokens = suppliedTotal ?? (
    inputTokens !== null && outputTokens !== null
      ? inputTokens + outputTokens
      : null
  );
  return { inputTokens, outputTokens, totalTokens };
}

function asFindings(output = {}) {
  return Array.isArray(output.findings)
    ? output.findings.filter((finding) => finding && typeof finding === "object")
    : [];
}

function hasLicense(finding) {
  return typeof (finding.license ?? finding.licenseState) === "string"
    && String(finding.license ?? finding.licenseState).trim().length > 0;
}

function judgeDiscoveryOutput(output = {}) {
  const findings = asFindings(output);
  const nextActions = Array.isArray(output.nextAction)
    ? output.nextAction.filter((action) => typeof action === "string" && action.trim())
    : typeof output.nextAction === "string" && output.nextAction.trim()
      ? [output.nextAction]
      : [];
  const checks = {
    githubPresent: findings.some((finding) => String(finding.source).toLowerCase() === "github"),
    huggingFacePresent: findings.some((finding) => ["huggingface", "hugging_face"].includes(String(finding.source).toLowerCase())),
    allUrlsVerified: findings.length > 0 && findings.every((finding) => {
      try {
        return new URL(finding.url).protocol === "https:";
      } catch {
        return false;
      }
    }),
    allLicensesExplicit: findings.length > 0 && findings.every(hasLicense),
    exactlyOneNextAction: nextActions.length === 1,
    noBlockedRecommendation: !findings.some((finding) => finding.blocked === true && finding.recommended === true),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const licensed = findings.filter(hasLicense).length;
  return {
    score: Math.round((passed / Object.keys(checks).length) * 100),
    checks,
    licenseCoverage: findings.length ? licensed / findings.length : 0,
  };
}

function redactError(error) {
  const raw = error instanceof Error ? error.message : String(error || "Unknown lane error");
  return raw
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_API_KEY]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, "Bearer [REDACTED]");
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) deepFreeze(item);
  return value;
}

function cloneMission(mission) {
  return deepFreeze(JSON.parse(JSON.stringify(mission || DEFAULT_MISSION)));
}

function normalizeCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function normalizeLaneResult(result, measuredElapsedMs) {
  const payload = result && typeof result === "object" ? result : {};
  const metrics = payload.metrics && typeof payload.metrics === "object" ? payload.metrics : {};
  const output = payload.output && typeof payload.output === "object" ? payload.output : {};
  const elapsedMs = Number(measuredElapsedMs.toFixed(2));
  return {
    status: "completed",
    output,
    quality: judgeDiscoveryOutput(output),
    metrics: {
      elapsedMs,
      modelTurns: normalizeCount(metrics.modelTurns),
      usage: normalizeUsage(metrics.usage),
      toolCalls: normalizeCount(metrics.toolCalls),
      toolFailures: normalizeCount(metrics.toolFailures),
    },
    error: null,
  };
}

async function executeLane(executor, mission, clock) {
  if (typeof executor !== "function") {
    return {
      status: "failed",
      output: {},
      quality: judgeDiscoveryOutput({}),
      metrics: {
        elapsedMs: null,
        modelTurns: null,
        usage: normalizeUsage({}),
        toolCalls: null,
        toolFailures: 1,
      },
      error: "Lane executor is not configured.",
    };
  }
  const started = clock();
  try {
    const result = await executor(mission);
    return normalizeLaneResult(result, Math.max(0, clock() - started));
  } catch (error) {
    return {
      status: "failed",
      output: {},
      quality: judgeDiscoveryOutput({}),
      metrics: {
        elapsedMs: Number(Math.max(0, clock() - started).toFixed(2)),
        modelTurns: null,
        usage: normalizeUsage({}),
        toolCalls: null,
        toolFailures: 1,
      },
      error: redactError(error),
    };
  }
}

function percentDelta(baseline, candidate) {
  if (!isNonNegativeNumber(baseline) || !isNonNegativeNumber(candidate) || baseline === 0) return null;
  return Number((((candidate - baseline) / baseline) * 100).toFixed(2));
}

function buildDeltas(baseline, candidate) {
  if (!baseline || !candidate) {
    return {
      elapsedMsPercent: null,
      modelTurnsPercent: null,
      totalTokensPercent: null,
      toolFailures: null,
      qualityScore: null,
      licenseCoverage: null,
    };
  }
  return {
    elapsedMsPercent: percentDelta(baseline.metrics.elapsedMs, candidate.metrics.elapsedMs),
    modelTurnsPercent: percentDelta(baseline.metrics.modelTurns, candidate.metrics.modelTurns),
    totalTokensPercent: percentDelta(baseline.metrics.usage.totalTokens, candidate.metrics.usage.totalTokens),
    toolFailures: baseline.metrics.toolFailures === null || candidate.metrics.toolFailures === null
      ? null
      : candidate.metrics.toolFailures - baseline.metrics.toolFailures,
    qualityScore: candidate.quality.score - baseline.quality.score,
    licenseCoverage: Number((candidate.quality.licenseCoverage - baseline.quality.licenseCoverage).toFixed(4)),
  };
}

function laneIsComplete(lane) {
  if (!lane || lane.status !== "completed") return false;
  const contractComplete = Object.values(lane.quality.checks).every(Boolean)
    && lane.quality.licenseCoverage === 1;
  const metricsComplete = lane.metrics.toolCalls !== null
    && lane.metrics.toolFailures !== null
    && (lane.metrics.modelTurns !== null || lane.metrics.usage.totalTokens !== null);
  return contractComplete && metricsComplete;
}

function chooseVerdict(baseline, candidate, deltas) {
  if (!laneIsComplete(baseline) || !laneIsComplete(candidate)) return "reject";
  if (
    candidate.quality.score < baseline.quality.score
    || candidate.quality.licenseCoverage < baseline.quality.licenseCoverage
    || candidate.quality.licenseCoverage < 1
    || deltas.toolFailures === null
    || deltas.toolFailures > 0
  ) return "reject";
  const materiallyImproved = deltas.totalTokensPercent !== null && deltas.totalTokensPercent <= -20
    || deltas.modelTurnsPercent !== null && deltas.modelTurnsPercent <= -20;
  const elapsedRegression = deltas.elapsedMsPercent !== null && deltas.elapsedMsPercent > 25;
  return materiallyImproved && !elapsedRegression ? "adopt" : "hold";
}

function nextActionFor(verdict) {
  if (verdict === "adopt") return "Review the completed live receipt before changing Repo Hunter production behavior.";
  if (verdict === "reject") return "Keep the baseline route and inspect the candidate evidence gap.";
  if (verdict === "hold") return "Keep the baseline route and rerun only after a material SDK or adapter change.";
  return "Wait for a normal stable @openai/agents release exposing programmaticToolCallingTool.";
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function reportFingerprint(report) {
  const evidence = {
    schema: report.schema,
    mode: report.mode,
    mission: report.mission,
    capability: report.capability,
    baseline: report.baseline,
    candidate: report.candidate,
    deltas: report.deltas,
    verdict: report.verdict,
    nextAction: report.nextAction,
  };
  return crypto.createHash("sha256").update(stableStringify(evidence)).digest("hex");
}

function finalizeReport(report) {
  return { ...report, fingerprint: reportFingerprint(report) };
}

async function runProgrammaticToolBenchmark(options = {}) {
  let capability = options.capability || {
    status: "blocked",
    version: null,
    stable: false,
    exportName: REQUIRED_EXPORT,
    reason: "Capability evidence was not supplied.",
  };
  const mission = cloneMission(options.mission);
  const mode = options.mode || "dry-run";
  if (mode === "live" && capability.status === "ready" && !capabilityIsStableReady(capability)) {
    capability = {
      ...capability,
      status: "blocked",
      stable: false,
      reason: `Live evidence requires a stable semantic version and the ${REQUIRED_EXPORT} export.`,
    };
  }
  const clock = mode === "fixture" && typeof options.clock === "function"
    ? options.clock
    : () => performance.now();
  const completedAt = typeof options.now === "function" ? options.now() : new Date().toISOString();

  if (capability.status !== "ready") {
    return finalizeReport({
      schema: "kaizen7.programmatic_tool_benchmark.v1",
      mode,
      simulated: mode === "fixture",
      eligibleForPromotion: false,
      mission,
      capability,
      baseline: null,
      candidate: null,
      deltas: buildDeltas(null, null),
      verdict: "waiting_for_stable_sdk",
      nextAction: nextActionFor("waiting_for_stable_sdk"),
      completedAt,
    });
  }

  const baseline = await executeLane(options.baselineExecutor, mission, clock);
  const candidate = await executeLane(options.candidateExecutor, mission, clock);
  const deltas = buildDeltas(baseline, candidate);
  const verdict = chooseVerdict(baseline, candidate, deltas);
  const nextAction = mode === "fixture"
    ? "Use this simulation only to verify the harness; wait for stable SDK evidence before a live run."
    : nextActionFor(verdict);
  return finalizeReport({
    schema: "kaizen7.programmatic_tool_benchmark.v1",
    mode,
    simulated: mode === "fixture",
    eligibleForPromotion: mode === "live" && verdict === "adopt",
    mission,
    capability,
    baseline,
    candidate,
    deltas,
    verdict,
    nextAction,
    completedAt,
  });
}

function appendBenchmarkReceipt(report, options = {}) {
  if (
    !report
    || report.mode !== "live"
    || report.baseline?.status !== "completed"
    || report.candidate?.status !== "completed"
    || !report.fingerprint
  ) {
    throw new Error("Receipts require a completed live benchmark with a fingerprint.");
  }
  const expectedFingerprint = reportFingerprint(report);
  if (report.fingerprint !== expectedFingerprint) {
    throw new Error("Benchmark receipt fingerprint integrity check failed.");
  }
  if (
    report.schema !== "kaizen7.programmatic_tool_benchmark.v1"
    || report.simulated !== false
    || !capabilityIsStableReady(report.capability)
    || !laneIsComplete(report.baseline)
    || !laneIsComplete(report.candidate)
  ) {
    throw new Error("Benchmark receipt invariants are incomplete or invalid.");
  }
  const expectedDeltas = buildDeltas(report.baseline, report.candidate);
  const expectedVerdict = chooseVerdict(report.baseline, report.candidate, expectedDeltas);
  if (report.nextAction !== nextActionFor(expectedVerdict)) {
    throw new Error("Benchmark receipt next action is inconsistent with its verdict.");
  }
  if (
    stableStringify(report.deltas) !== stableStringify(expectedDeltas)
    || report.verdict !== expectedVerdict
    || report.eligibleForPromotion !== (expectedVerdict === "adopt")
  ) {
    throw new Error("Benchmark receipt verdict evidence is inconsistent.");
  }
  const root = options.root || process.cwd();
  const receiptPath = path.join(root, RECEIPT_RELATIVE_PATH);
  const portablePath = RECEIPT_RELATIVE_PATH.replaceAll("\\", "/");
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  const existing = fs.existsSync(receiptPath) ? fs.readFileSync(receiptPath, "utf8") : "";
  const duplicate = existing.split(/\r?\n/).filter(Boolean).some((line) => {
    try {
      return JSON.parse(line).fingerprint === report.fingerprint;
    } catch {
      return false;
    }
  });
  if (duplicate) return { status: "duplicate", path: portablePath, fingerprint: report.fingerprint };
  fs.appendFileSync(receiptPath, `${JSON.stringify(report)}\n`, "utf8");
  return { status: "stored", path: portablePath, fingerprint: report.fingerprint };
}

module.exports = {
  DEFAULT_MISSION,
  REQUIRED_EXPORT,
  RECEIPT_RELATIVE_PATH,
  appendBenchmarkReceipt,
  checkProgrammaticToolCapability,
  judgeDiscoveryOutput,
  normalizeUsage,
  redactError,
  reportFingerprint,
  runProgrammaticToolBenchmark,
};
