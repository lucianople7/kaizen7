const { buildAdapterPlan } = require("./adapter-registry");
const { buildExternalIntelligenceBrief } = require("./external-intelligence");
const { buildFrontierOperatorBrief } = require("./frontier-operator");
const {
  activateMetaskills,
  buildMetaskillTelemetry,
  detectObjectiveType,
} = require("./metaskill-activation");
const {
  buildLedgerSummary,
  defaultLedgerPath,
  loadMetaskillLedger,
} = require("./metaskill-ledger");
const { buildFocusPacket } = require("./project-focus");
const { buildSecondBrain } = require("./second-brain");
const { buildSupertoolPlan } = require("./supertool-orchestrator");
const { buildToolchainPlan } = require("./toolchain-router");

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
  if (/coding|codex|code agent|openhands/.test(text)) {
    return { name: "code", reason: "coding agent profile detected" };
  }
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

function buildMetaskillStack(profile, route) {
  const base = [
    { skill: "k7-hive-memory", why: "recover shared project memory before acting" },
    { skill: "kaizen7-evolution-engine", why: "absorb useful external patterns without replacing the core" },
    { skill: "ponytail", why: "block bloat and keep the smallest useful integration" },
    { skill: "repo-hunter-github", why: "find mature GitHub patterns before inventing from scratch" },
    { skill: "verification-before-completion", why: "require fresh proof before claiming completion" },
  ];
  if (["code", "agent", "orchestrate"].includes(route.name)) {
    base.push({ skill: "test-driven-development", why: "write a failing check before changing code" });
  }
  if (String(profile.goal).toLowerCase().includes("hugging")) {
    base.push({ skill: "hugging-face:huggingface-papers", why: "inspect HF papers/models/datasets when model assets matter" });
  }
  return base;
}

function buildConnectors(profile, route, dangerous = []) {
  const text = `${profile.goal} ${profile.domain} ${profile.capabilities.join(" ")}`.toLowerCase();
  const connectors = [
    {
      id: "github",
      name: "GitHub",
      why: "discover repos, patterns and implementation references",
      command: "npm.cmd run k7:github -- \"<github-repo-url>\"",
      approvalRequired: false,
    },
    {
      id: "huggingface",
      name: "Hugging Face",
      why: "discover models, datasets, Spaces and papers",
      command: "npm.cmd run k7:hf -- \"<huggingface-url>\"",
      approvalRequired: false,
    },
    {
      id: "mcp",
      name: "MCP Server",
      why: "attach external tools through a supervised protocol",
      command: "npm.cmd run k7:adapt -- --name \"<mcp-name>\" --kind mcp \"<objective>\"",
      approvalRequired: false,
    },
  ];
  if (/openai|codex|agent|agente|sdk/.test(text) || route.name === "agent") {
    connectors.push({
      id: "openai",
      name: "OpenAI Agents SDK",
      why: "run agent workflows behind KAIZEN7 gates",
      command: "npm.cmd run k7:openai -- \"<objective>\"",
      approvalRequired: false,
    });
  }
  if (/openhands|remote worker|worker remoto|agent canvas/.test(text)) {
    connectors.push({
      id: "openhands",
      name: "OpenHands",
      why: "run bounded coding workers through Agent Canvas while KAIZEN7 keeps scope, memory and verification",
      command: "npm.cmd run k7:openhands -- \"<objective>\"",
      approvalRequired: false,
    });
  }
  if (/grapi|gradio|ui|demo|space/.test(text)) {
    connectors.push({
      id: "gradio",
      name: "Gradio",
      why: "turn agent capabilities into quick operator UIs or Spaces",
      command: "npm.cmd run k7:hf -- \"<huggingface-space-url>\"",
      approvalRequired: false,
    });
  }
  if (dangerous.includes("deploy")) {
    connectors.push({
      id: "deployment",
      name: "Deployment Target",
      why: "deployment needs an explicit human gate before any external effect",
      command: "npm.cmd run k7:real -- \"validate before deployment\"",
      approvalRequired: true,
    });
  }
  return connectors;
}

function buildDiscoveryPlan(profile, route, connectors) {
  const need = profile.goal || "agent improvement";
  return {
    mode: "sourceable-pattern-intake",
    queries: [
      `site:github.com ${need} open source`,
      `site:github.com ${need} mcp server`,
      `site:huggingface.co ${need}`,
    ],
    commands: unique([
      ...connectors.map((connector) => connector.command),
      "node lib/hunter.js queue",
      "npm.cmd run k7:frontier:brief -- --write-signals",
    ]),
    intakeTarget: "Obsidian/Flowmatik/Evolution/intakes/YYYY-MM-DD-topic.md",
    verdicts: ["adopt_now", "adapt_pattern", "test_later", "reference_only", "reject"],
    route: route.name,
  };
}

function buildConnectionPrompts(connectors) {
  return connectors.map((connector) => (
    connector.approvalRequired
      ? `Connect ${connector.name} only after approval: ${connector.command}`
      : `Connect ${connector.name} when useful: ${connector.command}`
  ));
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
  const connectors = buildConnectors(profile, route, dangerous);
  const projectFocus = buildFocusPacket({
    root,
    project: profile.name,
    goal: profile.goal,
    phase: options.phase,
  });
  const metaskillStack = buildMetaskillStack(profile, route);
  const objectiveType = detectObjectiveType(profile.goal, route);
  const ledger = options.metaskillLedger || loadMetaskillLedger(defaultLedgerPath(root));
  const metaskillLedger = buildLedgerSummary(ledger);
  const metaskillActivation = activateMetaskills({
    goal: profile.goal,
    route,
    capabilities: profile.capabilities,
    objectiveType,
    ledger,
  });
  const metaskillTelemetry = buildMetaskillTelemetry({
    objectiveType,
    activations: metaskillActivation,
    outcome: {
      testsPassed: false,
      reworkNeeded: false,
      reusedContext: true,
      riskReduced: approvalGates.length > 0 || metaskillActivation.some((item) => item.skill === "verification-before-completion"),
    },
  });
  const discoveryPlan = buildDiscoveryPlan(profile, route, connectors);
  const externalIntelligence = buildExternalIntelligenceBrief(profile.goal, {
    tags: [route.name, ...profile.capabilities],
    limit: route.name === "agent" || route.name === "research" ? 6 : 3,
  });
  const toolchainPlan = buildToolchainPlan({
    goal: profile.goal,
    capabilities: profile.capabilities,
  });

  return {
    version: 1,
    status: dangerous.length ? "needs_approval" : "ready",
    mode: "connector-kernel",
    profile,
    route,
    contextPack: unique([...(supertool.context || []), ...(secondBrain.memory || [])]),
    projectFocus,
    metaskills: unique([...(secondBrain.metaskills || []), ...(supertool.skills || []), ...metaskillStack.map((item) => item.skill)]),
    metaskillStack,
    metaskillActivation,
    metaskillTelemetry,
    metaskillLedger,
    tools: unique([
      ...(supertool.tools || []),
      "adapter-registry",
      "second-brain",
      "supertool-orchestrator",
    ]),
    signals: frontier.queue || [],
    externalIntelligence,
    toolchainPlan,
    connectors,
    discoveryPlan,
    connectionPrompts: buildConnectionPrompts(connectors),
    action: supertool.action || "Use KAIZEN7 to select one safe next action.",
    commands: unique([...(supertool.commands || []), ...discoveryPlan.commands, ...(toolchainPlan.commands || []), "npm.cmd run k7:connect -- \"<objective>\""]),
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
    "### Connectors",
    ...formatList(result.connectors?.map((item) => `${item.name}: ${item.command}`)),
    "",
    "### Discovery",
    ...formatList(result.discoveryPlan?.queries),
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
      connectors: result.connectors,
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
