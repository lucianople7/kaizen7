const { buildPromptFilter } = require("./prompt-filter");

const ALWAYS_BLOCKED_CONNECTIONS = ["publish", "deploy", "delete", "spend", "credential_write"];
const SAFE_CONNECTIONS = ["obsidian", "github", "browser", "huggingface", "local_files", "tests", "model_gateway"];

const FILTERS = [
  {
    id: "objective_filter",
    name: "Objective",
    rule: "convert desire into one concrete outcome with a visible stop condition",
  },
  {
    id: "memory_filter",
    name: "Memory",
    rule: "read only the smallest relevant Obsidian/project memory before deciding",
  },
  {
    id: "skill_filter",
    name: "Skills",
    rule: "choose the minimum skill set; never load skills because they sound impressive",
  },
  {
    id: "connection_filter",
    name: "Connections",
    rule: "connect only to sources needed for evidence or execution",
  },
  {
    id: "risk_filter",
    name: "Risk",
    rule: "route credentials, money, publication, deletion and deploys to approval",
  },
  {
    id: "evidence_filter",
    name: "Evidence",
    rule: "do not accept completion without fresh evidence",
  },
  {
    id: "memory_writeback_filter",
    name: "Writeback",
    rule: "write only reusable decisions, evidence, blockers and learnings; never secrets",
  },
];

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalize(value = "") {
  return String(value || "").trim();
}

function inferRisks(objective = "", connections = []) {
  const text = `${objective} ${connections.join(" ")}`.toLowerCase();
  const risks = [];
  if (/\b(access token|api key|secret|credential|password|oauth|login)\b/.test(text)) risks.push("credential_or_account_action");
  if (/\b(pay|payment|spend|ad|ads|checkout|publish|deploy|delete|borrar|pagar|publicar)\b/.test(text)) risks.push("money_or_publish_action");
  if (/\b(medical|legal|financial|claim|health|salud|legal|medico)\b/.test(text)) risks.push("high_stakes_claim");
  return unique(risks);
}

function allowedConnections(connections = []) {
  const requested = unique(connections);
  if (!requested.length) return ["obsidian", "local_files", "tests"];
  return requested.filter((item) => SAFE_CONNECTIONS.includes(item));
}

function buildMasterPrompt({ objective, project, capabilities, allowed, risks }) {
  return [
    "KAIZEN7 actua como filtro de sabiduria antes de cualquier accion.",
    "",
    "Antes de actuar:",
    "1. Define el objetivo en una frase y una condicion de parada.",
    "2. Lee solo la memoria minima necesaria.",
    "3. Elige la minima skill que reduzca pasos, riesgo o tokens.",
    "4. Elige la minima conexion que aporte evidencia real.",
    "5. Si aparece credencial, pago, publicacion, borrado o deploy, detente y pide aprobacion.",
    "6. Ejecuta una sola siguiente accion verificable.",
    "7. Escribe en memoria solo decisiones, evidencia, bloqueos y aprendizajes reutilizables.",
    "",
    `Proyecto: ${project || "unspecified"}`,
    `Objetivo: ${objective}`,
    `Capacidades: ${capabilities.join(", ") || "none"}`,
    `Conexiones permitidas: ${allowed.join(", ") || "none"}`,
    `Riesgos detectados: ${risks.join(", ") || "none"}`,
    "",
    "Respuesta requerida: one_next_action, evidence_required, risks, memory_writeback.",
  ].join("\n");
}

function buildWisdomFilter(options = {}) {
  const promptFilter = buildPromptFilter({
    prompt: options.prompt || options.objective || options.goal,
    project: options.project || options.name,
  });
  const objective = promptFilter.status === "ready"
    ? promptFilter.simplifiedPrompt
    : normalize(options.objective || options.goal);
  const project = normalize(options.project || options.name);
  const capabilities = unique(options.capabilities || []);
  const connections = unique(options.connections || []);

  if (!objective) {
    return {
      version: 1,
      status: "needs_input",
      mode: "wisdom-filter",
      question: "Cual es el objetivo concreto?",
      tokenPolicy: "no cargar skills, conexiones ni memoria hasta tener objetivo",
    };
  }

  const risks = inferRisks(objective, connections);
  const allowed = allowedConnections(connections);
  const blockedConnections = unique([...ALWAYS_BLOCKED_CONNECTIONS, ...connections.filter((item) => !allowed.includes(item) && !SAFE_CONNECTIONS.includes(item))]);
  const requiresApproval = risks.includes("credential_or_account_action") || risks.includes("money_or_publish_action");

  return {
    version: 1,
    status: "ready",
    mode: "wisdom-filter",
    identity: {
      name: "KAIZEN7 Wisdom Filter",
      role: "master filter for objectives, skills, connections, actions, evidence and memory",
      promise: "less steps, less tokens, more judgment",
    },
    project: project || "unspecified",
    objective,
    promptFilter,
    filters: FILTERS,
    capabilities,
    allowedConnections: allowed,
    blockedConnections,
    risks,
    decision: {
      proceed: !requiresApproval,
      nextAction: requiresApproval ? "ask_approval_or_reduce_scope" : "build_start_packet",
      reason: requiresApproval
        ? "objective touches credentials, money, publication or account action"
        : "objective can proceed through scoped KAIZEN7 start packet",
    },
    outputContract: ["one_next_action", "evidence_required", "risks", "memory_writeback"],
    masterPrompt: buildMasterPrompt({ objective, project, capabilities, allowed, risks }),
    tokenPolicy: "wisdom filter first; no broad memory, broad skills or broad connectors before objective route is clear",
  };
}

function formatWisdomPrompt(filter) {
  if (filter.status === "needs_input") {
    return [
      "## KAIZEN7 Wisdom Filter",
      "",
      `Status: ${filter.status}`,
      `Question: ${filter.question}`,
      "",
    ].join("\n");
  }
  return [
    "## KAIZEN7 Wisdom Filter",
    "",
    `Status: ${filter.status}`,
    `Project: ${filter.project}`,
    `Objective: ${filter.objective}`,
    `Decision: ${filter.decision.nextAction}`,
    "",
    "### Allowed Connections",
    ...filter.allowedConnections.map((item) => `- ${item}`),
    "",
    "### Master Prompt",
    filter.masterPrompt,
    "",
  ].join("\n");
}

function parseArgs(argv = []) {
  const capabilities = [];
  const connections = [];
  const objectiveParts = [];
  let project = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg === "--connection") connections.push(argv[++index] || "");
    else if (!arg.startsWith("--")) objectiveParts.push(arg);
  }
  return {
    project,
    capabilities: unique(capabilities),
    connections: unique(connections),
    objective: objectiveParts.join(" ").trim(),
  };
}

if (require.main === module) {
  const result = buildWisdomFilter(parseArgs(process.argv.slice(2)));
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`${formatWisdomPrompt(result)}\n`);
}

module.exports = {
  buildWisdomFilter,
  formatWisdomPrompt,
  parseArgs,
};
