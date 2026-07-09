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
assert(run.decision_pipeline.some((step) => step.step === "learn"));
assert.equal(run.currentness_radar.required, true);
assert(run.connection_strategy.open_to.includes("MCP servers"));
assert.equal(run.tool_strategy.anything_route.schema, "kaizen7.anything_route.v1");
assert(run.execution_card.verification_commands.includes("npm.cmd run k7:check"));
assert.equal(run.execution_card.external_effects, "blocked until approval, dry-run and verification contract exist");
assert(run.success_metrics.includes("receipt improves the next run"));

const formatted = formatSuperMetaskillRun(run);
assert(formatted.includes("# KAIZEN7 SUPER-METASKILL RUN"));
assert(formatted.includes("## Decision Pipeline"));
assert(formatted.includes("## Receipt Contract"));

console.log("k7 super metaskill tests passed");
