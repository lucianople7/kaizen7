const { buildAgentRun, buildRunSummary } = require("./agent-runner");
const { buildAgentAdvice, buildAdviceSummary } = require("./agent-advisor");

function countWords(text = "") {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function frictionScore(goal = "") {
  const words = countWords(goal);
  const vagueSignals = [/mejor(a|ar)/i, /todo/i, /producto/i, /ia/i, /web/i, /crea/i, /haz/i]
    .filter((pattern) => pattern.test(goal)).length;
  return Math.min(92, Math.max(38, 38 + words * 2 + vagueSignals * 7));
}

function compactGoal(goal = "") {
  const clean = String(goal || "").replace(/\s+/g, " ").trim();
  if (!clean) return "Definir un objetivo concreto y verificable.";
  if (clean.length <= 96) return clean;
  return `${clean.slice(0, 93).trim()}...`;
}

function buildBefore(goal) {
  return {
    label: "Antes de KAIZEN7",
    friction: frictionScore(goal),
    likelyWaste: [
      "Leer contexto de mas antes de saber que importa.",
      "Abrir varias herramientas sin una decision central.",
      "Terminar con consejos, no con una accion verificable.",
      "Perder el aprendizaje al cerrar la sesion.",
    ],
  };
}

function buildAfter({ goal, runSummary, adviceSummary }) {
  const action = runSummary.action?.next || adviceSummary.advice?.action || "Ejecutar la accion minima verificable.";
  const read = [
    ...new Set([
      ...(runSummary.memory || []),
      ...(adviceSummary.advice?.read || []),
    ]),
  ].slice(0, 4);
  return {
    label: "Despues de KAIZEN7",
    friction: Math.max(12, frictionScore(goal) - 42),
    contextPack: read,
    nextBestAction: action,
    guardrails: (adviceSummary.advice?.avoid || []).slice(0, 4),
    verification: [
      "Ejecutar solo la accion minima.",
      "Verificar con test, diff, endpoint, screenshot o checklist.",
      "Guardar la decision reutilizable en Obsidian.",
    ],
  };
}

function recommendModelRoute(goal = "") {
  const text = String(goal).toLowerCase();
  if (/privad|local|secreto|credential|clave|offline/.test(text)) {
    return { provider: "ollama", reason: "privacy-sensitive or local-first work" };
  }
  if (/codigo|code|repo|test|bug|api|endpoint|implementar|build/.test(text)) {
    return { provider: "openai", reason: "strong coding and tool-use route" };
  }
  if (/research|mercado|compar|modelo|proveedor|benchmark/.test(text)) {
    return { provider: "openrouter", reason: "compare strong market models through one gateway" };
  }
  if (/texto|copy|marca|guion|contenido|story/.test(text)) {
    return { provider: "anthropic", reason: "long-form editorial reasoning route" };
  }
  return { provider: "openai", reason: "default high-reasoning route" };
}

function buildLaunchCard({ goal, after, budget }) {
  const modelRoute = recommendModelRoute(goal);
  const objective = compactGoal(goal);
  const startNow = [
    after.contextPack.length ? `Read only: ${after.contextPack.slice(0, 2).join(" | ")}` : "Use current objective as the only context.",
    after.nextBestAction,
    "Verify once, then stop and write the learning.",
  ];
  const doneWhen = [
    "There is one visible result.",
    "The result has one proof: test, diff, endpoint, screenshot or checklist.",
    "The reusable decision is captured in memory.",
  ];
  const memoryDraft = [
    `Objective: ${objective}`,
    `Action: ${after.nextBestAction}`,
    `Verification: ${after.verification[1]}`,
    `Learning: Pending after execution.`,
  ].join("\n");
  return {
    title: "KAIZEN7 Launch Card",
    objective,
    startNow,
    doneWhen,
    modelRoute,
    maxContextBeforeAction: budget,
    copyPasteBrief: [
      `Objective: ${objective}`,
      `Use only the minimum context.`,
      `Next action: ${after.nextBestAction}`,
      `Verify with: test, diff, endpoint, screenshot or checklist.`,
      `Write memory after proof.`,
    ].join("\n"),
    memoryDraft,
  };
}

function confidenceScore({ before, after, launchCard }) {
  let score = 58;
  score += Math.max(0, before.friction - after.friction);
  if (after.contextPack.length) score += 8;
  if (after.nextBestAction && !/pendiente|definir/i.test(after.nextBestAction)) score += 10;
  if (launchCard.doneWhen.length >= 3) score += 8;
  if (launchCard.memoryDraft.includes("Pending")) score -= 4;
  return Math.max(0, Math.min(100, score));
}

function classifyIntent(goal = "") {
  const text = String(goal).toLowerCase();
  if (/codigo|repo|test|bug|endpoint|api|implementar|build|fix/.test(text)) return "build";
  if (/research|mercado|compet|proveedor|fuente|benchmark|compar/.test(text)) return "research";
  if (/contenido|copy|marca|guion|post|video|story|landing/.test(text)) return "content";
  if (/memoria|obsidian|documenta|aprendizaje|decision/.test(text)) return "memory";
  return "activation";
}

function buildActivationPack({ goal, before, after, launchCard }) {
  const intent = classifyIntent(goal);
  const confidence = confidenceScore({ before, after, launchCard });
  const objective = compactGoal(goal);
  const delegatePrompt = [
    "You are working under KAIZEN7.",
    `Objective: ${objective}`,
    `Intent: ${intent}`,
    `Read only this context first: ${(after.contextPack || []).slice(0, 3).join(" | ") || "none"}`,
    `Next action: ${after.nextBestAction}`,
    "Do not widen scope.",
    "Return: result, proof, risk, reusable learning.",
  ].join("\n");
  const timeline = [
    { minute: "0-1", action: "Read the Launch Card and confirm the objective." },
    { minute: "1-4", action: launchCard.startNow[1] || after.nextBestAction },
    { minute: "4-6", action: "Produce one visible result or one blocked reason." },
    { minute: "6-7", action: "Verify once and write the learning draft." },
  ];
  const stopRules = [
    "Stop if the next action needs credentials, money, publish, deploy or destructive changes.",
    "Stop if the proof cannot be produced in this run.",
    "Stop if new context would exceed the max context before action.",
  ];
  return {
    title: "KAIZEN7 Activation Pack",
    intent,
    confidence,
    readiness: confidence >= 82 ? "execute" : confidence >= 65 ? "execute-with-care" : "clarify-first",
    executeNow: launchCard.startNow,
    delegatePrompt,
    timeline,
    stopRules,
    evidenceRequired: [
      "test output",
      "diff",
      "endpoint response",
      "screenshot",
      "checklist",
    ],
    memoryWriteback: launchCard.memoryDraft,
  };
}

function buildAiHandoff({ goal, agent, after, launchCard, activationPack }) {
  const objective = compactGoal(goal);
  const outputSchema = {
    result: "string",
    proof: "string",
    risk: "none|low|medium|high",
    reusableLearning: "string",
    memoryWriteback: "string",
    status: "done|blocked|needs_approval",
  };
  return {
    protocol: "k7-ai-handoff",
    version: "1.0",
    from: "KAIZEN7",
    to: agent || "agent",
    objective,
    constraints: {
      maxContextTokens: launchCard.maxContextBeforeAction,
      readOnlyFirst: true,
      noScopeExpansion: true,
      noSecretsInMemory: true,
      requiresHumanApprovalFor: ["credentials", "spend", "publish", "deploy", "delete", "destructive_filesystem"],
    },
    inputPacket: {
      context: after.contextPack,
      action: after.nextBestAction,
      guardrails: after.guardrails,
      verification: after.verification,
      modelRoute: launchCard.modelRoute,
    },
    executionContract: {
      steps: activationPack.executeNow,
      stopRules: activationPack.stopRules,
      evidenceRequired: activationPack.evidenceRequired,
      doneWhen: launchCard.doneWhen,
    },
    responseContract: {
      format: "json",
      outputSchema,
      requiredFields: Object.keys(outputSchema),
      returnOnlyJson: true,
    },
    failureContract: {
      ifBlockedReturn: ["status", "risk", "proof", "reusableLearning"],
      allowedBlockedReasons: [
        "missing_context",
        "needs_approval",
        "verification_not_possible",
        "tool_unavailable",
        "safety_or_secret_risk",
      ],
    },
    compactPrompt: [
      "K7_AI_HANDOFF",
      `objective=${objective}`,
      `action=${after.nextBestAction}`,
      `read=${after.contextPack.slice(0, 3).join(" | ") || "none"}`,
      `max_context_tokens=${launchCard.maxContextBeforeAction}`,
      "return_only_json=true",
      "fields=result,proof,risk,reusableLearning,memoryWriteback,status",
    ].join("\n"),
  };
}

function parseAiResponse(response) {
  if (typeof response === "string") {
    try {
      return JSON.parse(response);
    } catch {
      return { _parseError: "response is not valid JSON", raw: response };
    }
  }
  return response && typeof response === "object" ? response : { _parseError: "response must be an object or JSON string" };
}

function validateAiHandoffResponse({ handoff, response }) {
  const contract = handoff?.responseContract || {};
  const requiredFields = contract.requiredFields || ["result", "proof", "risk", "reusableLearning", "memoryWriteback", "status"];
  const parsed = parseAiResponse(response);
  const issues = [];
  if (parsed._parseError) issues.push(parsed._parseError);

  for (const field of requiredFields) {
    if (parsed[field] === undefined || parsed[field] === null || String(parsed[field]).trim() === "") {
      issues.push(`missing:${field}`);
    }
  }

  const allowedStatuses = ["done", "blocked", "needs_approval"];
  const allowedRisks = ["none", "low", "medium", "high"];
  if (parsed.status && !allowedStatuses.includes(parsed.status)) issues.push("invalid:status");
  if (parsed.risk && !allowedRisks.includes(parsed.risk)) issues.push("invalid:risk");

  const proofText = String(parsed.proof || "").toLowerCase();
  const hasProof = ["test", "diff", "endpoint", "screenshot", "checklist", "passed", "verified"]
    .some((token) => proofText.includes(token));
  if (parsed.status === "done" && !hasProof) issues.push("weak:proof");

  const needsApproval = parsed.status === "needs_approval" || parsed.risk === "high";
  const blocked = parsed.status === "blocked" || issues.some((issue) => issue.startsWith("missing:") || issue.startsWith("invalid:") || issue === "response is not valid JSON");
  const retry = !blocked && parsed.status === "done" && issues.includes("weak:proof");
  const accepted = !needsApproval && !blocked && !retry && parsed.status === "done";

  return {
    protocol: "k7-ai-return-judge",
    version: "1.0",
    status: accepted ? "accepted" : needsApproval ? "needs_approval" : blocked ? "blocked" : "retry",
    decision: accepted ? "done" : needsApproval ? "needs_approval" : blocked ? "blocked" : "retry",
    issues,
    accepted,
    parsed,
    score: Math.max(0, 100 - issues.length * 18 - (needsApproval ? 25 : 0) - (blocked ? 35 : 0)),
    nextAction: accepted
      ? "Write memory and close the loop."
      : needsApproval
        ? "Ask human approval before continuing."
        : blocked
          ? "Return blocked reason to the sender with required missing fields."
          : "Ask the sender for stronger proof before memory writeback.",
    memoryWriteback: accepted ? parsed.memoryWriteback : "",
  };
}

async function buildActivationDemo(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || options.objective || "activar un proyecto con menos pasos";
  const agent = options.agent || "codex";
  const budget = Number(options.budget || options.contextBudget || 900);
  const run = await buildAgentRun({ root, goal });
  const advice = buildAgentAdvice({
    root,
    agent,
    goal,
    capabilities: options.capabilities || ["read_files", "edit_files", "run_tests"],
    contextBudget: budget,
    riskTolerance: options.riskTolerance || options.risk || "low",
  });
  const runSummary = buildRunSummary(run);
  const adviceSummary = buildAdviceSummary(advice);
  const before = buildBefore(goal);
  const after = buildAfter({ goal, runSummary, adviceSummary });
  const launchCard = buildLaunchCard({ goal, after, budget });
  const activationPack = buildActivationPack({ goal, before, after, launchCard });
  const aiHandoff = buildAiHandoff({ goal, agent, after, launchCard, activationPack });
  return {
    version: 1,
    mode: "30-second-activation",
    status: "ready",
    promise: "Goal in -> minimum useful context -> next best action -> verification -> memory.",
    goal: compactGoal(goal),
    agent,
    before,
    after,
    launchCard,
    activationPack,
    aiHandoff,
    proof: {
      frictionDrop: `${before.friction} -> ${after.friction}`,
      contextBudget: `${budget} tokens before first action`,
      commands: [
        `npm.cmd run k7 -- "${compactGoal(goal)}"`,
        `npm.cmd run k7:boost -- "${compactGoal(goal)}"`,
        "npm.cmd run check",
      ],
    },
    productLine: "KAIZEN7 turns chaos into one verified next action.",
  };
}

async function runK7Loop(options = {}) {
  const activation = await buildActivationDemo(options);
  const simulatedResponse = options.response || {
    result: `Executed: ${activation.after.nextBestAction}`,
    proof: options.proof || "checklist verified",
    risk: options.riskLevel || "low",
    reusableLearning: "K7 Loop can close an AI-to-AI run through handoff, judge and memory draft.",
    memoryWriteback: [
      `Objective: ${activation.goal}`,
      `Decision: ${activation.after.nextBestAction}`,
      `Proof: ${options.proof || "checklist verified"}`,
      "Learning: K7 Loop closed the AI-to-AI execution cycle.",
    ].join("\n"),
    status: "done",
  };
  const judge = validateAiHandoffResponse({
    handoff: activation.aiHandoff,
    response: simulatedResponse,
  });
  const trafficLight = judge.decision === "done"
    ? "green"
    : judge.decision === "needs_approval" || judge.decision === "retry"
      ? "yellow"
      : "red";
  return {
    version: 1,
    mode: "k7-loop",
    status: "ready",
    trafficLight,
    goal: activation.goal,
    loop: ["Intent", "Handoff", "Return", "Judge", "Memory", "Next Action"],
    activation,
    returnPacket: simulatedResponse,
    judge,
    display: {
      headline: judge.accepted ? "K7 Loop closed." : "K7 Loop needs attention.",
      nextAction: judge.nextAction,
      proof: simulatedResponse.proof,
      memoryDraft: judge.memoryWriteback || simulatedResponse.memoryWriteback || "",
    },
  };
}

function formatActivationDemo(demo) {
  return [
    "## KAIZEN7 30 Second Activation",
    "",
    `Goal: ${demo.goal}`,
    `Promise: ${demo.promise}`,
    "",
    `Before friction: ${demo.before.friction}`,
    `After friction: ${demo.after.friction}`,
    "",
    "### Next Best Action",
    demo.after.nextBestAction,
    "",
    "### Context Pack",
    ...(demo.after.contextPack.length ? demo.after.contextPack.map((item) => `- ${item}`) : ["- none"]),
    "",
    "### Verification",
    ...demo.after.verification.map((item) => `- ${item}`),
    "",
    "### Launch Card",
    ...demo.launchCard.startNow.map((item, index) => `${index + 1}. ${item}`),
    "",
    "### Activation Pack",
    `Readiness: ${demo.activationPack.readiness}`,
    `Confidence: ${demo.activationPack.confidence}`,
    `Intent: ${demo.activationPack.intent}`,
    "",
    "### AI Handoff",
    `Protocol: ${demo.aiHandoff.protocol}@${demo.aiHandoff.version}`,
    `Return: ${demo.aiHandoff.responseContract.format}`,
    "",
  ].join("\n");
}

function parseArgs(argv) {
  const compact = argv.includes("--compact");
  const json = argv.includes("--json");
  const goal = argv.filter((arg) => !arg.startsWith("--")).join(" ").trim();
  return { compact, json, goal };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  buildActivationDemo(args)
    .then((demo) => {
      if (args.compact || args.json) process.stdout.write(`${JSON.stringify(demo, null, args.compact ? 0 : 2)}\n`);
      else process.stdout.write(`${formatActivationDemo(demo)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
}

module.exports = {
  buildActivationDemo,
  buildAiHandoff,
  buildActivationPack,
  buildLaunchCard,
  classifyIntent,
  confidenceScore,
  formatActivationDemo,
  recommendModelRoute,
  runK7Loop,
  validateAiHandoffResponse,
};
