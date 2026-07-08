const { listCapabilities } = require("./registry");

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function includesAny(items = [], patterns = []) {
  const text = items.join(" ").toLowerCase();
  return patterns.some((pattern) => pattern.test(text));
}

function addCheck(checks, name, pass, points, recommendation) {
  checks.push({
    name,
    pass,
    points: pass ? points : 0,
    max_points: points,
    recommendation: pass ? "" : recommendation,
  });
}

function gradeFor(score) {
  if (score >= 90) return "world_class";
  if (score >= 75) return "strong";
  if (score >= 60) return "usable";
  return "needs_work";
}

function evaluateCapabilityQuality(capability = {}) {
  const checks = [];

  addCheck(
    checks,
    "clear_purpose",
    hasText(capability.purpose) && capability.purpose.length >= 30,
    12,
    "Write a specific purpose that explains the outcome, not only the tool.",
  );
  addCheck(
    checks,
    "stable_contract",
    hasItems(capability.inputs) && hasItems(capability.outputs),
    14,
    "Define non-empty inputs and outputs so agents know the contract.",
  );
  addCheck(
    checks,
    "verification_gates",
    hasItems(capability.verification) && includesAny(capability.verification, [/present|passed|reported|checked|valid|scope|evidence|receipt/]),
    16,
    "Add concrete verification gates that can certify completion.",
  );
  addCheck(
    checks,
    "safety_boundary",
    Array.isArray(capability.approval) && (capability.approval.length > 0 || includesAny(capability.verification, [/no_|risk|approval|scope|blocked/])),
    12,
    "Declare approval gates or explicit safety verification.",
  );
  addCheck(
    checks,
    "dependency_clarity",
    Array.isArray(capability.requires),
    8,
    "Declare required capabilities, even when the list is empty.",
  );
  addCheck(
    checks,
    "tool_portability",
    hasItems(capability.tools) && !capability.tools.every((tool) => /paid|vendor|cloud/i.test(tool)),
    10,
    "Prefer replaceable tools or local providers where possible.",
  );
  addCheck(
    checks,
    "memory_policy",
    hasText(capability.writeback),
    8,
    "Declare where reusable learning should be drafted.",
  );
  addCheck(
    checks,
    "routing_keywords",
    hasItems(capability.keywords) && capability.keywords.length >= 4,
    8,
    "Add enough keywords for deterministic routing.",
  );
  addCheck(
    checks,
    "kernel_alignment",
    !/execute everything|autonomous publish|auto spend|write secrets/i.test(capability.purpose || ""),
    12,
    "Keep the capability aligned with KAIZEN7: prepare, limit, verify and learn.",
  );

  const score = checks.reduce((total, check) => total + check.points, 0);
  const maxScore = checks.reduce((total, check) => total + check.max_points, 0);
  const normalizedScore = Math.round((score / maxScore) * 100);

  return {
    schema: "kaizen7.capability_quality.v1",
    id: capability.id || "",
    domain: capability.domain || "",
    score: normalizedScore,
    grade: gradeFor(normalizedScore),
    checks,
    improvements: checks.filter((check) => !check.pass).map((check) => check.recommendation),
  };
}

function buildCapabilityQualityReport(options = {}) {
  const evaluations = listCapabilities(options)
    .map(evaluateCapabilityQuality)
    .sort((left, right) => left.score - right.score || left.id.localeCompare(right.id));
  const averageScore = evaluations.length
    ? Math.round(evaluations.reduce((total, item) => total + item.score, 0) / evaluations.length)
    : 0;

  return {
    schema: "kaizen7.capability_quality_report.v1",
    status: "ready",
    average_score: averageScore,
    total_capabilities: evaluations.length,
    grade_counts: evaluations.reduce((counts, item) => {
      counts[item.grade] = (counts[item.grade] || 0) + 1;
      return counts;
    }, {}),
    needs_improvement: evaluations.filter((item) => item.grade !== "world_class").slice(0, options.limit || 10),
    world_class: evaluations.filter((item) => item.grade === "world_class").map((item) => item.id),
    next_action: "upgrade_lowest_scoring_capabilities_first",
  };
}

function formatCapabilityQualityReport(report) {
  return [
    "# KAIZEN7 Capability Quality Report",
    "",
    `Average score: ${report.average_score}`,
    `Total capabilities: ${report.total_capabilities}`,
    "",
    "## Needs Improvement",
    ...(report.needs_improvement.length
      ? report.needs_improvement.map((item) => `- ${item.id}: ${item.score} (${item.grade})`)
      : ["- none"]),
    "",
    "## World Class",
    ...(report.world_class.length ? report.world_class.map((id) => `- ${id}`) : ["- none yet"]),
    "",
    `Next action: ${report.next_action}`,
    "",
  ].join("\n");
}

module.exports = {
  buildCapabilityQualityReport,
  evaluateCapabilityQuality,
  formatCapabilityQualityReport,
  gradeFor,
};
