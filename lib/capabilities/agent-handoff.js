const { buildAgentBrief } = require("./agent-brief");
const { buildAgentContract } = require("./agent-contract");

function buildAgentHandoff(objective = "", options = {}) {
  const contract = options.contract || buildAgentContract(objective, options);
  const brief = options.brief || buildAgentBrief(objective, { ...options, contract });

  return {
    schema: "kaizen7.agent_handoff.v1",
    version: 1,
    objective: contract.objective || objective,
    contract,
    brief,
    expected_receipt_schema: "kaizen7.agent_receipt.v1",
    handoff_rule: "use_brief_for_action_return_receipt_for_verification",
  };
}

module.exports = {
  buildAgentHandoff,
};
