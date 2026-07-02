function clean(value = "", fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function unique(items = []) {
  return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}

function buildLitePlan(kind, options = {}) {
  const goal = clean(options.goal || options.objective, `operate ${kind}`);
  const capabilities = unique(options.capabilities || []);
  return {
    version: 1,
    status: "ready",
    mode: kind,
    goal,
    capabilities,
    providerStatus: options.providerStatus || "planned_local_contract",
    action: options.action || `Use ${kind} as a bounded KAIZEN7 capability contract.`,
    gates: unique([
      "no_external_effect_without_approval",
      "return_evidence_before_memory_writeback",
      ...(options.gates || []),
    ]),
    verification: unique([
      "contract_present",
      "risks_reported",
      ...(options.verification || []),
    ]),
    risks: unique(options.risks || ["provider may need a real installed backend before execution"]),
    nextAction: options.nextAction || "connect_real_provider_or_use_safe_fallback",
  };
}

function formatLitePlan(plan, title = "KAIZEN7 Capability") {
  return [
    `## ${title}`,
    "",
    `Status: ${plan.status}`,
    `Mode: ${plan.mode}`,
    `Goal: ${plan.goal}`,
    "",
    "### Action",
    plan.action,
    "",
    "### Gates",
    ...plan.gates.map((gate) => `- ${gate}`),
    "",
    "### Verification",
    ...plan.verification.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function parseLiteArgs(argv = []) {
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
    capabilities,
    goal: goalParts.join(" ").trim(),
  };
}

function runLiteCli(builder, formatter, argv = process.argv.slice(2)) {
  const args = parseLiteArgs(argv);
  const plan = builder(args);
  if (args.json) process.stdout.write(`${JSON.stringify(plan, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatter(plan)}\n`);
}

module.exports = {
  buildLitePlan,
  clean,
  formatLitePlan,
  parseLiteArgs,
  runLiteCli,
  unique,
};
