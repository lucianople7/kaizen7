const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const {
  buildAnythingCliResponse,
  parseAnythingArgs,
} = require("../lib/anything-cli");

const parsed = parseAnythingArgs(["--mode", "run-card", "--evidence", "{\"project\":\"kaizen7\"}", "crear memoria"]);
assert.equal(parsed.mode, "run-card");
assert.equal(parsed.objective, "crear memoria");
assert.equal(parsed.options.project, "kaizen7");

const runCardResponse = buildAnythingCliResponse("crear reel de Mr Kaizen con evidencia");
assert.equal(runCardResponse.schema, "kaizen7.anything_cli.v1");
assert.equal(runCardResponse.mode, "auto");
assert.equal(runCardResponse.surface.schema, "kaizen7.agent_run_card.v1");
assert.equal(runCardResponse.next_action, "execute_run_card");

const fullCycleResponse = buildAnythingCliResponse("crear reel de Mr Kaizen con evidencia", {
  result_summary: "Reel package prepared.",
  evidence: {
    changed_surface: ["script"],
    verification_result: "checked",
    remaining_risks: ["none known"],
  },
  memory_draft: "Anything CLI can close and prepare memory from one objective.",
  codex_observation: "One CLI surface reduces orchestration steps.",
  project: "kaizen7",
});
assert.equal(fullCycleResponse.surface.schema, "kaizen7.memory_plane.v1");
assert.equal(fullCycleResponse.run_verdict.verdict, "pass");
assert.equal(fullCycleResponse.mutual_learning.verdict, "pass");
assert.equal(fullCycleResponse.next_action, "review_then_write_memory_note");

const explicitPlan = buildAnythingCliResponse("activar memoria headroom graphy ponytail obsidian", {
  mode: "plan",
});
assert.equal(explicitPlan.surface.status, "ready");
assert(explicitPlan.surface.selected.some((capability) => capability.id === "super.memory_plane"));

const cli = spawnSync(process.execPath, [
  "lib/anything-cli.js",
  "crear reel de Mr Kaizen con evidencia",
], { encoding: "utf8" });
assert.equal(cli.status, 0);
assert(cli.stdout.includes("kaizen7.anything_cli.v1"));
assert(cli.stdout.includes("kaizen7.agent_run_card.v1"));

const fullCli = spawnSync(process.execPath, [
  "lib/anything-cli.js",
  "crear reel de Mr Kaizen con evidencia",
  "--evidence",
  JSON.stringify({
    result_summary: "Reel package prepared.",
    evidence: {
      changed_surface: ["script"],
      verification_result: "checked",
      remaining_risks: ["none known"],
    },
    memory_draft: "Anything CLI can close and prepare memory from one objective.",
    codex_observation: "One CLI surface reduces orchestration steps.",
    project: "kaizen7",
  }),
], { encoding: "utf8" });
assert.equal(fullCli.status, 0);
assert(fullCli.stdout.includes("kaizen7.memory_plane.v1"));
assert(fullCli.stdout.includes("review_then_write_memory_note"));

console.log("anything CLI tests passed");
