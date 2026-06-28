const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const defaults = {
  version: 1,
  projects: [],
  campaigns: [],
  tasks: [],
  content: [],
  audit: [],
  updatedAt: null,
};

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
}

function createWorkspaceStore(dataDir) {
  const filePath = path.join(dataDir, "kaizen-workspace.json");
  function read() {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaults, null, 2));
    return { ...structuredClone(defaults), ...JSON.parse(fs.readFileSync(filePath, "utf8")) };
  }
  function write(workspace) {
    workspace.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(workspace, null, 2));
    return workspace;
  }
  function audit(workspace, event, entityType, entityId, detail) {
    workspace.audit.push({ id: newId("audit"), event, entityType, entityId, detail, at: new Date().toISOString() });
    workspace.audit = workspace.audit.slice(-500);
  }
  function requireProject(workspace, projectId) {
    if (!workspace.projects.some((item) => item.id === projectId)) throw new Error("Proyecto no encontrado");
  }
  function createProject(input) {
    if (!input.name?.trim()) throw new Error("El proyecto necesita un nombre");
    const workspace = read();
    const project = {
      id: newId("project"), name: input.name.trim(), brand: input.brand?.trim() || "",
      product: input.product?.trim() || "", category: input.category?.trim() || "",
      audience: input.audience?.trim() || "", promise: input.promise?.trim() || "",
      goal: input.goal?.trim() || "", channel: input.channel?.trim() || "",
      status: "active", createdAt: new Date().toISOString(),
    };
    workspace.projects.push(project);
    audit(workspace, "project.created", "project", project.id, project.name);
    write(workspace);
    return project;
  }
  function createCampaign(input) {
    const workspace = read(); requireProject(workspace, input.projectId);
    if (!input.name?.trim()) throw new Error("La campaña necesita un nombre");
    const campaign = {
      id: newId("campaign"), projectId: input.projectId, name: input.name.trim(),
      objective: input.objective?.trim() || "", channel: input.channel?.trim() || "",
      status: input.status || "draft", startDate: input.startDate || "", endDate: input.endDate || "",
      budget: Number(input.budget || 0), spent: 0, createdAt: new Date().toISOString(),
    };
    workspace.campaigns.push(campaign);
    audit(workspace, "campaign.created", "campaign", campaign.id, campaign.name);
    write(workspace); return campaign;
  }
  function createTask(input) {
    const workspace = read(); requireProject(workspace, input.projectId);
    if (!input.title?.trim()) throw new Error("La tarea necesita un titulo");
    const task = {
      id: newId("task"), projectId: input.projectId, campaignId: input.campaignId || "",
      title: input.title.trim(), description: input.description?.trim() || "",
      owner: input.owner || "Commander", status: input.status || "backlog",
      priority: input.priority || "medium", dueDate: input.dueDate || "",
      runId: input.runId || "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    workspace.tasks.push(task);
    audit(workspace, "task.created", "task", task.id, task.title);
    write(workspace); return task;
  }
  function updateTask(taskId, input) {
    const workspace = read();
    const task = workspace.tasks.find((item) => item.id === taskId);
    if (!task) throw new Error("Tarea no encontrada");
    const allowed = ["title", "description", "owner", "status", "priority", "dueDate", "runId", "campaignId"];
    for (const key of allowed) if (key in input) task[key] = input[key];
    task.updatedAt = new Date().toISOString();
    audit(workspace, "task.updated", "task", task.id, `${task.title}: ${task.status}`);
    write(workspace); return task;
  }
  function createContent(input) {
    const workspace = read(); requireProject(workspace, input.projectId);
    if (!input.title?.trim() || !input.body?.trim()) throw new Error("El contenido necesita titulo y cuerpo");
    const item = {
      id: newId("content"), projectId: input.projectId, campaignId: input.campaignId || "",
      title: input.title.trim(), body: input.body.trim(), channel: input.channel || "",
      format: input.format || "post", status: input.status || "draft", evaluationId: input.evaluationId || "",
      runId: input.runId || "", scheduledFor: input.scheduledFor || "", createdAt: new Date().toISOString(),
    };
    workspace.content.push(item);
    audit(workspace, "content.created", "content", item.id, item.title);
    write(workspace); return item;
  }
  function addAudit(event, entityType, entityId, detail) {
    const workspace = read(); audit(workspace, event, entityType, entityId, detail); write(workspace);
  }
  function syncRun(runId, status) {
    const workspace = read();
    const task = workspace.tasks.find((item) => item.runId === runId);
    if (task) { task.status = status; task.updatedAt = new Date().toISOString(); }
    for (const item of workspace.content.filter((entry) => entry.runId === runId)) {
      item.status = status === "done" ? "published" : status === "cancelled" ? "rejected" : status;
    }
    audit(workspace, "run.synced", "run", runId, status);
    write(workspace);
  }
  function summary(projectId = "") {
    const workspace = read();
    const filter = (items) => projectId ? items.filter((item) => item.projectId === projectId) : items;
    const tasks = filter(workspace.tasks); const campaigns = filter(workspace.campaigns); const content = filter(workspace.content);
    return {
      workspace,
      metrics: {
        projects: workspace.projects.filter((item) => item.status === "active").length,
        campaigns: campaigns.length,
        tasksOpen: tasks.filter((item) => !["done", "cancelled"].includes(item.status)).length,
        tasksDone: tasks.filter((item) => item.status === "done").length,
        contentDrafts: content.filter((item) => item.status === "draft").length,
        contentScheduled: content.filter((item) => item.status === "scheduled").length,
        budget: campaigns.reduce((sum, item) => sum + item.budget, 0),
        spent: campaigns.reduce((sum, item) => sum + item.spent, 0),
      },
    };
  }
  return { addAudit, createCampaign, createContent, createProject, createTask, read, summary, syncRun, updateTask };
}

module.exports = { createWorkspaceStore };
