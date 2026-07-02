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

const parsedTools = parseAnythingArgs(["--tools"]);
assert.equal(parsedTools.tools, true);

const parsedCapability = parseAnythingArgs(["--capability", "video.render"]);
assert.equal(parsedCapability.capability, "video.render");

const parsedForge = parseAnythingArgs(["forge", "necesito transcribir audio local sin GPU"]);
assert.equal(parsedForge.mode, "forge");
assert.equal(parsedForge.objective, "necesito transcribir audio local sin GPU");

const runCardResponse = buildAnythingCliResponse("crear reel de Mr Kaizen con evidencia");
assert.equal(runCardResponse.schema, "kaizen7.anything_cli.v1");
assert.equal(runCardResponse.mode, "auto");
assert.equal(runCardResponse.surface.schema, "kaizen7.agent_run_card.v1");
assert.equal(runCardResponse.next_action, "execute_run_card");

const forgeResponse = buildAnythingCliResponse("necesito transcribir audio local sin GPU", {
  mode: "forge",
});
assert.equal(forgeResponse.mode, "forge");
assert.equal(forgeResponse.surface.schema, "kaizen7.forge_packet.v1");
assert.equal(forgeResponse.surface.capability, "audio.transcribe");
assert.equal(forgeResponse.surface.policy.hardware, "cpu_first");
assert(forgeResponse.surface.selected_path.includes("adapter.forge"));
assert(forgeResponse.surface.evidence_required.includes("provider_decision_recorded"));
assert(forgeResponse.surface.approval_required.includes("install_binary"));
assert.equal(forgeResponse.next_action, "prepare_agent_execution_packet");

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

const toolsResponse = buildAnythingCliResponse("", { tools: true });
assert.equal(toolsResponse.mode, "tools");
assert.equal(toolsResponse.surface.schema, "kaizen7.anything_tools_report.v1");
assert(toolsResponse.surface.available.includes("remotion"));

const capabilityResponse = buildAnythingCliResponse("", { capability: "video.render" });
assert.equal(capabilityResponse.mode, "capability");
assert.equal(capabilityResponse.surface.status, "ready");
assert.equal(capabilityResponse.surface.selected.id, "remotion");

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

const toolsCli = spawnSync(process.execPath, [
  "lib/anything-cli.js",
  "--tools",
], { encoding: "utf8" });
assert.equal(toolsCli.status, 0);
assert(toolsCli.stdout.includes("kaizen7.anything_tools_report.v1"));
assert(toolsCli.stdout.includes("remotion"));

const capabilityCli = spawnSync(process.execPath, [
  "lib/anything-cli.js",
  "--capability",
  "video.render",
], { encoding: "utf8" });
assert.equal(capabilityCli.status, 0);
assert(capabilityCli.stdout.includes("kaizen7.anything_tool_resolution.v1"));
assert(capabilityCli.stdout.includes("execute_provider_with_evidence"));

const forgeCli = spawnSync(process.execPath, [
  "lib/anything-cli.js",
  "forge",
  "necesito transcribir audio local sin GPU",
], { encoding: "utf8" });
assert.equal(forgeCli.status, 0);
assert(forgeCli.stdout.includes("kaizen7.forge_packet.v1"));
assert(forgeCli.stdout.includes("audio.transcribe"));
assert(forgeCli.stdout.includes("prepare_agent_execution_packet"));

console.log("anything CLI tests passed");
