const assert = require("node:assert/strict");
const {
  buildAnythingNextBlueprint,
  formatAnythingNextBlueprint,
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

console.log("k7 anything next tests passed");
