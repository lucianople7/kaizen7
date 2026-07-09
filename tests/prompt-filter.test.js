const assert = require("node:assert/strict");
const {
  buildPromptFilter,
  formatPromptFilter,
  parseArgs,
} = require("../lib/prompt-filter");

const empty = buildPromptFilter({});
assert.equal(empty.status, "needs_input");
assert.equal(empty.question, "Cual es el prompt crudo?");

const filtered = buildPromptFilter({
  prompt: "hazlo brutal con ia y conecta todo para thefocux rapido",
  project: "THE FOCUX",
});

assert.equal(filtered.status, "ready");
assert.equal(filtered.mode, "prompt-filter");
assert.equal(filtered.project, "THE FOCUX");
assert.equal(filtered.rawPrompt, "hazlo brutal con ia y conecta todo para thefocux rapido");
assert(filtered.analysis.intent.includes("mejorar"));
assert(filtered.analysis.ambiguities.includes("criterio_de_exito"));
assert(filtered.analysis.ambiguities.includes("evidencia_requerida"));
assert(filtered.simplifiedPrompt.includes("Definir un objetivo"));
assert(filtered.magnifiedPrompt.includes("THE FOCUX"));
assert(filtered.magnifiedPrompt.includes("una sola siguiente accion"));
assert(filtered.outputContract.includes("simplified_prompt"));
assert(filtered.outputContract.includes("magnified_prompt"));
assert.equal(filtered.tokenPolicy, "analyze once; execute the simplified or magnified prompt, never the noisy raw prompt");

const risky = buildPromptFilter({
  prompt: "publica y paga anuncios usando access token",
});
assert(risky.analysis.risks.includes("credential_or_account_action"));
assert(risky.analysis.risks.includes("money_or_publish_action"));
assert.equal(risky.executionGate, "approval_required");

const formatted = formatPromptFilter(filtered);
assert(formatted.includes("KAIZEN7 Prompt Filter"));
assert(formatted.includes("Simplified"));
assert(formatted.includes("Magnified"));

const parsed = parseArgs(["--project", "KAIZEN7", "mejora", "este", "prompt"]);
assert.equal(parsed.project, "KAIZEN7");
assert.equal(parsed.prompt, "mejora este prompt");

console.log("prompt filter tests passed");
