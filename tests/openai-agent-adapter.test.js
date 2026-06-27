const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  adviseAgent,
  runProjectActivation,
  verifyAndWriteback,
  toolSpecs,
} = require("../lib/openai-agent-adapter");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-openai-adapter-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Producto"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Producto", "K7 AI Booster.md"), "K7 AI Booster reduces steps and tokens.");
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "---\nname: repo-hunter-github\ndescription: repos github agentes\n---\n");
fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({
  modules: {
    semantic_memory: {
      status: "approved_for_prototype",
      primary: {
        source: "huggingface",
        id: "BAAI/bge-m3",
        license: "mit",
        verdict: "adopt_now",
        reason: "Embeddings for memory",
      },
    },
  },
}, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), "[]");

(async () => {
  const tools = toolSpecs();
  assert.equal(tools.length, 3);
  assert.equal(tools[0].name, "get_project_brief");
  assert.equal(tools[0].annotations.readOnlyHint, true);
  assert.equal(tools[2].name, "save_project_learning");
  assert.equal(tools[2].annotations.readOnlyHint, false);

  const activation = await runProjectActivation({
    root,
    goal: "activar proyecto con OpenAI Agents SDK",
    agent: "codex",
    useSdk: false,
  });
  assert.equal(activation.status, "ready");
  assert.equal(activation.mode, "openai-agents-sdk-adapter");
  assert.equal(activation.runtime, "local-compatible");
  assert(activation.projectActivation.action.includes("prototype"));
  assert(Array.isArray(activation.projectActivation.contextPack));
  assert(activation.projectActivation.verification.length >= 3);

  const advice = adviseAgent({
    root,
    goal: "preparar agente",
    agent: "codex",
    contextBudget: 900,
  });
  assert.equal(advice.status, "ready");
  assert.equal(advice.mode, "openai-agents-sdk-advisor");
  assert.equal(advice.agent, "codex");
  assert(advice.advice.tokenPolicy.includes("900"));

  const writeback = verifyAndWriteback({
    goal: "activar proyecto",
    result: "accion completada",
    learning: "usar adapter opcional",
  });
  assert.equal(writeback.requiresConfirmation, true);
  assert(writeback.memoryDraft.includes("usar adapter opcional"));

  console.log("openai agent adapter tests passed");
})();
