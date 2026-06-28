const DANGEROUS_TOOLS = ["publish", "deploy", "delete", "spend", "credential_write"];

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizeGoal(goal = "") {
  return String(goal || "").trim() || "route KAIZEN7 toolchain";
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function tool(id, role, reason) {
  return { id, role, reason };
}

function selectToolchain(goal, capabilities = []) {
  const text = `${goal} ${capabilities.join(" ")}`.toLowerCase();
  const tools = [tool("semantic-memory", "context", "recover the smallest useful KAIZEN7 memory pack")];

  if (includesAny(text, [/openhands|remote worker|worker remoto|coding|code|codigo|tests?|run_tests/])) {
    tools.push(tool("openhands-worker", "execution", "delegate bounded coding work and require diff/test evidence"));
  } else if (includesAny(text, [/mcp|tool_call|herramienta|tools?|adapter|adaptador/])) {
    tools.push(tool("adapter-registry", "planning", "map external tools to KAIZEN7 capabilities and approval gates"));
    tools.push(tool("mcp-tool-router", "selection", "select the smallest safe MCP/tool chain instead of loading every tool"));
  } else if (includesAny(text, [/github|hugging|research|repo|modelo|dataset/])) {
    tools.push(tool("external-intelligence", "research", "rank sourceable GitHub and Hugging Face patterns before adoption"));
  } else {
    tools.push(tool("connector-kernel", "routing", "choose the KAIZEN7 route and connectors for the objective"));
  }

  tools.push(tool("k7-eval-firewall", "verification", "accept results only when claims, evidence and gates line up"));
  return tools;
}

function buildEvalFirewall() {
  return {
    requiredEvidence: ["diff", "tests", "risks"],
    claimRubric: [
      { id: "scoped_change", claim: "changed files are scoped", evidence: "diff" },
      { id: "tests_passed", claim: "tests passed", evidence: "tests" },
      { id: "risks_reported", claim: "risks reported", evidence: "risks" },
    ],
    gates: [
      "Do not accept worker output without diff or changed-file evidence.",
      "Do not accept worker output without test or verification evidence.",
      "Do not write memory until risks and reusable learning are separated from secrets.",
    ],
  };
}

function commandFor(toolItem, goal) {
  if (toolItem.id === "openhands-worker") return `npm.cmd run k7:openhands -- ${JSON.stringify(goal)}`;
  if (toolItem.id === "adapter-registry") return `npm.cmd run k7:adapt -- --kind mcp ${JSON.stringify(goal)}`;
  if (toolItem.id === "external-intelligence") return `npm.cmd run k7:connect -- --domain research ${JSON.stringify(goal)}`;
  if (toolItem.id === "connector-kernel") return `npm.cmd run k7:connect -- ${JSON.stringify(goal)}`;
  if (toolItem.id === "semantic-memory") return `npm.cmd run k7:memory -- ${JSON.stringify(goal)}`;
  return "";
}

function buildToolchainPlan(options = {}) {
  const goal = normalizeGoal(options.goal || options.objective);
  const capabilities = unique(options.capabilities || []);
  const toolchain = selectToolchain(goal, capabilities);
  const evalFirewall = buildEvalFirewall();
  const commands = unique(toolchain.map((item) => commandFor(item, goal)).filter(Boolean));
  const approvalRequired = toolchain.some((item) => ["openhands-worker", "mcp-tool-router", "adapter-registry"].includes(item.id))
    || capabilities.some((capability) => DANGEROUS_TOOLS.includes(capability));

  return {
    version: 1,
    status: "ready",
    mode: "toolchain-router",
    goal,
    toolchain,
    commands,
    blockedTools: DANGEROUS_TOOLS,
    approvalRequired,
    evalFirewall,
    outputContract: {
      claims: "what the toolchain says it accomplished",
      evidence: "diff, tests, logs, source URLs or screenshots",
      risks: "remaining risks and approvals needed",
      memoryDraft: "one short reusable learning; no secrets",
    },
    policy: "select the smallest useful toolchain; KAIZEN7 keeps scope, approval, verification and memory writeback",
  };
}

function hasEvidence(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(String(value || "").trim());
}

function evaluateToolchainResult(result = {}) {
  const claims = (result.claims || []).map((claim) => String(claim || "").toLowerCase());
  const evidence = result.evidence || {};
  const rubric = buildEvalFirewall().claimRubric;
  const satisfiedClaims = [];
  const missingClaims = [];

  for (const item of rubric) {
    const claimPresent = claims.some((claim) => claim.includes(item.claim));
    const evidencePresent = hasEvidence(evidence[item.evidence]);
    if (claimPresent && evidencePresent) satisfiedClaims.push(item.id);
    else missingClaims.push(item.id);
  }

  return {
    verdict: missingClaims.length ? "block" : "pass",
    satisfiedClaims,
    missingClaims,
    gates: missingClaims.length
      ? ["Do not accept result until missing claims have matching evidence."]
      : ["Result can proceed to human approval or memory writeback."],
  };
}

function parseArgs(argv = []) {
  const capabilities = [];
  const flags = new Set();
  const goalParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    capabilities: unique(capabilities),
    goal: goalParts.join(" ").trim(),
  };
}

function formatToolchainPlan(plan) {
  return [
    "## KAIZEN7 Toolchain Router",
    "",
    `Status: ${plan.status}`,
    `Goal: ${plan.goal}`,
    `Approval required: ${plan.approvalRequired}`,
    "",
    "### Toolchain",
    ...plan.toolchain.map((item) => `- ${item.id}: ${item.reason}`),
    "",
    "### Commands",
    ...plan.commands.map((item) => `- ${item}`),
    "",
    "### Eval Firewall",
    ...plan.evalFirewall.gates.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const plan = buildToolchainPlan(args);
  if (args.json) process.stdout.write(`${JSON.stringify(plan, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatToolchainPlan(plan)}\n`);
}

module.exports = {
  buildToolchainPlan,
  evaluateToolchainResult,
  formatToolchainPlan,
  parseArgs,
  selectToolchain,
};
