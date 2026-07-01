const { validateAgentLanguage } = require("./agent-language-guard");

function buildAgentReadiness(packet = {}) {
  const checks = {
    contract: validateAgentLanguage(packet.agent_contract || {}, "kaizen7.agent_contract.v1"),
    brief: validateAgentLanguage(packet.agent_brief || {}, "kaizen7.agent_brief.v1"),
    handoff: validateAgentLanguage(packet.agent_handoff || {}, "kaizen7.agent_handoff.v1"),
  };
  const blocks = Object.entries(checks)
    .filter(([, check]) => check.verdict === "block")
    .map(([name]) => name);
  const missingInputs = packet.capability_plan?.missing_inputs || [];
  const verdict = blocks.length || missingInputs.length ? "block" : "pass";

  return {
    schema: "kaizen7.agent_readiness.v1",
    verdict,
    checks: {
      contract: checks.contract.verdict,
      brief: checks.brief.verdict,
      handoff: checks.handoff.verdict,
    },
    blocks,
    missing_inputs: missingInputs,
    approval_gates: packet.capability_plan?.approval_gates || [],
    next_action: verdict === "pass" ? "execute_handoff" : "repair_packet",
  };
}

module.exports = {
  buildAgentReadiness,
};
