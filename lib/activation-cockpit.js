const { buildToolchainPlan } = require("./toolchain-router");

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalize(value = "") {
  return String(value || "").trim();
}

function buildQuestion(id, prompt, choices = []) {
  return { id, prompt, choices };
}

function inferReadingPlan(goal, context = "") {
  const text = `${goal} ${context}`.toLowerCase();
  const plan = [
    "Obsidian/Flowmatik/Arquitectura/KAIZEN7 Arquitectura Fundacional v2.md",
    "Obsidian/Flowmatik/Kaizen7/2026-06-28.md",
  ];
  if (/openhands|worker|codigo|code|tests?/.test(text)) {
    plan.push("docs/UNIVERSAL_ADAPTERS.md");
    plan.push("docs/TOOLCHAIN_ROUTER.md");
  }
  if (/memoria|memory|contexto|tokens?/.test(text)) {
    plan.push("Obsidian/Flowmatik/Arquitectura/K7 Toolchain Router Eval Firewall.md");
  }
  return unique(plan).slice(0, 5);
}

function chooseNextAction(toolchain, goal) {
  if (toolchain.toolchain.some((item) => item.id === "openhands-worker")) {
    return {
      type: "delegate_worker_packet",
      command: `npm.cmd run k7:openhands -- ${JSON.stringify(goal)}`,
      why: "OpenHands can execute bounded coding work while KAIZEN7 keeps scope and verification",
    };
  }
  if (toolchain.toolchain.some((item) => item.id === "mcp-tool-router")) {
    return {
      type: "plan_toolchain",
      command: `npm.cmd run k7:toolchain -- ${JSON.stringify(goal)}`,
      why: "KAIZEN7 should select the smallest safe toolchain before calling tools",
    };
  }
  return {
    type: "connect_project",
    command: `npm.cmd run k7:connect -- ${JSON.stringify(goal)}`,
    why: "KAIZEN7 should build context, route and verification before work starts",
  };
}

function buildActivationCockpit(options = {}) {
  const goal = normalize(options.goal || options.objective);
  const context = normalize(options.context || options.projectContext);
  const capabilities = unique(options.capabilities || []);

  if (!goal) {
    return {
      version: 1,
      status: "needs_input",
      mode: "activation-cockpit",
      question: buildQuestion("objective", "Que quieres conseguir ahora?", [
        "mejorar un proyecto",
        "crear una feature",
        "investigar una oportunidad",
      ]),
      questions: ["objective"],
      readingPlan: [],
      commands: [],
      tokenPolicy: "preguntar antes de leer; no cargar memoria ni herramientas sin objetivo",
    };
  }

  if (!context) {
    return {
      version: 1,
      status: "needs_input",
      mode: "activation-cockpit",
      goal,
      question: buildQuestion("context", "Dame el contexto minimo o confirma que seguimos con contexto minimo.", [
        "repo local actual",
        "proyecto nuevo",
        "seguir con contexto minimo",
      ]),
      questions: ["context"],
      options: [
        { id: "continue_minimal", label: "Seguir con contexto minimo" },
        { id: "add_context", label: "Anadir contexto" },
      ],
      readingPlan: inferReadingPlan(goal),
      commands: [],
      tokenPolicy: "no leer todo; pedir solo el contexto que cambia la decision",
    };
  }

  const toolchain = buildToolchainPlan({ goal, capabilities });
  const readingPlan = inferReadingPlan(goal, context);
  const nextAction = chooseNextAction(toolchain, goal);

  return {
    version: 1,
    status: "ready",
    mode: "activation-cockpit",
    goal,
    context,
    activationLoop: ["Objective", "Minimal context", "Toolchain", "Action", "Verification", "Memory"],
    questions: [],
    readingPlan,
    toolchain,
    nextAction,
    commands: unique([nextAction.command, ...toolchain.commands]),
    verification: unique(["npm.cmd run check", "npm.cmd run k7:ready", ...toolchain.evalFirewall.requiredEvidence]),
    writeback: {
      target: "Obsidian/Flowmatik/Kaizen7/YYYY-MM-DD.md",
      rule: "guardar solo decision, evidencia, bloqueo o aprendizaje reutilizable",
    },
    stopRules: [
      "Si falta evidencia, no cerrar.",
      "Si hay publish/deploy/delete/spend/credential_write, pedir aprobacion.",
      "Si el contexto supera lo necesario, resumir y volver al objetivo.",
    ],
    tokenPolicy: "leer maximo 5 nodos iniciales; toolchain minima; evidencia antes de memoria",
  };
}

function parseArgs(argv = []) {
  const capabilities = [];
  const goalParts = [];
  let context = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg === "--context") context = argv[++index] || "";
    else if (!arg.startsWith("--")) goalParts.push(arg);
  }
  return {
    capabilities: unique(capabilities),
    context,
    goal: goalParts.join(" ").trim(),
  };
}

function formatActivationCockpit(result) {
  if (result.status === "needs_input") {
    return [
      "## KAIZEN7 Activation Cockpit",
      "",
      `Status: ${result.status}`,
      `Question: ${result.question.prompt}`,
      "",
    ].join("\n");
  }
  return [
    "## KAIZEN7 Activation Cockpit",
    "",
    `Status: ${result.status}`,
    `Goal: ${result.goal}`,
    "",
    "### Reading Plan",
    ...result.readingPlan.map((item) => `- ${item}`),
    "",
    "### Next Action",
    `${result.nextAction.command}`,
    "",
    "### Verification",
    ...result.verification.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = buildActivationCockpit(args);
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`${formatActivationCockpit(result)}\n`);
}

module.exports = {
  buildActivationCockpit,
  formatActivationCockpit,
  parseArgs,
};
