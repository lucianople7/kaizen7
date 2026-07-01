#!/usr/bin/env node
const {
  buildAgentRunCard,
  buildAgentRunVerdict,
  buildAgentWorkbench,
  buildMemoryPlane,
  buildMutualLearningExchange,
  resolveCapabilities,
} = require("./capabilities");

function parseAnythingArgs(argv = []) {
  const parts = [];
  let mode = "auto";
  let options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--mode") mode = argv[++index] || mode;
    else if (arg === "--evidence" || arg === "--json") options = JSON.parse(argv[++index] || "{}");
    else parts.push(arg);
  }

  return {
    mode,
    objective: parts.join(" ").trim(),
    options,
  };
}

function hasResultEvidence(options = {}) {
  return Boolean(options.result_summary || options.memory_draft || options.evidence || options.result);
}

function buildFullCycle(objective = "", options = {}) {
  const runCard = buildAgentRunCard(objective, options);
  const result = options.result || options;
  const runVerdict = buildAgentRunVerdict(runCard, result);
  const mutualLearning = buildMutualLearningExchange(runVerdict, result);
  const memoryPlane = buildMemoryPlane(objective, {
    ...options,
    exchange: options.exchange || mutualLearning,
  });

  return {
    surface: memoryPlane,
    run_card: runCard,
    run_verdict: runVerdict,
    mutual_learning: mutualLearning,
    next_action: memoryPlane.next_action,
  };
}

function buildSurface(objective = "", options = {}) {
  const mode = options.mode || "auto";
  if (mode === "plan") return { surface: resolveCapabilities(objective, options), next_action: "select_capability" };
  if (mode === "workbench") return { surface: buildAgentWorkbench(objective, options), next_action: "execute_workbench" };
  if (mode === "run-card") return { surface: buildAgentRunCard(objective, options), next_action: "execute_run_card" };
  if (mode === "verdict") {
    const runCard = options.run_card || options.runCard || buildAgentRunCard(objective, options);
    const surface = buildAgentRunVerdict(runCard, options.result || options);
    return { surface, run_card: runCard, next_action: surface.next_action };
  }
  if (mode === "learn") return buildFullCycle(objective, options);
  if (mode === "memory") return { surface: buildMemoryPlane(objective, options), next_action: "review_then_write_memory_note" };
  if (hasResultEvidence(options)) return buildFullCycle(objective, options);
  return { surface: buildAgentRunCard(objective, options), next_action: "execute_run_card" };
}

function buildAnythingCliResponse(objective = "", options = {}) {
  const mode = options.mode || "auto";
  const built = buildSurface(objective, options);
  return {
    schema: "kaizen7.anything_cli.v1",
    version: 1,
    objective,
    mode,
    ...built,
  };
}

function run(argv = process.argv.slice(2)) {
  const parsed = parseAnythingArgs(argv);
  const response = buildAnythingCliResponse(parsed.objective, {
    ...parsed.options,
    mode: parsed.mode,
  });
  process.stdout.write(`${JSON.stringify(response, null, 2)}\n`);
}

if (require.main === module) run();

module.exports = {
  buildAnythingCliResponse,
  parseAnythingArgs,
  run,
};
