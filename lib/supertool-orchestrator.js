const { buildAdapterPlan } = require("./adapter-registry");
const { buildCodexBridge } = require("./codex-bridge");
const { buildCodexRealizerReport } = require("./codex-realizer");
const { buildFrontierOperatorBrief } = require("./frontier-operator");

function detectIntent(goal = "") {
  const text = String(goal).toLowerCase();
  if (/frontier|puntero|tendencia|signals?|señal|senal|radar|hoy|daily/.test(text)) {
    return { intent: "frontier", reason: "frontier or trend language detected" };
  }
  if (/api|mcp|sdk|cli|tool|herramienta|conectar|adapter|adaptador|webhook|shopify|github/.test(text)) {
    return { intent: "adapter", reason: "external tool or adapter language detected" };
  }
  if (/memoria|memory|obsidian|recordar|recuperar|contexto|knowledge/.test(text)) {
    return { intent: "memory", reason: "memory or context retrieval language detected" };
  }
  if (/implementar|implement|fix|bug|test|endpoint|codigo|código|code|refactor|feature/.test(text)) {
    return { intent: "code", reason: "code change or verification language detected" };
  }
  return { intent: "orchestrate", reason: "general objective" };
}

function routeFor(intent) {
  const routes = {
    code: { primary: "codex", helpers: ["codex-realizer", "skill-router", "production-readiness"] },
    adapter: { primary: "adapter-registry", helpers: ["codex", "k7-scope", "judge"] },
    frontier: { primary: "frontier-operator", helpers: ["hunter", "adapter-registry", "codex"] },
    memory: { primary: "codex", helpers: ["semantic-memory", "skill-router", "obsidian-memory"] },
    orchestrate: { primary: "codex", helpers: ["frontier-operator", "adapter-registry", "codex-realizer"] },
  };
  return routes[intent] || routes.orchestrate;
}

function defaultCapabilities(intent) {
  if (intent === "adapter") return ["read_external", "tool_call"];
  if (intent === "frontier") return ["read_external"];
  return ["read_files", "edit_files", "run_tests"];
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function buildSupertoolPlan(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || "orchestrate KAIZEN7";
  const detected = options.intent ? { intent: options.intent, reason: "provided by caller" } : detectIntent(goal);
  const route = routeFor(detected.intent);
  const capabilities = options.capabilities?.length ? options.capabilities : defaultCapabilities(detected.intent);
  const codexBridge = options.codexBridge || ((input) => buildCodexBridge(input));
  const realizer = options.realizer || ((input) => buildCodexRealizerReport(input));
  const frontier = options.frontier || ((input) => buildFrontierOperatorBrief(input));
  const adapterPlanner = options.adapterPlanner || ((input) => buildAdapterPlan(input));

  const base = {
    version: 1,
    status: "ready",
    mode: "supertool-orchestrator",
    goal,
    intent: detected.intent,
    reason: detected.reason,
    route,
    context: [],
    skills: [],
    tools: [],
    action: "",
    verification: [],
    risk: safetyRisks(),
    commands: [],
    approvalRequired: false,
  };

  if (detected.intent === "frontier") {
    const frontierPlan = frontier({ root, writeSignals: options.writeSignals !== false, limit: options.limit || 5 });
    return {
      ...base,
      context: frontierPlan.priority ? [frontierPlan.priority.reason || frontierPlan.priority.candidate] : [],
      tools: unique(["frontier-operator", "hunter", "adapter-registry"]),
      action: frontierPlan.action?.title || "Run Frontier Operator and select one signal.",
      verification: frontierPlan.gates || [],
      risk: unique([...base.risk, ...(frontierPlan.gates || [])]),
      commands: frontierPlan.commands || ["npm.cmd run k7:frontier:brief -- --write-signals"],
      frontier: frontierPlan,
    };
  }

  if (detected.intent === "adapter") {
    const adapter = adapterPlanner({
      name: options.name || goal,
      kind: options.kind || "api",
      goal,
      capabilities,
      authEnv: options.authEnv || [],
    });
    return {
      ...base,
      tools: unique(["adapter-registry", "codex-bridge"]),
      action: adapter.nextSteps?.[0] || "Create a thin supervised adapter.",
      verification: adapter.gates || [],
      risk: unique([...base.risk, ...(adapter.gates || [])]),
      commands: [`npm.cmd run k7:adapt -- --name ${JSON.stringify(options.name || goal)} --kind ${adapter.kind || "api"} ${JSON.stringify(goal)}`],
      approvalRequired: true,
      adapter,
    };
  }

  const bridge = codexBridge({
    root,
    goal,
    capabilities,
    contextBudget: options.contextBudget || options.budget || 1200,
    frontier: detected.intent === "orchestrate" && options.frontier !== false,
    writeSignals: Boolean(options.writeSignals),
  });
  const includeRealizer = options.execute === true;
  const reality = includeRealizer ? realizer({ goal, frontier: options.frontier !== false }) : null;
  return {
    ...base,
    context: bridge.codex?.read || [],
    skills: bridge.codex?.skills || [],
    tools: unique(["codex-bridge", ...(reality ? ["codex-realizer"] : []), ...(bridge.frontier ? ["frontier-operator"] : [])]),
    action: bridge.codex?.action || "Ask Codex for one safe next action.",
    verification: bridge.codex?.verification || [],
    risk: unique([...base.risk, ...(bridge.codex?.avoid || [])]),
    commands: bridge.codex?.commands || ["npm.cmd run k7:codex -- \"<goal>\""],
    codex: bridge,
    realizer: reality,
  };
}

function safetyRisks() {
  return [
    "No publish, push, deploy, spend, delete or credential writes without explicit approval.",
    "No secret may be stored in memory, Obsidian or signal packets.",
    "No completion claim without a fresh verification command.",
  ];
}

function parseArgs(argv) {
  const flags = new Set();
  const capabilities = [];
  const goalParts = [];
  let intent = "";
  let kind = "";
  let name = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--intent") intent = argv[++index] || "";
    else if (arg === "--kind") kind = argv[++index] || "";
    else if (arg === "--name") name = argv[++index] || "";
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    execute: flags.has("--execute"),
    writeSignals: flags.has("--write-signals"),
    frontier: !flags.has("--no-frontier"),
    intent,
    kind,
    name,
    capabilities: capabilities.filter(Boolean),
    goal: goalParts.join(" ").trim(),
  };
}

function formatSupertoolPlan(plan) {
  return [
    "## KAIZEN7 Supertool",
    "",
    `Status: ${plan.status}`,
    `Intent: ${plan.intent}`,
    `Route: ${plan.route.primary}`,
    `Goal: ${plan.goal}`,
    "",
    "### Action",
    plan.action,
    "",
    "### Context",
    ...(plan.context.length ? plan.context.map((item) => `- ${item}`) : ["- none"]),
    "",
    "### Skills",
    ...(plan.skills.length ? plan.skills.map((item) => `- ${item}`) : ["- none"]),
    "",
    "### Tools",
    ...(plan.tools.length ? plan.tools.map((item) => `- ${item}`) : ["- none"]),
    "",
    "### Verification",
    ...(plan.verification.length ? plan.verification.map((item) => `- ${item}`) : ["- run npm.cmd run check before claiming completion"]),
    "",
    "### Commands",
    ...(plan.commands.length ? plan.commands.map((item) => `- ${item}`) : ["- none"]),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const plan = buildSupertoolPlan(args);
  if (args.compact) {
    process.stdout.write(`${JSON.stringify({ status: plan.status, intent: plan.intent, route: plan.route, action: plan.action, commands: plan.commands }, null, 2)}\n`);
  } else if (args.json) {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatSupertoolPlan(plan)}\n`);
  }
}

module.exports = {
  buildSupertoolPlan,
  detectIntent,
  formatSupertoolPlan,
  parseArgs,
  routeFor,
};
