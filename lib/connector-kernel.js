const { buildAdapterPlan } = require("./adapter-registry");
const { buildFrontierOperatorBrief } = require("./frontier-operator");
const { buildSecondBrain } = require("./second-brain");
const { buildSupertoolPlan } = require("./supertool-orchestrator");

const DANGEROUS_CAPABILITIES = [
  "publish",
  "deploy",
  "spend",
  "delete",
  "credential_write",
  "install_dependencies",
];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function normalizeText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function normalizeProfile(options = {}) {
  return {
    name: normalizeText(options.project || options.name, "local-project"),
    kind: normalizeText(options.kind, "project"),
    domain: normalizeText(options.domain, "general"),
    goal: normalizeText(options.goal || options.objective, "connect to KAIZEN7"),
    capabilities: unique(options.capabilities || []),
    riskPolicy: "approval-first",
    memoryPolicy: "selected-context-only",
  };
}

function detectConnectorRoute(profile = {}) {
  const text = `${profile.goal || ""} ${profile.domain || ""} ${profile.kind || ""}`.toLowerCase();
  if (/redes|social|content|contenido|post|tiktok|instagram|linkedin|x\b/.test(text)) {
    return { name: "social", reason: "social/content objective detected" };
  }
  if (/commerce|shopify|ecommerce|producto|supplier|proveedor|venta/.test(text)) {
    return { name: "commerce", reason: "commerce objective detected" };
  }
  if (/memoria|memory|obsidian|segundo cerebro|contexto/.test(text)) {
    return { name: "memory", reason: "memory objective detected" };
  }
  if (/research|investigar|github|hugging face|hf|frontier|puntero|repos?/.test(text)) {
    return { name: "research", reason: "research/frontier objective detected" };
  }
  if (/code|codigo|codex|test|bug|refactor|implementar/.test(text)) {
    return { name: "code", reason: "code objective detected" };
  }
  if (/agent|agente|mcp|api|sdk|tool|herramienta|adapter|adaptador/.test(text)) {
    return { name: "agent", reason: "agent/tool connection detected" };
  }
  return { name: "orchestrate", reason: "default orchestration route" };
}

function dangerousCapabilities(capabilities = []) {
  return capabilities.filter((capability) => DANGEROUS_CAPABILITIES.includes(String(capability).toLowerCase()));
}

function supertoolIntent(routeName) {
  const intents = {
    agent: "adapter",
    research: "frontier",
    social: "orchestrate",
    commerce: "adapter",
    memory: "memory",
    code: "code",
    orchestrate: "orchestrate",
  };
  return intents[routeName] || "orchestrate";
}

function buildConnectorKernel(options = {}) {
  const root = options.root || process.cwd();
  const profile = normalizeProfile(options);
  const route = detectConnectorRoute(profile);
  const dangerous = dangerousCapabilities(profile.capabilities);
  const supertoolBuilder = options.supertool || buildSupertoolPlan;
  const secondBrainBuilder = options.secondBrain || buildSecondBrain;
  const adapterPlanner = options.adapterPlanner || buildAdapterPlan;
  const frontierBuilder = options.frontier || buildFrontierOperatorBrief;

  const supertool = supertoolBuilder({
    root,
    goal: profile.goal,
    capabilities: profile.capabilities,
    intent: supertoolIntent(route.name),
    writeSignals: false,
  });
  const secondBrain = secondBrainBuilder({
    root,
    goal: profile.goal,
    writeSignals: false,
  });
  const adapter = adapterPlanner({
    name: profile.name,
    kind: profile.kind === "agent" ? "agent" : "api",
    goal: profile.goal,
    capabilities: profile.capabilities,
  });
  const frontier = frontierBuilder({
    root,
    writeSignals: false,
    limit: options.limit || 3,
  });
  const approvalGates = unique([
    ...dangerous.map((capability) => `Capability ${capability} requires explicit human approval`),
    ...(adapter.gates || []),
    ...(route.name === "social" ? ["Publishing social content requires explicit human approval"] : []),
    ...(route.name === "commerce" ? ["Commerce writes and supplier actions require explicit human approval"] : []),
  ]);

  return {
    version: 1,
    status: dangerous.length ? "needs_approval" : "ready",
    mode: "connector-kernel",
    profile,
    route,
    contextPack: unique([...(supertool.context || []), ...(secondBrain.memory || [])]),
    metaskills: unique([...(secondBrain.metaskills || []), ...(supertool.skills || [])]),
    tools: unique([
      ...(supertool.tools || []),
      "adapter-registry",
      "second-brain",
      "supertool-orchestrator",
    ]),
    signals: frontier.queue || [],
    action: supertool.action || "Use KAIZEN7 to select one safe next action.",
    commands: unique([...(supertool.commands || []), "npm.cmd run k7:connect -- \"<objective>\""]),
    verification: unique([
      ...(supertool.verification || []),
      ...(frontier.gates || []),
      "Run npm.cmd run check before claiming completion",
    ]),
    approvalGates,
    writeback: secondBrain.writeback || { mode: "draft", target: "memory", approvalRequired: true },
    adapter,
    safety: [
      "No publish, deploy, spend, delete, credential write, secret storage or dependency install without explicit approval.",
      "Return context and next action only; do not execute external effects.",
    ],
  };
}

function parseArgs(argv = []) {
  const flags = new Set();
  const capabilities = [];
  const goalParts = [];
  let project = "";
  let name = "";
  let kind = "";
  let domain = "";
  let limit = 0;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg === "--name") name = argv[++index] || "";
    else if (arg === "--kind") kind = argv[++index] || "";
    else if (arg === "--domain") domain = argv[++index] || "";
    else if (arg === "--limit") limit = Number(argv[++index] || 0);
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }

  return {
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    project,
    name,
    kind,
    domain,
    limit,
    capabilities: capabilities.filter(Boolean),
    goal: goalParts.join(" ").trim(),
  };
}

function formatList(items, fallback = "- none") {
  return items?.length ? items.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`) : [fallback];
}

function formatConnectorKernel(result) {
  return [
    "## KAIZEN7 Connector Kernel",
    "",
    `Status: ${result.status}`,
    `Project: ${result.profile.name}`,
    `Kind: ${result.profile.kind}`,
    `Route: ${result.route.name}`,
    `Goal: ${result.profile.goal}`,
    "",
    "### Action",
    result.action,
    "",
    "### Context Pack",
    ...formatList(result.contextPack),
    "",
    "### Metaskills",
    ...formatList(result.metaskills),
    "",
    "### Tools",
    ...formatList(result.tools),
    "",
    "### Verification",
    ...formatList(result.verification, "- Run npm.cmd run check before claiming completion"),
    "",
    "### Approval Gates",
    ...formatList(result.approvalGates),
    "",
    "### Commands",
    ...formatList(result.commands),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = buildConnectorKernel(args);
  if (args.compact) {
    process.stdout.write(`${JSON.stringify({
      status: result.status,
      project: result.profile.name,
      route: result.route,
      action: result.action,
      commands: result.commands,
      approvalGates: result.approvalGates,
    }, null, 2)}\n`);
  } else if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatConnectorKernel(result)}\n`);
  }
}

module.exports = {
  buildConnectorKernel,
  detectConnectorRoute,
  formatConnectorKernel,
  normalizeProfile,
  parseArgs,
};
