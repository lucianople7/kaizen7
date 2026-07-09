const assert = require("node:assert/strict");
const {
  COMMONS_CANDIDATES,
  buildOpenCommonsPack,
  formatOpenCommonsPack,
  rankCandidates,
} = require("../lib/k7-open-commons");

assert(COMMONS_CANDIDATES.length >= 7);
assert(COMMONS_CANDIDATES.some((candidate) => candidate.id === "local-first-memory"));
assert(COMMONS_CANDIDATES.some((candidate) => candidate.id === "mcp-and-tool-sandbox"));
assert(COMMONS_CANDIDATES.some((candidate) => candidate.id === "local-model-runtime"));

const ranked = rankCandidates("memoria local offline sin pagar");
assert.equal(ranked[0].score >= 1, true);
assert(ranked.some((candidate) => candidate.id === "local-first-memory"));

const pack = buildOpenCommonsPack("usar repos libres y conexiones propias");
assert.equal(pack.schema, "kaizen7.open_commons_pack.v1");
assert.equal(pack.agent_agnostic, true);
assert.equal(pack.paid_services_policy.default, "do not require paid services");
assert(pack.bring_your_own_connections.includes("local CLI"));
assert(pack.bring_your_own_connections.includes("MCP server"));
assert(pack.selection_rules.some((rule) => rule.includes("free/open/local")));
assert.equal(pack.route_contract.cost, "free | user-provided | paid-approved");

const formatted = formatOpenCommonsPack(pack);
assert(formatted.includes("# KAIZEN7 OPEN COMMONS PACK"));
assert(formatted.includes("## Free-First Policy"));
assert(formatted.includes("## Bring Your Own Connections"));

console.log("k7 open commons tests passed");
