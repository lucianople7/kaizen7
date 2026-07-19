const { buildPreflight } = require("./k7-preflight");
const { loadLoopPolicy } = require("./k7-loop-system");
const { appendReceipt, isReceiptFresh, readLedger } = require("./k7-receipt-ledger");
const { buildOutcomeReceipt, buildTaskContract } = require("./k7-work-contracts");

function normalize(value = "") {
  return String(value || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function stableTaskId(objective = "") {
  let hash = 0;
  for (const char of normalize(objective) || "kaizen7") {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  }
  return `k7t_${hash.toString(16).padStart(8, "0")}`;
}

function ownerFor(preflight = {}, policy = loadLoopPolicy()) {
  const objective = normalize(preflight.objective);
  const technical = (policy.routing.technical_patterns || []).some((pattern) => objective.includes(normalize(pattern)));
  const creative = (policy.routing.creative_patterns || []).some((pattern) => objective.includes(normalize(pattern)));
  if (technical) return policy.roles.technical_executor;
  if (creative) return policy.roles.creative_executor;
  return policy.routing[preflight.route] || policy.roles.frontend;
}

function profileFor(preflight = {}, policy = loadLoopPolicy()) {
  const objective = normalize(preflight.objective);
  const entries = Object.entries(policy.profiles || {});
  const routeMatch = entries.find(([, profile]) => (profile.routes || []).includes(preflight.route));
  if (routeMatch && ["research", "memory"].includes(routeMatch[0])) return routeMatch[0];
  const priority = ["commerce", "research", "tool", "technical", "creative", "memory"];
  for (const name of priority) {
    const profile = policy.profiles?.[name];
    if ((profile?.patterns || []).some((pattern) => objective.includes(normalize(pattern)))) return name;
  }
  if (routeMatch) return routeMatch[0];
  return "general";
}

function buildLoopTask(preflight = {}, policy = loadLoopPolicy(), limits = {}) {
  const profile = profileFor(preflight, policy);
  return buildTaskContract({
    id: stableTaskId(preflight.objective),
    goal: preflight.objective,
    expected_output: preflight.recommendation,
    owner: ownerFor(preflight, policy),
    route: preflight.route,
    constraints: ["bounded execution", "no unapproved external effects"],
    approval_gates: preflight.approval_needed ? ["explicit human approval"] : [],
    acceptance_checks: [preflight.verification],
    loop: {
      profile,
      stages: policy.profiles[profile].stages,
      max_iterations: limits.maxIterations || policy.limits.max_iterations,
      max_failures: limits.maxFailures || policy.limits.max_failures,
      token_budget: limits.tokenBudget || policy.limits.token_budget,
      autonomy: "controlled_constructor",
      stop_conditions: ["verified", "approval_required", "hard_failure", "failure_cap", "attempt_cap", "token_budget"],
    },
    status: "approved",
    next_action: preflight.recommendation,
  });
}

function verifiedUses(objective, options = {}) {
  const target = normalize(objective);
  return readLedger({ root: options.root }).filter((record) => (
    normalize(record.objective) === target
      && record.worked === true
      && Boolean(String(record.verification || "").trim())
      && isReceiptFresh(record, options.now)
  )).length;
}

function terminal(base, status, nextAction, extra = {}) {
  return {
    schema: "kaizen7.action_reaction_loop.v1",
    ...base,
    ...extra,
    status,
    next_action: nextAction,
  };
}

function runActionReactionLoop(objective = "", options = {}) {
  const goal = String(objective || "").trim();
  if (!goal) throw new Error("objective is required");
  const now = options.now || new Date().toISOString();
  const policy = loadLoopPolicy({ policy: options.policy });
  const maxIterations = Number.isInteger(options.maxIterations) ? options.maxIterations : policy.limits.max_iterations;
  const maxFailures = Number.isInteger(options.maxFailures) ? options.maxFailures : policy.limits.max_failures;
  const tokenBudget = Number.isInteger(options.tokenBudget) ? options.tokenBudget : policy.limits.token_budget;
  const states = [];
  const attempts = [];
  let tokensUsed = 0;

  const base = {
    system_id: policy.system.id,
    system_version: policy.system.version,
    objective: goal,
    states,
    attempts,
    task: null,
    receipt: null,
    learning: { promoted: false, verified_uses: 0 },
  };
  const enter = (state, tokens = 0) => {
    if (tokensUsed + tokens > tokenBudget) return false;
    states.push(state);
    tokensUsed += tokens;
    return true;
  };
  const exhausted = (reason = "token_budget") => terminal(
    base,
    "budget_exhausted",
    "Reduce scope or budget, then resume from the same TaskContract.",
    { stop_reason: reason, tokens_used: tokensUsed },
  );

  if (!enter("preflight")) return exhausted();
  const preflight = (options.preflight || buildPreflight)(goal, {
    root: options.root,
    now,
    budget: Math.min(600, Math.max(120, options.preflightBudget || policy.limits.preflight_budget)),
    candidate: options.candidate,
  });
  tokensUsed += preflight.estimated_tokens || 0;
  base.preflight = preflight;
  if (tokensUsed > tokenBudget) return exhausted();

  if (preflight.approval_needed) {
    states.push("approval_required");
    return terminal(base, "approval_required", "Request one explicit approval or preference, then resume this task.", { tokens_used: tokensUsed });
  }

  if (!enter("ready")) return exhausted();
  const task = buildLoopTask(preflight, policy, { maxIterations, maxFailures, tokenBudget });
  base.task = task;
  if (typeof options.executor !== "function") {
    return terminal(base, "ready", `Dispatch the TaskContract to ${task.owner}.`, { tokens_used: tokensUsed });
  }

  let execution = {};
  let verification = { passed: false };
  let evidence = [];
  let failures = 0;
  let previousExecution = null;
  let previousVerification = null;

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    if (!enter("executing")) return exhausted();
    const context = {
      preflight,
      iteration,
      max_iterations: maxIterations,
      token_budget_remaining: tokenBudget - tokensUsed,
      previous_execution: previousExecution,
      previous_verification: previousVerification,
      correction: previousVerification?.correction || "",
    };
    let executorError = null;
    try {
      execution = options.executor(task, context) || {};
    } catch (error) {
      executorError = error;
      execution = { result: "", evidence: [], error: error.message, token_usage: 0 };
    }
    tokensUsed += Number(execution.token_usage || 0);
    if (tokensUsed > tokenBudget) return exhausted("token_budget");

    if (!enter("verifying")) return exhausted();
    evidence = Array.isArray(execution.evidence) ? execution.evidence.filter(Boolean) : [];
    try {
      verification = executorError
        ? { passed: false, correction: `Repair executor error: ${executorError.message}`, error: executorError.message }
        : (typeof options.verifier === "function"
          ? options.verifier(execution, task, context)
          : { passed: evidence.length > 0 });
    } catch (error) {
      verification = { passed: false, correction: `Repair verifier error: ${error.message}`, error: error.message };
    }
    if (verification === true) verification = { passed: true };
    if (verification === false || !verification) verification = { passed: false };
    const passed = verification.passed === true && evidence.length > 0;
    attempts.push({
      iteration,
      status: passed ? "verified" : "failed",
      result: String(execution.result || ""),
      evidence,
      token_usage: Number(execution.token_usage || 0),
      verification,
    });
    if (passed) break;

    failures += 1;
    previousExecution = execution;
    previousVerification = verification;
    if (verification.hard_fail === true || verification.hardFail === true) {
      states.push("blocked");
      return terminal(base, "blocked", "Human authority or a redesigned task is required before continuing.", {
        stop_reason: "hard_failure",
        verification,
        tokens_used: tokensUsed,
      });
    }
    if (iteration >= maxIterations) return exhausted("attempt_cap");
    if (failures >= maxFailures) {
      states.push("blocked");
      return terminal(base, "blocked", "Use the recorded corrections to redesign the bounded task before resuming.", {
        stop_reason: "failure_cap",
        verification,
        tokens_used: tokensUsed,
      });
    }
    states.push("adjusting");
  }

  if (!enter("learning")) return exhausted();
  const nextAction = String(execution.next_action || "Run preflight for the next bounded objective.");
  const receipt = buildOutcomeReceipt({
    task_id: task.id,
    status: "completed",
    result: execution.result || "verified execution completed",
    evidence,
    files_changed: execution.files_changed || [],
    risks: execution.risks || [],
    reuse_next_time: execution.reuse_next_time || nextAction,
    discard: execution.discard || ["Do not reuse when verification or scope no longer matches."],
    next_action: nextAction,
    verified_at: now,
    expires_at: preflight.expires_at,
  });
  base.receipt = receipt;
  if (options.persist === true) {
    appendReceipt({
      objective: goal,
      route: preflight.route,
      tool: task.owner,
      output: receipt.result,
      verification: evidence.join(" | "),
      worked: true,
      reuse_next_time: receipt.reuse_next_time,
      discard: receipt.discard,
      verified_at: now,
      expires_at: receipt.expires_at,
      tags: ["action-reaction-loop", task.owner],
    }, { root: options.root });
  }
  const uses = verifiedUses(goal, { root: options.root, now });
  const promotionThreshold = policy.learning.minimum_verified_uses;
  base.learning = {
    promoted: uses >= promotionThreshold,
    verified_uses: uses,
    promotion_threshold: promotionThreshold,
    rule: uses >= promotionThreshold
      ? receipt.reuse_next_time
      : `Collect ${promotionThreshold} verified matching outcomes before promotion.`,
  };

  if (!enter("next_action")) return exhausted();
  if (!enter("completed")) return exhausted();
  return terminal(base, "completed", nextAction, { execution, verification, tokens_used: tokensUsed });
}

function formatActionReactionLoop(loop = {}) {
  return [
    "# KAIZEN7 ACTION–REACTION LOOP",
    `Objective: ${loop.objective || ""}`,
    `Status: ${loop.status || ""}`,
    `States: ${(loop.states || []).join(" -> ")}`,
    `Owner: ${loop.task?.owner || "none"}`,
    `Profile: ${loop.task?.loop?.profile || "none"}`,
    `Attempts: ${(loop.attempts || []).length}`,
    `Next: ${loop.next_action || ""}`,
    "",
  ].join("\n");
}

module.exports = {
  buildLoopTask,
  formatActionReactionLoop,
  ownerFor,
  profileFor,
  runActionReactionLoop,
  stableTaskId,
  verifiedUses,
};
