const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createWorkspaceStore } = require("../lib/workspace-store");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kaizen7-workspace-"));
try {
  const store = createWorkspaceStore(dir);
  const project = store.createProject({ name: "THE FOCUX", product: "Keto Performance" });
  const campaign = store.createCampaign({ projectId: project.id, name: "Validacion", budget: 500 });
  const task = store.createTask({ projectId: project.id, campaignId: campaign.id, title: "Crear tres hooks" });
  store.createContent({ projectId: project.id, campaignId: campaign.id, title: "Hook 1", body: "Contenido de prueba suficientemente claro" });
  store.updateTask(task.id, { status: "done" });
  const result = store.summary(project.id);
  assert.equal(result.metrics.projects, 1);
  assert.equal(result.metrics.tasksDone, 1);
  assert.equal(result.metrics.contentDrafts, 1);
  assert.equal(result.metrics.budget, 500);
  assert(result.workspace.audit.length >= 5);
  console.log("K7 workspace persistence and metrics tests passed");
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
