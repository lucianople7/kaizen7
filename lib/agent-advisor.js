const { buildAgentPacket } = require("./agent-loop");

const DEFAULT_BUDGET = 1200;

function parseAdviseArgs(argv) {
  const flags = new Set();
  const capabilities = [];
  const goalParts = [];
  let agent = "agent";
  let contextBudget = DEFAULT_BUDGET;
  let riskTolerance = "low";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--agent") agent = argv[++index] || agent;
    else if (arg === "--budget") contextBudget = Number(argv[++index] || DEFAULT_BUDGET);
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg === "--risk") riskTolerance = argv[++index] || riskTolerance;
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    flags,
    agent,
    capabilities: capabilities.filter(Boolean),
    contextBudget: Number.isFinite(contextBudget) ? contextBudget : DEFAULT_BUDGET,
    riskTolerance,
    goal: goalParts.join(" ").trim(),
  };
}

function ensureSkill(skills, required) {
  const names = new Set(skills.map((skill) => skill.name));
  for (const name of required) {
    if (!names.has(name)) skills.unshift({ name, score: 999, path: "", why: "required by task pattern" });
  }
  return skills;
}

function requiredSkills(goal) {
  const required = [];
  if (/implement|implementar|build|constru|fix|test|endpoint|api|bug|feature/i.test(goal)) {
    required.push("test-driven-development");
  }
  if (/github|repo|hugging|model|tool|herramienta|agent/i.test(goal)) {
    required.push("repo-hunter-github");
  }
  return required;
}

function riskAvoidList({ capabilities = [], riskTolerance = "low" }) {
  const avoid = [
    "do not run external publish actions without explicit approval",
    "do not spend money or provision paid resources without approval",
    "do not read or persist secrets in memory",
  ];
  if (!capabilities.includes("web_search")) avoid.push("do not assume current market facts without a verified source");
  if (!capabilities.includes("run_tests")) avoid.push("do not claim implementation is complete without an executable verification path");
  if (riskTolerance === "low") avoid.push("do not execute destructive filesystem, deploy, auth or credential changes");
  return avoid;
}

function actionFor({ goal, packet, capabilities }) {
  const topSkill = packet.skills[0]?.name || "selected skill";
  const topHunter = packet.hunter.top[0];
  if (/test|endpoint|api|implement|implementar|build|fix/i.test(goal)) {
    return `write or run the smallest failing test first, then change only the files needed; start with ${topSkill}`;
  }
  if (topHunter) {
    return `evaluate ${topHunter.module}:${topHunter.candidate} before loading wider context`;
  }
  if (!capabilities.includes("read_files")) {
    return "ask the host agent for minimal file/context access before acting";
  }
  return packet.nextAction.title;
}

function buildAgentAdvice(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || "advise this agent";
  const contextBudget = options.contextBudget || DEFAULT_BUDGET;
  const capabilities = options.capabilities || [];
  const packet = buildAgentPacket({ root, date: options.date, goal });
  const skills = ensureSkill([...(packet.skills || [])], requiredSkills(goal)).slice(0, 3);
  const memory = (packet.memory.matches || []).slice(0, 3);
  const hunter = (packet.hunter.top || []).slice(0, 3);
  const read = memory.map((match) => match.relativePath);
  const action = actionFor({ goal, packet: { ...packet, skills }, capabilities });
  return {
    version: 1,
    mode: "agent-advisor",
    status: "ready",
    date: packet.date,
    agent: options.agent || "agent",
    goal,
    contextBudget,
    capabilities,
    riskTolerance: options.riskTolerance || "low",
    advice: {
      read,
      skills: skills.map((skill) => skill.name),
      avoid: riskAvoidList({ capabilities, riskTolerance: options.riskTolerance || "low" }),
      action,
      tokenPolicy: `stay under ${contextBudget} tokens before first edit; metadata first; deep-read only listed memory and selected skills`,
      commands: commandHints({ capabilities }),
    },
    sources: {
      memory: memory.map((match) => ({ path: match.relativePath, score: match.score })),
      hunter: hunter.map((item) => `${item.module}:${item.candidate}`),
      gates: packet.gates,
    },
  };
}

function commandHints({ capabilities = [] }) {
  const commands = ["npm.cmd run k7:ready"];
  if (capabilities.includes("run_tests")) commands.push("npm.cmd run check");
  commands.push("npm.cmd run k7:loop -- --write-memory \"<goal>\"");
  return commands;
}

function buildAdviceSummary(advice) {
  return {
    status: advice.status,
    agent: advice.agent,
    goal: advice.goal,
    advice: advice.advice,
  };
}

function formatAdviceBrief(advice) {
  return [
    "## KAIZEN7 Agent Advisor",
    "",
    `Agent: ${advice.agent}`,
    `Goal: ${advice.goal}`,
    `Budget: ${advice.contextBudget}`,
    "",
    "### Action",
    advice.advice.action,
    "",
    "### Read",
    ...(advice.advice.read.length ? advice.advice.read.map((item) => `- ${item}`) : ["- none"]),
    "",
    "### Skills",
    ...(advice.advice.skills.length ? advice.advice.skills.map((item) => `- ${item}`) : ["- none"]),
    "",
    "### Avoid",
    ...advice.advice.avoid.map((item) => `- ${item}`),
    "",
    "### Token Policy",
    advice.advice.tokenPolicy,
    "",
  ].join("\n");
}

if (require.main === module) {
  const { flags, agent, capabilities, contextBudget, riskTolerance, goal } = parseAdviseArgs(process.argv.slice(2));
  const advice = buildAgentAdvice({ agent, capabilities, contextBudget, riskTolerance, goal });
  if (flags.has("--json")) process.stdout.write(`${JSON.stringify(advice, null, 2)}\n`);
  else if (flags.has("--compact")) process.stdout.write(`${JSON.stringify(buildAdviceSummary(advice), null, 2)}\n`);
  else process.stdout.write(`${formatAdviceBrief(advice)}\n`);
}

module.exports = {
  buildAgentAdvice,
  buildAdviceSummary,
  formatAdviceBrief,
  parseAdviseArgs,
};
