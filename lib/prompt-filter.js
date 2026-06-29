function normalize(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function inferIntent(prompt = "") {
  const text = prompt.toLowerCase();
  const intents = [];
  if (/\b(crea|crear|haz|hacer|construye|build)\b/.test(text)) intents.push("crear");
  if (/\b(mejora|mejorar|optimiza|potencia|brutal|bestial)\b/.test(text)) intents.push("mejorar");
  if (/\b(conecta|integrar|api|mcp|github|obsidian|modelo|ia)\b/.test(text)) intents.push("conectar");
  if (/\b(documenta|docs|obsidian|memoria)\b/.test(text)) intents.push("documentar");
  if (/\b(test|verifica|comprueba|ready|produccion)\b/.test(text)) intents.push("verificar");
  return intents.length ? intents : ["aclarar_objetivo"];
}

function inferAmbiguities(prompt = "") {
  const text = prompt.toLowerCase();
  const ambiguities = [];
  if (!/\b(repo|web|api|doc|test|dossier|prompt|skill|conexion|filtro|kaizen7|thefocux)\b/.test(text)) ambiguities.push("superficie_de_trabajo");
  if (!/\b(para|objetivo|resultado|entregable|dossier|web|api|archivo|doc|test)\b/.test(text)) ambiguities.push("resultado_concreto");
  if (/\b(todo|brutal|bestial|mejor|potente|rapido|full|completo)\b/.test(text)) ambiguities.push("criterio_de_exito");
  if (!/\b(verifica|test|ready|evidencia|comprueba|sin romper)\b/.test(text)) ambiguities.push("evidencia_requerida");
  return unique(ambiguities);
}

function inferRisks(prompt = "") {
  const text = prompt.toLowerCase();
  const risks = [];
  if (/\b(access token|api key|secret|password|oauth|login|credencial)\b/.test(text)) risks.push("credential_or_account_action");
  if (/\b(publica|publish|paga|payment|checkout|deploy|delete|borrar|anuncios|ads)\b/.test(text)) risks.push("money_or_publish_action");
  if (/\b(medico|salud|legal|financiero|claim|claims)\b/.test(text)) risks.push("high_stakes_claim");
  return unique(risks);
}

function compactObjective(prompt = "", project = "") {
  const cleaned = normalize(prompt)
    .replace(/\b(brutal|bestial|super|full|rapido|lo mejor|con todo)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const target = project ? ` para ${project}` : "";
  if (!cleaned) return `Definir un objetivo concreto${target}, con evidencia y una sola siguiente accion.`;
  return `Definir un objetivo concreto${target}: ${cleaned}.`;
}

function buildSimplifiedPrompt({ prompt, project, ambiguities }) {
  const lines = [
    compactObjective(prompt, project),
    "Entregar una sola siguiente accion verificable.",
    "Usar memoria y conexiones solo si reducen pasos, riesgo o tokens.",
  ];
  if (ambiguities.length) lines.push(`Aclarar o asumir explicitamente: ${ambiguities.join(", ")}.`);
  return lines.join(" ");
}

function buildMagnifiedPrompt({ prompt, project, intent, risks }) {
  const scope = project || "el proyecto";
  const approval = risks.length
    ? "Si aparecen credenciales, pagos, publicacion, borrado o deploy, detenerse y pedir aprobacion."
    : "Mantener la accion dentro de un cambio seguro y verificable.";
  return [
    `Actua como KAIZEN7 para ${scope}.`,
    `Transforma este prompt en ejecucion: "${normalize(prompt)}".`,
    `Intencion detectada: ${intent.join(", ")}.`,
    "Reduce ruido, define el entregable, elige la minima skill y la minima conexion.",
    "Ejecuta una sola siguiente accion con evidencia fresca.",
    approval,
    "Cierra con memoria reutilizable: decision, evidencia, riesgos y siguiente accion.",
  ].join(" ");
}

function buildPromptFilter(options = {}) {
  const rawPrompt = normalize(options.prompt || options.objective || options.goal);
  const project = normalize(options.project || options.name);

  if (!rawPrompt) {
    return {
      version: 1,
      status: "needs_input",
      mode: "prompt-filter",
      question: "Cual es el prompt crudo?",
      tokenPolicy: "no cargar contexto hasta tener prompt",
    };
  }

  const intent = inferIntent(rawPrompt);
  const ambiguities = inferAmbiguities(rawPrompt);
  const risks = inferRisks(rawPrompt);
  const executionGate = risks.some((risk) => risk === "credential_or_account_action" || risk === "money_or_publish_action")
    ? "approval_required"
    : "safe_to_route";

  return {
    version: 1,
    status: "ready",
    mode: "prompt-filter",
    project: project || "unspecified",
    rawPrompt,
    analysis: {
      intent,
      ambiguities,
      risks,
      noise: ambiguities.length + risks.length,
    },
    simplifiedPrompt: buildSimplifiedPrompt({ prompt: rawPrompt, project, ambiguities }),
    magnifiedPrompt: buildMagnifiedPrompt({ prompt: rawPrompt, project, intent, risks }),
    executionGate,
    outputContract: ["analysis", "simplified_prompt", "magnified_prompt", "execution_gate"],
    tokenPolicy: "analyze once; execute the simplified or magnified prompt, never the noisy raw prompt",
  };
}

function formatPromptFilter(result) {
  if (result.status === "needs_input") {
    return [
      "## KAIZEN7 Prompt Filter",
      "",
      `Status: ${result.status}`,
      `Question: ${result.question}`,
      "",
    ].join("\n");
  }

  return [
    "## KAIZEN7 Prompt Filter",
    "",
    `Status: ${result.status}`,
    `Project: ${result.project}`,
    `Gate: ${result.executionGate}`,
    "",
    "### Analysis",
    `Intent: ${result.analysis.intent.join(", ")}`,
    `Ambiguities: ${result.analysis.ambiguities.join(", ") || "none"}`,
    `Risks: ${result.analysis.risks.join(", ") || "none"}`,
    "",
    "### Simplified",
    result.simplifiedPrompt,
    "",
    "### Magnified",
    result.magnifiedPrompt,
    "",
  ].join("\n");
}

function parseArgs(argv = []) {
  const promptParts = [];
  let project = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (!arg.startsWith("--")) promptParts.push(arg);
  }
  return {
    project,
    prompt: promptParts.join(" ").trim(),
  };
}

if (require.main === module) {
  const result = buildPromptFilter(parseArgs(process.argv.slice(2)));
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`${formatPromptFilter(result)}\n`);
}

module.exports = {
  buildPromptFilter,
  formatPromptFilter,
  parseArgs,
};
