const { rankMetaskills } = require("./metaskill-ledger");

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function uniqueBySkill(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.skill || seen.has(item.skill)) return false;
    seen.add(item.skill);
    return true;
  });
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function activation(skill, trigger, discipline, verification) {
  return {
    skill,
    trigger,
    instructions: `Load ${skill} before acting. ${discipline}`,
    verification,
  };
}

function detectObjectiveType(goal = "", route = {}) {
  const text = `${goal} ${route.name || ""}`.toLowerCase();
  if (/kaizen7 contra kaizen7|self[- ]?evolution|self[- ]?improve|autoevalu|automejor|auto[- ]?mejor|self[- ]?eval/.test(text)) return "self-evolution";
  if (/bug|failing|failure|fail|error|broken|debug|regression/.test(text)) return "bugfix";
  if (/review|feedback|pr\b|pull request/.test(text)) return "review";
  if (/test|feature|implement|code|refactor|codigo|codex/.test(text)) return "implementation";
  if (/memory|memoria|obsidian|context/.test(text)) return "memory";
  if (/research|github|hugging|frontier|investigar/.test(text)) return "research";
  return "orchestration";
}

function activateMetaskills(options = {}) {
  const goal = normalizeText(options.goal || options.objective);
  const route = options.route || {};
  const capabilities = (options.capabilities || []).map(normalizeText);
  const objectiveType = options.objectiveType || detectObjectiveType(goal, route);
  const items = [];

  if (objectiveType === "self-evolution") {
    items.push(activation(
      "k7-self-evolution-loop",
      "kaizen_self_improvement_cycle",
      "Run bounded KAIZEN7-against-KAIZEN7 passes, convert concrete friction into tests, patch minimally, verify and write reusable learning.",
      "Each pass has k7:start or k7:eval evidence, a focused change or stop reason, verification and memory writeback.",
    ));
  }

  if (objectiveType === "bugfix") {
    items.push(activation(
      "systematic-debugging",
      "bug_or_test_failure_detected",
      "Reproduce the symptom first, identify one cause, change one thing, then verify the original symptom.",
      "Original failure is reproduced before the fix and passes after the fix.",
    ));
  }

  if (["implementation", "bugfix", "self-evolution"].includes(objectiveType) || capabilities.includes("edit_files")) {
    items.push(activation(
      "test-driven-development",
      "code_change_expected",
      "Write the failing test before production code and keep the change minimal.",
      "New or changed behavior has a test that failed before implementation and passes after.",
    ));
  }

  if (objectiveType === "review") {
    items.push(activation(
      "receiving-code-review",
      "review_feedback_detected",
      "Classify feedback as accepted, clarified or rejected before editing.",
      "Each accepted review item has a targeted change and verification.",
    ));
  }

  if (objectiveType === "research") {
    items.push(activation(
      "repo-hunter-github",
      "external_pattern_needed",
      "Find sourceable mature patterns before inventing new integration logic.",
      "Adopt, adapt, test later, reference only or reject is recorded.",
    ));
  }

  if (objectiveType === "memory") {
    items.push(activation(
      "k7-hive-memory",
      "shared_memory_needed",
      "Recover relevant project memory before choosing the next action.",
      "Only cited memory affects the action or writeback draft.",
    ));
  }

  items.push(activation(
    "verification-before-completion",
    "completion_claim_expected",
    "Run fresh verification before reporting done, fixed or passing.",
    "Final response names the exact command and result, or states the remaining gap.",
  ));

  const selected = uniqueBySkill(items).slice(0, Number(options.limit || 5));
  if (!options.ledger) return selected;

  const ranked = rankMetaskills(options.ledger, {
    objectiveType,
    candidates: selected.map((item) => item.skill),
  });
  const rankBySkill = new Map(ranked.map((item, index) => [item.skill, { ...item, index }]));
  return selected
    .map((item, index) => {
      const fitness = rankBySkill.get(item.skill) || { averageFitness: 0, sampleSize: 0, index };
      return {
        ...item,
        fitness: {
          averageFitness: fitness.averageFitness,
          sampleSize: fitness.sampleSize,
          source: fitness.sampleSize > 0 ? "metaskill-ledger" : "default-rule",
        },
      };
    })
    .sort((a, b) => (
      b.fitness.averageFitness - a.fitness.averageFitness
      || b.fitness.sampleSize - a.fitness.sampleSize
      || selected.findIndex((item) => item.skill === a.skill) - selected.findIndex((item) => item.skill === b.skill)
    ));
}

function scoreMetaskillFitness(outcome = {}) {
  let score = 0.35;
  const steps = Number(outcome.stepsBeforeFix || outcome.steps || 0);
  if (steps > 0) score += clamp((12 - steps) / 12, 0, 1) * 0.2;
  if (outcome.testsPassed) score += 0.18;
  if (outcome.reworkNeeded === false) score += 0.12;
  if (outcome.reusedContext) score += 0.08;
  if (outcome.riskReduced) score += 0.09;
  if (Number.isFinite(Number(outcome.confidenceAfter))) {
    score += clamp(Number(outcome.confidenceAfter), 0, 1) * 0.18;
  }
  if (outcome.reworkNeeded === true) score -= 0.18;
  if (outcome.testsPassed === false) score -= 0.2;
  return Number(clamp(score).toFixed(2));
}

function buildMetaskillTelemetry(options = {}) {
  const activations = options.activations || [];
  const outcome = options.outcome || {};
  const fitnessScore = scoreMetaskillFitness(outcome);
  const signals = [];
  if (outcome.testsPassed) signals.push("tests_passed");
  if (outcome.reworkNeeded === false) signals.push("no_rework");
  if (outcome.reusedContext) signals.push("context_reused");
  if (outcome.riskReduced) signals.push("risk_reduced");
  if (Number(outcome.stepsBeforeFix || 0) > 0) signals.push(`steps:${Number(outcome.stepsBeforeFix)}`);

  return {
    objectiveType: options.objectiveType || "unknown",
    activated: activations.map((item) => item.skill),
    fitnessScore,
    signals,
    memoryWriteback: `Metaskill fitness ${fitnessScore}: ${activations.map((item) => item.skill).join(", ") || "none"}`,
  };
}

module.exports = {
  activateMetaskills,
  buildMetaskillTelemetry,
  detectObjectiveType,
  scoreMetaskillFitness,
};
