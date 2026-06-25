const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createKaizenCore } = require("../lib/kaizen-core");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kaizen7-"));
try {
  const core = createKaizenCore(dir);
  const run = core.startRun({ goal: "Publicar una campana", product: "Producto A", mode: "builder" });
  core.updateRun(run.id, "running", "Inicio");
  core.recordTool(run.id, "memory.search", "completed", "Contexto recuperado");
  const approval = core.requestApproval({ runId: run.id, tool: "social.meta.publish", input: { message: "Hola" }, summary: "Publicar en Meta" });
  assert.equal(core.status().pendingApprovals, 1);
  assert.equal(core.decideApproval(approval.id, "approved").status, "approved");
  assert.equal(core.finishApproval(approval.id, { id: "post_1" }).status, "executed");
  assert.equal(core.status().recentRuns[0].status, "completed");
  assert(core.status().recentRuns[0].trace.length >= 6);
  const safePost = core.evaluate({ content: "Descubre una forma mas clara de trabajar. ¿Que proceso mejorarias primero?", profile: "social" });
  const riskyPost = core.evaluate({ content: "Garantiza resultados asegurados al 100%.", profile: "social" });
  assert.equal(safePost.verdict, "pass");
  assert.equal(riskyPost.verdict, "block");
  console.log("K7 core state, approval and trace tests passed");
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
