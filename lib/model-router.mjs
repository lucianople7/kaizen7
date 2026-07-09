// Router de complejidad para el catalogo BytePlus ModelArk (Coding Plan).
//
// Por que existe: la doc de ModelArk advierte explicitamente que GLM-5.1 y
// DeepSeek-V4-Pro tienen un "deduction coefficient" alto y consumen cuota
// rapido, recomendando reservarlos para tareas dificiles/complejas y usar
// modelos mas livianos (GLM-4.7, etc.) para el dia a dia. Este router
// automatiza esa recomendacion en vez de dejar todo en "auto".
//
// Los callers pueden:
//   1) dejar que classifyComplexity() adivine por heuristica de texto, o
//   2) pasar la complejidad explicita via requestContext.set("complexity", ...)

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const ARK_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/coding/v3";

// Mastra's built-in "openai/<model>" string resolver hardcodes the Responses
// API (createOpenAI(...).responses(modelId)), which BytePlus ARK's endpoint
// rejects ("item reference is not supported" -- ARK only speaks classic Chat
// Completions). So instead of returning a plain "openai/<id>" string, we build
// the model object ourselves via the generic OpenAI-compatible Chat
// Completions client, bypassing Mastra's provider-string resolution entirely.
let arkProvider = null;
function getArkProvider() {
  if (!arkProvider) {
    arkProvider = createOpenAICompatible({
      name: "byteplus-ark",
      baseURL: ARK_BASE_URL,
      apiKey: process.env.ARK_API_KEY,
    });
  }
  return arkProvider;
}

const COMPLEX_KEYWORDS = [
  "refactor", "refactoriza", "arquitectura", "architecture", "migra", "migrate",
  "migracion", "migration", "reescribe", "rewrite", "sistema completo",
  "multi-step", "multi-file", "multiples archivos", "optimiza", "optimization",
  "seguridad", "security audit", "auditoria", "diseño de sistema", "design system",
  "complejo", "complex", "orquestacion", "orchestration", "pipeline completo",
];

// IDs confirmados en la doc oficial de ModelArk (no adivinados).
const ARK_MODEL_IDS = {
  simple: "glm-4.7",
  complex: "glm-5.1",
};

/**
 * Heuristica simple: por keywords de tarea y longitud del prompt.
 * No es perfecta a proposito -- es mas seguro y barato equivocarse hacia
 * "simple" (el caller siempre puede forzar "complex" via requestContext).
 */
export function classifyComplexity(text = "") {
  const lower = String(text).toLowerCase();
  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  const hasComplexKeyword = COMPLEX_KEYWORDS.some((kw) => lower.includes(kw));
  if (hasComplexKeyword || wordCount > 80) return "complex";
  return "simple";
}

/**
 * Resuelve un modelo real de ARK (Chat Completions, no Responses API) segun
 * la complejidad. Usar solo cuando ARK_API_KEY esta configurada -- fuera de
 * ese catalogo, la nocion de "barato vs caro dentro del mismo proveedor" no
 * aplica igual.
 */
export function resolveArkModel(complexity = "simple") {
  const modelId = ARK_MODEL_IDS[complexity] || ARK_MODEL_IDS.simple;
  return getArkProvider().chatModel(modelId);
}

export function resolveArkModelId(complexity = "simple") {
  return ARK_MODEL_IDS[complexity] || ARK_MODEL_IDS.simple;
}

export { ARK_MODEL_IDS };
