const { buildCapabilityPacket } = require("./packet");
const { buildAgentReceipt } = require("./agent-receipt");
const { verifyCapabilityEvidence } = require("./verifier");

function buildAgentCycle(objective = "", result = {}, options = {}) {
  const packet = options.packet || buildCapabilityPacket(objective, options);
  const readiness = packet.agent_readiness;
  const verification = verifyCapabilityEvidence(packet, result);
  const receipt = buildAgentReceipt(packet, result);
  const verdict = readiness?.verdict === "pass" && verification.verdict === "pass" ? "pass" : "block";

  return {
    schema: "kaizen7.agent_cycle.v1",
    version: 1,
    objective: packet.objective || objective,
    verdict,
    readiness,
    verification,
    receipt,
    memory_draft: receipt.memory_draft || "",
    next_action: verdict === "pass" ? "complete" : receipt.next_action,
  };
}

module.exports = {
  buildAgentCycle,
};
