const { runActionReactionLoop } = require("./k7-action-reaction-loop");
const { loadLoopPolicy } = require("./k7-loop-system");
const { buildOperatorContract } = require("./k7-operator-constitution");

function list(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map(String).map((item) => item.trim()).filter(Boolean);
}

function normalizeOneDoorInput(input = {}) {
  const source = typeof input === "string" ? { objective: input } : input;
  const objective = String(source.objective || "").trim();
  if (!objective) throw new Error("objective is required");
  const iterations = Number(source.budget?.iterations || 8);
  const tokens = Number(source.budget?.tokens || 1200);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 20) {
    throw new Error("budget.iterations must be an integer between 1 and 20");
  }
  if (!Number.isInteger(tokens) || tokens < 120 || tokens > 10000) {
    throw new Error("budget.tokens must be an integer between 120 and 10000");
  }
  return {
    schema: "kaizen7.one_door_input.v1",
    objective,
    project: String(source.project || "KAIZEN7").trim(),
    constraints: list(source.constraints),
    authority: list(source.authority),
    budget: { iterations, tokens },
  };
}

function runOneDoor(input, options = {}) {
  const request = normalizeOneDoorInput(input);
  const operatorContract = buildOperatorContract({
    filePath: options.operatorConstitutionPath,
  });
  const policy = loadLoopPolicy({ policy: options.policy });
  const loop = runActionReactionLoop(request.objective, {
    ...options,
    policy,
    maxIterations: request.budget.iterations,
    tokenBudget: request.budget.tokens,
  });
  const gated = loop.status === "approval_required";
  const task = loop.task ? {
    ...loop.task,
    constraints: [...new Set([...(loop.task.constraints || []), ...request.constraints])],
  } : null;
  const evidence = Array.isArray(loop.execution?.evidence) ? loop.execution.evidence.filter(Boolean) : [];
  return {
    schema: "kaizen7.one_door.v1",
    system_id: loop.system_id,
    system_version: loop.system_version,
    request,
    operator_contract: operatorContract,
    status: loop.status,
    decision: {
      route: loop.preflight?.route || "",
      reason: loop.preflight?.reason || "",
      research_needed: loop.preflight?.research_needed === true,
      approval_needed: loop.preflight?.approval_needed === true,
    },
    executor: gated ? policy.roles.authority : (task?.owner || policy.roles.coordinator),
    task_contract: task,
    attempts: loop.attempts || [],
    evidence,
    outcome_receipt: loop.receipt,
    learning: loop.learning,
    next_action: loop.next_action,
  };
}

function formatOneDoor(envelope = {}) {
  return [
    "# K7 ONE DOOR",
    `Objective: ${envelope.request?.objective || ""}`,
    `Authority: ${envelope.operator_contract?.principal?.name || ""} (${envelope.operator_contract?.principal?.role || ""})`,
    `Status: ${envelope.status || ""}`,
    `Route: ${envelope.decision?.route || ""}`,
    `Executor: ${envelope.executor || ""}`,
    `Loop: ${envelope.task_contract?.loop?.profile || "none"}`,
    `Attempts: ${(envelope.attempts || []).length}`,
    `Evidence: ${(envelope.evidence || []).length}`,
    `Next: ${envelope.next_action || ""}`,
    "",
  ].join("\n");
}

module.exports = {
  formatOneDoor,
  normalizeOneDoorInput,
  runOneDoor,
};
