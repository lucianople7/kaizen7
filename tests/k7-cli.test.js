const assert = require("node:assert/strict");
const {
  buildK7Tool,
  formatK7ToolHelp,
  resolveCommandName,
  runK7ToolCommand,
} = require("../lib/k7-cli");

const tool = buildK7Tool();

assert.equal(tool.schema, "kaizen7.tool.v1");
assert.equal(tool.name, "k7");
assert(tool.promise.includes("less context"));
assert(tool.commands.some((command) => command.name === "status"));
assert(tool.commands.some((command) => command.name === "doctor"));
assert(tool.commands.some((command) => command.name === "version"));
assert(tool.commands.some((command) => command.name === "mission"));
assert(tool.commands.some((command) => command.name === "anything"));
assert(tool.commands.some((command) => command.name === "improve"));
assert(tool.commands.some((command) => command.name === "receipt"));

const help = formatK7ToolHelp(tool);
assert(help.includes("# KAIZEN7 TOOL"));
assert(help.includes("npm.cmd run k7 -- status"));
assert(help.includes("npm.cmd run k7 -- doctor"));
assert(help.includes("npm.cmd run k7 -- version"));
assert(help.includes("npm.cmd run k7 -- mission"));
assert(help.includes("npm.cmd run k7 -- anything"));
assert(help.includes("npm.cmd run k7 -- improve"));

const status = runK7ToolCommand(["status"]);
assert.equal(status.exitCode, 0);
assert(status.output.includes("# KAIZEN7 STATUS"));
assert(status.output.includes("## Product Split"));

const statusJson = runK7ToolCommand(["status", "--json"]);
assert.equal(statusJson.exitCode, 0);
const parsedStatus = JSON.parse(statusJson.output);
assert.equal(parsedStatus.agent_browser.entrypoint, "npm.cmd run k7 -- status");
assert(parsedStatus.git.product_split.buckets.kaizen7_kernel);

const statusAlias = runK7ToolCommand(["s"]);
assert.equal(statusAlias.exitCode, 0);
assert(statusAlias.output.includes("# KAIZEN7 STATUS"));

const version = runK7ToolCommand(["version", "--json"]);
assert.equal(version.exitCode, 0);
const versionPacket = JSON.parse(version.output);
assert.equal(versionPacket.schema, "kaizen7.version.v1");
assert.equal(versionPacket.name, "kaizen7-webui");
assert(versionPacket.commands.includes("doctor"));

const doctor = runK7ToolCommand(["doctor"]);
assert.equal(doctor.exitCode, 0);
assert(doctor.output.includes("# KAIZEN7 DOCTOR"));
assert(doctor.output.includes("tool surface"));

const handoff = runK7ToolCommand(["handoff"]);
assert.equal(handoff.exitCode, 0);
assert(handoff.output.includes("# KAIZEN7 AGENT HANDOFF"));

const mission = runK7ToolCommand(["mission", "renderizar video con OpenClaw"]);
assert.equal(mission.exitCode, 0);
assert(mission.output.includes("# KAIZEN7 Mission Control"));
assert(mission.output.includes("renderizar video con OpenClaw"));

const missionAlias = runK7ToolCommand(["m", "renderizar video con OpenClaw"]);
assert.equal(missionAlias.exitCode, 0);
assert(missionAlias.output.includes("# KAIZEN7 Mission Control"));

const anything = runK7ToolCommand(["anything"]);
assert.equal(anything.exitCode, 0);
assert(anything.output.includes("# KAIZEN7 ANYTHING CLI NEXT"));

const improve = runK7ToolCommand(["improve", "hacer KAIZEN7 mas claro"]);
assert.equal(improve.exitCode, 0);
assert(improve.output.includes("KAIZEN7 SELF IMPROVEMENT PASS"));
assert(improve.output.includes("hacer KAIZEN7 mas claro"));

const improveJson = runK7ToolCommand(["improve", "hacer KAIZEN7 mas claro", "--json"]);
assert.equal(improveJson.exitCode, 0);
const improvePacket = JSON.parse(improveJson.output);
assert.equal(improvePacket.schema, "kaizen7.self_improvement_pass.v1");
assert.equal(improvePacket.mode, "controlled_self_improvement");
assert(improvePacket.friction.includes("hacer KAIZEN7 mas claro"));
assert(improvePacket.commands.includes("npm.cmd run k7 -- check"));
assert.equal(improvePacket.receipt.memory_update_recommendation, "Record only if the pass reduces future steps, context or errors.");

const receipt = runK7ToolCommand(["receipt"]);
assert.equal(receipt.exitCode, 0);
assert(receipt.output.includes("Mission Outcome Receipt"));
assert(receipt.output.includes("memory_update_recommendation"));

const unknown = runK7ToolCommand(["wat"]);
assert.equal(unknown.exitCode, 2);
assert(unknown.output.includes("Unknown command"));
assert(unknown.output.includes("Did you mean"));

assert.equal(resolveCommandName("s"), "status");
assert.equal(resolveCommandName("m"), "mission");


console.log("k7 cli tests passed");
