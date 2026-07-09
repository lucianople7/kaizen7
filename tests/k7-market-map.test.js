const assert = require("node:assert/strict");
const {
  MARKET_PROBLEMS,
  buildMarketMap,
  formatMarketMap,
  rankProblems,
} = require("../lib/k7-market-map");

assert(MARKET_PROBLEMS.length >= 8);
assert(MARKET_PROBLEMS.some((problem) => problem.id === "tool_trust_gap"));
assert(MARKET_PROBLEMS.some((problem) => problem.id === "context_token_waste"));
assert(MARKET_PROBLEMS.some((problem) => problem.id === "api_blocked_work"));

const ranked = rankProblems("conectar app sin API con menos tokens y mas confianza");
assert.equal(ranked[0].rank, 1);
assert(ranked.some((problem) => problem.id === "api_blocked_work"));
assert(ranked.some((problem) => problem.id === "context_token_waste"));

const map = buildMarketMap("conectar agentes a herramientas sin API y gastar menos tokens");

assert.equal(map.schema, "kaizen7.market_map.v1");
assert.equal(map.identity, "KAIZEN7 market problem map");
assert(map.owns.includes("route selection"));
assert(map.owns.includes("tool trust gates"));
assert(map.owns.includes("receipt memory"));
assert(map.ranked_problems.length >= 8);
assert.equal(map.fused_runtime.recall.schema, "kaizen7.receipt_recall.v1");
assert.equal(map.fused_runtime.radar.required, true);
assert(map.fused_runtime.adaptation.open_connections.includes("MCP servers"));
assert(map.fused_runtime.mesh.build_order.includes("receipt-ledger"));
assert(map.product_moves.some((move) => move.move === "diagnose"));
assert(map.product_moves.some((move) => move.move === "trust_tool"));
assert(map.acceptance_tests.some((test) => test.includes("trust and rejection rules")));

const formatted = formatMarketMap(map);
assert(formatted.includes("# KAIZEN7 MARKET MAP"));
assert(formatted.includes("## Top Market Problems"));
assert(formatted.includes("## Fused Runtime"));
assert(formatted.includes("## Product Moves"));

console.log("k7 market map tests passed");
