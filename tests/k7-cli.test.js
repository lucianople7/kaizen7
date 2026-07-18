const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
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
assert(tool.commands.some((command) => command.name === "run"));
assert(tool.commands.some((command) => command.name === "preflight"));
assert(tool.commands.some((command) => command.name === "loop"));
assert(tool.commands.some((command) => command.name === "system"));
assert(tool.commands.some((command) => command.name === "do"));
assert(tool.commands.some((command) => command.name === "wizard"));
assert(tool.commands.some((command) => command.name === "doctor"));
assert(tool.commands.some((command) => command.name === "version"));
assert(tool.commands.some((command) => command.name === "mission"));
assert(tool.commands.some((command) => command.name === "solve"));
assert(tool.commands.some((command) => command.name === "anything"));
assert(tool.commands.some((command) => command.name === "mesh"));
assert(tool.commands.some((command) => command.name === "adapt"));
assert(tool.commands.some((command) => command.name === "radar"));
assert(tool.commands.some((command) => command.name === "opportunity"));
assert(tool.commands.some((command) => command.name === "commons"));
assert(tool.commands.some((command) => command.name === "forge"));
assert(tool.commands.some((command) => command.name === "trust"));
assert(tool.commands.some((command) => command.name === "eval"));
assert(tool.commands.some((command) => command.name === "production"));
assert(tool.commands.some((command) => command.name === "improve"));
assert(tool.commands.some((command) => command.name === "recall"));
assert(tool.commands.some((command) => command.name === "context"));
assert(tool.commands.some((command) => command.name === "resume"));
assert(tool.commands.some((command) => command.name === "journal"));
assert(tool.commands.some((command) => command.name === "remember"));
assert(tool.commands.some((command) => command.name === "receipt"));

const help = formatK7ToolHelp(tool);
assert(help.includes("# KAIZEN7 TOOL"));
assert(help.includes("npm.cmd run k7 -- status"));
assert(help.includes("npm.cmd run k7 -- run"));
assert(help.includes("npm.cmd run k7 -- preflight"));
assert(help.includes("npm.cmd run k7 -- loop"));
assert(help.includes("npm.cmd run k7 -- system"));
assert(help.includes("npm.cmd run k7 -- do"));
assert(help.includes("npm.cmd run k7 -- wizard"));
assert(help.includes("npm.cmd run k7 -- doctor"));
assert(help.includes("npm.cmd run k7 -- version"));
assert(help.includes("npm.cmd run k7 -- mission"));
assert(help.includes("npm.cmd run k7 -- solve"));
assert(help.includes("npm.cmd run k7 -- anything"));
assert(help.includes("npm.cmd run k7 -- mesh"));
assert(help.includes("npm.cmd run k7 -- adapt"));
assert(help.includes("npm.cmd run k7 -- radar"));
assert(help.includes("npm.cmd run k7 -- opportunity"));
assert(help.includes("npm.cmd run k7 -- commons"));
assert(help.includes("npm.cmd run k7 -- forge"));
assert(help.includes("npm.cmd run k7 -- trust"));
assert(help.includes("npm.cmd run k7 -- eval"));
assert(help.includes("npm.cmd run k7 -- production"));
assert(help.includes("npm.cmd run k7 -- improve"));
assert(help.includes("npm.cmd run k7 -- recall"));
assert(help.includes("npm.cmd run k7 -- context"));
assert(help.includes("npm.cmd run k7 -- resume"));
assert(help.includes("npm.cmd run k7 -- journal"));
assert(help.includes("npm.cmd run k7 -- remember"));

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
assert(doctor.output.includes("improvement radar contract"));
assert(doctor.output.includes("market map contract"));
assert(doctor.output.includes("open commons contract"));
assert(doctor.output.includes("tool forge contract"));
assert(doctor.output.includes("trust gate contract"));
assert(doctor.output.includes("eval pack contract"));
assert(doctor.output.includes("production pack contract"));
assert(doctor.output.includes("super metaskill run contract"));
assert(doctor.output.includes("wizard contract"));
assert(doctor.output.includes("receipt ledger recall contract"));
assert(doctor.output.includes("agent context contract"));

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

const superRun = runK7ToolCommand(["run", "mejorar cualquier agente con menos tokens"]);
assert.equal(superRun.exitCode, 0);
assert(superRun.output.includes("# KAIZEN7 SUPER-METASKILL RUN"));
assert(superRun.output.includes("## Currentness Radar"));
assert(superRun.output.includes("## Market Map"));
assert(superRun.output.includes("## Execution Card"));

const superRunJson = runK7ToolCommand(["go", "conectar una app sin API", "--json"]);
assert.equal(superRunJson.exitCode, 0);
const superRunPacket = JSON.parse(superRunJson.output);
assert.equal(superRunPacket.schema, "kaizen7.super_metaskill_run.v1");
assert.equal(superRunPacket.agent_agnostic, true);
assert.equal(superRunPacket.market_map.schema, "kaizen7.market_map.v1");
assert.equal(superRunPacket.agent_context.schema, "kaizen7.agent_context_pack.v1");
assert.equal(superRunPacket.open_commons.schema, "kaizen7.open_commons_pack.v1");
assert.equal(superRunPacket.open_commons.paid_default, "do not require paid services");
assert.equal(superRunPacket.production_control.trust_schema, "kaizen7.trust_gate.v1");
assert.equal(superRunPacket.production_control.eval_schema, "kaizen7.eval_pack.v1");
assert.equal(superRunPacket.production_control.production_schema, "kaizen7.production_pack.v1");
assert(superRunPacket.decision_pipeline.some((step) => step.step === "radar"));
assert(superRunPacket.decision_pipeline.some((step) => step.step === "map_market_problem"));
assert(superRunPacket.decision_pipeline.some((step) => step.step === "load_agent_context"));
assert(superRunPacket.decision_pipeline.some((step) => step.step === "commons"));
assert(superRunPacket.decision_pipeline.some((step) => step.step === "forge"));
assert(superRunPacket.decision_pipeline.some((step) => step.step === "trust"));
assert(superRunPacket.decision_pipeline.some((step) => step.step === "eval"));
assert(superRunPacket.execution_card.verification_commands.includes("npm.cmd run k7:check"));

const wizard = runK7ToolCommand(["wizard", "mejorar repo con menos pasos"]);
assert.equal(wizard.exitCode, 0);
assert(wizard.output.includes("# KAIZEN7 WIZARD"));
assert(wizard.output.includes("npm.cmd run k7 -- run \"mejorar repo con menos pasos\""));

const wizardJson = runK7ToolCommand([
  "start",
  "--answers",
  JSON.stringify({
    objective: "crear adaptador browser",
    project_type: "web",
    connections: ["browser", "MCP"],
    agent: "Codex",
  }),
  "--json",
]);
assert.equal(wizardJson.exitCode, 0);
const wizardPacket = JSON.parse(wizardJson.output);
assert.equal(wizardPacket.schema, "kaizen7.wizard_plan.v1");
assert.equal(wizardPacket.answers.project_type, "web");
assert(wizardPacket.recommended_flow.includes("forge"));

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

const radar = runK7ToolCommand(["radar", "buscar un agente browser mejor"]);
assert.equal(radar.exitCode, 0);
assert(radar.output.includes("# KAIZEN7 IMPROVEMENT RADAR"));
assert(radar.output.includes("## Scan Targets"));
assert(radar.output.includes("agent browsers"));

const radarJson = runK7ToolCommand(["scan", "buscar repos nuevos antes de adaptar", "--json"]);
assert.equal(radarJson.exitCode, 0);
const radarPacket = JSON.parse(radarJson.output);
assert.equal(radarPacket.schema, "kaizen7.improvement_radar.v1");
assert.equal(radarPacket.currentness_required, true);
assert(radarPacket.candidate_scorecard.must_improve_one_of.includes("lower token cost"));
assert(radarPacket.output_contract.selected_action.includes("keep"));

const opportunity = runK7ToolCommand(["opportunity", "conectar agentes sin API con menos tokens"]);
assert.equal(opportunity.exitCode, 0);
assert(opportunity.output.includes("# KAIZEN7 MARKET MAP"));
assert(opportunity.output.includes("## Product Moves"));

const opportunityJson = runK7ToolCommand(["diagnose", "resolver tool trust y coste de tokens", "--json"]);
assert.equal(opportunityJson.exitCode, 0);
const opportunityPacket = JSON.parse(opportunityJson.output);
assert.equal(opportunityPacket.schema, "kaizen7.market_map.v1");
assert(opportunityPacket.owns.includes("tool trust gates"));
assert(opportunityPacket.product_moves.some((move) => move.move === "diagnose"));

const commons = runK7ToolCommand(["commons", "repos libres y conexiones propias"]);
assert.equal(commons.exitCode, 0);
assert(commons.output.includes("# KAIZEN7 OPEN COMMONS PACK"));
assert(commons.output.includes("do not require paid services"));

const commonsJson = runK7ToolCommand(["free", "memoria local sin pagar", "--json"]);
assert.equal(commonsJson.exitCode, 0);
const commonsPacket = JSON.parse(commonsJson.output);
assert.equal(commonsPacket.schema, "kaizen7.open_commons_pack.v1");
assert.equal(commonsPacket.paid_services_policy.default, "do not require paid services");

const forge = runK7ToolCommand(["forge", "herramienta de video libre que aprenda patron"]);
assert.equal(forge.exitCode, 0);
assert(forge.output.includes("# KAIZEN7 TOOL FORGE"));
assert(forge.output.includes("learn_pattern"));

const forgeJson = runK7ToolCommand(["forja", "browser sin API con clicks", "--json"]);
assert.equal(forgeJson.exitCode, 0);
const forgePacket = JSON.parse(forgeJson.output);
assert.equal(forgePacket.schema, "kaizen7.tool_forge_plan.v1");
assert.equal(forgePacket.selected_lane.id, "browser-tool");
assert.equal(forgePacket.promotion_gate.promote_after_verified_receipts, 3);

const trust = runK7ToolCommand(["trust", "MCP tool with API key and deploy"]);
assert.equal(trust.exitCode, 0);
assert(trust.output.includes("# KAIZEN7 TRUST GATE"));
assert(trust.output.includes("Decision: block"));

const trustJson = runK7ToolCommand(["gate", "browser session automation", "--json"]);
assert.equal(trustJson.exitCode, 0);
const trustPacket = JSON.parse(trustJson.output);
assert.equal(trustPacket.schema, "kaizen7.trust_gate.v1");
assert.equal(trustPacket.decision, "review");

const evalPack = runK7ToolCommand(["eval", "conectar MCP con seguridad"]);
assert.equal(evalPack.exitCode, 0);
assert(evalPack.output.includes("# KAIZEN7 EVAL PACK"));
assert(evalPack.output.includes("## Acceptance Tests"));

const evalJson = runK7ToolCommand(["verify-plan", "conectar MCP con seguridad", "--json"]);
assert.equal(evalJson.exitCode, 0);
const evalPacket = JSON.parse(evalJson.output);
assert.equal(evalPacket.schema, "kaizen7.eval_pack.v1");
assert(evalPacket.observability_fields.includes("estimated_tokens"));

const production = runK7ToolCommand(["production", "crear workflow largo con memoria"]);
assert.equal(production.exitCode, 0);
assert(production.output.includes("# KAIZEN7 PRODUCTION PACK"));
assert(production.output.includes("## Framework Selector"));

const productionJson = runK7ToolCommand(["prod", "browser cli app sin API", "--json"]);
assert.equal(productionJson.exitCode, 0);
const productionPacket = JSON.parse(productionJson.output);
assert.equal(productionPacket.schema, "kaizen7.production_pack.v1");
assert(productionPacket.recommended_stack.includes("Anything CLI"));

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

const ledgerRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-cli-ledger-"));
const remembered = runK7ToolCommand([
  "remember",
  JSON.stringify({
    objective: "conectar una app sin API con menos pasos",
    route: "api_escape_to_tool_route",
    tool: "Anything CLI",
    verification: "node tests/k7-cli.test.js",
    reuse_next_time: "Start with the existing Anything CLI route before building a new adapter.",
    discard: ["Do not start with a paid API integration when local control works."],
    tags: ["anything-cli", "api-escape"],
  }),
  "--json",
], ledgerRoot);
assert.equal(remembered.exitCode, 0);
const rememberedPacket = JSON.parse(remembered.output);
assert.equal(rememberedPacket.schema, "kaizen7.receipt_append.v1");
assert.equal(rememberedPacket.record.route, "api_escape_to_tool_route");

const recall = runK7ToolCommand(["recall", "app sin API anything", "--json"], ledgerRoot);
assert.equal(recall.exitCode, 0);
const recallPacket = JSON.parse(recall.output);
assert.equal(recallPacket.schema, "kaizen7.receipt_recall.v1");
assert.equal(recallPacket.total_receipts, 1);
assert.equal(recallPacket.matches.length, 1);
assert(recallPacket.reuse_candidates[0].includes("Anything CLI"));

const recallText = runK7ToolCommand(["memory", "app sin API anything"], ledgerRoot);
assert.equal(recallText.exitCode, 0);
assert(recallText.output.includes("# KAIZEN7 RECEIPT RECALL"));

const journal = runK7ToolCommand([
  "journal",
  JSON.stringify({
    agent: "codex",
    objective: "conectar una app sin API con menos pasos",
    action: "stored agnostic context",
    commands: ["API_KEY=secret-value"],
    outcome: "memory event stored",
    next_action: "resume from context",
    tags: ["memory"],
  }),
  "--json",
], ledgerRoot);
assert.equal(journal.exitCode, 0);
const journalPacket = JSON.parse(journal.output);
assert.equal(journalPacket.schema, "kaizen7.agent_memory_append.v1");
assert(journalPacket.record.commands[0].includes("[REDACTED]"));

const context = runK7ToolCommand(["context", "app sin API memory", "--json"], ledgerRoot);
assert.equal(context.exitCode, 0);
const contextPacket = JSON.parse(context.output);
assert.equal(contextPacket.schema, "kaizen7.agent_context_pack.v1");
assert.equal(contextPacket.agent_agnostic, true);
assert(contextPacket.recent_events.length >= 1);

const resume = runK7ToolCommand(["resume", "app sin API memory"], ledgerRoot);
assert.equal(resume.exitCode, 0);
assert(resume.output.includes("# KAIZEN7 AGENT CONTEXT"));

const badJournal = runK7ToolCommand(["journal", "{bad-json"], ledgerRoot);
assert.equal(badJournal.exitCode, 2);
assert(badJournal.output.includes("Invalid memory event"));

const badRemember = runK7ToolCommand(["remember", "{bad-json"], ledgerRoot);
assert.equal(badRemember.exitCode, 2);
assert(badRemember.output.includes("Invalid receipt"));

const receipt = runK7ToolCommand(["receipt"]);
assert.equal(receipt.exitCode, 0);
assert(receipt.output.includes("Mission Outcome Receipt"));
assert(receipt.output.includes("memory_update_recommendation"));

const preflight = runK7ToolCommand([
  "preflight",
  "--budget", "240",
  "mejor modelo actual para subtitulos",
  "--json",
]);
assert.equal(preflight.exitCode, 0);
const preflightPacket = JSON.parse(preflight.output);
assert.equal(preflightPacket.schema, "kaizen7.preflight_card.v1");
assert.equal(preflightPacket.route, "research_primary_sources");
assert.equal(preflightPacket.budget, 240);

const rejectedCandidate = runK7ToolCommand([
  "pf",
  "--candidate", "BAAI/bge-m3 embeddings",
  "decidir cuando preguntar al usuario en un workflow",
  "--json",
]);
assert.equal(rejectedCandidate.exitCode, 0);
assert.equal(JSON.parse(rejectedCandidate.output).candidate_fit.accepted, false);

const badBudget = runK7ToolCommand(["preflight", "--budget", "20", "pregunta tecnica"]);
assert.equal(badBudget.exitCode, 2);
assert(badBudget.output.includes("budget must be an integer between 120 and 600"));

const actionLoop = runK7ToolCommand([
  "loop",
  "--max-iterations", "6",
  "añadir una prueba estable al parser",
  "--json",
]);
assert.equal(actionLoop.exitCode, 0);
const actionLoopPacket = JSON.parse(actionLoop.output);
assert.equal(actionLoopPacket.schema, "kaizen7.action_reaction_loop.v1");
assert.equal(actionLoopPacket.status, "ready");
assert.equal(actionLoopPacket.task.owner, "codex");

const loopSystem = runK7ToolCommand(["system", "--json"]);
assert.equal(loopSystem.exitCode, 0);
const loopSystemPacket = JSON.parse(loopSystem.output);
assert.equal(loopSystemPacket.schema, "kaizen7.loop_system.v1");
assert.equal(loopSystemPacket.status, "defined");

const oneDoor = runK7ToolCommand([
  "do",
  "--project", "KAIZEN7",
  "implementar comando de entrada universal",
  "--json",
]);
assert.equal(oneDoor.exitCode, 0);
const oneDoorPacket = JSON.parse(oneDoor.output);
assert.equal(oneDoorPacket.schema, "kaizen7.one_door.v1");
assert.equal(oneDoorPacket.executor, "codex");
assert.equal(oneDoorPacket.request.project, "KAIZEN7");

const oneDoorInput = runK7ToolCommand([
  "do",
  "--input", JSON.stringify({ objective: "crear plantilla creativa de vídeo", project: "Flowmatik" }),
  "--json",
]);
assert.equal(oneDoorInput.exitCode, 0);
assert.equal(JSON.parse(oneDoorInput.output).executor, "flowmatik");

const unknown = runK7ToolCommand(["wat"]);
assert.equal(unknown.exitCode, 2);
assert(unknown.output.includes("Unknown command"));
assert(unknown.output.includes("Did you mean"));

assert.equal(resolveCommandName("s"), "status");
assert.equal(resolveCommandName("go"), "run");
assert.equal(resolveCommandName("pf"), "preflight");
assert.equal(resolveCommandName("loop"), "loop");
assert.equal(resolveCommandName("os"), "system");
assert.equal(resolveCommandName("one"), "do");
assert.equal(resolveCommandName("start"), "wizard");
assert.equal(resolveCommandName("setup-guide"), "wizard");
assert.equal(resolveCommandName("m"), "mission");
assert.equal(resolveCommandName("llave"), "solve");
assert.equal(resolveCommandName("frontier"), "mesh");
assert.equal(resolveCommandName("evolve"), "adapt");
assert.equal(resolveCommandName("scan"), "radar");
assert.equal(resolveCommandName("diagnose"), "opportunity");
assert.equal(resolveCommandName("value"), "opportunity");
assert.equal(resolveCommandName("free"), "commons");
assert.equal(resolveCommandName("libre"), "commons");
assert.equal(resolveCommandName("forja"), "forge");
assert.equal(resolveCommandName("pattern"), "forge");
assert.equal(resolveCommandName("gate"), "trust");
assert.equal(resolveCommandName("security"), "trust");
assert.equal(resolveCommandName("verify-plan"), "eval");
assert.equal(resolveCommandName("ready"), "production");
assert.equal(resolveCommandName("memory"), "recall");
assert.equal(resolveCommandName("ctx"), "context");
assert.equal(resolveCommandName("continue"), "resume");
assert.equal(resolveCommandName("log"), "journal");
assert.equal(resolveCommandName("learn"), "remember");


console.log("k7 cli tests passed");
