const path = require("node:path");
const { buildAdapterPlan } = require("./adapter-registry");
const { buildExternalIntelligenceBrief } = require("./external-intelligence");

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizePathList(items = []) {
  return unique(items).map((item) => item.replace(/\\/g, "/"));
}

function buildOpenHandsAdapterPlan(options = {}) {
  const root = options.root || process.cwd();
  const goal = String(options.goal || options.objective || "delegate bounded coding work through OpenHands").trim();
  const allowedPaths = normalizePathList(options.allowedPaths?.length ? options.allowedPaths : [
    "lib",
    "tests",
    "docs",
    "Obsidian/Flowmatik/Evolution",
  ]);
  const verificationCommands = unique(options.verificationCommands?.length ? options.verificationCommands : [
    "npm.cmd run check",
    "npm.cmd run k7:ready",
  ]);
  const name = options.name || "OpenHands Worker";
  const projectRoot = path.resolve(root);
  const projectsPath = path.dirname(projectRoot);

  const adapter = buildAdapterPlan({
    name,
    kind: "remote_worker",
    goal,
    capabilities: unique(["read_files", "edit_files", "run_tests", "return_diff", ...(options.capabilities || [])]),
    risk: options.risk || "medium",
  });

  return {
    version: 1,
    status: "ready",
    mode: "openhands-adapter",
    name,
    goal,
    adapter,
    source: {
      project: "OpenHands Agent Canvas",
      repo: "https://github.com/OpenHands/OpenHands",
      docs: "https://docs.openhands.dev/",
      pattern: "self-hosted control center for local, remote and cloud coding agent backends",
    },
    kaizenAuthority: "KAIZEN7 decides scope, memory, gates and verification; OpenHands executes only the bounded worker packet.",
    sandboxRecommendation: {
      preferred: "docker",
      reason: "OpenHands can run without a sandbox, but that grants broad filesystem access. KAIZEN7 should prefer Docker or a dedicated PROJECTS_PATH.",
      projectRoot,
      projectsPath,
      openhandsProjectsPath: "/projects",
      warning: "Do not mount home directories, credentials folders or unrelated projects into the worker scope.",
    },
    workerPacket: {
      objective: goal,
      contextPack: [
        "Call npm.cmd run k7:connect first when more context is needed.",
        "Read only KAIZEN7-selected files and memory notes.",
        "Return diff, tests, risks and memory draft.",
      ],
      allowedPaths,
      forbiddenActions: [
        "publish",
        "deploy",
        "delete",
        "spend",
        "credential_write",
        "store_secrets",
        "merge_directly",
        "expand_scope_without_approval",
      ],
      verificationCommands,
      returnFormat: {
        summary: "short explanation of changes",
        diff: "patch or PR link",
        tests: "commands run and results",
        risks: "remaining risks and approval needs",
        memoryDraft: "one reusable learning; no secrets",
      },
    },
    agentCanvas: {
      backendRole: "OpenHands Agent Server or ACP-compatible backend",
      frontendRole: "Agent Canvas operator UI",
      automationRole: "optional scheduled or webhook-triggered work after local contract is trusted",
      commands: [
        "npm.cmd run k7:openhands -- \"<objective>\"",
        "npm.cmd run k7:adapt -- --name \"OpenHands Worker\" --kind remote_worker --capability return_diff \"<objective>\"",
      ],
    },
    gates: [
      ...adapter.gates,
      "Prefer Docker sandbox or dedicated PROJECTS_PATH before real execution.",
      "OpenHands output must come back to KAIZEN7 for verification before merge or memory writeback.",
    ],
    externalIntelligence: buildExternalIntelligenceBrief(goal, {
      tags: ["openhands", "remote-worker", "agent-backend", "sandbox", "coding-agent"],
      limit: 6,
    }),
  };
}

function parseArgs(argv = []) {
  const options = { allowedPaths: [], verificationCommands: [], capabilities: [] };
  const goalParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--name") options.name = argv[++index] || "";
    else if (arg === "--path") options.allowedPaths.push(argv[++index] || "");
    else if (arg === "--verify") options.verificationCommands.push(argv[++index] || "");
    else if (arg === "--capability") options.capabilities.push(argv[++index] || "");
    else if (arg === "--risk") options.risk = argv[++index] || "";
    else if (!arg.startsWith("--")) goalParts.push(arg);
  }
  options.goal = goalParts.join(" ").trim();
  return options;
}

function formatOpenHandsAdapterPlan(plan) {
  return [
    "## KAIZEN7 OpenHands Adapter",
    "",
    `Status: ${plan.status}`,
    `Goal: ${plan.goal}`,
    `Authority: ${plan.kaizenAuthority}`,
    "",
    "### Sandbox",
    `Preferred: ${plan.sandboxRecommendation.preferred}`,
    `Projects path: ${plan.sandboxRecommendation.projectsPath}`,
    `Warning: ${plan.sandboxRecommendation.warning}`,
    "",
    "### Allowed Paths",
    ...plan.workerPacket.allowedPaths.map((item) => `- ${item}`),
    "",
    "### Forbidden Actions",
    ...plan.workerPacket.forbiddenActions.map((item) => `- ${item}`),
    "",
    "### Verification",
    ...plan.workerPacket.verificationCommands.map((item) => `- ${item}`),
    "",
    "### Gates",
    ...plan.gates.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const plan = buildOpenHandsAdapterPlan(args);
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  else process.stdout.write(`${formatOpenHandsAdapterPlan(plan)}\n`);
}

module.exports = {
  buildOpenHandsAdapterPlan,
  formatOpenHandsAdapterPlan,
  parseArgs,
};
