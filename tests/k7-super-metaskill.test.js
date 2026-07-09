const assert = require("node:assert/strict");
const {
  buildSuperMetaskillRun,
  formatSuperMetaskillRun,
} = require("../lib/k7-super-metaskill");

const run = buildSuperMetaskillRun("mejorar un agente con menos contexto");

assert.equal(run.schema, "kaizen7.super_metaskill_run.v1");
assert.equal(run.agent_agnostic, true);
assert.equal(run.mode, "preflight");
assert(run.doctrine.includes("Decide before executing."));
assert(run.minimal_context.read_first.includes("AGENTS.md"));
assert(run.decision_pipeline.some((step) => step.step === "radar"));
assert(run.decision_pipeline.some((step) => step.step === "map_market_problem"));
assert(run.decision_pipeline.some((step) => step.step === "learn"));
assert.equal(run.currentness_radar.required, true);
assert.equal(run.market_map.schema, "kaizen7.market_map.v1");
assert(run.market_map.owns.includes("route selection"));
assert(run.market_map.product_moves.some((move) => move.move === "diagnose"));
assert.equal(run.agent_context.schema, "kaizen7.agent_context_pack.v1");
assert.equal(run.agent_context.local_first, true);
assert(run.agent_context.trust_boundary.some((item) => item.includes("untrusted reference data")));
assert.equal(run.open_commons.schema, "kaizen7.open_commons_pack.v1");
assert.equal(run.open_commons.paid_default, "do not require paid services");
assert(run.open_commons.bring_your_own_connections.includes("local CLI"));
assert.equal(run.production_control.trust_schema, "kaizen7.trust_gate.v1");
assert.equal(run.production_control.eval_schema, "kaizen7.eval_pack.v1");
assert.equal(run.production_control.production_schema, "kaizen7.production_pack.v1");
assert(run.production_control.production_checklist.includes("tool trust decision recorded"));
assert(run.connection_strategy.open_to.includes("MCP servers"));
assert.equal(run.tool_strategy.anything_route.schema, "kaizen7.anything_route.v1");
assert(run.execution_card.verification_commands.includes("npm.cmd run k7:check"));
assert.equal(run.execution_card.external_effects, "blocked until approval, dry-run and verification contract exist");
assert(run.success_metrics.includes("receipt improves the next run"));

const formatted = formatSuperMetaskillRun(run);
assert(formatted.includes("# KAIZEN7 SUPER-METASKILL RUN"));
assert(formatted.includes("## Decision Pipeline"));
assert(formatted.includes("## Market Map"));
assert(formatted.includes("## Agent Context"));
assert(formatted.includes("## Open Commons"));
assert(formatted.includes("## Production Control"));
assert(formatted.includes("## Receipt Contract"));

console.log("k7 super metaskill tests passed");
