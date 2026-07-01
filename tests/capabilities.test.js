const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  buildAgentContract,
  buildAgentBrief,
  buildAgentHandoff,
  buildCapabilityPacket,
  buildAgentReceipt,
  buildAgentReadiness,
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
assert(listCapabilities({ domain: "content" }).some((capability) => capability.id === "content.reel.script"));
assert.equal(getCapability("code.change").domain, "code");
assert.equal(getCapability("missing.capability"), null);

assert.equal(inferCapabilityDomain("crear reel de Mr Kaizen para foco"), "content");
assert.equal(inferCapabilityDomain("arreglar bug con tests en KAIZEN7"), "code");
assert.equal(inferCapabilityDomain("revisar claims de THE FOCUX para producto premium"), "commerce");

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
