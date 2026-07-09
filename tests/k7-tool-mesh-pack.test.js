const assert = require("node:assert/strict");
const {
  buildAdapterPack,
  buildFrontierModules,
  buildToolMeshPack,
  formatToolMeshPack,
  slugify,
} = require("../lib/k7-tool-mesh-pack");

const pack = buildToolMeshPack("conectar apps sin API con una ruta reutilizable");

assert.equal(pack.schema, "kaizen7.tool_mesh_pack.v1");
assert.equal(pack.agent_agnostic, true);
assert(pack.core_loop.includes("write receipt"));
assert(pack.product_pillars.some((pillar) => pillar.pillar === "tool_mesh"));
assert.equal(pack.adapter_pack.schema, "kaizen7.adapter_pack.v1");
assert(pack.adapter_pack.adapter_types.some((adapter) => adapter.type === "desktop"));
assert(pack.scoring_model.fields.includes("artifact_verifiability"));
assert(pack.scoring_model.reject_if.includes("cannot produce a verifiable artifact"));
assert(pack.frontier_modules.some((module) => module.id === "adapter-forge-templates"));
assert(pack.build_order.includes("receipt-ledger"));
assert.equal(pack.metaskill_contract.schema, "kaizen7.metaskill_card.v1");
assert.equal(pack.anything_contract.schema, "kaizen7.anything_route.v1");

const modules = buildFrontierModules();
assert.equal(modules[0].id, "receipt-ledger");
assert.equal(modules.filter((module) => module.build_now).length, 3);

const adapterPack = buildAdapterPack("usar una app local");
assert.equal(adapterPack.manifest.name, "usar-una-app-local");
assert.equal(adapterPack.manifest.dry_run_required, true);

assert.equal(slugify("Conectar App!!!"), "conectar-app");

const formatted = formatToolMeshPack(pack);
assert(formatted.includes("# KAIZEN7 TOOL MESH PACK"));
assert(formatted.includes("## Product Pillars"));
assert(formatted.includes("## Adapter Pack"));
assert(formatted.includes("## Scoring Model"));

console.log("k7 tool mesh pack tests passed");
