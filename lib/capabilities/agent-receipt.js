const { evidenceValue, verifyCapabilityEvidence } = require("./verifier");

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function buildAgentReceipt(packet = {}, result = {}) {
  const verification = verifyCapabilityEvidence(packet, result);
  const evidence = result.evidence || {};
  const contract = packet.agent_contract || {};

  return {
    schema: "kaizen7.agent_receipt.v1",
    version: 1,
    objective: contract.objective || packet.objective || "",
    intent: contract.intent || "general_work",
    verdict: verification.verdict,
    summary: result.summary || result.result_summary || "",
    evidence: {
      changed_surface: asArray(evidenceValue(evidence, "changed_surface")),
      verification_result: evidenceValue(evidence, "verification_result") || "",
      remaining_risks: asArray(evidenceValue(evidence, "remaining_risks")),
    },
    missing_evidence: verification.missing,
    accepted_claims: verification.acceptedClaims,
    next_action: verification.verdict === "pass" ? "complete" : "provide_missing_evidence",
    memory_draft: result.memory_draft || result.memoryDraft || "",
  };
}

module.exports = {
  buildAgentReceipt,
};
