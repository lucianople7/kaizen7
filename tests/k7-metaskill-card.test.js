const assert = require("node:assert/strict");
const {
  buildMetaskillCard,
  classifyRoute,
  formatMetaskillCard,
} = require("../lib/k7-metaskill-card");

const card = buildMetaskillCard("conectar una app sin API con menos tokens");

assert.equal(card.schema, "kaizen7.metaskill_card.v1");
assert.equal(card.agent_agnostic, true);
assert.equal(card.primary_route, "api_escape_to_tool_route");
assert.equal(card.context_budget.max_files_first_pass, 7);
assert(card.context_budget.required_first_reads.includes("AGENTS.md"));
assert(card.memory_loop.recall.includes("previous receipt for the same tool, app, repo or output type"));
assert(card.tool_ladder.some((item) => item.route === "anything_cli_or_cli_hub"));
assert(card.api_escape_route.allowed_paths.includes("Anything CLI / cli-hub adapter"));
assert(card.execution_plan.some((step) => step.id === "route"));
assert(card.execution_plan.some((step) => step.id === "learn"));
assert.equal(card.anything_route.schema, "kaizen7.anything_route.v1");
assert(card.success_metrics.includes("receipt improves the next run"));

assert.equal(classifyRoute("reducir contexto y tokens"), "context_memory_compression_route");
assert.equal(classifyRoute("usar Anything CLI para una herramienta"), "anything_cli_operator_route");

const formatted = formatMetaskillCard(card);
assert(formatted.includes("# KAIZEN7 METASKILL CARD"));
assert(formatted.includes("## Context Budget"));
assert(formatted.includes("## API Escape Route"));
assert(formatted.includes("## Learn"));

console.log("k7 metaskill card tests passed");
