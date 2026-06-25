const assert = require("assert");
const fs = require("fs");
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
const port = 8797;
const server = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

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
    console.log("K7 API approval firewall test passed");
  } finally {
    server.kill();
    if (originalRuntime) fs.writeFileSync(runtimePath, originalRuntime);
    else fs.rmSync(runtimePath, { force: true });
    if (originalWorkspace) fs.writeFileSync(workspacePath, originalWorkspace);
    else fs.rmSync(workspacePath, { force: true });
    if (originalGenome) fs.writeFileSync(genomePath, originalGenome);
    else fs.rmSync(genomePath, { force: true });
    if (originalMetaBrowser) fs.writeFileSync(metaBrowserPath, originalMetaBrowser);
    else fs.rmSync(metaBrowserPath, { force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
