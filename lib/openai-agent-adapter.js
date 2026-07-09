const { buildAgentRun, buildRunSummary } = require("./agent-runner");
const { buildAgentAdvice, buildAdviceSummary } = require("./agent-advisor");

const DEFAULT_MODEL = process.env.OPENAI_AGENTS_MODEL || process.env.OPENAI_MODEL || "gpt-5.5";

function toolSpecs() {
  return [
    {
      name: "get_project_brief",
      description: "Return the compact KAIZEN7 project activation brief for one objective.",
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    {
      name: "get_activation_checklist",
      description: "Return the compact KAIZEN7 activation checklist.",
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false },
    },
    {
      name: "save_project_learning",
      description: "Save one confirmed learning item to project memory. Requires explicit user confirmation.",
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false },
    },
  ];
}

async function loadAgentsSdk() {
  try {
    const sdk = await import("@openai/agents");
    return { available: true, sdk };
  } catch (error) {
    return { available: false, reason: error.code === "ERR_MODULE_NOT_FOUND" ? "@openai/agents not installed" : error.message };
  }
}

function buildInstructions() {
  return [
    "You are KAIZEN7 Project Activation, an OpenAI Agents SDK adapter for KAIZEN7.",
    "Your job is not to replace KAIZEN7 core.",
    "Your job is to execute KAIZEN7's compact activation loop with better runtime structure.",
    "Always optimize for fewer steps, fewer tokens, better verified judgment.",
    "Return one next action, the minimum context, risks, and a verification gate.",
    "Never publish, delete, spend, deploy, or handle credentials without explicit approval.",
    "Do not store secrets in memory.",
  ].join("\n");
}

function buildActivationPayload({ goal, agent = "codex", runSummary, adviceSummary, runtime, sdkInfo, sdkOutput = null }) {
  return {
    status: "ready",
    mode: "openai-agents-sdk-adapter",
    runtime,
    sdk: sdkInfo,
    agent,
    goal,
    projectActivation: {
      contextPack: runSummary.memory || [],
      decisionGuard: adviceSummary.advice?.avoid || [],
      tools: toolSpecs(),
      action: runSummary.action?.next || adviceSummary.advice?.action || "Define one verified next action.",
      verification: [
        "Run the minimum useful action.",
        "Verify with test, diff, endpoint, screenshot, or checklist.",
        "Write the reusable learning back to Obsidian.",
      ],
      commands: runSummary.commands || [],
    },
    tokenPolicy: adviceSummary.advice?.tokenPolicy || "metadata first; deep-read only selected memory and selected skills",
    sdkOutput,
  };
}

async function runWithAgentsSdk({ goal, model = DEFAULT_MODEL, runSummary, adviceSummary }) {
  const loaded = await loadAgentsSdk();
  if (!loaded.available) return { runtime: "local-compatible", sdkInfo: loaded, sdkOutput: null };
  if (!process.env.OPENAI_API_KEY) {
    return {
      runtime: "local-compatible",
      sdkInfo: { available: true, blocked: true, reason: "OPENAI_API_KEY not configured" },
      sdkOutput: null,
    };
  }

  try {
    const { Agent, run } = loaded.sdk;
    if (typeof Agent !== "function" || typeof run !== "function") {
      return {
        runtime: "local-compatible",
        sdkInfo: { available: true, blocked: true, reason: "Unsupported @openai/agents export shape" },
        sdkOutput: null,
      };
    }
    const activationAgent = new Agent({
      name: "KAIZEN7 Project Activation",
      model,
      instructions: buildInstructions(),
    });
    const input = [
      `Objective: ${goal}`,
      `KAIZEN7 action: ${runSummary.action?.next || ""}`,
      `Read: ${(runSummary.memory || []).join(" | ")}`,
      `Avoid: ${(adviceSummary.advice?.avoid || []).join(" | ")}`,
      "Return a compact JSON-like brief with action, verification and writeback.",
    ].join("\n");
    const result = await run(activationAgent, input);
    return {
      runtime: "openai-agents-sdk",
      sdkInfo: { available: true, model },
      sdkOutput: result.finalOutput || result.output || result,
    };
  } catch (error) {
    return {
      runtime: "local-compatible",
      sdkInfo: { available: true, blocked: true, reason: error.message },
      sdkOutput: null,
    };
  }
}

async function runProjectActivation(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || options.objective || "";
  const agent = options.agent || "codex";
  const run = await buildAgentRun({ root, goal });
  const advice = buildAgentAdvice({
    root,
    agent,
    goal,
    capabilities: options.capabilities || ["read_files", "edit_files", "run_tests"],
    contextBudget: Number(options.contextBudget || options.budget || 1200),
    riskTolerance: options.riskTolerance || options.risk || "low",
  });
  const runSummary = buildRunSummary(run);
  const adviceSummary = buildAdviceSummary(advice);
  const sdkRun = options.useSdk === false
    ? { runtime: "local-compatible", sdkInfo: { available: false, reason: "SDK disabled by caller" }, sdkOutput: null }
    : await runWithAgentsSdk({ goal, model: options.model || DEFAULT_MODEL, runSummary, adviceSummary });
  return buildActivationPayload({
    goal,
    agent,
    runSummary,
    adviceSummary,
    runtime: sdkRun.runtime,
    sdkInfo: sdkRun.sdkInfo,
    sdkOutput: sdkRun.sdkOutput,
  });
}

function adviseAgent(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || options.objective || "";
  const agent = options.agent || "codex";
  const advice = buildAgentAdvice({
    root,
    agent,
    goal,
    capabilities: options.capabilities || ["read_files", "edit_files", "run_tests"],
    contextBudget: Number(options.contextBudget || options.budget || 1200),
    riskTolerance: options.riskTolerance || options.risk || "low",
  });
  return {
    status: "ready",
    mode: "openai-agents-sdk-advisor",
    runtime: "local-compatible",
    agent,
    goal,
    tools: toolSpecs(),
    advice: buildAdviceSummary(advice).advice,
  };
}

function verifyAndWriteback(options = {}) {
  const goal = options.goal || options.objective || "";
  const result = options.result || "";
  return {
    status: "ready",
    mode: "openai-agents-sdk-writeback",
    goal,
    verification: options.verification || "Require test, diff, endpoint, screenshot, or checklist before close.",
    memoryDraft: [
      `Objective: ${goal}`,
      `Result: ${result || "Pending result."}`,
      `Learning: ${options.learning || "Pending reusable learning."}`,
      "Guardrail: no secrets, no destructive action, no external publish without approval.",
    ].join("\n"),
    requiresConfirmation: true,
  };
}

function parseArgs(argv) {
  const command = argv[0] && !argv[0].startsWith("--") ? argv[0] : "activate";
  const rest = command === argv[0] ? argv.slice(1) : argv;
  const compact = rest.includes("--compact");
  const useSdk = !rest.includes("--no-sdk");
  const agentIndex = rest.indexOf("--agent");
  const agent = agentIndex >= 0 ? rest[agentIndex + 1] : "codex";
  const goal = rest.filter((arg, index) => {
    if (arg.startsWith("--")) return false;
    if (index > 0 && rest[index - 1] === "--agent") return false;
    return true;
  }).join(" ").trim();
  return { command, compact, useSdk, agent, goal };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const output = args.command === "advise"
    ? adviseAgent(args)
    : args.command === "verify"
      ? verifyAndWriteback(args)
      : await runProjectActivation(args);
  process.stdout.write(`${JSON.stringify(output, null, args.compact ? 0 : 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  adviseAgent,
  runProjectActivation,
  verifyAndWriteback,
  toolSpecs,
};
