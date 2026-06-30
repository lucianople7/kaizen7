const { buildMissionPacket, parseArgs: parseMissionArgs } = require("./k7-mission-packet");

const EXECUTORS = [
  { id: "codex", label: "Codex", installed: true, role: "local executor" },
  { id: "qwen-code", label: "Qwen Code", installed: false, role: "memory, skills, subagents and MCP reference" },
  { id: "aider", label: "Aider", installed: false, role: "focused repo patching" },
  { id: "jcode", label: "jcode", installed: false, role: "session harness candidate" },
  { id: "browser", label: "Browser Eyes", installed: true, role: "visual and web evidence" },
  { id: "manual", label: "Manual Approval", installed: true, role: "safety fallback" },
];

function clean(value = "") {
  return String(value || "").trim();
}

function unique(items = []) {
  return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}

function executorById(id) {
  return EXECUTORS.find((executor) => executor.id === id) || EXECUTORS[0];
}

function textFor(mission) {
  return `${mission.objective} ${mission.capabilities.join(" ")} ${mission.preferredExecutor}`.toLowerCase();
}

function scoreExecutor(executor, mission) {
  const text = textFor(mission);
  if (executor.id === "manual") return mission.risk === "high" ? 100 : 5;
  if (mission.risk === "high") return executor.id === "manual" ? 100 : -100;

  let score = 0;
  if (executor.installed) score += 12;
  if (mission.preferredExecutor === executor.id) score += 40;
  if (mission.preferredExecutor !== "auto" && mission.preferredExecutor !== executor.id) score -= 8;

  if (executor.id === "codex") {
    if (/code|codigo|repo|landing|test|mejorar|edit|implementar/.test(text)) score += 30;
    if (mission.capabilities.includes("edit_code")) score += 15;
    if (mission.capabilities.includes("run_tests")) score += 10;
  }
  if (executor.id === "browser") {
    if (/visual|screenshot|dom|web|browser|navegador/.test(text)) score += 50;
    if (mission.capabilities.includes("visual_inspection")) score += 25;
  }
  if (executor.id === "aider") {
    if (/aider|repo map|quirurg|patch|parche|refactor/.test(text)) score += 35;
    if (mission.capabilities.includes("edit_code") && mission.capabilities.includes("run_tests")) score += 12;
  }
  if (executor.id === "qwen-code") {
    if (/qwen|auto-memory|auto skills|subagent|subagents|mcp|skills|memoria automatica|modular/.test(text)) score += 45;
    if (mission.capabilities.includes("mcp_tools")) score += 12;
    if (mission.capabilities.includes("subagents")) score += 12;
    if (mission.capabilities.includes("memory_writeback")) score += 8;
  }
  if (executor.id === "jcode") {
    if (/jcode|harness|session|sesion|persistent|swarm/.test(text)) score += 45;
    if (mission.capabilities.includes("session_resume")) score += 15;
  }
  return score;
}

function reasonFor(id) {
  if (id === "manual") return "manual approval required because risk or stop rules block execution";
  if (id === "browser") return "visual or web evidence is central to the mission";
  if (id === "aider") return "focused repo patching is requested, but requires external CLI smoke test before real execution";
  if (id === "qwen-code") return "memory, skills, subagents or MCP patterns are central, but require external CLI smoke test before real execution";
  if (id === "jcode") return "session or harness behavior is central, but requires external CLI smoke test before real execution";
  return "local repo work fits Codex as the safe default executor";
}

function routeMission(options = {}) {
  const mission = options.mode === "k7-mission-packet" ? options : buildMissionPacket(options);
  const scores = Object.fromEntries(EXECUTORS.map((executor) => [executor.id, scoreExecutor(executor, mission)]));
  const recommendedExecutor = executorById(Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]);
  const gates = unique([
    ...(mission.approval.required ? ["human_approval_before_execution"] : []),
    ...(!recommendedExecutor.installed && recommendedExecutor.id !== "manual" ? ["external_cli_smoke_test_required"] : []),
    "evidence_before_memory_writeback",
  ]);
  const reason = reasonFor(recommendedExecutor.id, mission);
  return {
    version: 1,
    status: "ready",
    mode: "k7-harness-router",
    mission,
    executors: EXECUTORS,
    scores,
    recommendedExecutor,
    reason,
    gates,
    policy: "KAIZEN7 decides, routes, limits, verifies and remembers; executors remain replaceable.",
  };
}

function commandForExecutor(executorId, mission) {
  const objective = JSON.stringify(mission.objective);
  if (executorId === "aider") return `aider --message ${objective}`;
  if (executorId === "qwen-code") return `qwen-code ${objective}`;
  if (executorId === "jcode") return `npm.cmd run k7:jcode -- ${objective}`;
  if (executorId === "browser") return `npm.cmd run k7:browser -- ${objective}`;
  if (executorId === "manual") return "request human approval before execution";
  return `npm.cmd run k7:codex -- ${objective}`;
}

function nextActionFor(executorId, mission) {
  if (executorId === "manual") return "Stop and request approval with risk reasons before execution.";
  if (executorId === "browser") return "Inspect the target visually and return screenshot or DOM evidence.";
  if (executorId === "aider") return "Prepare Aider command as a dry-run; require CLI smoke test before real edits.";
  if (executorId === "qwen-code") return "Prepare Qwen Code command as a dry-run; require CLI smoke test before real orchestration.";
  if (executorId === "jcode") return "Prepare jcode harness packet as a dry-run; require smoke test before real sessions.";
  return `Run Codex locally within ${mission.allowedPaths.join(", ")} and verify with ${mission.verificationCommands.join(", ")}.`;
}

function buildHarnessDryRun(options = {}) {
  const route = routeMission(options);
  const mission = route.mission;
  const executorId = route.recommendedExecutor.id;
  return {
    version: 1,
    status: "ready",
    mode: "k7-harness-dry-run",
    route,
    nextAction: nextActionFor(executorId, mission),
    command: commandForExecutor(executorId, mission),
    allowedPaths: mission.allowedPaths,
    stopRules: mission.stopRules,
    approval: mission.approval,
    verificationCommands: mission.verificationCommands,
    expectedEvidence: mission.expectedEvidence,
    memoryDraft: [
      `Project: ${mission.project}`,
      `Objective: ${mission.objective}`,
      `Executor: ${executorId}`,
      "Learning: KAIZEN7 routed the mission through a bounded dry-run before execution.",
    ].join("\n"),
  };
}

function parseArgs(argv = []) {
  return parseMissionArgs(argv);
}

function formatHarnessRoute(route) {
  return [
    "## K7 Harness Router",
    "",
    `Status: ${route.status}`,
    `Objective: ${route.mission.objective}`,
    `Executor: ${route.recommendedExecutor.id}`,
    `Reason: ${route.reason}`,
    "",
    "### Gates",
    ...route.gates.map((gate) => `- ${gate}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const route = routeMission(args);
  if (args.json) process.stdout.write(`${JSON.stringify(route, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatHarnessRoute(route)}\n`);
}

module.exports = {
  buildHarnessDryRun,
  formatHarnessRoute,
  parseArgs,
  routeMission,
  scoreExecutor,
};
