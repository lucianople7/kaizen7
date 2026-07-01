const {
  buildAgentBrief,
  buildAgentContract,
  buildAgentCycle,
  buildAgentHandoff,
  buildAgentReceipt,
  buildCapabilityForge,
  buildCapabilityPacket,
  buildCapabilitySpec,
  buildKernelBridge,
  listCapabilities,
  resolveCapabilities,
  validateAgentLanguage,
  verifyCapabilityEvidence,
} = require("./index");

function parseArgs(argv = []) {
  const flags = new Set();
  const parts = [];
  let evidence = "";

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--evidence") evidence = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
    else parts.push(arg);
  }

  return { flags, objective: parts.join(" ").trim(), evidence };
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (args.flags.has("--list")) {
    printJson({ status: "ready", capabilities: listCapabilities().map((capability) => capability.id) });
    return;
  }

  if (args.flags.has("--plan")) {
    printJson(resolveCapabilities(args.objective));
    return;
  }

  if (args.flags.has("--contract")) {
    printJson(buildAgentContract(args.objective));
    return;
  }

  if (args.flags.has("--brief")) {
    printJson(buildAgentBrief(args.objective));
    return;
  }

  if (args.flags.has("--handoff")) {
    printJson(buildAgentHandoff(args.objective));
    return;
  }

  if (args.flags.has("--ready")) {
    printJson(buildCapabilityPacket(args.objective).agent_readiness);
    return;
  }

  if (args.flags.has("--packet")) {
    printJson(buildCapabilityPacket(args.objective));
    return;
  }

  if (args.flags.has("--receipt")) {
    const packet = buildCapabilityPacket(args.objective);
    const result = args.evidence ? JSON.parse(args.evidence) : {};
    printJson(buildAgentReceipt(packet, result));
    return;
  }

  if (args.flags.has("--cycle")) {
    const result = args.evidence ? JSON.parse(args.evidence) : {};
    printJson(buildAgentCycle(args.objective, result));
    return;
  }

  if (args.flags.has("--bridge")) {
    printJson(buildKernelBridge(args.objective));
    return;
  }

  if (args.flags.has("--spec")) {
    printJson(buildCapabilitySpec(args.objective));
    return;
  }

  if (args.flags.has("--forge")) {
    printJson(buildCapabilityForge(args.objective));
    return;
  }

  if (args.flags.has("--validate")) {
    const value = args.evidence ? JSON.parse(args.evidence) : {};
    printJson(validateAgentLanguage(value));
    return;
  }

  if (args.flags.has("--verify")) {
    const packet = buildCapabilityPacket(args.objective);
    const result = args.evidence ? JSON.parse(args.evidence) : {};
    printJson(verifyCapabilityEvidence(packet, result));
    return;
  }

  printJson({
    status: "needs_input",
    usage: [
      "node lib/capabilities/cli.js --list",
      "node lib/capabilities/cli.js --plan \"<objective>\"",
      "node lib/capabilities/cli.js --contract \"<objective>\"",
      "node lib/capabilities/cli.js --brief \"<objective>\"",
      "node lib/capabilities/cli.js --handoff \"<objective>\"",
      "node lib/capabilities/cli.js --ready \"<objective>\"",
      "node lib/capabilities/cli.js --packet \"<objective>\"",
      "node lib/capabilities/cli.js --receipt \"<objective>\" --evidence \"<json>\"",
      "node lib/capabilities/cli.js --cycle \"<objective>\" --evidence \"<json>\"",
      "node lib/capabilities/cli.js --bridge \"<objective>\"",
      "node lib/capabilities/cli.js --spec \"<capability.id>\"",
      "node lib/capabilities/cli.js --forge \"<objective>\"",
      "node lib/capabilities/cli.js --validate --evidence \"<json>\"",
      "node lib/capabilities/cli.js --verify \"<objective>\" --evidence \"<json>\"",
    ],
  });
}

if (require.main === module) run();

module.exports = {
  parseArgs,
  run,
};
