const { buildCapabilitySpec } = require("./capability-spec");
const { buildNextBestAction } = require("./next-best-action");
const { resolveCapabilities } = require("./resolver");

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function optionArray(options, camelName, snakeName, fallback = []) {
  const value = options[camelName] || options[snakeName] || fallback;
  return Array.isArray(value) ? value : [value].filter(Boolean);
}

function buildContextCapsule(objective = "", options = {}, plan = {}) {
  return {
    project: options.project || "universal",
    objective,
    relevant_facts: optionArray(options, "relevantFacts", "relevant_facts"),
    boundaries: unique([
      ...optionArray(options, "boundaries", "boundaries", [
        "smallest_useful_change",
        "evidence_before_completion",
      ]),
    ]),
    do_not_touch: unique([
      ...optionArray(options, "doNotTouch", "do_not_touch", [
        "secrets",
        "external_write_without_approval",
        "publish_without_approval",
      ]),
    ]),
    capability_route: (plan.selected || []).map((capability) => capability.id),
  };
}

function buildExecutionRecipe(nextBestAction = {}, capabilitySpec = {}) {
  const primaryInput = capabilitySpec.interface?.input?.[0] || "objective";
  const primaryOutput = capabilitySpec.interface?.output?.[0] || "capability_result";
  const primaryEvidence = nextBestAction.evidence_required?.[0] || "verification_result";

  return [
    {
      step: "read_context_capsule",
      input: ["objective", "boundaries", "capability_route"],
      output: "working_scope",
      evidence: "context_capsule_present",
    },
    {
      step: "run_recommended_capability",
      input: [primaryInput],
      output: primaryOutput,
      evidence: primaryEvidence,
    },
    {
      step: "return_receipt",
      input: ["result_summary", "evidence", "remaining_risks"],
      output: "agent_receipt",
      evidence: "receipt_schema_valid",
    },
    {
      step: "teach_next_agent",
      input: ["memory_draft", "verified_receipt"],
      output: "learning_packet",
      evidence: "learning_packet_present",
    },
  ];
}

function buildAgentWorkbench(objective = "", options = {}) {
  const plan = resolveCapabilities(objective, options);
  const nextBestAction = buildNextBestAction(objective, options);
  const capabilitySpec = buildCapabilitySpec(nextBestAction.recommended_capability);

  return {
    schema: "kaizen7.agent_workbench.v1",
    version: 1,
    objective,
    context_capsule: buildContextCapsule(objective, options, plan),
    next_best_action: nextBestAction,
    capability: nextBestAction.recommended_capability,
    capability_spec: capabilitySpec,
    execution_recipe: buildExecutionRecipe(nextBestAction, capabilitySpec),
    approval_gates: plan.approvalGates || [],
    evidence_required: nextBestAction.evidence_required || [],
    stop_when: nextBestAction.stop_when,
    learning_rule: "teach_next_agent_only_after_verified_receipt",
    next_action: nextBestAction.next_action,
  };
}

module.exports = {
  buildAgentWorkbench,
  buildContextCapsule,
  buildExecutionRecipe,
};
