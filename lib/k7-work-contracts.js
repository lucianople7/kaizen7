const TASK_STATUSES = new Set(["proposed", "approved", "running", "blocked", "verifying", "completed"]);
const RECEIPT_STATUSES = new Set(["completed", "blocked"]);

function text(value = "") {
  return String(value || "").trim();
}

function list(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(text).filter(Boolean);
}

function required(value, label) {
  const normalized = text(value);
  if (!normalized) throw new Error(`${label} is required`);
  return normalized;
}

function estimateTokens(value) {
  return Math.ceil(JSON.stringify(value || {}).length / 4);
}

function buildPreflightCard(input = {}) {
  return {
    schema: "kaizen7.preflight_card.v1",
    objective: required(input.objective, "objective"),
    route: required(input.route, "route"),
    memory_reused: list(input.memory_reused),
    research_needed: input.research_needed === true,
    recommendation: required(input.recommendation, "recommendation"),
    reason: text(input.reason),
    approval_needed: input.approval_needed === true,
    verification: required(input.verification, "verification"),
    expires_at: text(input.expires_at),
  };
}

function buildTaskContract(input = {}) {
  const status = text(input.status || "proposed");
  if (!TASK_STATUSES.has(status)) throw new Error(`invalid task status: ${status}`);
  return {
    schema: "kaizen7.task_contract.v1",
    id: required(input.id, "id"),
    goal: required(input.goal, "goal"),
    expected_output: required(input.expected_output, "expected_output"),
    owner: required(input.owner, "owner"),
    route: required(input.route, "route"),
    context_refs: list(input.context_refs),
    constraints: list(input.constraints),
    approval_gates: list(input.approval_gates),
    acceptance_checks: list(input.acceptance_checks),
    status,
    next_action: required(input.next_action, "next_action"),
  };
}

function buildOutcomeReceipt(input = {}) {
  const status = text(input.status);
  if (!RECEIPT_STATUSES.has(status)) throw new Error(`invalid receipt status: ${status}`);
  return {
    schema: "kaizen7.outcome_receipt.v1",
    task_id: required(input.task_id, "task_id"),
    status,
    result: text(input.result),
    evidence: list(input.evidence),
    files_changed: list(input.files_changed),
    risks: list(input.risks),
    reuse_next_time: text(input.reuse_next_time),
    discard: list(input.discard),
    next_action: required(input.next_action, "next_action"),
    verified_at: required(input.verified_at, "verified_at"),
    expires_at: text(input.expires_at),
  };
}

module.exports = {
  buildOutcomeReceipt,
  buildPreflightCard,
  buildTaskContract,
  estimateTokens,
};
