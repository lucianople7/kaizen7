const assert = require("node:assert/strict");
const {
  buildImprovementRadar,
  formatImprovementRadar,
} = require("../lib/k7-improvement-radar");

const radar = buildImprovementRadar("buscar mejor agente browser para el objetivo");

assert.equal(radar.schema, "kaizen7.improvement_radar.v1");
assert.equal(radar.currentness_required, true);
assert(radar.scan_triggers.includes("an agent is about to build a wrapper from scratch"));
assert(radar.scan_targets.includes("agent browsers and repo-intelligence tools"));
assert(radar.search_protocol.some((step) => step.includes("official docs")));
assert(radar.candidate_scorecard.must_improve_one_of.includes("lower token cost"));
assert(radar.candidate_scorecard.reject_if.includes("new but not maintained"));
assert(radar.agent_prompts.some((prompt) => prompt.includes("What has improved")));
assert.equal(radar.output_contract.selected_action, "keep | refresh | replace | retire | watch");

const formatted = formatImprovementRadar(radar);
assert(formatted.includes("# KAIZEN7 IMPROVEMENT RADAR"));
assert(formatted.includes("## Search Protocol"));
assert(formatted.includes("## Candidate Scorecard"));

console.log("k7 improvement radar tests passed");
