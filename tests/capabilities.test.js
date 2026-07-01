const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  buildAgentContract,
  buildAgentBrief,
  buildAgentCycle,
  buildAgentHandoff,
  buildAgentRunCard,
  buildAgentRunVerdict,
  buildAgentWorkbench,
  buildCapabilityPacket,
  buildCapabilityForge,
  buildCapabilitySpec,
  buildAgentReceipt,
  buildAgentReadiness,
  buildKernelBridge,
  buildKernelOffer,
  buildLearningLoop,
  buildMemoryPlane,
  buildMutualLearningExchange,
  buildNextBestAction,
  buildSuperCapabilitySystem,
  buildWorldInteractionPlan,
  findRuntimeLanguage,
  getCapability,
  inferAgentIntent,
  inferCapabilityDomain,
  listCapabilities,
  listAgentLanguageSchemas,
  loadCapabilityRegistry,
  resolveCapabilities,
  validateAgentLanguage,
  verifyCapabilityEvidence,
  validateCapabilityRegistry,
} = require("../lib/capabilities");

const registry = loadCapabilityRegistry();

assert.equal(registry.schema, "kaizen7.capabilities.v1");
assert.equal(validateCapabilityRegistry(registry).length, 0);
assert(listCapabilities().length >= 12);
assert(listCapabilities().some((capability) => capability.id === "kernel.capability_registry"));
assert(listCapabilities().some((capability) => capability.id === "kernel.capability_forge"));
assert(listCapabilities({ domain: "content" }).some((capability) => capability.id === "content.reel.script"));
assert(listCapabilities({ domain: "agent" }).some((capability) => capability.id === "agent.handoff_cycle"));
assert(listCapabilities({ domain: "project" }).some((capability) => capability.id === "project.context_intake"));
assert(listCapabilities({ domain: "app" }).some((capability) => capability.id === "app.integration_plan"));
assert.equal(listCapabilities({ domain: "super" }).length, 12);
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.agent_companion"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.content_engine"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.next_best_action"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.agent_workbench"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.agent_run_card"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.agent_run_verdict"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.mutual_learning_exchange"));
assert(listCapabilities({ domain: "super" }).some((capability) => capability.id === "super.memory_plane"));
assert(listCapabilities({ domain: "world" }).some((capability) => capability.id === "world.mcp_tool_plan"));
assert(listCapabilities({ domain: "world" }).some((capability) => capability.id === "world.clip_intake"));
assert.equal(getCapability("code.change").domain, "code");
assert.equal(getCapability("missing.capability"), null);

assert.equal(inferCapabilityDomain("crear reel de Mr Kaizen para foco"), "content");
assert.equal(inferCapabilityDomain("arreglar bug con tests en KAIZEN7"), "code");
assert.equal(inferCapabilityDomain("revisar claims de THE FOCUX para producto premium"), "commerce");
assert.equal(inferCapabilityDomain("pasar trabajo a otro agente con handoff y receipt"), "agent");
assert.equal(inferCapabilityDomain("conectar una aplicacion externa con permisos y aprobaciones"), "app");
assert.equal(inferCapabilityDomain("preparar contexto de proyecto para Flowmatic"), "project");
assert.equal(inferCapabilityDomain("activar super capacidades para orquestar un ecosistema rapido"), "super");
assert.equal(inferCapabilityDomain("preparar mesa de trabajo del agente para avanzar rapido"), "super");
assert.equal(inferCapabilityDomain("crear tarjeta de ejecucion compacta para agente"), "super");
assert.equal(inferCapabilityDomain("cerrar tarjeta de agente con veredicto y evidencia"), "super");
assert.equal(inferCapabilityDomain("aprendizaje mutuo entre Codex y Kaizen7"), "super");
assert.equal(inferCapabilityDomain("activar memoria headroom graphy ponytail obsidian"), "super");
assert.equal(inferCapabilityDomain("usar MCP y conectores para interactuar con apps externas"), "world");

const codePlan = resolveCapabilities("implementar cambio con tests en KAIZEN7");
assert.equal(codePlan.status, "ready");
assert.equal(codePlan.inferredDomain, "code");
assert.equal(codePlan.selected[0].id, "code.change");
assert(!codePlan.selected.some((capability) => capability.id === "content.reel.script"));
assert(codePlan.approvalGates.includes("delete"));
assert(codePlan.verification.includes("tests_passed"));

const reelPlan = resolveCapabilities("crear reel de Mr Kaizen sobre foco en Bangkok");
assert.equal(reelPlan.inferredDomain, "content");
assert(reelPlan.selected.some((capability) => capability.id === "content.reel.script"));
assert(reelPlan.selected.some((capability) => capability.id === "persona.voice"));

const claimsPlan = resolveCapabilities("comprobar claims de THE FOCUX antes de publicar");
assert.equal(claimsPlan.inferredDomain, "commerce");
assert.equal(claimsPlan.selected[0].id, "claims.check");
assert(claimsPlan.approvalGates.includes("medical_claims"));

const agentPlan = resolveCapabilities("pasar trabajo a otro agente con handoff y receipt");
assert.equal(agentPlan.inferredDomain, "agent");
assert.equal(agentPlan.selected[0].id, "agent.handoff_cycle");
assert(agentPlan.verification.includes("receipt_schema_valid"));

const appPlan = resolveCapabilities("conectar una aplicacion externa con permisos y aprobaciones");
assert.equal(appPlan.inferredDomain, "app");
assert.equal(appPlan.selected[0].id, "app.integration_plan");
assert(appPlan.approvalGates.includes("external_write"));

const forgePlan = resolveCapabilities("forjar una nueva capacidad para agentes");
assert.equal(forgePlan.inferredDomain, "kernel");
assert.equal(forgePlan.selected[0].id, "kernel.capability_forge");

const superPlan = resolveCapabilities("activar super capacidades para orquestar un ecosistema rapido");
assert.equal(superPlan.inferredDomain, "super");
assert.equal(superPlan.selected[0].id, "super.agent_companion");
assert(superPlan.verification.includes("steps_reduced"));

const nextBestPlan = resolveCapabilities("decidir siguiente mejor accion para el agente");
assert.equal(nextBestPlan.inferredDomain, "super");
assert.equal(nextBestPlan.selected[0].id, "super.next_best_action");

const workbenchPlan = resolveCapabilities("preparar mesa de trabajo del agente para avanzar rapido");
assert.equal(workbenchPlan.inferredDomain, "super");
assert.equal(workbenchPlan.selected[0].id, "super.agent_workbench");

const runCardPlan = resolveCapabilities("crear tarjeta de ejecucion compacta para agente");
assert.equal(runCardPlan.inferredDomain, "super");
assert.equal(runCardPlan.selected[0].id, "super.agent_run_card");

const runVerdictPlan = resolveCapabilities("cerrar tarjeta de agente con veredicto y evidencia");
assert.equal(runVerdictPlan.inferredDomain, "super");
assert.equal(runVerdictPlan.selected[0].id, "super.agent_run_verdict");

const mutualLearningPlan = resolveCapabilities("aprendizaje mutuo entre Codex y Kaizen7");
assert.equal(mutualLearningPlan.inferredDomain, "super");
assert.equal(mutualLearningPlan.selected[0].id, "super.mutual_learning_exchange");

const memoryPlanePlan = resolveCapabilities("activar memoria headroom graphy ponytail obsidian");
assert.equal(memoryPlanePlan.inferredDomain, "super");
assert.equal(memoryPlanePlan.selected[0].id, "super.memory_plane");

const worldPlan = resolveCapabilities("usar MCP y conectores para interactuar con apps externas");
assert.equal(worldPlan.inferredDomain, "world");
assert.equal(worldPlan.selected[0].id, "world.app_connector_plan");
assert(worldPlan.approvalGates.includes("external_write"));

const capabilitySpec = buildCapabilitySpec("agent.handoff_cycle");
assert.equal(capabilitySpec.schema, "kaizen7.capability_spec.v1");
assert.equal(capabilitySpec.id, "agent.handoff_cycle");
assert.equal(capabilitySpec.interface.input[0], "objective");
assert(capabilitySpec.interface.output.includes("receipt"));
assert(capabilitySpec.evidence.required.includes("receipt_schema_valid"));
assert(capabilitySpec.agent_contract.route.includes("return_receipt"));

const forgedCapability = buildCapabilityForge("crear pipeline de contenido para Mr Kaizen con guion storyboard y evidencia", {
  id: "content.mr_kaizen_pipeline",
  domain: "content",
});
assert.equal(forgedCapability.schema, "kaizen7.capability_forge.v1");
assert.equal(forgedCapability.draft.id, "content.mr_kaizen_pipeline");
assert.equal(forgedCapability.draft.status, "experimental");
assert(forgedCapability.draft.inputs.includes("objective"));
assert(forgedCapability.draft.outputs.includes("capability_result"));
assert(forgedCapability.draft.verification.includes("evidence_present"));
assert.equal(forgedCapability.spec.schema, "kaizen7.capability_spec.v1");
assert.equal(forgedCapability.validation_errors.length, 0);
assert.equal(forgedCapability.next_action, "review_then_register");
assert.deepEqual(findRuntimeLanguage(forgedCapability), []);

const agentContract = buildAgentContract("implementar cambio con tests en KAIZEN7", {
  context: ["docs/CAPABILITY_KERNEL.md"],
});
assert.equal(agentContract.schema, "kaizen7.agent_contract.v1");
assert.equal(agentContract.intent, "code_change");
assert.deepEqual(agentContract.route, ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"]);
assert(agentContract.capabilities.includes("modify_code"));
assert.equal(agentContract.boundary.scope, "smallest_useful_change");
assert(agentContract.boundary.avoid.includes("secrets"));
assert.deepEqual(agentContract.context.references, ["docs/CAPABILITY_KERNEL.md"]);
assert(agentContract.evidence.required.includes("changed_surface"));
assert.equal(agentContract.done.rule, "do_not_complete_until_required_evidence_is_present");
assert.equal(agentContract.memory.rule, "draft_reusable_learning_only");
assert.equal(Object.hasOwn(agentContract, "commands"), false);
assert.equal(inferAgentIntent(codePlan, "implementar cambio con tests"), "code_change");

const agentBrief = buildAgentBrief("implementar cambio con tests en KAIZEN7", {
  contract: agentContract,
});
assert.equal(agentBrief.schema, "kaizen7.agent_brief.v1");
assert.equal(agentBrief.role, "working_companion");
assert.equal(agentBrief.objective, "implementar cambio con tests en KAIZEN7");
assert.equal(agentBrief.intent, "code_change");
assert.equal(agentBrief.first_move, "understand_scope");
assert.equal(agentBrief.focus, "smallest_useful_change");
assert(agentBrief.avoid.includes("secrets"));
assert(agentBrief.evidence_needed.includes("verification_result"));
assert.equal(agentBrief.stop_when, "required_evidence_is_present");
assert.deepEqual(agentBrief.return, ["result_summary", "evidence", "risks", "memory_draft"]);
assert.equal(Object.hasOwn(agentBrief, "commands"), false);

const agentHandoff = buildAgentHandoff("implementar cambio con tests en KAIZEN7", {
  contract: agentContract,
  brief: agentBrief,
});
assert.equal(agentHandoff.schema, "kaizen7.agent_handoff.v1");
assert.equal(agentHandoff.contract.schema, "kaizen7.agent_contract.v1");
assert.equal(agentHandoff.brief.schema, "kaizen7.agent_brief.v1");
assert.equal(agentHandoff.expected_receipt_schema, "kaizen7.agent_receipt.v1");
assert.equal(agentHandoff.handoff_rule, "use_brief_for_action_return_receipt_for_verification");
assert.equal(Object.hasOwn(agentHandoff, "commands"), false);

const packet = buildCapabilityPacket("implementar cambio con tests en KAIZEN7", {
  allowedFiles: ["lib/capabilities/registry.js", "tests/capabilities.test.js"],
  context: ["docs/ARCHITECTURE.md"],
});
assert.equal(packet.mode, "k7-execution-packet");
assert.equal(packet.agent_contract.schema, "kaizen7.agent_contract.v1");
assert.equal(packet.agent_contract.intent, "code_change");
assert(packet.agent_contract.evidence.required.includes("verification_result"));
assert.equal(Object.hasOwn(packet.agent_contract, "commands"), false);
assert.equal(packet.agent_brief.schema, "kaizen7.agent_brief.v1");
assert.equal(packet.agent_brief.first_move, "understand_scope");
assert(packet.agent_brief.evidence_needed.includes("verification_result"));
assert.equal(Object.hasOwn(packet.agent_brief, "commands"), false);
assert.equal(packet.agent_handoff.schema, "kaizen7.agent_handoff.v1");
assert.equal(packet.agent_handoff.expected_receipt_schema, "kaizen7.agent_receipt.v1");
assert.deepEqual(packet.agent_language_validation, {
  contract: "pass",
  brief: "pass",
  handoff: "pass",
});
assert.equal(packet.agent_readiness.schema, "kaizen7.agent_readiness.v1");
assert.equal(packet.agent_readiness.verdict, "pass");
assert.equal(packet.agent_readiness.next_action, "execute_handoff");
assert.equal(packet.operator, "codex");
assert.equal(packet.capabilities[0], "code.change");
assert(packet.allowed_files.includes("lib/capabilities/registry.js"));
assert(packet.context.includes("docs/ARCHITECTURE.md"));
assert(packet.forbidden_actions.includes("credential_write"));
assert(packet.commands.includes("node tests/capabilities.test.js"));
assert(packet.commands.includes("npm.cmd run check"));
assert(packet.evidence_required.includes("tests"));
assert.equal(packet.writeback.rule, "write only reusable learning; no secrets");

const legacyPacket = { ...packet };
delete legacyPacket.agent_contract;

const blockedVerification = verifyCapabilityEvidence(legacyPacket, {
  claims: ["changed files are scoped"],
  evidence: { diff: ["lib/capabilities/registry.js"] },
});
assert.equal(blockedVerification.verdict, "block");
assert(blockedVerification.missing.includes("tests"));
assert(blockedVerification.missing.includes("risks"));

const passedVerification = verifyCapabilityEvidence(legacyPacket, {
  claims: ["changed files are scoped", "tests passed", "risks reported"],
  evidence: {
    diff: ["lib/capabilities/registry.js"],
    tests: "node tests/capabilities.test.js passed",
    risks: ["no external effects"],
  },
});
assert.equal(passedVerification.verdict, "pass");
assert.equal(passedVerification.missing.length, 0);
assert(passedVerification.acceptedClaims.includes("tests passed"));

const semanticBlocked = verifyCapabilityEvidence(packet, {
  claims: ["changed surface reported"],
  evidence: {
    changed_surface: ["lib/capabilities/agent-contract.js"],
  },
});
assert.equal(semanticBlocked.verdict, "block");
assert(semanticBlocked.missing.includes("verification_result"));
assert(semanticBlocked.missing.includes("remaining_risks"));

const semanticPassed = verifyCapabilityEvidence(packet, {
  claims: ["changed surface reported", "verification passed", "risks listed"],
  evidence: {
    changed_surface: ["lib/capabilities/agent-contract.js"],
    verification_result: "capability tests passed",
    remaining_risks: ["none known"],
  },
});
assert.equal(semanticPassed.verdict, "pass");
assert.equal(semanticPassed.missing.length, 0);
assert(semanticPassed.acceptedClaims.includes("verification passed"));

const passingReceipt = buildAgentReceipt(packet, {
  summary: "agent contract receipt added",
  claims: ["changed surface reported", "verification passed", "risks listed"],
  evidence: {
    changed_surface: ["lib/capabilities/agent-receipt.js"],
    verification_result: "capability tests passed",
    remaining_risks: ["none known"],
  },
  memory_draft: "Receipts let agents hand back evidence in a stable format.",
});
assert.equal(passingReceipt.schema, "kaizen7.agent_receipt.v1");
assert.equal(passingReceipt.verdict, "pass");
assert.equal(passingReceipt.intent, "code_change");
assert.equal(passingReceipt.next_action, "complete");
assert.equal(passingReceipt.missing_evidence.length, 0);
assert(passingReceipt.accepted_claims.includes("verification passed"));
assert.equal(passingReceipt.memory_draft, "Receipts let agents hand back evidence in a stable format.");
assert.equal(Object.hasOwn(passingReceipt, "commands"), false);

const blockedReceipt = buildAgentReceipt(packet, {
  summary: "partial work",
  evidence: {
    changed_surface: ["lib/capabilities/agent-receipt.js"],
  },
});
assert.equal(blockedReceipt.verdict, "block");
assert.equal(blockedReceipt.next_action, "provide_missing_evidence");
assert(blockedReceipt.missing_evidence.includes("verification_result"));

const passedCycle = buildAgentCycle("implementar cambio con tests en KAIZEN7", {
  summary: "cycle closes the kernel loop",
  claims: ["verification passed"],
  evidence: {
    changed_surface: ["lib/capabilities/agent-cycle.js"],
    verification_result: "capability tests passed",
    remaining_risks: ["none known"],
  },
  memory_draft: "Agent Cycle closes readiness, receipt and verification in one kernel object.",
});
assert.equal(passedCycle.schema, "kaizen7.agent_cycle.v1");
assert.equal(passedCycle.verdict, "pass");
assert.equal(passedCycle.readiness.verdict, "pass");
assert.equal(passedCycle.verification.verdict, "pass");
assert.equal(passedCycle.receipt.next_action, "complete");
assert.equal(passedCycle.next_action, "complete");
assert.equal(passedCycle.memory_draft, "Agent Cycle closes readiness, receipt and verification in one kernel object.");

const blockedCycle = buildAgentCycle("implementar cambio con tests en KAIZEN7", {
  summary: "cycle blocks incomplete evidence",
  evidence: {
    changed_surface: ["lib/capabilities/agent-cycle.js"],
  },
});
assert.equal(blockedCycle.verdict, "block");
assert.equal(blockedCycle.next_action, "provide_missing_evidence");
assert(blockedCycle.verification.missing.includes("verification_result"));

const kernelBridge = buildKernelBridge("crear contenido para Mr Kaizen con evidencia", {
  consumer: "any_agent",
  project: "mr_kaizen",
});
assert.equal(kernelBridge.schema, "kaizen7.kernel_bridge.v1");
assert.equal(kernelBridge.consumer, "any_agent");
assert.equal(kernelBridge.project, "mr_kaizen");
assert.equal(kernelBridge.interface.input, "objective_plus_optional_result_evidence");
assert.equal(kernelBridge.interface.output, "agent_cycle_or_repair_request");
assert(kernelBridge.compatible_contexts.includes("content"));
assert(kernelBridge.kernel_objects.includes("kaizen7.agent_cycle.v1"));
assert(kernelBridge.guarantees.includes("evidence_gated_completion"));
assert.equal(kernelBridge.next_action, "run_cycle");
assert.deepEqual(findRuntimeLanguage(kernelBridge), []);

const kernelOffer = buildKernelOffer("convertir agentes y proyectos en herramientas utiles");
assert.equal(kernelOffer.schema, "kaizen7.kernel_offer.v1");
assert.equal(kernelOffer.product, "KAIZEN7");
assert(kernelOffer.promise.includes("turn_agent_work_into_verified_capability_cycles"));
assert(kernelOffer.consumers.includes("codex"));
assert(kernelOffer.consumers.includes("content_systems"));
assert(kernelOffer.guarantees.includes("less_steps_less_tokens"));
assert(kernelOffer.capability_backbone.includes("kernel.capability_forge"));
assert(kernelOffer.capability_backbone.includes("agent.handoff_cycle"));
assert(kernelOffer.non_goals.includes("replace_domain_projects"));
assert.equal(kernelOffer.next_action, "select_capability_or_forge_missing_one");
assert.deepEqual(findRuntimeLanguage(kernelOffer), []);

const learningLoop = buildLearningLoop(passedCycle);
assert.equal(learningLoop.schema, "kaizen7.learning_loop.v1");
assert.equal(learningLoop.verdict, "pass");
assert.equal(learningLoop.learning.memory_draft, passedCycle.memory_draft);
assert(learningLoop.teaching_packet.agent_instruction.includes("reuse_learning_before_next_action"));
assert(learningLoop.teaching_packet.capability_hints.includes("memory.writeback_draft"));
assert.equal(learningLoop.next_action, "teach_next_agent");
assert.deepEqual(findRuntimeLanguage(learningLoop), []);

const blockedLearningLoop = buildLearningLoop(blockedCycle);
assert.equal(blockedLearningLoop.verdict, "block");
assert(blockedLearningLoop.blockers.includes("cycle_not_passed"));
assert.equal(blockedLearningLoop.next_action, "provide_evidence_before_learning");

const superSystem = buildSuperCapabilitySystem("orquestar Codex Mr Kaizen Flowmatic y apps sin friccion");
assert.equal(superSystem.schema, "kaizen7.super_capability_system.v1");
assert.equal(superSystem.pieces.length, 12);
assert(superSystem.pieces.some((piece) => piece.id === "super.agent_companion"));
assert(superSystem.pieces.some((piece) => piece.id === "super.safe_app_operator"));
assert(superSystem.guarantees.includes("less_steps_less_tokens"));
assert(superSystem.orchestration_rule.includes("compose_small_capabilities"));
assert.equal(superSystem.next_action, "select_super_capability");
assert.deepEqual(findRuntimeLanguage(superSystem), []);

const worldInteraction = buildWorldInteractionPlan("usar MCP y clips para preparar publicacion sin publicar", {
  target: "mcp",
  artifact: "clip",
});
assert.equal(worldInteraction.schema, "kaizen7.world_interaction_plan.v1");
assert.equal(worldInteraction.verdict, "plan_only");
assert(worldInteraction.capabilities.includes("world.mcp_tool_plan"));
assert(worldInteraction.capabilities.includes("world.clip_intake"));
assert(worldInteraction.approval_gates.includes("external_write"));
assert(worldInteraction.evidence_contract.includes("no_unapproved_external_effect"));
assert.equal(worldInteraction.next_action, "prepare_handoff_or_request_approval");
assert.deepEqual(findRuntimeLanguage(worldInteraction), []);

const nextBestAction = buildNextBestAction("crear reel de Mr Kaizen con evidencia", {
  state: "ready",
});
assert.equal(nextBestAction.schema, "kaizen7.next_best_action.v1");
assert.equal(nextBestAction.state, "ready");
assert.equal(nextBestAction.recommended_capability, "super.content_engine");
assert.equal(nextBestAction.next_action, "run_cycle");
assert(nextBestAction.evidence_required.includes("verification_result"));
assert(nextBestAction.forbidden_actions.includes("external_write_without_approval"));
assert.equal(nextBestAction.stop_when, "receipt_verified");
assert.deepEqual(findRuntimeLanguage(nextBestAction), []);

const blockedNextBestAction = buildNextBestAction("continuar trabajo sin evidencia", {
  state: "blocked",
  missingEvidence: ["verification_result"],
});
assert.equal(blockedNextBestAction.next_action, "provide_missing_evidence");
assert(blockedNextBestAction.inputs_needed.includes("verification_result"));

const agentWorkbench = buildAgentWorkbench("crear reel de Mr Kaizen con evidencia", {
  project: "mr_kaizen",
  relevantFacts: ["brand voice matters"],
});
assert.equal(agentWorkbench.schema, "kaizen7.agent_workbench.v1");
assert.equal(agentWorkbench.context_capsule.project, "mr_kaizen");
assert.equal(agentWorkbench.next_best_action.schema, "kaizen7.next_best_action.v1");
assert.equal(agentWorkbench.capability, "super.content_engine");
assert.equal(agentWorkbench.capability_spec.schema, "kaizen7.capability_spec.v1");
assert(agentWorkbench.execution_recipe.some((step) => step.step === "return_receipt"));
assert(agentWorkbench.evidence_required.includes("verification_result"));
assert.equal(agentWorkbench.stop_when, "receipt_verified");
assert.equal(agentWorkbench.learning_rule, "teach_next_agent_only_after_verified_receipt");
assert.deepEqual(findRuntimeLanguage(agentWorkbench), []);

const agentRunCard = buildAgentRunCard("crear reel de Mr Kaizen con evidencia", {
  project: "mr_kaizen",
  relevantFacts: ["brand voice matters"],
});
assert.equal(agentRunCard.schema, "kaizen7.agent_run_card.v1");
assert.equal(agentRunCard.project, "mr_kaizen");
assert.equal(agentRunCard.capability, "super.content_engine");
assert.equal(agentRunCard.action, "run_cycle");
assert(agentRunCard.mission.includes("crear reel de Mr Kaizen con evidencia"));
assert(agentRunCard.recipe.length <= 4);
assert(agentRunCard.recipe.includes("return_receipt"));
assert(agentRunCard.evidence.includes("verification_result"));
assert(agentRunCard.preflight_checks.includes("check_required_inputs"));
assert.equal(agentRunCard.blockers.includes("missing_required_input"), false);
assert.equal(agentRunCard.done_when, "receipt_verified");
assert.equal(agentRunCard.next_handoff.schema, "kaizen7.agent_handoff_hint.v1");
assert.deepEqual(findRuntimeLanguage(agentRunCard), []);

const passingRunVerdict = buildAgentRunVerdict(agentRunCard, {
  result_summary: "Reel package prepared.",
  evidence: {
    changed_surface: ["script"],
    verification_result: "checked",
    remaining_risks: ["none known"],
  },
  memory_draft: "Content run card can close when evidence keys are present.",
});
assert.equal(passingRunVerdict.schema, "kaizen7.agent_run_verdict.v1");
assert.equal(passingRunVerdict.verdict, "pass");
assert.equal(passingRunVerdict.next_action, "teach_next_agent");
assert.equal(passingRunVerdict.done, true);
assert.equal(passingRunVerdict.learning_allowed, true);
assert.equal(passingRunVerdict.receipt_hint.schema, "kaizen7.agent_receipt_hint.v1");
assert.deepEqual(passingRunVerdict.missing_evidence, []);
assert.deepEqual(findRuntimeLanguage(passingRunVerdict), []);

const blockedRunVerdict = buildAgentRunVerdict(agentRunCard, {
  result_summary: "Reel package prepared.",
  evidence: {
    changed_surface: ["script"],
  },
});
assert.equal(blockedRunVerdict.verdict, "block");
assert.equal(blockedRunVerdict.done, false);
assert.equal(blockedRunVerdict.learning_allowed, false);
assert(blockedRunVerdict.missing_evidence.includes("verification_result"));
assert.equal(blockedRunVerdict.next_action, "provide_missing_evidence");

const mutualLearningExchange = buildMutualLearningExchange(passingRunVerdict, {
  codexObservation: "Run cards close faster when closure evidence is compact.",
  kaizenGuidance: "Ask for changed surface, verification result and risks before teaching.",
});
assert.equal(mutualLearningExchange.schema, "kaizen7.mutual_learning_exchange.v1");
assert.equal(mutualLearningExchange.verdict, "pass");
assert.equal(mutualLearningExchange.codex_to_kaizen7.lesson, "Run cards close faster when closure evidence is compact.");
assert(mutualLearningExchange.codex_to_kaizen7.reusable_when.includes("similar_run_card_closes"));
assert.equal(mutualLearningExchange.kaizen7_to_codex.guidance, "Ask for changed surface, verification result and risks before teaching.");
assert(mutualLearningExchange.kaizen7_to_codex.apply_before.includes("next_best_action"));
assert.equal(mutualLearningExchange.next_action, "store_learning_packet");
assert.deepEqual(findRuntimeLanguage(mutualLearningExchange), []);

const blockedMutualLearningExchange = buildMutualLearningExchange(blockedRunVerdict);
assert.equal(blockedMutualLearningExchange.verdict, "block");
assert(blockedMutualLearningExchange.blockers.includes("learning_not_allowed"));
assert.equal(blockedMutualLearningExchange.next_action, "close_run_with_evidence_first");

const memoryPlane = buildMemoryPlane("activar memoria headroom graphy ponytail obsidian", {
  project: "kaizen7",
  exchange: mutualLearningExchange,
  headroomBudget: 900,
});
assert.equal(memoryPlane.schema, "kaizen7.memory_plane.v1");
assert.equal(memoryPlane.verdict, "plan_only");
assert.equal(memoryPlane.headroom.max_context_tokens, 900);
assert.equal(memoryPlane.headroom.compression_rule, "keep_only_reusable_operational_memory");
assert(memoryPlane.ponytail.summary.includes("Run cards close faster"));
assert(memoryPlane.graphy.nodes.some((node) => node.id === "project:kaizen7"));
assert(memoryPlane.graphy.edges.some((edge) => edge.type === "teaches"));
assert.equal(memoryPlane.obsidian.vault, "Obsidian");
assert.equal(memoryPlane.obsidian.write_policy, "no_write_without_verdict_and_approval");
assert(memoryPlane.obsidian.destination.includes("Obsidian"));
assert(memoryPlane.evidence_gate.includes("learning_allowed"));
assert.equal(memoryPlane.next_action, "review_then_write_memory_note");
assert.deepEqual(findRuntimeLanguage(memoryPlane), []);

assert.deepEqual(findRuntimeLanguage(agentContract), []);
assert.deepEqual(findRuntimeLanguage(agentBrief), []);
assert.deepEqual(findRuntimeLanguage(agentHandoff), []);
assert.deepEqual(findRuntimeLanguage(passingReceipt), []);
assert(findRuntimeLanguage({ command: "npm.cmd run check" }).includes("npm.cmd"));
assert(listAgentLanguageSchemas().includes("kaizen7.agent_contract.v1"));

const validLanguage = validateAgentLanguage(agentHandoff, "kaizen7.agent_handoff.v1");
assert.equal(validLanguage.verdict, "pass");
assert.equal(validLanguage.schema, "kaizen7.agent_handoff.v1");
assert.equal(validLanguage.missing.length, 0);
assert.equal(validLanguage.runtime_language.length, 0);

const runtimeBlockedLanguage = validateAgentLanguage({ ...agentBrief, note: "npm.cmd run check" });
assert.equal(runtimeBlockedLanguage.verdict, "block");
assert(runtimeBlockedLanguage.runtime_language.includes("npm.cmd"));

const missingFieldLanguage = validateAgentLanguage({ schema: "kaizen7.agent_brief.v1" });
assert.equal(missingFieldLanguage.verdict, "block");
assert(missingFieldLanguage.missing.includes("objective"));

const blockedReadiness = buildAgentReadiness({
  ...packet,
  agent_brief: { schema: "kaizen7.agent_brief.v1" },
  capability_plan: { ...packet.capability_plan, missing_inputs: ["goal"] },
});
assert.equal(blockedReadiness.verdict, "block");
assert(blockedReadiness.blocks.includes("brief"));
assert(blockedReadiness.missing_inputs.includes("goal"));

const listCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--list"], { encoding: "utf8" });
assert.equal(listCli.status, 0);
assert(listCli.stdout.includes("kernel.capability_registry"));

const planCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--plan", "crear reel de Mr Kaizen"], {
  encoding: "utf8",
});
assert.equal(planCli.status, 0);
assert(planCli.stdout.includes("content.reel.script"));

const packetCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--packet", "implementar cambio con tests"], {
  encoding: "utf8",
});
assert.equal(packetCli.status, 0);
assert(packetCli.stdout.includes("k7-execution-packet"));

const contractCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--contract", "implementar cambio con tests"], {
  encoding: "utf8",
});
assert.equal(contractCli.status, 0);
assert(contractCli.stdout.includes("kaizen7.agent_contract.v1"));
assert(!contractCli.stdout.includes("npm.cmd"));

const briefCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--brief", "implementar cambio con tests"], {
  encoding: "utf8",
});
assert.equal(briefCli.status, 0);
assert(briefCli.stdout.includes("kaizen7.agent_brief.v1"));
assert(!briefCli.stdout.includes("npm.cmd"));

const handoffCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--handoff", "implementar cambio con tests"], {
  encoding: "utf8",
});
assert.equal(handoffCli.status, 0);
assert(handoffCli.stdout.includes("kaizen7.agent_handoff.v1"));
assert(handoffCli.stdout.includes("kaizen7.agent_receipt.v1"));
assert(!handoffCli.stdout.includes("npm.cmd"));

const readyCli = spawnSync(process.execPath, ["lib/capabilities/cli.js", "--ready", "implementar cambio con tests"], {
  encoding: "utf8",
});
assert.equal(readyCli.status, 0);
assert(readyCli.stdout.includes("kaizen7.agent_readiness.v1"));
assert(readyCli.stdout.includes("\"next_action\": \"execute_handoff\""));

const receiptEvidence = JSON.stringify({
  summary: "receipt cli works",
  claims: ["verification passed"],
  evidence: {
    changed_surface: ["lib/capabilities/cli.js"],
    verification_result: "capability tests passed",
    remaining_risks: ["none known"],
  },
  memory_draft: "Receipt CLI gives agents a stable return shape.",
});
const receiptCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--receipt",
  "implementar cambio con tests",
  "--evidence",
  receiptEvidence,
], { encoding: "utf8" });
assert.equal(receiptCli.status, 0);
assert(receiptCli.stdout.includes("kaizen7.agent_receipt.v1"));
assert(receiptCli.stdout.includes("\"next_action\": \"complete\""));
assert(!receiptCli.stdout.includes("npm.cmd"));

const cycleCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--cycle",
  "implementar cambio con tests",
  "--evidence",
  receiptEvidence,
], { encoding: "utf8" });
assert.equal(cycleCli.status, 0);
assert(cycleCli.stdout.includes("kaizen7.agent_cycle.v1"));
assert(cycleCli.stdout.includes("\"next_action\": \"complete\""));

const bridgeCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--bridge",
  "crear contenido para Mr Kaizen",
], { encoding: "utf8" });
assert.equal(bridgeCli.status, 0);
assert(bridgeCli.stdout.includes("kaizen7.kernel_bridge.v1"));
assert(bridgeCli.stdout.includes("evidence_gated_completion"));

const specCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--spec",
  "agent.handoff_cycle",
], { encoding: "utf8" });
assert.equal(specCli.status, 0);
assert(specCli.stdout.includes("kaizen7.capability_spec.v1"));
assert(specCli.stdout.includes("return_receipt"));

const forgeCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--forge",
  "crear pipeline de contenido para Mr Kaizen",
], { encoding: "utf8" });
assert.equal(forgeCli.status, 0);
assert(forgeCli.stdout.includes("kaizen7.capability_forge.v1"));
assert(forgeCli.stdout.includes("review_then_register"));

const offerCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--offer",
  "convertir agentes y proyectos en herramientas utiles",
], { encoding: "utf8" });
assert.equal(offerCli.status, 0);
assert(offerCli.stdout.includes("kaizen7.kernel_offer.v1"));
assert(offerCli.stdout.includes("less_steps_less_tokens"));

const learnCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--learn",
  "implementar cambio con tests",
  "--evidence",
  receiptEvidence,
], { encoding: "utf8" });
assert.equal(learnCli.status, 0);
assert(learnCli.stdout.includes("kaizen7.learning_loop.v1"));
assert(learnCli.stdout.includes("teach_next_agent"));

const superCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--super",
  "orquestar Codex Mr Kaizen Flowmatic y apps sin friccion",
], { encoding: "utf8" });
assert.equal(superCli.status, 0);
assert(superCli.stdout.includes("kaizen7.super_capability_system.v1"));
assert(superCli.stdout.includes("super.agent_companion"));

const worldCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--world",
  "usar MCP y clips para preparar publicacion sin publicar",
], { encoding: "utf8" });
assert.equal(worldCli.status, 0);
assert(worldCli.stdout.includes("kaizen7.world_interaction_plan.v1"));
assert(worldCli.stdout.includes("prepare_handoff_or_request_approval"));

const nextCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--next",
  "crear reel de Mr Kaizen con evidencia",
], { encoding: "utf8" });
assert.equal(nextCli.status, 0);
assert(nextCli.stdout.includes("kaizen7.next_best_action.v1"));
assert(nextCli.stdout.includes("run_cycle"));

const workbenchCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--workbench",
  "crear reel de Mr Kaizen con evidencia",
], { encoding: "utf8" });
assert.equal(workbenchCli.status, 0);
assert(workbenchCli.stdout.includes("kaizen7.agent_workbench.v1"));
assert(workbenchCli.stdout.includes("return_receipt"));

const runCardCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--run-card",
  "crear reel de Mr Kaizen con evidencia",
], { encoding: "utf8" });
assert.equal(runCardCli.status, 0);
assert(runCardCli.stdout.includes("kaizen7.agent_run_card.v1"));
assert(runCardCli.stdout.includes("receipt_verified"));

const runVerdictCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--run-verdict",
  "crear reel de Mr Kaizen con evidencia",
  "--evidence",
  JSON.stringify({
    result_summary: "Reel package prepared.",
    evidence: {
      changed_surface: ["script"],
      verification_result: "checked",
      remaining_risks: ["none known"],
    },
    memory_draft: "Run verdict closes with evidence.",
  }),
], { encoding: "utf8" });
assert.equal(runVerdictCli.status, 0);
assert(runVerdictCli.stdout.includes("kaizen7.agent_run_verdict.v1"));
assert(runVerdictCli.stdout.includes("\"verdict\": \"pass\""));

const mutualLearningCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--mutual-learn",
  "crear reel de Mr Kaizen con evidencia",
  "--evidence",
  JSON.stringify({
    result_summary: "Reel package prepared.",
    evidence: {
      changed_surface: ["script"],
      verification_result: "checked",
      remaining_risks: ["none known"],
    },
    memory_draft: "Mutual learning closes with evidence.",
    codex_observation: "Compact closure evidence reduces repeated reasoning.",
  }),
], { encoding: "utf8" });
assert.equal(mutualLearningCli.status, 0);
assert(mutualLearningCli.stdout.includes("kaizen7.mutual_learning_exchange.v1"));
assert(mutualLearningCli.stdout.includes("store_learning_packet"));

const memoryPlaneCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--memory-plane",
  "activar memoria headroom graphy ponytail obsidian",
  "--evidence",
  JSON.stringify({
    exchange: mutualLearningExchange,
    project: "kaizen7",
  }),
], { encoding: "utf8" });
assert.equal(memoryPlaneCli.status, 0);
assert(memoryPlaneCli.stdout.includes("kaizen7.memory_plane.v1"));
assert(memoryPlaneCli.stdout.includes("review_then_write_memory_note"));

const validateCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--validate",
  "--evidence",
  JSON.stringify(agentBrief),
], { encoding: "utf8" });
assert.equal(validateCli.status, 0);
assert(validateCli.stdout.includes("\"verdict\": \"pass\""));

const blockedValidateCli = spawnSync(process.execPath, [
  "lib/capabilities/cli.js",
  "--validate",
  "--evidence",
  JSON.stringify({ ...agentBrief, note: "PowerShell" }),
], { encoding: "utf8" });
assert.equal(blockedValidateCli.status, 0);
assert(blockedValidateCli.stdout.includes("\"verdict\": \"block\""));
assert(blockedValidateCli.stdout.includes("PowerShell"));

console.log("capability kernel tests passed");
