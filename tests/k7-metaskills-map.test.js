const assert = require("node:assert/strict");
const {
  METASKILLS,
  buildMetaskillsMap,
  formatMetaskillsMap,
} = require("../lib/k7-metaskills-map");

const map = buildMetaskillsMap();

assert.equal(map.schema, "kaizen7.metaskills_map.v1");
assert(map.principle.includes("Metaskills decide"));
assert(map.default_chain[0] === "kaizen7-metaskill");
assert(map.default_chain.includes("cli-anything-operator when missing executor"));
assert(map.default_chain.includes("receipt"));
assert(METASKILLS.some((item) => item.name === "kaizen7-metaskill" && item.layer === "director"));
assert(METASKILLS.some((item) => item.name === "k7-hive-memory" && item.layer === "memory"));
assert(METASKILLS.some((item) => item.name === "cli-anything-operator" && item.layer === "operator_adapter_factory"));
assert(METASKILLS.some((item) => item.name === "repo-hunter-github"));
assert(METASKILLS.every((item) => item.path.endsWith("SKILL.md")));
assert.equal(map.creation_rule, "If it only performs a task, it is a skill, not a metaskill.");

const formatted = formatMetaskillsMap(map);
assert(formatted.includes("# KAIZEN7 METASKILLS MAP"));
assert(formatted.includes("## Default Chain"));
assert(formatted.includes("cli-anything-operator"));
assert(formatted.includes("kaizen7-evolution-engine"));
assert(formatted.includes("## Creation Rule"));

console.log("k7 metaskills map tests passed");
