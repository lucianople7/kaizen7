const assert = require("node:assert/strict");
const {
  buildMarketAdaptationPack,
  formatMarketAdaptationPack,
} = require("../lib/k7-market-adaptation-pack");

const pack = buildMarketAdaptationPack("adaptarse al mercado con conectores modulares");

assert.equal(pack.schema, "kaizen7.market_adaptation_pack.v1");
assert.equal(pack.agent_agnostic, true);
assert(pack.connection_policy.open_to.includes("official APIs"));
assert(pack.connection_policy.open_to.includes("MCP servers"));
assert(pack.connection_policy.open_to.includes("desktop app adapters"));
assert.equal(pack.connection_policy.connection_contract.type, "api | cli | mcp | browser | desktop | file_exchange | webhook | agent | manual");
assert(pack.signal_sources.some((source) => source.source === "official_docs"));
assert(pack.adaptation_loop.includes("run improvement radar before hardening the route"));
assert(pack.adaptation_loop.includes("rank connector candidates"));
assert(pack.improvement_radar.required_before.includes("locking a provider or agent-browser choice"));
assert(pack.evolution_gates.promote_to_skill_when.includes("same route succeeds at least 3 times"));
assert(pack.evolution_gates.refresh_when.includes("official docs changed"));
assert(pack.evolution_gates.retire_when.includes("maintenance cost exceeds reuse value"));
assert(pack.modular_surfaces.some((surface) => surface.module === "connector-registry"));
assert(pack.decision_matrix.some((decision) => decision.condition === "new market tool appears"));
assert.equal(pack.mesh_contract.schema, "kaizen7.tool_mesh_pack.v1");
assert(pack.acceptance_tests.some((test) => test.includes("stale adapter")));

const formatted = formatMarketAdaptationPack(pack);
assert(formatted.includes("# KAIZEN7 MARKET ADAPTATION PACK"));
assert(formatted.includes("## Evolution Gates"));
assert(formatted.includes("## Decision Matrix"));

console.log("k7 market adaptation pack tests passed");
