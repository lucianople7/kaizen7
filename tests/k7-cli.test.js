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
assert(tool.promise.includes("Anything CLI route"));
assert(tool.commands.some((command) => command.name === "status"));
assert(tool.commands.some((command) => command.name === "doctor"));
assert(tool.commands.some((command) => command.name === "version"));
assert(tool.commands.some((command) => command.name === "mission"));
assert(tool.commands.some((command) => command.name === "solve"));
assert(tool.commands.some((command) => command.name === "anything"));
assert(tool.commands.some((command) => command.name === "mesh"));
assert(tool.commands.some((command) => command.name === "adapt"));
assert(tool.commands.some((command) => command.name === "improve"));
assert(tool.commands.some((command) => command.name === "receipt"));

const help = formatK7ToolHelp(tool);
assert(help.includes("# KAIZEN7 TOOL"));
assert(help.includes("npm.cmd run k7 -- status"));
assert(help.includes("npm.cmd run k7 -- doctor"));
assert(help.includes("npm.cmd run k7 -- version"));
assert(help.includes("npm.cmd run k7 -- mission"));
assert(help.includes("npm.cmd run k7 -- solve"));
assert(help.includes("npm.cmd run k7 -- anything"));
assert(help.includes("npm.cmd run k7 -- mesh"));
assert(help.includes("npm.cmd run k7 -- adapt"));
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
assert.equal(versionPacket.name, "kaizen7");
assert(versionPacket.commands.includes("doctor"));

const doctor = runK7ToolCommand(["doctor"]);
assert.equal(doctor.exitCode, 0);
assert(doctor.output.includes("# KAIZEN7 DOCTOR"));
assert(doctor.output.includes("tool surface"));
assert(doctor.output.includes("anything route contract"));
assert(doctor.output.includes("metaskill card contract"));
assert(doctor.output.includes("tool mesh pack contract"));
assert(doctor.output.includes("market adaptation contract"));

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

const solve = runK7ToolCommand(["solve", "conectar app sin API gastando menos tokens"]);
assert.equal(solve.exitCode, 0);
assert(solve.output.includes("# KAIZEN7 METASKILL CARD"));
assert(solve.output.includes("api_escape_to_tool_route"));
assert(solve.output.includes("## Tool Ladder"));

const solveJson = runK7ToolCommand(["llave", "conectar app sin API", "--json"]);
assert.equal(solveJson.exitCode, 0);
const solvePacket = JSON.parse(solveJson.output);
assert.equal(solvePacket.schema, "kaizen7.metaskill_card.v1");
assert.equal(solvePacket.primary_route, "api_escape_to_tool_route");
assert.equal(solvePacket.context_budget.max_files_first_pass, 7);
assert(solvePacket.execution_plan.some((step) => step.id === "learn"));

const anything = runK7ToolCommand(["anything"]);
assert.equal(anything.exitCode, 0);
assert(anything.output.includes("# KAIZEN7 ANYTHING CLI NEXT"));

const anythingRoute = runK7ToolCommand(["anything", "mejorar cualquier proyecto"]);
assert.equal(anythingRoute.exitCode, 0);
assert(anythingRoute.output.includes("# KAIZEN7 ANYTHING ROUTE"));
assert(anythingRoute.output.includes("cli-hub search"));

const anythingRouteJson = runK7ToolCommand(["anything", "crear skills reales", "--json"]);
assert.equal(anythingRouteJson.exitCode, 0);
const anythingRoutePacket = JSON.parse(anythingRouteJson.output);
assert.equal(anythingRoutePacket.schema, "kaizen7.anything_route.v1");
assert.equal(anythingRoutePacket.agent_agnostic, true);
assert(anythingRoutePacket.command_plan.some((step) => step.id === "verify"));

const mesh = runK7ToolCommand(["mesh", "conectar apps sin API y aprender"]);
assert.equal(mesh.exitCode, 0);
assert(mesh.output.includes("# KAIZEN7 TOOL MESH PACK"));
assert(mesh.output.includes("## Frontier Modules"));
assert(mesh.output.includes("adapter-forge-templates"));

const meshJson = runK7ToolCommand(["frontier", "conectar apps sin API", "--json"]);
assert.equal(meshJson.exitCode, 0);
const meshPacket = JSON.parse(meshJson.output);
assert.equal(meshPacket.schema, "kaizen7.tool_mesh_pack.v1");
assert.equal(meshPacket.adapter_pack.schema, "kaizen7.adapter_pack.v1");
assert(meshPacket.frontier_modules.some((module) => module.id === "receipt-ledger"));
assert(meshPacket.acceptance_tests.some((test) => test.includes("API-blocked app")));

const adapt = runK7ToolCommand(["adapt", "mantener conectores modulares"]);
assert.equal(adapt.exitCode, 0);
assert(adapt.output.includes("# KAIZEN7 MARKET ADAPTATION PACK"));
assert(adapt.output.includes("## Open Connections"));
assert(adapt.output.includes("connector-registry"));

const adaptJson = runK7ToolCommand(["evolve", "adaptarse al mercado sin quedar obsoleto", "--json"]);
assert.equal(adaptJson.exitCode, 0);
const adaptPacket = JSON.parse(adaptJson.output);
assert.equal(adaptPacket.schema, "kaizen7.market_adaptation_pack.v1");
assert(adaptPacket.connection_policy.open_to.includes("MCP servers"));
assert(adaptPacket.evolution_gates.retire_when.includes("verification cannot prove output"));
assert(adaptPacket.acceptance_tests.some((test) => test.includes("new tool type")));

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
assert.equal(resolveCommandName("llave"), "solve");
assert.equal(resolveCommandName("frontier"), "mesh");
assert.equal(resolveCommandName("evolve"), "adapt");


console.log("k7 cli tests passed");
