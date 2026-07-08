const { resolveMissionContext } = require("./resolver");

function clean(value = "") {
  return String(value || "").trim();
}

function unique(items = []) {
  return [...new Set(items.map(clean).filter(Boolean))];
}

function firstItems(items = [], limit = 5) {
  return unique(items).slice(0, limit);
}

function inferProject(mission = {}) {
  const text = `${mission.project || ""} ${mission.goal || ""} ${mission.why || ""}`.toLowerCase();
  if (text.includes("the focux") || text.includes("focux")) return "THE FOCUX";
  if (text.includes("flowmatik")) return "Flowmatik";
  if (text.includes("mr kaizen")) return "Mr. Kaizen";
  if (text.includes("neurocity")) return "NEUROCITY";
  return clean(mission.project) || "KAIZEN7";
}

function buildCurrentState(resolution) {
  return [
    `Capability selected: ${resolution.capability || "needs_triage"}.`,
    `Next action: ${resolution.next_action}.`,
    `Context files selected: ${resolution.context_files.length}.`,
  ].join(" ");
}

function buildMissionBrief(mission = {}, options = {}) {
  const maxFiles = Number(options.maxFiles || mission.max_files || 5);
  const resolution = options.resolution || resolveMissionContext(mission, options);
  const filesToRead = firstItems(resolution.context_files, maxFiles);
  const filesForbidden = unique([
    ...(resolution.context_efficiency?.dropped_files || []),
    ...(mission.files_forbidden || mission.filesForbidden || []),
  ]);

  return {
    schema: "kaizen7.mission_brief.v1",
    status: resolution.status,
    mission: {
      goal: resolution.goal,
      project: inferProject(mission),
      priority: resolution.priority || "P2 - normal",
      estimated_scope: resolution.estimated_scope || "S - focused change",
    },
    capability: resolution.capability,
    current_state: buildCurrentState(resolution),
    files_to_read: filesToRead,
    files_forbidden: filesForbidden,
    constraints: resolution.constraints,
    acceptance_tests: resolution.acceptance_tests,
    risks: resolution.risks,
    context_budget: {
      max_files: maxFiles,
      selected_files: filesToRead.length,
      provided_files: resolution.context_efficiency?.provided_files || 0,
      dropped_files: filesForbidden.length,
      reduction_ratio: resolution.context_efficiency?.reduction_ratio || 0,
    },
    first_action: "Read files_to_read, then implement only the requested mission scope.",
    stop_conditions: [
      "credentials_required",
      "publish_deploy_payment_or_delete_required",
      "mission_scope_unclear",
      "acceptance_tests_cannot_run",
      "needed_context_not_in_files_to_read",
    ],
    return_format: [
      "summary",
      "changed_files",
      "tests",
      "risks",
      "memory_update_recommendation",
    ],
  };
}

function formatMissionBrief(brief) {
  return [
    "# K7 Mission Brief",
    "",
    `Goal: ${brief.mission.goal}`,
    `Project: ${brief.mission.project}`,
    `Capability: ${brief.capability}`,
    `Priority: ${brief.mission.priority}`,
    `Scope: ${brief.mission.estimated_scope}`,
    "",
    "## Current State",
    brief.current_state,
    "",
    "## Files To Read",
    ...brief.files_to_read.map((file) => `- ${file}`),
    "",
    "## Files Forbidden",
    ...(brief.files_forbidden.length ? brief.files_forbidden.map((file) => `- ${file}`) : ["- none"]),
    "",
    "## Constraints",
    ...brief.constraints.map((item) => `- ${item}`),
    "",
    "## Acceptance Tests",
    ...brief.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Risks",
    ...(brief.risks.length ? brief.risks.map((item) => `- ${item}`) : ["- none reported"]),
    "",
    "## First Action",
    brief.first_action,
    "",
    "## Stop Conditions",
    ...brief.stop_conditions.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

module.exports = {
  buildMissionBrief,
  formatMissionBrief,
};
