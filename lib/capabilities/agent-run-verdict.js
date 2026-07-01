function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function evidenceValue(result = {}, key = "") {
  const evidence = result.evidence || {};
  return evidence[key] ?? result[key];
}

function missingEvidenceFor(runCard = {}, result = {}) {
  return unique((runCard.evidence || []).filter((key) => {
    const value = evidenceValue(result, key);
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  }));
}

function decideVerdict(runCard = {}, result = {}) {
  const approvalState = result.approval_state || result.approvalState || "";
  if (approvalState === "required" || approvalState === "pending") return "needs_approval";
  return missingEvidenceFor(runCard, result).length ? "block" : "pass";
}

function nextActionFor(verdict) {
  if (verdict === "pass") return "teach_next_agent";
  if (verdict === "needs_approval") return "request_approval";
  return "provide_missing_evidence";
}

function buildAgentRunVerdict(runCard = {}, result = {}) {
  const missingEvidence = missingEvidenceFor(runCard, result);
  const verdict = decideVerdict(runCard, result);
  const memoryDraft = result.memory_draft || result.memoryDraft || "";
  const done = verdict === "pass";

  return {
    schema: "kaizen7.agent_run_verdict.v1",
    version: 1,
    mission: runCard.mission || "",
    capability: runCard.capability || "",
    verdict,
    done,
    missing_evidence: missingEvidence,
    learning_allowed: done && Boolean(memoryDraft),
    next_action: nextActionFor(verdict),
    receipt_hint: {
      schema: "kaizen7.agent_receipt_hint.v1",
      required: runCard.next_handoff?.return || ["result_summary", "evidence", "remaining_risks", "memory_draft"],
      done_when: runCard.done_when || "receipt_verified",
    },
  };
}

module.exports = {
  buildAgentRunVerdict,
  decideVerdict,
  missingEvidenceFor,
};
