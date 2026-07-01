const { buildAgentCycle } = require("./agent-cycle");

function hasText(value = "") {
  return Boolean(String(value || "").trim());
}

function buildLearningLoop(cycleOrObjective = "", result = {}, options = {}) {
  const cycle = typeof cycleOrObjective === "string"
    ? buildAgentCycle(cycleOrObjective, result, options)
    : cycleOrObjective;
  const blockers = [];
  if (cycle.verdict !== "pass") blockers.push("cycle_not_passed");
  if (!hasText(cycle.memory_draft)) blockers.push("memory_draft_missing");
  const verdict = blockers.length ? "block" : "pass";

  return {
    schema: "kaizen7.learning_loop.v1",
    version: 1,
    objective: cycle.objective || "",
    verdict,
    learning: {
      memory_draft: cycle.memory_draft || "",
      source_schema: cycle.schema || "",
      evidence_verdict: cycle.verification?.verdict || "unknown",
      reusable_when: [
        "same_capability_recurs",
        "similar_project_context_appears",
        "next_agent_needs_orientation",
      ],
    },
    teaching_packet: {
      agent_instruction: verdict === "pass"
        ? "reuse_learning_before_next_action"
        : "do_not_teach_until_cycle_passes",
      capability_hints: ["memory.writeback_draft", "agent.handoff_cycle", "kernel.capability_forge"],
      avoid: ["raw_transcript", "secrets", "claims_without_evidence"],
    },
    blockers,
    next_action: verdict === "pass" ? "teach_next_agent" : "provide_evidence_before_learning",
  };
}

module.exports = {
  buildLearningLoop,
};
