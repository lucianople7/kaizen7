const assert = require("node:assert/strict");
const {
  buildConnectorKernel,
  detectConnectorRoute,
  parseArgs,
} = require("../lib/connector-kernel");

assert.equal(detectConnectorRoute({ goal: "crear posts para redes sociales" }).name, "social");
assert.equal(detectConnectorRoute({ goal: "mejorar agente con tests" }).name, "code");
assert.equal(detectConnectorRoute({ goal: "mejorar KAIZEN7 como producto", domain: "coding", kind: "agent" }).name, "code");
assert.equal(detectConnectorRoute({ goal: "buscar mejores repos de GitHub y Hugging Face" }).name, "research");
assert.equal(detectConnectorRoute({ goal: "activar memoria y contexto compartido" }).name, "memory");
assert.equal(detectConnectorRoute({ goal: "conectar MCP externo como herramienta" }).name, "agent");
assert.equal(detectConnectorRoute({ goal: "mejorar ecommerce y Shopify" }).name, "commerce");

const result = buildConnectorKernel({
  root: process.cwd(),
  project: "Flowmatik",
  kind: "project",
  goal: "mejorar redes sociales con memoria y verificacion",
  capabilities: ["read_files", "edit_files", "run_tests"],
  supertool: () => ({
    status: "ready",
    context: ["docs/SUPERTOOL.md"],
    skills: ["test-driven-development"],
    tools: ["codex-bridge"],
    verification: ["Run tests"],
    action: "Write test first",
    commands: ["npm.cmd run check"],
  }),
  secondBrain: () => ({
    status: "ready",
    metaskills: ["kaizen7-evolution-engine"],
    memory: ["Obsidian/Flowmatik"],
    writeback: { mode: "draft", target: "Obsidian" },
  }),
  adapterPlanner: () => ({
    status: "ready",
    gates: ["Require human approval before external writes"],
    connectToK7: { advise: "POST /api/k7/advise" },
  }),
  frontier: () => ({
    status: "ready",
    queue: [{ candidate: "OpenAI Agents SDK" }],
    gates: ["Verify license"],
  }),
});

assert.equal(result.status, "ready");
assert.equal(result.mode, "connector-kernel");
assert.equal(result.profile.name, "Flowmatik");
assert.equal(result.profile.kind, "project");
assert.equal(result.route.name, "social");
assert(result.contextPack.includes("docs/SUPERTOOL.md"));
assert(result.contextPack.includes("Obsidian/Flowmatik"));
assert(result.metaskills.includes("kaizen7-evolution-engine"));
assert(result.metaskills.includes("test-driven-development"));
assert(result.metaskillStack.some((item) => item.skill === "ponytail"));
assert(result.metaskillStack.some((item) => item.skill === "repo-hunter-github"));
assert(result.tools.includes("codex-bridge"));
assert(result.tools.includes("adapter-registry"));
assert(result.connectors.some((item) => item.id === "github"));
assert(result.connectors.some((item) => item.id === "huggingface"));
assert(result.connectors.some((item) => item.id === "mcp"));
assert(result.discoveryPlan.queries.some((item) => item.includes("site:github.com")));
assert(result.discoveryPlan.commands.includes("npm.cmd run k7:github -- \"<github-repo-url>\""));
assert(result.connectionPrompts.some((item) => item.includes("GitHub")));
assert(result.signals.some((item) => item.candidate === "OpenAI Agents SDK"));
assert.equal(result.action, "Write test first");
assert(result.verification.includes("Run tests"));
assert.equal(result.writeback.mode, "draft");
assert(result.safety.some((item) => item.includes("No publish")));

const gated = buildConnectorKernel({
  project: "External Agent",
  goal: "deploy and publish",
  capabilities: ["deploy", "publish"],
  supertool: () => ({ status: "ready" }),
  secondBrain: () => ({ status: "ready" }),
  adapterPlanner: () => ({ status: "ready" }),
  frontier: () => ({ status: "ready" }),
});
assert.equal(gated.status, "needs_approval");
assert(gated.approvalGates.some((gate) => gate.includes("deploy")));
assert(gated.approvalGates.some((gate) => gate.includes("publish")));
assert(gated.connectors.some((item) => item.id === "deployment" && item.approvalRequired));

const fallback = buildConnectorKernel({
  supertool: () => ({ status: "ready" }),
  secondBrain: () => ({ status: "ready" }),
  adapterPlanner: () => ({ status: "ready" }),
  frontier: () => ({ status: "ready" }),
});
assert.equal(fallback.profile.name, "local-project");
assert.equal(fallback.profile.kind, "project");
assert.equal(fallback.route.name, "orchestrate");

const args = parseArgs(["--project", "Codex", "--kind", "agent", "--domain", "coding", "--capability", "run_tests", "--json", "mejorar", "codigo"]);
assert.equal(args.project, "Codex");
assert.equal(args.kind, "agent");
assert.equal(args.domain, "coding");
assert.deepEqual(args.capabilities, ["run_tests"]);
assert.equal(args.json, true);
assert.equal(args.goal, "mejorar codigo");

console.log("connector kernel tests passed");
