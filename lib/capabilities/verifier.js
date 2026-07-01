function hasEvidence(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value || "").trim());
}

function verifyCapabilityEvidence(packet = {}, result = {}) {
  const evidence = result.evidence || {};
  const required = packet.evidence_required || ["diff", "tests", "risks"];
  const missing = required.filter((item) => !hasEvidence(evidence[item]));
  const claims = (result.claims || []).map((claim) => String(claim || ""));

  return {
    version: 1,
    mode: "capability-evidence-verification",
    verdict: missing.length ? "block" : "pass",
    capability: packet.capabilities?.[0] || "unknown",
    required,
    missing,
    acceptedClaims: missing.length ? [] : claims,
    gates: missing.length
      ? [`Missing evidence: ${missing.join(", ")}`]
      : ["Evidence satisfies required capability packet contract."],
  };
}

module.exports = {
  hasEvidence,
  verifyCapabilityEvidence,
};
