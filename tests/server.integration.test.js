const assert = require("assert");
const fs = require("fs");
const net = require("net");
const path = require("path");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");
const runtimePath = path.join(root, "data", "kaizen-runtime.json");
const originalRuntime = fs.existsSync(runtimePath) ? fs.readFileSync(runtimePath) : null;
const workspacePath = path.join(root, "data", "kaizen-workspace.json");
const originalWorkspace = fs.existsSync(workspacePath) ? fs.readFileSync(workspacePath) : null;
const genomePath = path.join(root, "data", "product-genome.json");
const originalGenome = fs.existsSync(genomePath) ? fs.readFileSync(genomePath) : null;
const metaBrowserPath = path.join(root, "data", "metabrowser-runs.json");
const originalMetaBrowser = fs.existsSync(metaBrowserPath) ? fs.readFileSync(metaBrowserPath) : null;
const signalInboxPath = path.join(root, "data", "signal-inbox.json");
const originalSignalInbox = fs.existsSync(signalInboxPath) ? fs.readFileSync(signalInboxPath) : null;
let server;
let port;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("El servidor de prueba no arranco");
}

(async () => {
  try {
    port = await getFreePort();
    server = spawn(process.execPath, ["server.js"], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await waitForServer();
    const setupResponse = await fetch(`http://localhost:${port}/api/k7/setup`);
    assert.equal(setupResponse.status, 200);
    const setup = await setupResponse.json();
    assert(["local-only", "enhanced", "blocked"].includes(setup.status));
    assert(setup.services.some((service) => service.id === "openai"));
    assert(setup.actions.includes("npm.cmd run k7:init"));

    const cockpitQuestionResponse = await fetch(`http://localhost:${port}/api/k7/cockpit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(cockpitQuestionResponse.status, 200);
    const cockpitQuestion = await cockpitQuestionResponse.json();
    assert.equal(cockpitQuestion.status, "needs_input");
    assert.equal(cockpitQuestion.question.id, "objective");
    const cockpitReadyResponse = await fetch(`http://localhost:${port}/api/k7/cockpit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "mejorar KAIZEN7 con OpenHands",
        context: "repo local",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(cockpitReadyResponse.status, 200);
    const cockpitReady = await cockpitReadyResponse.json();
    assert.equal(cockpitReady.status, "ready");
    assert(cockpitReady.nextAction.command.includes("k7:openhands"));
    const startResponse = await fetch(`http://localhost:${port}/api/k7/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "THE FOCUX",
        objective: "crear dossier NEUROCITY verificable",
        context: "repo separado",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(startResponse.status, 200);
    const start = await startResponse.json();
    assert.equal(start.mode, "start-hub");
    assert.equal(start.project, "THE FOCUX");
    assert(start.commands.some((command) => command.includes("k7:start")));
    const bridgeResponse = await fetch(`http://localhost:${port}/api/k7/bridge`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "KAIZEN7",
        goal: "crear bridge cerebro vision brazos con n8n",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(bridgeResponse.status, 200);
    const bridge = await bridgeResponse.json();
    assert.equal(bridge.mode, "kaizen7-body-bridge");
    assert.equal(bridge.body.brain.role, "decide");
    assert.equal(bridge.body.vision.role, "see");
    assert.equal(bridge.body.arms.role, "act");
    assert(bridge.body.arms.modules.some((arm) => arm.id === "n8n"));
    const strengthResponse = await fetch(`http://localhost:${port}/api/k7/strength`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "KAIZEN7",
        weakness: "prompt-filter no detecta self_test y pide aclarar demasiado",
      }),
    });
    assert.equal(strengthResponse.status, 200);
    const strength = await strengthResponse.json();
    assert.equal(strength.status, "ready");
    assert.equal(strength.mode, "weakness-to-strength");
    assert.equal(strength.type, "prompt_filter");
    assert.equal(strength.redTest.file, "tests/prompt-filter.test.js");
    assert(strength.verification.includes("npm.cmd run check"));
    const evolveResponse = await fetch(`http://localhost:${port}/api/k7/evolve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "KAIZEN7",
        signals: [{
          source: { type: "text" },
          confidence: "high",
          destination: "task",
          content: {
            title: "prompt-filter no detecta self_test",
            summary: "Friccion repetible que debe fortalecerse.",
          },
          signals: { hasNext: true, tools: ["prompt-filter"], risks: [] },
        }],
      }),
    });
    assert.equal(evolveResponse.status, 200);
    const evolve = await evolveResponse.json();
    assert.equal(evolve.status, "ready");
    assert.equal(evolve.mode, "evolution-inbox");
    assert.equal(evolve.recommended.lane, "strength");
    assert.equal(evolve.recommended.action.packet.mode, "weakness-to-strength");

    const ticketsResponse = await fetch(`http://localhost:${port}/api/k7/tickets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "KAIZEN7",
        signals: [{
          source: { type: "text" },
          confidence: "high",
          destination: "task",
          content: {
            title: "prompt-filter no detecta self_test",
            summary: "Friccion repetible que debe fortalecerse.",
          },
          signals: { hasNext: true, tools: ["prompt-filter"], risks: [] },
        }],
      }),
    });
    assert.equal(ticketsResponse.status, 200);
    const tickets = await ticketsResponse.json();
    assert.equal(tickets.status, "ready");
    assert.equal(tickets.mode, "action-queue-tickets");
    assert.equal(tickets.recommended.priority, "P0");
    assert.equal(tickets.recommended.status, "pending_approval");
    assert(tickets.recommended.stopCondition.includes("stop_if_credentials_required"));

    const queuedResponse = await fetch(`http://localhost:${port}/api/social/meta`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "No publicar: prueba K7 Scope" }),
    });
    assert.equal(queuedResponse.status, 202);
    const queued = await queuedResponse.json();
    assert.equal(queued.approval.status, "pending");

    const decisionResponse = await fetch(`http://localhost:${port}/api/core/approvals/${queued.approval.id}/decision`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "rejected", note: "Prueba automatizada" }),
    });
    const decision = await decisionResponse.json();
    assert.equal(decision.approval.status, "rejected");
    const status = await (await fetch(`http://localhost:${port}/api/core/status`)).json();
    assert.equal(status.recentRuns[0].status, "cancelled");
    const projectResponse = await fetch(`http://localhost:${port}/api/workspace/projects`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Integration project", product: "Test product" }),
    });
    assert.equal(projectResponse.status, 201);
    const { project } = await projectResponse.json();
    const taskResponse = await fetch(`http://localhost:${port}/api/workspace/tasks`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId: project.id, title: "Integration task" }),
    });
    const { task } = await taskResponse.json();
    const patchResponse = await fetch(`http://localhost:${port}/api/workspace/tasks/${task.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "done" }),
    });
    assert.equal(patchResponse.status, 200);
    const workspace = await (await fetch(`http://localhost:${port}/api/workspace?projectId=${project.id}`)).json();
    assert.equal(workspace.metrics.tasksDone, 1);
    const search = await (await fetch(`http://localhost:${port}/api/search?q=Integration`)).json();
    assert(search.results.some((item) => item.id === project.id));
    const exported = await fetch(`http://localhost:${port}/api/workspace/export`);
    assert.equal(exported.status, 200);
    assert.match(exported.headers.get("content-disposition"), /kaizen7-workspace/);
    const trendResponse = await fetch(`http://localhost:${port}/api/metabrowser/trend-search`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: "nootropicos premium tiktok",
        platform: "TikTok",
        product: "THE FOCUX",
        sources: [{ text: "En TikTok los comentarios piden nootropicos premium para foco, energia limpia y menos estres durante jornadas largas." }],
      }),
    });
    assert.equal(trendResponse.status, 201);
    const trend = await trendResponse.json();
    assert(trend.signals.length > 0);
    assert(trend.genome.summary.creatives > 0);
    const k7RunResponse = await fetch(`http://localhost:${port}/api/k7/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "hacer KAIZEN7 usable por cualquier agente via API",
        compact: true,
      }),
    });
    assert.equal(k7RunResponse.status, 200);
    const k7Run = await k7RunResponse.json();
    assert.equal(k7Run.status, "ready");
    assert(k7Run.action.candidate);
    assert(Array.isArray(k7Run.skills));
    assert(Array.isArray(k7Run.commands));
    assert(k7Run.commands.includes("node lib/hunter.js queue"));
    const adviseResponse = await fetch(`http://localhost:${port}/api/k7/advise`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agent: "codex",
        goal: "implementar mejora con tests",
        capabilities: ["read_files", "edit_files", "run_tests"],
        contextBudget: 900,
        riskTolerance: "low",
        compact: true,
      }),
    });
    assert.equal(adviseResponse.status, 200);
    const advise = await adviseResponse.json();
    assert.equal(advise.status, "ready");
    assert.equal(advise.agent, "codex");
    assert(advise.advice.skills.includes("test-driven-development"));
    assert(advise.advice.action.includes("test"));
    const codexResponse = await fetch(`http://localhost:${port}/api/k7/codex`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "implementar conexion Codex KAIZEN7",
        frontier: true,
        writeSignals: true,
      }),
    });
    assert.equal(codexResponse.status, 200);
    const codex = await codexResponse.json();
    assert.equal(codex.status, "ready");
    assert.equal(codex.mode, "codex-bridge");
    assert.equal(codex.agent, "codex");
    assert(codex.codex.commands.includes("npm.cmd run check"));
    assert(codex.frontier);
    const superResponse = await fetch(`http://localhost:${port}/api/k7/super`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "implementar endpoint con tests",
        execute: false,
      }),
    });
    assert.equal(superResponse.status, 200);
    const supertool = await superResponse.json();
    assert.equal(supertool.status, "ready");
    assert.equal(supertool.mode, "supertool-orchestrator");
    assert.equal(supertool.intent, "code");
    assert.equal(supertool.route.primary, "codex");
    const brainResponse = await fetch(`http://localhost:${port}/api/k7/brain`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar KAIZEN7 como segundo cerebro",
      }),
    });
    assert.equal(brainResponse.status, 200);
    const brain = await brainResponse.json();
    assert.equal(brain.status, "ready");
    assert.equal(brain.mode, "second-brain-metaskills");
    assert(brain.metaskills.includes("kaizen7-evolution-engine"));
    const connectResponse = await fetch(`http://localhost:${port}/api/k7/connect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "Flowmatik",
        kind: "project",
        goal: "mejorar redes sociales con memoria y verificacion",
        capabilities: ["read_files", "edit_files", "run_tests"],
      }),
    });
    assert.equal(connectResponse.status, 200);
    const connector = await connectResponse.json();
    assert.equal(connector.status, "ready");
    assert.equal(connector.mode, "connector-kernel");
    assert.equal(connector.profile.name, "Flowmatik");
    assert.equal(connector.route.name, "social");
    assert(connector.metaskills.includes("kaizen7-evolution-engine"));
    assert(connector.tools.includes("adapter-registry"));
    const onboardPresetsResponse = await fetch(`http://localhost:${port}/api/k7/onboard`);
    assert.equal(onboardPresetsResponse.status, 200);
    const onboardPresets = await onboardPresetsResponse.json();
    assert(onboardPresets.presets.some((preset) => preset.id === "codex"));
    const onboardResponse = await fetch(`http://localhost:${port}/api/k7/onboard`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        preset: "codex",
        goal: "mejorar KAIZEN7 con tests",
      }),
    });
    assert.equal(onboardResponse.status, 200);
    const onboard = await onboardResponse.json();
    assert.equal(onboard.status, "ready");
    assert.equal(onboard.mode, "onboarding");
    assert.equal(onboard.preset.id, "codex");
    const improveResponse = await fetch(`http://localhost:${port}/api/k7/improve`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "mejorar KAIZEN7 usando señales actuales del mercado de agentes",
      }),
    });
    assert.equal(improveResponse.status, 200);
    const improve = await improveResponse.json();
    assert.equal(improve.status, "ready");
    assert.equal(improve.mode, "self-improvement-loop");
    assert.equal(improve.subject, "KAIZEN7");
    assert(improve.marketSignals.some((signal) => signal.id === "mcp-tools"));
    const adapterKindsResponse = await fetch(`http://localhost:${port}/api/k7/adapters`);
    assert.equal(adapterKindsResponse.status, 200);
    const adapterKinds = await adapterKindsResponse.json();
    assert(adapterKinds.kinds.some((item) => item.kind === "api"));
    const adapterPlanResponse = await fetch(`http://localhost:${port}/api/k7/adapters/plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "External Coding Agent",
        kind: "agent",
        goal: "mejorar sistemas conectandose a KAIZEN7",
        capabilities: ["run_tests", "deploy"],
      }),
    });
    assert.equal(adapterPlanResponse.status, 200);
    const adapterPlan = await adapterPlanResponse.json();
    assert.equal(adapterPlan.status, "ready");
    assert.equal(adapterPlan.risk, "high");
    assert.equal(adapterPlan.connectToK7.advise, "POST /api/k7/advise");
    assert(adapterPlan.gates.some((gate) => gate.includes("Require human approval")));
    const openHandsResponse = await fetch(`http://localhost:${port}/api/k7/openhands`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar OpenHands como worker remoto seguro",
        allowedPaths: ["lib", "tests"],
      }),
    });
    assert.equal(openHandsResponse.status, 200);
    const openHands = await openHandsResponse.json();
    assert.equal(openHands.mode, "openhands-adapter");
    assert.equal(openHands.adapter.kind, "remote_worker");
    assert(openHands.workerPacket.forbiddenActions.includes("merge_directly"));
    const claudeFlowResponse = await fetch(`http://localhost:${port}/api/k7/claude-flow`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar Claude Flow como worker multiagente seguro",
        allowedPaths: ["lib", "tests"],
      }),
    });
    assert.equal(claudeFlowResponse.status, 200);
    const claudeFlow = await claudeFlowResponse.json();
    assert.equal(claudeFlow.mode, "claude-flow-adapter");
    assert.equal(claudeFlow.adapter.kind, "remote_worker");
    assert.equal(claudeFlow.source.status, "candidate_pending_source_verification");
    assert(claudeFlow.workerPacket.forbiddenActions.includes("install_dependencies_without_approval"));
    const hermesResponse = await fetch(`http://localhost:${port}/api/k7/hermes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar Hermes Agent como amigo intimo critico de KAIZEN7",
        allowedPaths: ["lib", "tests"],
      }),
    });
    assert.equal(hermesResponse.status, 200);
    const hermes = await hermesResponse.json();
    assert.equal(hermes.mode, "hermes-agent-adapter");
    assert.equal(hermes.relationship, "intimate_companion_candidate");
    assert.equal(hermes.source.status, "candidate_pending_source_verification");
    assert(hermes.companionPacket.forbiddenActions.includes("run_unbounded_agent_loop"));
    const jcodeResponse = await fetch(`http://localhost:${port}/api/k7/jcode`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar jcode como harness candidato de KAIZEN7",
        allowedPaths: ["lib", "tests"],
      }),
    });
    assert.equal(jcodeResponse.status, 200);
    const jcode = await jcodeResponse.json();
    assert.equal(jcode.mode, "jcode-adapter");
    assert.equal(jcode.relationship, "harness_candidate_not_core");
    assert.equal(jcode.installPolicy.current, "not_installed_adapter_only");
    assert(jcode.harnessPacket.blockedModes.includes("self_dev"));
    const missionResponse = await fetch(`http://localhost:${port}/api/k7/mission`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "THE FOCUX",
        objective: "mejorar landing THE FOCUX con tests",
        capabilities: ["edit_code", "run_tests"],
      }),
    });
    assert.equal(missionResponse.status, 200);
    const mission = await missionResponse.json();
    assert.equal(mission.mode, "k7-mission-packet");
    assert.equal(mission.project, "THE FOCUX");
    assert.equal(mission.risk, "low");
    assert(mission.verificationCommands.includes("npm.cmd run check"));
    const routeResponse = await fetch(`http://localhost:${port}/api/k7/harness/route`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "usar memoria automatica, subagents y MCP",
        capabilities: ["memory_writeback", "subagents", "mcp_tools"],
      }),
    });
    assert.equal(routeResponse.status, 200);
    const route = await routeResponse.json();
    assert.equal(route.mode, "k7-harness-router");
    assert.equal(route.recommendedExecutor.id, "qwen-code");
    assert(route.gates.includes("external_cli_smoke_test_required"));
    const dryRunResponse = await fetch(`http://localhost:${port}/api/k7/harness/dry-run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "deploy production with token",
        capabilities: ["deploy", "credential_write"],
      }),
    });
    assert.equal(dryRunResponse.status, 200);
    const dryRun = await dryRunResponse.json();
    assert.equal(dryRun.mode, "k7-harness-dry-run");
    assert.equal(dryRun.route.recommendedExecutor.id, "manual");
    assert.equal(dryRun.approval.required, true);
    const operatingResponse = await fetch(`http://localhost:${port}/api/k7/operating`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "construir K7 Operating Layer modular",
        capabilities: ["semantic_memory"],
      }),
    });
    assert.equal(operatingResponse.status, 200);
    const operating = await operatingResponse.json();
    assert.equal(operating.mode, "k7-operating-layer");
    assert.equal(operating.authority.core, "KAIZEN7");
    assert(operating.layers.some((layer) => layer.id === "k7-harness"));
    assert(operating.layers.some((layer) => layer.id === "k7-context"));
    assert(operating.layers.some((layer) => layer.id === "k7-control-plane"));
    assert.equal(operating.jcodeAdapter.mode, "jcode-adapter");
    assert.equal(operating.headroomAdapter.mode, "headroom-adapter");
    assert.equal(operating.paperclipAdapter.mode, "paperclip-adapter");
    const headroomResponse = await fetch(`http://localhost:${port}/api/k7/headroom`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar Headroom como compresion reversible de KAIZEN7",
        allowedPaths: ["lib", "tests"],
      }),
    });
    assert.equal(headroomResponse.status, 200);
    const headroom = await headroomResponse.json();
    assert.equal(headroom.mode, "headroom-adapter");
    assert.equal(headroom.relationship, "context_compression_candidate_not_source_of_truth");
    assert.equal(headroom.installPolicy.current, "not_installed_adapter_only");
    assert(headroom.compressionPacket.blockedModes.includes("secret_compression"));
    const contextResponse = await fetch(`http://localhost:${port}/api/k7/context`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "reducir tokens sin perder evidencia",
        capabilities: ["reversible_retrieval"],
      }),
    });
    assert.equal(contextResponse.status, 200);
    const context = await contextResponse.json();
    assert.equal(context.mode, "k7-context-layer");
    assert.equal(context.authority.owner, "K7 Context");
    assert(context.pipeline.some((step) => step.id === "retrieve"));
    assert.equal(context.headroomAdapter.mode, "headroom-adapter");
    const paperclipResponse = await fetch(`http://localhost:${port}/api/k7/paperclip`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar Paperclip como control plane candidato de KAIZEN7",
        allowedPaths: ["lib", "tests"],
      }),
    });
    assert.equal(paperclipResponse.status, 200);
    const paperclip = await paperclipResponse.json();
    assert.equal(paperclip.mode, "paperclip-adapter");
    assert.equal(paperclip.relationship, "control_plane_candidate_not_kaizen_core");
    assert.equal(paperclip.installPolicy.current, "not_installed_adapter_only");
    assert(paperclip.controlPacket.blockedModes.includes("budgetless_agent"));
    const controlResponse = await fetch(`http://localhost:${port}/api/k7/control`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "gobernar agentes KAIZEN7 con presupuesto y auditoria",
        capabilities: ["budget_governance"],
      }),
    });
    assert.equal(controlResponse.status, 200);
    const control = await controlResponse.json();
    assert.equal(control.mode, "k7-control-plane");
    assert.equal(control.authority.owner, "K7 Control Plane");
    assert(control.primitives.some((primitive) => primitive.id === "budget"));
    assert.equal(control.paperclipAdapter.mode, "paperclip-adapter");
    const toolchainResponse = await fetch(`http://localhost:${port}/api/k7/toolchain`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        goal: "usar OpenHands para mejorar KAIZEN7 con tests",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(toolchainResponse.status, 200);
    const toolchain = await toolchainResponse.json();
    assert.equal(toolchain.mode, "toolchain-router");
    assert(toolchain.toolchain.some((item) => item.id === "openhands-worker"));
    const evalResponse = await fetch(`http://localhost:${port}/api/k7/toolchain/evaluate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        claims: ["changed files are scoped"],
        evidence: { diff: "patch" },
      }),
    });
    assert.equal(evalResponse.status, 200);
    const evalResult = await evalResponse.json();
    assert.equal(evalResult.verdict, "block");
    const harnessResponse = await fetch(`http://localhost:${port}/api/k7/eval`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "The Focus",
        objective: "crear proyecto de creacion de contenido",
        context: "repo local",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(harnessResponse.status, 200);
    const harness = await harnessResponse.json();
    assert.equal(harness.mode, "eval-harness");
    assert.equal(harness.project, "The Focus");
    assert(harness.comparison.kaizen.cockpit.metaskillBoot.activationOrder.length > 0);
    const frontierResponse = await fetch(`http://localhost:${port}/api/k7/frontier`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ writeSignals: true, limit: 3 }),
    });
    assert.equal(frontierResponse.status, 200);
    const frontier = await frontierResponse.json();
    assert.equal(frontier.status, "ready");
    assert.equal(frontier.mode, "frontier-operator");
    assert(frontier.action.command.includes("k7:adapt"));
    assert(frontier.adapterPlan);
    assert(frontier.queue.length > 0);
    console.log("K7 API approval firewall test passed");
  } finally {
    if (server) server.kill();
    if (originalRuntime) fs.writeFileSync(runtimePath, originalRuntime);
    else fs.rmSync(runtimePath, { force: true });
    if (originalWorkspace) fs.writeFileSync(workspacePath, originalWorkspace);
    else fs.rmSync(workspacePath, { force: true });
    if (originalGenome) fs.writeFileSync(genomePath, originalGenome);
    else fs.rmSync(genomePath, { force: true });
    if (originalMetaBrowser) fs.writeFileSync(metaBrowserPath, originalMetaBrowser);
    else fs.rmSync(metaBrowserPath, { force: true });
    if (originalSignalInbox) fs.writeFileSync(signalInboxPath, originalSignalInbox);
    else fs.rmSync(signalInboxPath, { force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
