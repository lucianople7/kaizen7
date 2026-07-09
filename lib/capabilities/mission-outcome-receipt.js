const { buildMissionBrief } = require("./mission-brief");

function clean(value = "") {
  return String(value || "").trim();
}

function asArray(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  if (value === undefined || value === null || value === "") return [];
  return [clean(value)].filter(Boolean);
}

function unique(items = []) {
  return [...new Set(items.map(clean).filter(Boolean))];
}

function normalizePath(filePath = "") {
  return clean(filePath).replace(/\\/g, "/");
}

function boolValue(value, fallback = false) {
  if (value === true || value === false) return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function changedFilesFrom(result = {}) {
  return unique([
    ...asArray(result.files_changed || result.changed_files || result.changedFiles),
    ...asArray(result.evidence?.changed_surface),
  ].map(normalizePath));
}

function testsFrom(result = {}) {
  return unique([
    ...asArray(result.tests),
    ...asArray(result.evidence?.tests),
    ...asArray(result.evidence?.verification_result),
    ...asArray(result.verification_result),
  ]);
}

function outsideBriefFiles(changedFiles = [], brief = {}) {
  const readable = new Set([
    ...(brief.files_to_read || []),
    ...(brief.files_allowed || []),
  ].map((file) => normalizePath(file).toLowerCase()));

  return changedFiles.filter((file) => {
    const normalized = normalizePath(file).toLowerCase();
    if (readable.has(normalized)) return false;
    return !(normalized.startsWith("tests/") || normalized.startsWith("docs/"));
  });
}

function inferStatus(goalCompleted, constraintsRespected, tests, unexpectedChanges) {
  if (!goalCompleted) return "block";
  if (!constraintsRespected) return "block";
  if (!tests.length) return "block";
  if (unexpectedChanges.length) return "needs_review";
  return "pass";
}

function buildMissionOutcomeReceipt(input = {}, maybeResult = {}) {
  const brief = input.schema === "kaizen7.mission_brief.v1"
    ? input
    : input.mission_brief || input.missionBrief || buildMissionBrief(input.mission || input);
  const result = input.result || maybeResult || {};
  const filesChanged = changedFilesFrom(result);
  const tests = testsFrom(result);
  const constraintsRespected = boolValue(
    result.constraints_respected ?? result.constraintsRespected,
    !asArray(result.constraint_violations || result.constraintViolations).length,
  );
  const goalCompleted = boolValue(result.goal_completed ?? result.goalCompleted, false);
  const unexpectedChanges = unique([
    ...outsideBriefFiles(filesChanged, brief),
    ...asArray(result.unexpected_changes || result.unexpectedChanges).map(normalizePath),
  ]);
  const recommendedMemory = clean(result.recommended_memory || result.recommendedMemory || result.memory_draft);
  const status = inferStatus(goalCompleted, constraintsRespected, tests, unexpectedChanges);

  return {
    schema: "kaizen7.mission_outcome_receipt.v1",
    version: 1,
    mission: {
      goal: brief.mission?.goal || "",
      project: brief.mission?.project || "KAIZEN7",
      capability: brief.capability || "",
    },
    status,
    goal_completed: goalCompleted,
    files_changed: filesChanged,
    tests,
    constraints_respected: constraintsRespected,
    unexpected_changes: unexpectedChanges,
    recommended_memory: recommendedMemory,
    next_capability: clean(result.next_capability || result.nextCapability),
    follow_up: clean(result.follow_up || result.followUp),
    review: {
      needs_human_review: status !== "pass" || Boolean(recommendedMemory),
      reasons: unique([
        status === "block" ? "mission_not_certified" : "",
        unexpectedChanges.length ? "unexpected_changes_detected" : "",
        recommendedMemory ? "memory_recommendation_present" : "",
      ]),
    },
  };
}

function formatMissionOutcomeReceipt(receipt) {
  return [
    "# K7 Mission Outcome Receipt",
    "",
    `Status: ${receipt.status}`,
    `Goal completed: ${receipt.goal_completed}`,
    `Project: ${receipt.mission.project}`,
    `Capability: ${receipt.mission.capability}`,
    "",
    "## Mission",
    receipt.mission.goal,
    "",
    "## Files Changed",
    ...(receipt.files_changed.length ? receipt.files_changed.map((file) => `- ${file}`) : ["- none"]),
    "",
    "## Tests",
    ...(receipt.tests.length ? receipt.tests.map((test) => `- ${test}`) : ["- none"]),
    "",
    "## Unexpected Changes",
    ...(receipt.unexpected_changes.length ? receipt.unexpected_changes.map((file) => `- ${file}`) : ["- none"]),
    "",
    "## Recommended Memory",
    receipt.recommended_memory || "none",
    "",
    "## Follow Up",
    receipt.follow_up || "none",
    "",
  ].join("\n");
}

module.exports = {
  buildMissionOutcomeReceipt,
  formatMissionOutcomeReceipt,
  inferStatus,
};
