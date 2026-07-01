function buildKernelOffer(objective = "", options = {}) {
  return {
    schema: "kaizen7.kernel_offer.v1",
    version: 1,
    product: "KAIZEN7",
    objective,
    audience: options.audience || "agents_projects_and_apps",
    promise: [
      "turn_agent_work_into_verified_capability_cycles",
      "reduce_repeated_orientation",
      "make_handoffs_auditable",
      "turn_new_needs_into_reviewable_capabilities",
    ],
    consumers: ["codex", "agent_platforms", "content_systems", "project_workflows", "app_connectors"],
    guarantees: [
      "less_steps_less_tokens",
      "evidence_gated_completion",
      "portable_agent_language",
      "review_before_external_effect",
      "memory_draft_only",
    ],
    capability_backbone: [
      "kernel.capability_resolver",
      "kernel.capability_forge",
      "agent.handoff_cycle",
      "project.context_intake",
      "app.integration_plan",
      "memory.writeback_draft",
    ],
    non_goals: [
      "replace_domain_projects",
      "auto_publish_without_approval",
      "store_secrets",
      "claim_completion_without_evidence",
    ],
    usable_when: [
      "an_agent_needs_a_clear_work_boundary",
      "a_project_needs_context_intake",
      "an_app_needs_safe_integration_planning",
      "a_new_repeatable_need_should_become_a_capability",
    ],
    next_action: "select_capability_or_forge_missing_one",
  };
}

module.exports = {
  buildKernelOffer,
};
