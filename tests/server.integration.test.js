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
