const { buildAgentContract } = require("./agent-contract");

function buildAgentBrief(objective = "", options = {}) {
  const contract = options.contract || buildAgentContract(objective, options);

  return {
    schema: "kaizen7.agent_brief.v1",
    version: 1,
    role: "working_companion",
    objective: contract.objective || objective,
    intent: contract.intent || "general_work",
    first_move: contract.route?.[0] || "understand_scope",
    focus: contract.boundary?.scope || "smallest_useful_change",
    avoid: contract.boundary?.avoid || [],
    evidence_needed: contract.evidence?.required || ["changed_surface", "verification_result", "remaining_risks"],
    stop_when: "required_evidence_is_present",
    return: ["result_summary", "evidence", "risks", "memory_draft"],
  };
}

module.exports = {
  buildAgentBrief,
};
