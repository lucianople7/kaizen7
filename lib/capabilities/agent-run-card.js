const { buildAgentWorkbench } = require("./agent-workbench");

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function shortRecipe(workbench = {}) {
  return (workbench.execution_recipe || [])
    .map((step) => step.step)
    .filter(Boolean)
    .slice(0, 4);
}

function buildBlockers(workbench = {}) {
  const nextAction = workbench.next_action || "";
  const inputsNeeded = workbench.next_best_action?.inputs_needed || [];
  const gates = workbench.approval_gates || [];

  return unique([
    inputsNeeded.length ? "missing_required_input" : "",
    gates.length ? "approval_required" : "",
    nextAction === "provide_missing_evidence" ? "missing_evidence" : "",
    nextAction === "request_approval" ? "approval_required" : "",
  ]);
}

function preflightChecks(workbench = {}) {
  return unique([
    "check_required_inputs",
    "check_approval_state",
    "check_evidence_path",
    workbench.capability ? "check_capability_spec" : "",
  ]);
}

function buildAgentRunCard(objective = "", options = {}) {
  const workbench = buildAgentWorkbench(objective, options);

  return {
    schema: "kaizen7.agent_run_card.v1",
    version: 1,
    project: workbench.context_capsule.project,
    mission: `${objective} -> ${workbench.capability}`,
    action: workbench.next_action,
    capability: workbench.capability,
    recipe: shortRecipe(workbench),
    preflight_checks: preflightChecks(workbench),
    evidence: workbench.evidence_required,
    blockers: buildBlockers(workbench),
    done_when: workbench.stop_when,
    next_handoff: {
      schema: "kaizen7.agent_handoff_hint.v1",
      return: ["result_summary", "evidence", "remaining_risks", "memory_draft"],
      teach_when: workbench.learning_rule,
    },
  };
}

module.exports = {
  buildAgentRunCard,
  buildBlockers,
  preflightChecks,
  shortRecipe,
};
