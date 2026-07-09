const assert = require("node:assert/strict");
const {
  buildActionPlan,
  buildAgentHandoff,
  buildBestReport,
  buildOperatingDecision,
  classifyWarnings,
  formatAgentHandoff,
  formatBestReport,
  projectRiskGuardrails,
} = require("../lib/k7-best");

const warningGroups = classifyWarnings([
  "env:OPENAI_API_KEY",
  "working_tree_dirty:10",
  "the_focux:claims_review_required",
  "custom_warning",
]);

assert.deepEqual(warningGroups.env, ["env:OPENAI_API_KEY"]);
assert.deepEqual(warningGroups.repo, ["working_tree_dirty:10"]);
assert.deepEqual(warningGroups.project, ["the_focux:claims_review_required"]);
assert.deepEqual(warningGroups.other, ["custom_warning"]);
assert.deepEqual(projectRiskGuardrails(["claims_review_required", "low_priority_note"]), ["claims_review_required"]);

const blockedPlan = buildActionPlan({
  status: "fail",
  operating_decision: { decision: "blocked" },
  the_focux_os: { risks: [] },
});
assert.equal(blockedPlan[0], "Fix k7:smoke failure before execution.");

const blockedDecision = buildOperatingDecision({
  status: "fail",
  repo: { blockers: ["module:missing"] },
  next_mission: { lane: "KAIZEN7 Execution Quality" },
  the_focux_os: { risks: [] },
});
assert.equal(blockedDecision.decision, "blocked");

const guardedDecision = buildOperatingDecision({
  status: "pass",
  repo: { blockers: [] },
  next_mission: { lane: "KAIZEN7 Execution Quality" },
  the_focux_os: { risks: ["claims_review_required"] },
});
assert.equal(guardedDecision.decision, "execute_with_guardrails");

const handoff = buildAgentHandoff({
  next_mission: {
    goal: "mejorar KAIZEN7",
    lane: "KAIZEN7 Execution Quality",
    files_to_read: ["AGENTS.md"],
  },
  operating_decision: guardedDecision,
});
assert.equal(handoff.decision, "execute_with_guardrails");
assert.deepEqual(handoff.read_first, ["AGENTS.md"]);
assert(handoff.command_sequence.includes("npm.cmd run k7:now"));
assert(handoff.stop_if.includes("credentials_required"));
assert(handoff.close_with.includes("memory_update_recommendation"));
assert.equal(handoff.receipt_template.summary, "");
assert.equal(handoff.receipt_template.memory_update_recommendation, "");

const report = buildBestReport(process.cwd());
assert.equal(report.schema, "kaizen7.best.v1");
assert.equal(report.principle, "Less steps. Less tokens. Better route. Reusable learning.");
assert.equal(report.status, "pass");
assert(report.best_assets.some((asset) => asset.name === "KAIZEN7 Metaskill"));
assert(report.best_assets.some((asset) => asset.name === "CLI-Anything Operator"));
assert(report.best_commands.includes("npm.cmd run k7:best"));
assert(report.best_route_now.includes("Mission Brief"));
assert(report.next_mission.files_to_read.includes("AGENTS.md"));
assert(["execute", "execute_with_guardrails", "review_first"].includes(report.operating_decision.decision));
assert.equal(report.agent_handoff.decision, report.operating_decision.decision);
assert(report.agent_handoff.command_sequence.includes("npm.cmd run k7:check"));
assert.equal(report.agent_handoff.receipt_template.reuse_next_time, "");
assert(report.action_plan.includes("Run npm.cmd run k7:now."));
assert.equal(report.use_next, "npm.cmd run k7:now");

const formatted = formatBestReport(report);
assert(formatted.includes("# KAIZEN7 BEST NOW"));
assert(formatted.includes("## Decision"));
assert(formatted.includes("## Action Plan"));
assert(formatted.includes("## Agent Handoff"));
assert(formatted.includes("## Warnings"));
assert(formatted.includes("## Use Next"));

const handoffText = formatAgentHandoff(report.agent_handoff);
assert(handoffText.includes("# KAIZEN7 AGENT HANDOFF"));
assert(handoffText.includes("## Read First"));
assert(handoffText.includes("## Commands"));
assert(handoffText.includes("## Stop If"));
assert(handoffText.includes("## Receipt Template"));
assert(handoffText.includes("memory_update_recommendation:"));
assert(!handoffText.includes("## Best Assets"));
assert.equal(report.agent_handoff.allowed_scope, report.operating_decision.allowed_scope);

console.log("k7 best tests passed");
