const { buildExternalIntelligenceBrief } = require("./external-intelligence");

const ADAPTER_KINDS = {
  api: {
    label: "HTTP API",
    entrypoint: "server-side adapter",
    defaultCapabilities: ["read_external", "write_external"],
    risk: "medium",
  },
  cli: {
    label: "CLI tool",
    entrypoint: "supervised local command",
    defaultCapabilities: ["run_command"],
    risk: "medium",
  },
  mcp: {
    label: "MCP server",
    entrypoint: "tool server bridge",
    defaultCapabilities: ["tool_call"],
    risk: "medium",
  },
  agent: {
    label: "External agent",
    entrypoint: "advisor/run contract",
    defaultCapabilities: ["read_files", "edit_files", "run_tests"],
    risk: "medium",
  },
  remote_worker: {
    label: "Remote worker",
    entrypoint: "bounded work packet",
    defaultCapabilities: ["read_files", "edit_files", "run_tests", "return_diff"],
    risk: "medium",
  },
  sdk: {
    label: "SDK/library",
    entrypoint: "thin module wrapper",
    defaultCapabilities: ["library_call"],
    risk: "low",
  },
  webhook: {
    label: "Webhook",
    entrypoint: "event ingestion adapter",
    defaultCapabilities: ["receive_event"],
    risk: "medium",
  },
};

const RISK_ORDER = ["low", "medium", "high"];
const DESTRUCTIVE_CAPABILITIES = new Set(["delete", "deploy", "publish", "spend", "credential_write", "install_dependencies"]);
const WRITE_CAPABILITIES = new Set(["write_external", "edit_files", "run_command", "tool_call"]);

function normalizeKind(kind = "api") {
  const key = String(kind || "api").toLowerCase();
  return ADAPTER_KINDS[key] ? key : "api";
}

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function maxRisk(...levels) {
  return levels
    .filter(Boolean)
    .sort((a, b) => RISK_ORDER.indexOf(b) - RISK_ORDER.indexOf(a))[0] || "low";
}

function inferRisk(kind, capabilities = [], requestedRisk = "") {
  let risk = ADAPTER_KINDS[kind].risk;
  if (capabilities.some((capability) => DESTRUCTIVE_CAPABILITIES.has(capability))) risk = "high";
  else if (capabilities.some((capability) => WRITE_CAPABILITIES.has(capability))) risk = maxRisk(risk, "medium");
  if (RISK_ORDER.includes(requestedRisk)) risk = maxRisk(risk, requestedRisk);
  return risk;
}

function approvalGates({ risk, capabilities, authEnv }) {
  const gates = [
    "Never store secrets in memory or Obsidian.",
    "Record evidence and source before writing a learning.",
    "Return one next action and one verification gate before execution.",
  ];
  if (authEnv.length) gates.push("Read credentials only from approved environment variables.");
  if (risk !== "low" || capabilities.some((capability) => WRITE_CAPABILITIES.has(capability))) {
    gates.push("Require human approval before external writes, publication, deploys, deletion or spending.");
  }
  if (capabilities.includes("run_command")) gates.push("Run commands in the narrowest workspace scope and report the exact verification command.");
  if (capabilities.includes("return_diff")) gates.push("Return diff, tests, risks and next action; do not merge or publish directly.");
  return gates;
}

function buildRemoteWorkerPacket({ name, goal, capabilities, risk }) {
  return {
    mode: "kaizen7-remote-worker",
    worker: name,
    authority: "execute only inside the approved packet; KAIZEN7 remains the core decision system",
    risk,
    input: {
      objective: goal,
      contextPack: "minimum memory, files, docs and signals selected by KAIZEN7",
      allowedPaths: [],
      forbiddenActions: ["publish", "deploy", "delete", "spend", "credential_write", "store_secrets"],
      capabilities,
      verificationCommands: ["npm.cmd run check", "npm.cmd run k7:ready"],
    },
    output: {
      summary: "what changed and why",
      diff: "patch or PR link",
      tests: "commands run and results",
      risks: "remaining risks or approvals needed",
      questions: "only blockers that prevent safe completion",
      memoryDraft: "short reusable learning; no secrets",
    },
    lifecycle: ["brief", "execute", "return_diff", "verify", "human_approval", "memory_writeback"],
  };
}

function buildAdapterPlan(options = {}) {
  const kind = normalizeKind(options.kind || options.type);
  const profile = ADAPTER_KINDS[kind];
  const name = String(options.name || options.system || "external-system").trim();
  const capabilities = unique([...(profile.defaultCapabilities || []), ...(options.capabilities || [])]);
  const authEnv = unique(options.authEnv || options.env || []);
  const goal = String(options.goal || options.objective || `connect ${name} to KAIZEN7`).trim();
  const risk = inferRisk(kind, capabilities, String(options.risk || "").toLowerCase());
  const canAct = capabilities.some((capability) => WRITE_CAPABILITIES.has(capability) || DESTRUCTIVE_CAPABILITIES.has(capability));

  return {
    version: 1,
    status: "ready",
    name,
    kind,
    label: profile.label,
    goal,
    role: canAct ? "supervised-execution-adapter" : "signal-or-advice-adapter",
    risk,
    entrypoint: profile.entrypoint,
    connectToK7: {
      advise: "POST /api/k7/advise",
      run: "POST /api/k7/run",
      adapterPlan: "POST /api/k7/adapters/plan",
      memory: "POST /api/memory",
      judge: "POST /api/judge",
    },
    contract: {
      input: {
        objective: "what the host wants improved",
        capabilities,
        evidence: "source URLs, files, logs or observed output",
        authEnv,
      },
      output: {
        action: "one next action",
        context: "minimum files, memory or signals to read",
        risks: "what must not happen without approval",
        verification: "test, diff, endpoint, screenshot or checklist",
        writeback: "confirmed reusable learning only; no secrets",
      },
    },
    gates: approvalGates({ risk, capabilities, authEnv }),
    memoryPolicy: {
      store: ["decisions", "verified learnings", "source metadata", "adapter limitations"],
      neverStore: ["API keys", "tokens", "passwords", "session cookies", "private customer data without approval"],
    },
    nextSteps: [
      `Create a thin ${kind} adapter for ${name}.`,
      "Map external actions to KAIZEN7 capabilities and approval gates.",
      "Add one smoke test that proves the adapter returns a plan without touching external state.",
      "Only then add real execution behind explicit approval.",
    ],
    remoteWorker: kind === "remote_worker" ? buildRemoteWorkerPacket({ name, goal, capabilities, risk }) : null,
    externalIntelligence: buildExternalIntelligenceBrief(goal, {
      tags: kind === "remote_worker" ? ["remote-worker", "coding-agent", "evaluation"] : [kind],
      limit: kind === "remote_worker" ? 6 : 3,
    }),
  };
}

function listAdapterKinds() {
  return Object.entries(ADAPTER_KINDS).map(([kind, profile]) => ({
    kind,
    label: profile.label,
    entrypoint: profile.entrypoint,
    defaultCapabilities: profile.defaultCapabilities,
    risk: profile.risk,
  }));
}

function parseArgs(argv) {
  const options = { capabilities: [], authEnv: [] };
  const goalParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--name") options.name = argv[++index] || "";
    else if (arg === "--kind" || arg === "--type") options.kind = argv[++index] || "";
    else if (arg === "--capability") options.capabilities.push(argv[++index] || "");
    else if (arg === "--env") options.authEnv.push(argv[++index] || "");
    else if (arg === "--risk") options.risk = argv[++index] || "";
    else if (!arg.startsWith("--")) goalParts.push(arg);
  }
  options.goal = goalParts.join(" ").trim();
  return options;
}

function formatAdapterPlan(plan) {
  return [
    "## KAIZEN7 Adapter Plan",
    "",
    `Name: ${plan.name}`,
    `Kind: ${plan.kind}`,
    `Role: ${plan.role}`,
    `Risk: ${plan.risk}`,
    "",
    "### Connect",
    ...Object.entries(plan.connectToK7).map(([name, endpoint]) => `- ${name}: ${endpoint}`),
    "",
    "### Gates",
    ...plan.gates.map((gate) => `- ${gate}`),
    "",
    "### Next Steps",
    ...plan.nextSteps.map((step) => `- ${step}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const plan = buildAdapterPlan(parseArgs(process.argv.slice(2)));
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  else process.stdout.write(`${formatAdapterPlan(plan)}\n`);
}

module.exports = {
  buildAdapterPlan,
  formatAdapterPlan,
  listAdapterKinds,
  parseArgs,
};
