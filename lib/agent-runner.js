const fs = require("node:fs");
const path = require("node:path");
const { buildAgentPacket, buildCompactPacket } = require("./agent-loop");
const { fetchBrowserSignal } = require("./browser-adapter");
const { fetchGitHubRepoSignal } = require("./github-adapter");
const { fetchHuggingFaceSignal } = require("./huggingface-adapter");
const {
  buildImplementationQueue,
  buildSignalQueue,
  loadHunterRegistry,
  loadSignalInbox,
} = require("./hunter");
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
const { appendSignalPacket } = require("./signal-ingestion");

function parseRunArgs(argv) {
  const flags = new Set();
  const browserUrls = [];
  const githubUrls = [];
  const huggingFaceUrls = [];
  const goalParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--browser") browserUrls.push(argv[++index] || "");
    else if (arg === "--github") githubUrls.push(argv[++index] || "");
    else if (arg === "--hf" || arg === "--huggingface") huggingFaceUrls.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    flags,
    browserUrls: browserUrls.filter(Boolean),
    githubUrls: githubUrls.filter(Boolean),
    huggingFaceUrls: huggingFaceUrls.filter(Boolean),
    goal: goalParts.join(" ").trim(),
  };
}

async function ingestSignals(options) {
  const root = options.root || process.cwd();
  const inboxPath = path.join(root, "data", "signal-inbox.json");
  const ingested = [];
  const browserFetcher = options.fetchBrowserSignal || fetchBrowserSignal;
  const githubFetcher = options.fetchGitHubSignal || fetchGitHubRepoSignal;
  const hfFetcher = options.fetchHuggingFaceSignal || fetchHuggingFaceSignal;
  for (const url of options.browserUrls || []) {
    const packet = await browserFetcher(url, { objective: options.goal || "" });
    appendSignalPacket(packet, inboxPath);
    ingested.push({ type: "browser", url, candidate: packet.browser?.domain || packet.source?.url || url });
  }
  for (const url of options.githubUrls || []) {
    const packet = await githubFetcher(url);
    appendSignalPacket(packet, inboxPath);
    ingested.push({ type: "github", url, candidate: packet.github?.fullName || packet.source?.url || url });
  }
  for (const url of options.huggingFaceUrls || []) {
    const packet = await hfFetcher(url);
    appendSignalPacket(packet, inboxPath);
    ingested.push({ type: "huggingface", url, candidate: packet.huggingface?.repoId || packet.source?.url || url });
  }
  return ingested;
}

function selectAction(executionQueue, agentPacket) {
  const top = executionQueue.find((item) => !item.blocked);
  if (top) {
    return {
      type: top.nextStep,
      candidate: top.candidate,
      module: top.module,
      source: top.source,
      origin: top.origin,
      score: top.score,
      next: top.nextAction || `${top.nextStep}: ${top.module}:${top.candidate}`,
      requiresApproval: false,
    };
  }
  return {
    type: agentPacket.nextAction.type,
    candidate: agentPacket.nextAction.candidate || agentPacket.nextAction.title,
    module: agentPacket.nextAction.module || "agent_loop",
    source: "local",
    origin: "agent-loop",
    score: 0,
    next: agentPacket.nextAction.title,
    requiresApproval: false,
  };
}

async function buildAgentRun(options = {}) {
  const root = options.root || process.cwd();
  const goal = options.goal || "mejorar KAIZEN7 con menos pasos y menos tokens";
  const ingested = await ingestSignals({
    root,
    browserUrls: options.ingest?.browserUrls || [],
    githubUrls: options.ingest?.githubUrls || [],
    huggingFaceUrls: options.ingest?.huggingFaceUrls || [],
    fetchBrowserSignal: options.fetchBrowserSignal,
    fetchGitHubSignal: options.fetchGitHubSignal,
    fetchHuggingFaceSignal: options.fetchHuggingFaceSignal,
    goal,
  });
  const agentPacket = buildAgentPacket({ root, date: options.date, goal });
  const registry = loadHunterRegistry(path.join(root, "data", "hunter-registry.json"));
  const signalInbox = loadSignalInbox(path.join(root, "data", "signal-inbox.json"));
  const signalQueue = buildSignalQueue(signalInbox, { limit: 10 });
  const executionQueue = buildImplementationQueue(registry, { signals: signalInbox, limit: 10 });
  const action = selectAction(executionQueue, agentPacket);
  const projectFocus = buildFocusPacket({ root, goal });
  const route = { name: /bug|test|code|codigo|implementar|fix/i.test(goal) ? "code" : "orchestrate" };
  const objectiveType = detectObjectiveType(goal, route);
  const ledger = options.metaskillLedger || loadMetaskillLedger(defaultLedgerPath(root));
  const metaskillLedger = buildLedgerSummary(ledger);
  const metaskillActivation = activateMetaskills({
    goal,
    route,
    capabilities: ["read_files", "edit_files", "run_tests"],
    objectiveType,
    ledger,
  });
  const metaskillTelemetry = buildMetaskillTelemetry({
    objectiveType,
    activations: metaskillActivation,
    outcome: {
      testsPassed: false,
      reworkNeeded: false,
      reusedContext: Boolean(agentPacket.memory?.length || agentPacket.skills?.length),
      riskReduced: true,
    },
  });
  return {
    version: 1,
    mode: "agent-runner",
    status: "ready",
    date: agentPacket.date,
    goal,
    ingested,
    agent: buildCompactPacket(agentPacket),
    signalQueue,
    executionQueue,
    action,
    projectFocus,
    metaskillActivation,
    metaskillTelemetry,
    metaskillLedger,
    gates: agentPacket.gates,
    tokenPolicy: "single action first; metadata first; deep-read only selected candidate, selected skill and cited memory",
  };
}

function buildRunSummary(run) {
  return {
    status: run.status,
    goal: run.goal,
    action: run.action,
    signals: run.signalQueue.slice(0, 3).map((item) => `${item.module}:${item.candidate}`),
    skills: run.agent.skills,
    memory: run.agent.memory,
    commands: [
      "node lib/hunter.js signals",
      "node lib/hunter.js queue",
      `npm.cmd run k7:loop -- --write-memory "${run.goal}"`,
    ],
  };
}

function formatRunBrief(run) {
  const signals = run.signalQueue.length
    ? run.signalQueue.slice(0, 5).map((item) => `- ${item.module}: ${item.candidate} (${item.score})`).join("\n")
    : "- none";
  return [
    "## KAIZEN7 Run",
    "",
    `Status: ${run.status}`,
    `Goal: ${run.goal}`,
    "",
    "### Action",
    `${run.action.type}: ${run.action.candidate}`,
    `Module: ${run.action.module}`,
    `Origin: ${run.action.origin}`,
    "",
    "### Signals",
    signals,
    "",
    "### Next Command",
    "node lib/hunter.js queue",
    "",
    "### Token Policy",
    run.tokenPolicy,
    "",
  ].join("\n");
}

if (require.main === module) {
  const { flags, browserUrls, githubUrls, huggingFaceUrls, goal } = parseRunArgs(process.argv.slice(2));
  buildAgentRun({ goal, ingest: { browserUrls, githubUrls, huggingFaceUrls } })
    .then((run) => {
      if (flags.has("--json")) process.stdout.write(`${JSON.stringify(run, null, 2)}\n`);
      else if (flags.has("--compact")) process.stdout.write(`${JSON.stringify(buildRunSummary(run), null, 2)}\n`);
      else process.stdout.write(`${formatRunBrief(run)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
}

module.exports = {
  buildAgentRun,
  buildRunSummary,
  formatRunBrief,
  parseRunArgs,
};
