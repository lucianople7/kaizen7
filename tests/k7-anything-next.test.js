const assert = require("node:assert/strict");
const {
  buildAnythingRoute,
  buildAnythingNextBlueprint,
  formatAnythingRoute,
  formatAnythingNextBlueprint,
  inferOutputType,
} = require("../lib/k7-anything-next");

const blueprint = buildAnythingNextBlueprint();

assert.equal(blueprint.schema, "kaizen7.anything_cli_next.v1");
assert(blueprint.north_star.includes("agent-native command"));
assert(blueprint.architecture.some((item) => item.layer === "tool_graph"));
assert(blueprint.architecture.some((item) => item.layer === "adapter_forge"));
assert(blueprint.architecture.some((item) => item.layer === "sandbox_guard"));
assert(blueprint.lifecycle.includes("dry_run"));
assert(blueprint.lifecycle.includes("promote_or_discard"));
assert(blueprint.scoring.prefer.includes("existing receipt"));
assert(blueprint.scoring.prefer.includes("cli-hub adapter"));
assert(blueprint.safety_gates.includes("credentials_required"));
assert(blueprint.safety_gates.includes("external_publish_required"));
assert.equal(blueprint.receipt_template.promote_to_skill, false);

const formatted = formatAnythingNextBlueprint(blueprint);
assert(formatted.includes("# KAIZEN7 ANYTHING CLI NEXT"));
assert(formatted.includes("## Architecture"));
assert(formatted.includes("tool_graph"));
assert(formatted.includes("## Receipt Template"));

const route = buildAnythingRoute("crear skills y metaskills reales para cualquier repo");
assert.equal(route.schema, "kaizen7.anything_route.v1");
assert.equal(route.agent_agnostic, true);
assert.equal(route.route, "anything_cli.project_improvement");
assert.equal(route.output_type, "verified_skill_or_metaskill_route");
assert(route.command_plan.some((step) => step.id === "discover_executor"));
assert(route.command_plan.some((step) => step.command && step.command.includes("cli-hub search")));
assert(route.context_contract.read_first.includes(".agents/skills/cli-anything-operator/SKILL.md"));
assert(route.safety_gates.includes("external_publish_required"));
assert.equal(route.receipt_template.promote_to_skill, false);
assert.equal(inferOutputType("fix test bug"), "verified_code_change");
assert.equal(inferOutputType("aprender una ruta sin API"), "verified_project_improvement");

const formattedRoute = formatAnythingRoute(route);
assert(formattedRoute.includes("# KAIZEN7 ANYTHING ROUTE"));
assert(formattedRoute.includes("## Command Plan"));
assert(formattedRoute.includes("discover_executor"));
assert(formattedRoute.includes("## Adapter Contract"));

console.log("k7 anything next tests passed");
