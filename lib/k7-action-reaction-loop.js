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
  const creative = (policy.routing.creative_patterns || []).some((pattern) => objective.includes(normalize(pattern)));
  if (creative) return policy.roles.creative_executor;
  return policy.routing[preflight.route] || policy.roles.frontend;
}

function buildLoopTask(preflight = {}, policy = loadLoopPolicy()) {
  return buildTaskContract({
    id: stableTaskId(preflight.objective),
    goal: preflight.objective,
    expected_output: preflight.recommendation,
    owner: ownerFor(preflight, policy),
    route: preflight.route,
    constraints: ["bounded execution", "no unapproved external effects"],
    approval_gates: preflight.approval_needed ? ["explicit human approval"] : [],
    acceptance_checks: [preflight.verification],
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
  const tokenBudget = Number.isInteger(options.tokenBudget) ? options.tokenBudget : policy.limits.token_budget;
  const states = [];
  let tokensUsed = 0;

  const base = {
    system_id: policy.system.id,
    system_version: policy.system.version,
    objective: goal,
    states,
    task: null,
    receipt: null,
    learning: { promoted: false, verified_uses: 0 },
  };
  const enter = (state, tokens = 0) => {
    if (states.length >= maxIterations || tokensUsed + tokens > tokenBudget) return false;
    states.push(state);
    tokensUsed += tokens;
    return true;
  };
  const exhausted = () => terminal(base, "budget_exhausted", "Reduce scope and run one new KAIZEN7 preflight.", { tokens_used: tokensUsed });

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
  const task = buildLoopTask(preflight, policy);
  base.task = task;
  if (typeof options.executor !== "function") {
    return terminal(base, "ready", `Dispatch the TaskContract to ${task.owner}.`, { tokens_used: tokensUsed });
  }

  if (!enter("executing")) return exhausted();
  let execution;
  try {
    execution = options.executor(task, { preflight, token_budget_remaining: tokenBudget - tokensUsed }) || {};
  } catch (error) {
    states.push("blocked");
    return terminal(base, "blocked", "Repair the executor failure, then resume from the same TaskContract.", {
      error: error.message,
      tokens_used: tokensUsed,
    });
  }
  tokensUsed += Number(execution.token_usage || 0);
  if (tokensUsed > tokenBudget) return exhausted();

  if (!enter("verifying")) return exhausted();
  const evidence = Array.isArray(execution.evidence) ? execution.evidence.filter(Boolean) : [];
  const verification = typeof options.verifier === "function"
    ? options.verifier(execution, task)
    : { passed: evidence.length > 0 };
  const passed = verification === true || verification?.passed === true;
  if (!passed || evidence.length === 0) {
    states.push("blocked");
    return terminal(base, "blocked", "Fix the failed verification; do not create reusable learning.", {
      verification,
      tokens_used: tokensUsed,
    });
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
    `Next: ${loop.next_action || ""}`,
    "",
  ].join("\n");
}

module.exports = {
  buildLoopTask,
  formatActionReactionLoop,
  ownerFor,
  runActionReactionLoop,
  stableTaskId,
  verifiedUses,
};
