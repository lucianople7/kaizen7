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
let server;
let port;
let stderr = "";

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
    if (server.exitCode !== null) throw new Error(`El servidor salio antes de arrancar: ${stderr}`);
    try {
      const response = await fetch(`http://localhost:${port}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`El servidor de prueba no arranco: ${stderr}`);
}

(async () => {
  try {
    port = await getFreePort();
    server = spawn(process.execPath, ["server.js"], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    server.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    await waitForServer();

    const setupResponse = await fetch(`http://localhost:${port}/api/k7/setup`);
    assert.equal(setupResponse.status, 200);
    const setup = await setupResponse.json();
    assert(["local-only", "enhanced", "blocked"].includes(setup.status));
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
        goal: "mejorar KAIZEN7 con tests",
        context: "repo local",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(cockpitReadyResponse.status, 200);
    const cockpitReady = await cockpitReadyResponse.json();
    assert.equal(cockpitReady.status, "ready");
    assert(cockpitReady.nextAction.command.includes("k7:"));

    const startResponse = await fetch(`http://localhost:${port}/api/k7/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        project: "KAIZEN7",
        objective: "evaluar KAIZEN7 limpio",
        context: "repo local KAIZEN7",
        capabilities: ["run_tests"],
      }),
    });
    assert.equal(startResponse.status, 200);
    const start = await startResponse.json();
    assert.equal(start.mode, "start-hub");
    assert.equal(start.project, "KAIZEN7");
    assert(start.firstAction.command.includes("Project: KAIZEN7"));
    assert(start.firstAction.command.includes("Context: repo local KAIZEN7"));

    const capabilityPlanResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/plan`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "crear reel de Mr Kaizen" }),
    });
    assert.equal(capabilityPlanResponse.status, 200);
    const capabilityPlan = await capabilityPlanResponse.json();
    assert.equal(capabilityPlan.inferredDomain, "content");
    assert(capabilityPlan.selected.some((capability) => capability.id === "content.reel.script"));

    const capabilityContractResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/contract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityContractResponse.status, 200);
    const capabilityContract = await capabilityContractResponse.json();
    assert.equal(capabilityContract.schema, "kaizen7.agent_contract.v1");
    assert.equal(capabilityContract.intent, "code_change");
    assert.equal(Object.hasOwn(capabilityContract, "commands"), false);

    const capabilityBriefResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/brief`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityBriefResponse.status, 200);
    const capabilityBrief = await capabilityBriefResponse.json();
    assert.equal(capabilityBrief.schema, "kaizen7.agent_brief.v1");
    assert.equal(capabilityBrief.first_move, "understand_scope");
    assert.equal(Object.hasOwn(capabilityBrief, "commands"), false);

    const capabilityHandoffResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/handoff`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityHandoffResponse.status, 200);
    const capabilityHandoff = await capabilityHandoffResponse.json();
    assert.equal(capabilityHandoff.schema, "kaizen7.agent_handoff.v1");
    assert.equal(capabilityHandoff.expected_receipt_schema, "kaizen7.agent_receipt.v1");

    const capabilityValidateResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/validate-language`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: capabilityHandoff, expectedSchema: "kaizen7.agent_handoff.v1" }),
    });
    assert.equal(capabilityValidateResponse.status, 200);
    const capabilityValidate = await capabilityValidateResponse.json();
    assert.equal(capabilityValidate.verdict, "pass");

    const capabilityReadyResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/readiness`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityReadyResponse.status, 200);
    const capabilityReady = await capabilityReadyResponse.json();
    assert.equal(capabilityReady.schema, "kaizen7.agent_readiness.v1");
    assert.equal(capabilityReady.next_action, "execute_handoff");

    const capabilityReceiptResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/receipt`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "implementar cambio con tests",
        result: {
          summary: "api receipt works",
          claims: ["verification passed"],
          evidence: {
            changed_surface: ["server.js"],
            verification_result: "server integration passed",
            remaining_risks: ["none known"],
          },
        },
      }),
    });
    assert.equal(capabilityReceiptResponse.status, 200);
    const capabilityReceipt = await capabilityReceiptResponse.json();
    assert.equal(capabilityReceipt.schema, "kaizen7.agent_receipt.v1");
    assert.equal(capabilityReceipt.verdict, "pass");
    assert.equal(capabilityReceipt.next_action, "complete");

    const capabilityCycleResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/cycle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "implementar cambio con tests",
        result: {
          summary: "cycle endpoint works",
          claims: ["verification passed"],
          evidence: {
            changed_surface: ["server.js"],
            verification_result: "server integration passed",
            remaining_risks: ["none known"],
          },
          memory_draft: "Capability cycle endpoint gives agents one closure object.",
        },
      }),
    });
    assert.equal(capabilityCycleResponse.status, 200);
    const capabilityCycle = await capabilityCycleResponse.json();
    assert.equal(capabilityCycle.schema, "kaizen7.agent_cycle.v1");
    assert.equal(capabilityCycle.next_action, "complete");

    const capabilityBridgeResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/bridge`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "crear contenido para Mr Kaizen",
        consumer: "any_agent",
        project: "mr_kaizen",
      }),
    });
    assert.equal(capabilityBridgeResponse.status, 200);
    const capabilityBridge = await capabilityBridgeResponse.json();
    assert.equal(capabilityBridge.schema, "kaizen7.kernel_bridge.v1");
    assert.equal(capabilityBridge.next_action, "run_cycle");

    const capabilitySpecResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/spec`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "agent.handoff_cycle" }),
    });
    assert.equal(capabilitySpecResponse.status, 200);
    const capabilitySpec = await capabilitySpecResponse.json();
    assert.equal(capabilitySpec.schema, "kaizen7.capability_spec.v1");
    assert.equal(capabilitySpec.id, "agent.handoff_cycle");

    const capabilityForgeResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/forge`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "crear pipeline de contenido para Mr Kaizen",
        id: "content.mr_kaizen_pipeline",
        domain: "content",
      }),
    });
    assert.equal(capabilityForgeResponse.status, 200);
    const capabilityForge = await capabilityForgeResponse.json();
    assert.equal(capabilityForge.schema, "kaizen7.capability_forge.v1");
    assert.equal(capabilityForge.draft.id, "content.mr_kaizen_pipeline");

    const capabilityOfferResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/offer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "convertir agentes y proyectos en herramientas utiles" }),
    });
    assert.equal(capabilityOfferResponse.status, 200);
    const capabilityOffer = await capabilityOfferResponse.json();
    assert.equal(capabilityOffer.schema, "kaizen7.kernel_offer.v1");
    assert(capabilityOffer.promise.includes("turn_agent_work_into_verified_capability_cycles"));

    const capabilityLearnResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/learn`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "convertir resultado en aprendizaje reutilizable",
        result: {
          summary: "learning endpoint works",
          claims: ["verification passed"],
          evidence: {
            changed_surface: ["server.js"],
            verification_result: "server integration passed",
            remaining_risks: ["none known"],
          },
          memory_draft: "Learning loop teaches the next agent from verified work.",
        },
      }),
    });
    assert.equal(capabilityLearnResponse.status, 200);
    const capabilityLearn = await capabilityLearnResponse.json();
    assert.equal(capabilityLearn.schema, "kaizen7.learning_loop.v1");
    assert.equal(capabilityLearn.next_action, "teach_next_agent");

    const capabilitySuperResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/super`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "orquestar Codex Mr Kaizen Flowmatic y apps sin friccion" }),
    });
    assert.equal(capabilitySuperResponse.status, 200);
    const capabilitySuper = await capabilitySuperResponse.json();
    assert.equal(capabilitySuper.schema, "kaizen7.super_capability_system.v1");
    assert.equal(capabilitySuper.pieces.length, 8);

    const capabilityWorldResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/world`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "usar MCP y clips para preparar publicacion sin publicar",
        target: "mcp",
        artifact: "clip",
      }),
    });
    assert.equal(capabilityWorldResponse.status, 200);
    const capabilityWorld = await capabilityWorldResponse.json();
    assert.equal(capabilityWorld.schema, "kaizen7.world_interaction_plan.v1");
    assert.equal(capabilityWorld.next_action, "prepare_handoff_or_request_approval");

    const capabilityNextResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/next`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "crear reel de Mr Kaizen con evidencia", state: "ready" }),
    });
    assert.equal(capabilityNextResponse.status, 200);
    const capabilityNext = await capabilityNextResponse.json();
    assert.equal(capabilityNext.schema, "kaizen7.next_best_action.v1");
    assert.equal(capabilityNext.next_action, "run_cycle");

    const capabilityWorkbenchResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/workbench`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "crear reel de Mr Kaizen con evidencia",
        project: "mr_kaizen",
      }),
    });
    assert.equal(capabilityWorkbenchResponse.status, 200);
    const capabilityWorkbench = await capabilityWorkbenchResponse.json();
    assert.equal(capabilityWorkbench.schema, "kaizen7.agent_workbench.v1");
    assert.equal(capabilityWorkbench.capability, "super.content_engine");

    const capabilityPacketResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/packet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ objective: "implementar cambio con tests" }),
    });
    assert.equal(capabilityPacketResponse.status, 200);
    const capabilityPacket = await capabilityPacketResponse.json();
    assert.equal(capabilityPacket.mode, "k7-execution-packet");
    assert.equal(capabilityPacket.capabilities[0], "code.change");

    const capabilityVerifyResponse = await fetch(`http://localhost:${port}/api/k7/capabilities/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        objective: "implementar cambio con tests",
        evidence: {
          claims: ["tests passed", "risks reported"],
          evidence: {
            diff: ["server.js"],
            tests: "node tests/server.integration.test.js passed",
            risks: ["no external effects"],
          },
        },
      }),
    });
    assert.equal(capabilityVerifyResponse.status, 200);
    const capabilityVerify = await capabilityVerifyResponse.json();
    assert.equal(capabilityVerify.verdict, "pass");

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

    console.log("K7 clean API integration test passed");
  } finally {
    if (server) server.kill();
    if (originalRuntime) fs.writeFileSync(runtimePath, originalRuntime);
    else fs.rmSync(runtimePath, { force: true });
    if (originalWorkspace) fs.writeFileSync(workspacePath, originalWorkspace);
    else fs.rmSync(workspacePath, { force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
