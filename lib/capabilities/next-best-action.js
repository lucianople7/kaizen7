const { resolveCapabilities } = require("./resolver");

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function chooseRecommendedCapability(plan = {}) {
  const selected = plan.selected || [];
  const first = selected[0]?.id || "";
  if (plan.inferredDomain === "content") return "super.content_engine";
  if (plan.inferredDomain === "app" || plan.inferredDomain === "world") return "super.safe_app_operator";
  if (plan.inferredDomain === "project") return "super.project_navigator";
  if (plan.inferredDomain === "kernel") return "super.capability_builder";
  if (plan.inferredDomain === "agent") return "super.agent_companion";
  return first || "super.agent_companion";
}

function decideNextAction(options = {}, plan = {}) {
  const missingEvidence = options.missingEvidence || options.missing_evidence || [];
  const missingInputs = options.missingInputs || options.missing_inputs || [];
  const approvalState = options.approvalState || options.approval_state || "";
  if (missingEvidence.length) return "provide_missing_evidence";
  if (missingInputs.length) return "provide_missing_inputs";
  if (approvalState === "required" || approvalState === "pending") return "request_approval";
  if (plan.status === "needs_triage") return "forge_capability";
  if (options.state === "done") return "teach_next_agent";
  return "run_cycle";
}

function buildNextBestAction(objective = "", options = {}) {
  const plan = resolveCapabilities(objective, options);
  const recommendedCapability = options.recommendedCapability || chooseRecommendedCapability(plan);
  const inputsNeeded = unique([
    ...(plan.missingInputs || []),
    ...(options.missingInputs || options.missing_inputs || []),
    ...(options.missingEvidence || options.missing_evidence || []),
  ]);

  return {
    schema: "kaizen7.next_best_action.v1",
    version: 1,
    objective,
    state: options.state || plan.status,
    recommended_capability: recommendedCapability,
    reason: plan.status === "needs_triage"
      ? "missing_repeatable_capability"
      : "highest_leverage_verified_next_step",
    inputs_needed: inputsNeeded,
    evidence_required: unique([
      "changed_surface",
      "verification_result",
      "remaining_risks",
      ...(plan.verification || []),
    ]),
    forbidden_actions: [
      "external_write_without_approval",
      "publish_without_approval",
      "store_secrets",
      "claim_completion_without_evidence",
    ],
    stop_when: "receipt_verified",
    next_action: decideNextAction(options, plan),
  };
}

module.exports = {
  buildNextBestAction,
  chooseRecommendedCapability,
  decideNextAction,
};
