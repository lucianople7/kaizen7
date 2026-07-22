const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SUPPORTED_SKILLOPT_VERSION = "0.2.0";
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const RECEIPT_PATH = path.join("data", "skillopt", "receipts.jsonl");

function numberOrNull(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function normalizeMetricLane(lane = {}) {
  return {
    failures: numberOrNull(lane.failures),
    tokens: numberOrNull(lane.tokens),
    latencyMs: numberOrNull(lane.latencyMs),
  };
}

function normalizeScores(scores = {}) {
  return {
    baseline: numberOrNull(scores.baseline),
    candidate: numberOrNull(scores.candidate),
  };
}

function normalizeHash(value) {
  const hash = String(value || "").trim().toLowerCase();
  return SHA256_PATTERN.test(hash) ? hash : "";
}

function normalizeIds(value) {
  return Array.isArray(value) ? [...new Set(value.map((item) => String(item).trim()).filter(Boolean))] : [];
}

function normalizeCommands(value) {
  return Array.isArray(value) ? value.map((item) => ({
    command: String(item?.command || "").trim(),
    exitCode: Number.isInteger(item?.exitCode) ? item.exitCode : null,
  })) : [];
}

function normalizeSkillOptEvidence(input = {}) {
  return {
    skilloptVersion: String(input.skilloptVersion || "").trim(),
    sourceHash: normalizeHash(input.sourceHash),
    currentSourceHash: normalizeHash(input.currentSourceHash),
    baselineHash: normalizeHash(input.baselineHash),
    candidateHash: normalizeHash(input.candidateHash),
    validation: normalizeScores(input.validation),
    test: normalizeScores(input.test),
    metrics: {
      baseline: normalizeMetricLane(input.metrics?.baseline),
      candidate: normalizeMetricLane(input.metrics?.candidate),
    },
    splitIds: {
      train: normalizeIds(input.splitIds?.train),
      validation: normalizeIds(input.splitIds?.validation),
      test: normalizeIds(input.splitIds?.test),
    },
    commands: normalizeCommands(input.commands),
    commandsDeclared: Array.isArray(input.commands),
    productionWrites: Array.isArray(input.productionWrites)
      ? input.productionWrites.map((item) => String(item)).filter(Boolean)
      : [],
    productionWritesDeclared: Array.isArray(input.productionWrites),
  };
}

function hasCompleteRequiredEvidence(evidence) {
  return evidence.skilloptVersion === SUPPORTED_SKILLOPT_VERSION
    && Boolean(evidence.sourceHash)
    && Boolean(evidence.currentSourceHash)
    && Boolean(evidence.baselineHash)
    && Boolean(evidence.candidateHash)
    && evidence.validation.baseline !== null
    && evidence.validation.candidate !== null
    && evidence.test.baseline !== null
    && evidence.test.candidate !== null
    && evidence.metrics.baseline.failures !== null
    && evidence.metrics.candidate.failures !== null
    && evidence.splitIds.train.length > 0
    && evidence.splitIds.validation.length > 0
    && evidence.splitIds.test.length > 0
    && evidence.commandsDeclared
    && evidence.commands.length > 0
    && evidence.commands.every((item) => item.command && item.exitCode !== null)
    && evidence.productionWritesDeclared;
}

function rejectionReasons(evidence) {
  const reasons = [];
  if (evidence.sourceHash !== evidence.currentSourceHash) reasons.push("source_hash_changed");
  if (evidence.baselineHash === evidence.candidateHash) reasons.push("candidate_matches_baseline");
  if (evidence.test.candidate < evidence.test.baseline) reasons.push("held_out_regression");
  if (evidence.metrics.candidate.failures > evidence.metrics.baseline.failures) reasons.push("new_failures");
  if (evidence.commands.some((item) => item.exitCode !== 0)) reasons.push("failed_run_command");
  if (evidence.productionWrites.length) reasons.push("production_write_detected");
  return reasons;
}

function incompletenessReasons(evidence) {
  const reasons = [];
  if (evidence.skilloptVersion !== SUPPORTED_SKILLOPT_VERSION) reasons.push("unsupported_skillopt_version");
  if (!evidence.sourceHash) reasons.push("missing_source_hash");
  if (!evidence.currentSourceHash) reasons.push("missing_current_source_hash");
  if (!evidence.baselineHash) reasons.push("missing_baseline_hash");
  if (!evidence.candidateHash) reasons.push("missing_candidate_hash");
  if (evidence.validation.baseline === null || evidence.validation.candidate === null) reasons.push("missing_validation_scores");
  if (evidence.test.baseline === null || evidence.test.candidate === null) reasons.push("missing_held_out_scores");
  if (evidence.metrics.baseline.failures === null || evidence.metrics.candidate.failures === null) reasons.push("missing_failure_counts");
  if (!evidence.splitIds.train.length || !evidence.splitIds.validation.length || !evidence.splitIds.test.length) reasons.push("missing_split_identifiers");
  if (!evidence.commandsDeclared || !evidence.commands.length || evidence.commands.some((item) => !item.command || item.exitCode === null)) reasons.push("missing_run_commands");
  if (!evidence.productionWritesDeclared) reasons.push("missing_production_write_declaration");
  return reasons;
}

function nextActionFor(verdict, simulated) {
  if (simulated) return "Run a real supported SkillOpt evaluation; simulation evidence cannot be promoted.";
  if (verdict === "promotable") return "Prepare a separate human-reviewed patch from the staged candidate; do not overwrite the source skill.";
  if (verdict === "hold") return "Keep the current skill and collect a candidate with a strict validation improvement.";
  if (verdict === "reject") return "Discard this candidate and preserve the current production skill.";
  return "Complete the missing supported-version, hash, validation, held-out, and failure evidence before deciding.";
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function skillOptFingerprint(report = {}) {
  const payload = {
    schema: report.schema,
    simulated: report.simulated === true,
    evidence: report.evidence,
    manifest: report.manifest,
    verdict: report.verdict,
    reasons: report.reasons,
    nextAction: report.nextAction,
  };
  const digest = crypto.createHash("sha256").update(JSON.stringify(stableValue(payload))).digest("hex");
  return `k7so_${digest.slice(0, 16)}`;
}

function evaluateSkillOptEvidence(input = {}, options = {}) {
  const evidence = normalizeSkillOptEvidence(input);
  const incomplete = incompletenessReasons(evidence);
  const rejected = incomplete.length ? [] : rejectionReasons(evidence);
  let verdict = "promotable";
  let reasons = [];

  if (!hasCompleteRequiredEvidence(evidence)) {
    verdict = "incomplete";
    reasons = incomplete;
  } else if (rejected.length) {
    verdict = "reject";
    reasons = rejected;
  } else if (evidence.validation.candidate <= evidence.validation.baseline) {
    verdict = "hold";
    reasons = ["no_strict_validation_improvement"];
  } else {
    reasons = ["strict_validation_improvement", "held_out_non_regression", "no_new_failures"];
  }

  const simulated = options.simulated === true;
  const report = {
    schema: "kaizen7.skillopt_evaluation.v1",
    simulated,
    evidence,
    verdict,
    reasons,
    eligibleForPromotion: verdict === "promotable" && !simulated,
    nextAction: nextActionFor(verdict, simulated),
  };
  return { ...report, fingerprint: skillOptFingerprint(report) };
}

function appendSkillOptReceipt(report = {}, options = {}) {
  if (report.schema !== "kaizen7.skillopt_evaluation.v1") throw new Error("Invalid SkillOpt evaluation schema.");
  if (report.simulated === true) throw new Error("Simulated SkillOpt evaluations cannot be written as receipts.");
  if (report.verdict === "incomplete") throw new Error("Incomplete SkillOpt evaluations cannot be written as receipts.");
  const expectedFingerprint = skillOptFingerprint(report);
  if (report.fingerprint !== expectedFingerprint) throw new Error("SkillOpt receipt fingerprint mismatch.");

  const root = path.resolve(options.root || process.cwd());
  const ledger = path.join(root, RECEIPT_PATH);
  fs.mkdirSync(path.dirname(ledger), { recursive: true });
  const existing = fs.existsSync(ledger) ? fs.readFileSync(ledger, "utf8").split(/\r?\n/).filter(Boolean) : [];
  const duplicate = existing.some((line) => {
    try {
      return JSON.parse(line).fingerprint === report.fingerprint;
    } catch {
      return false;
    }
  });
  if (duplicate) return { status: "duplicate", path: ledger, fingerprint: report.fingerprint };

  const receipt = {
    ...report,
    recordedAt: options.now ? options.now() : new Date().toISOString(),
  };
  fs.appendFileSync(ledger, `${JSON.stringify(receipt)}\n`, "utf8");
  return { status: "stored", path: ledger, fingerprint: report.fingerprint, receipt };
}

module.exports = {
  RECEIPT_PATH,
  SUPPORTED_SKILLOPT_VERSION,
  appendSkillOptReceipt,
  evaluateSkillOptEvidence,
  normalizeSkillOptEvidence,
  skillOptFingerprint,
};
