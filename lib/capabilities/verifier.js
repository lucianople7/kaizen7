function hasEvidence(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value || "").trim());
}

const LEGACY_EVIDENCE_ALIASES = {
  changed_surface: ["changed_surface", "diff", "files_changed"],
  verification_result: ["verification_result", "tests", "tests_result", "checks"],
  remaining_risks: ["remaining_risks", "risks", "risk_summary"],
};

function evidenceValue(evidence = {}, key = "") {
  const aliases = LEGACY_EVIDENCE_ALIASES[key] || [key];
  return aliases.map((alias) => evidence[alias]).find(hasEvidence);
}

function requiredEvidence(packet = {}) {
  return packet.agent_contract?.evidence?.required || packet.evidence_required || ["diff", "tests", "risks"];
}

function verifyCapabilityEvidence(packet = {}, result = {}) {
  const evidence = result.evidence || {};
  const required = requiredEvidence(packet);
  const missing = required.filter((item) => !hasEvidence(evidenceValue(evidence, item)));
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
  evidenceValue,
  hasEvidence,
  requiredEvidence,
  verifyCapabilityEvidence,
};
