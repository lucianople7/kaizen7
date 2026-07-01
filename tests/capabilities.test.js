const assert = require("node:assert/strict");
const {
  getCapability,
  inferCapabilityDomain,
  listCapabilities,
  loadCapabilityRegistry,
  resolveCapabilities,
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

console.log("capability kernel tests passed");
