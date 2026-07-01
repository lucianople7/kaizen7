function hasText(value = "") {
  return Boolean(String(value || "").trim());
}

function defaultCodexLesson(runVerdict = {}) {
  return runVerdict.learning_allowed
    ? "Use verified run verdicts before teaching future agents."
    : "";
}

function defaultKaizenGuidance(runVerdict = {}) {
  if (!runVerdict.learning_allowed) return "";
  return "Check the run card, close evidence, then teach only from a passing verdict.";
}

function buildMutualLearningExchange(runVerdict = {}, options = {}) {
  const codexLesson = options.codexObservation || options.codex_observation || defaultCodexLesson(runVerdict);
  const kaizenGuidance = options.kaizenGuidance || options.kaizen_guidance || defaultKaizenGuidance(runVerdict);
  const blockers = [];

  if (!runVerdict.learning_allowed) blockers.push("learning_not_allowed");
  if (!hasText(codexLesson)) blockers.push("codex_lesson_missing");
  if (!hasText(kaizenGuidance)) blockers.push("kaizen_guidance_missing");

  const verdict = blockers.length ? "block" : "pass";

  return {
    schema: "kaizen7.mutual_learning_exchange.v1",
    version: 1,
    verdict,
    source_verdict: runVerdict.schema || "",
    codex_to_kaizen7: {
      lesson: verdict === "pass" ? codexLesson : "",
      evidence_link: runVerdict.receipt_hint?.done_when || runVerdict.done_when || "",
      reusable_when: [
        "similar_run_card_closes",
        "same_capability_recurs",
        "next_agent_needs_less_context",
      ],
    },
    kaizen7_to_codex: {
      guidance: verdict === "pass" ? kaizenGuidance : "",
      apply_before: ["next_best_action", "agent_run_card", "agent_run_verdict"],
      avoid: ["raw_transcript", "secrets", "claims_without_evidence"],
    },
    blockers,
    next_action: verdict === "pass" ? "store_learning_packet" : "close_run_with_evidence_first",
  };
}

module.exports = {
  buildMutualLearningExchange,
};
