const DEFAULT_ALLOWED_PATHS = ["lib", "tests", "docs", "Obsidian/Flowmatik/Kaizen7"];
const DEFAULT_STOP_RULES = [
  "stop_if_credentials_required",
  "stop_if_publish_deploy_payment_or_delete_is_needed",
  "stop_if_license_or_compliance_risk_is_unclear",
  "stop_after_budget_exhausted",
];
const DEFAULT_EVIDENCE = ["diff_summary", "test_output", "memory_draft"];

function clean(value = "") {
  return String(value || "").trim();
}

function unique(items = []) {
  return [...new Set(items.map((item) => clean(item)).filter(Boolean))];
}

function normalizePaths(items = []) {
  return unique(items).map((item) => item.replace(/\\/g, "/"));
}

function inferCapabilities(objective = "", capabilities = []) {
  const text = clean(objective).toLowerCase();
  const inferred = [...capabilities];
  if (/visual|screenshot|captura|dom|web|browser|navegador/.test(text)) inferred.push("visual_inspection");
  if (/test|prueba|check|verificar/.test(text)) inferred.push("run_tests");
  if (/edit|code|codigo|implementar|mejorar|landing|repo/.test(text)) inferred.push("edit_code");
  if (/mcp|tool|herramienta/.test(text)) inferred.push("mcp_tools");
  if (/memory|memoria|obsidian/.test(text)) inferred.push("memory_writeback");
  return unique(inferred);
}

function riskSignals(objective = "", capabilities = []) {
  const text = `${objective} ${capabilities.join(" ")}`.toLowerCase();
  return unique([
    /credential|token|secret|api key|password|clave/.test(text) ? "credentials" : "",
    /deploy|publish|production|push|publicar|desplegar/.test(text) ? "deploy_or_publish" : "",
    /delete|remove|borrar|eliminar/.test(text) ? "delete" : "",
    /payment|spend|buy|pagar|gastar|comprar/.test(text) ? "payment_or_spend" : "",
    /license|legal|compliance|medical|financial|licencia|legalidad/.test(text) ? "compliance" : "",
  ]);
}

function inferRisk(options = {}, capabilities = []) {
  if (options.risk) return options.risk;
  return riskSignals(options.objective || options.goal || "", capabilities).length ? "high" : "low";
}

function buildApproval(risk, signals = []) {
  return {
    required: risk === "high",
    gate: risk === "high" ? "human_approval_before_execution" : "bounded_auto_dry_run",
    reasons: signals.map((signal) => {
      if (signal === "credentials") return "requires credentials or secrets review";
      if (signal === "deploy_or_publish") return "requires deploy, publish or push approval";
      if (signal === "delete") return "requires delete approval";
      if (signal === "payment_or_spend") return "requires payment or spend approval";
      if (signal === "compliance") return "requires license, legal or compliance review";
      return signal;
    }),
  };
}

function buildMissionPacket(options = {}) {
  const objective = clean(options.objective || options.goal) || "activate KAIZEN7 action copilot";
  const capabilities = inferCapabilities(objective, options.capabilities || []);
  const signals = riskSignals(objective, capabilities);
  const risk = inferRisk({ ...options, objective }, capabilities);
  const stopRules = unique([
    ...DEFAULT_STOP_RULES,
    ...(risk === "high" ? ["stop_until_human_approval"] : []),
    ...(options.stopRules || []),
  ]);
  const expectedEvidence = unique([
    ...DEFAULT_EVIDENCE,
    ...(capabilities.includes("visual_inspection") ? ["screenshot_or_dom_snapshot"] : []),
    ...(options.expectedEvidence || []),
  ]);
  return {
    version: 1,
    status: "ready",
    mode: "k7-mission-packet",
    objective,
    project: clean(options.project) || "KAIZEN7",
    risk,
    allowedPaths: normalizePaths(options.allowedPaths?.length ? options.allowedPaths : DEFAULT_ALLOWED_PATHS),
    budget: {
      maxSteps: Number(options.maxSteps || options.budget?.maxSteps || 5),
      maxTokens: Number(options.maxTokens || options.budget?.maxTokens || 1600),
      maxMinutes: Number(options.maxMinutes || options.budget?.maxMinutes || 30),
    },
    capabilities,
    preferredExecutor: clean(options.preferredExecutor || options.executor) || "auto",
    stopRules,
    verificationCommands: unique(options.verificationCommands?.length ? options.verificationCommands : ["npm.cmd run check"]),
    expectedEvidence,
    approval: buildApproval(risk, signals),
    memoryWriteback: {
      target: clean(options.memoryTarget) || "Obsidian/Flowmatik/Kaizen7",
      kind: clean(options.memoryKind) || "Decision",
    },
  };
}

function parseArgs(argv = []) {
  const options = {
    allowedPaths: [],
    capabilities: [],
    verificationCommands: [],
  };
  const flags = new Set();
  const objectiveParts = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") options.project = argv[++index] || "";
    else if (arg === "--risk") options.risk = argv[++index] || "";
    else if (arg === "--executor") options.preferredExecutor = argv[++index] || "";
    else if (arg === "--path") options.allowedPaths.push(argv[++index] || "");
    else if (arg === "--capability") options.capabilities.push(argv[++index] || "");
    else if (arg === "--verify") options.verificationCommands.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else objectiveParts.push(arg);
  }
  return {
    ...options,
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    objective: objectiveParts.join(" ").trim(),
  };
}

function formatMissionPacket(packet) {
  return [
    "## K7 Mission Packet",
    "",
    `Status: ${packet.status}`,
    `Project: ${packet.project}`,
    `Objective: ${packet.objective}`,
    `Risk: ${packet.risk}`,
    `Preferred executor: ${packet.preferredExecutor}`,
    "",
    "### Allowed Paths",
    ...packet.allowedPaths.map((item) => `- ${item}`),
    "",
    "### Verification",
    ...packet.verificationCommands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const packet = buildMissionPacket(args);
  if (args.json) process.stdout.write(`${JSON.stringify(packet, null, args.compact ? 0 : 2)}\n`);
  else process.stdout.write(`${formatMissionPacket(packet)}\n`);
}

module.exports = {
  buildMissionPacket,
  formatMissionPacket,
  parseArgs,
};
