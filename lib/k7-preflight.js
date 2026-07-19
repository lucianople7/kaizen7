const { buildReceiptRecall } = require("./k7-receipt-ledger");
const { buildPreflightCard, estimateTokens } = require("./k7-work-contracts");

const STOPWORDS = new Set([
  "para", "como", "cuando", "donde", "desde", "este", "esta", "esto", "hacer",
  "crear", "decidir", "usuario", "mejor", "the", "and", "with", "from", "that",
]);

const DOMAIN_PATTERNS = {
  process: /\b(workflow|proceso|preguntar|aprobacion|ruta|preflight|coordinar)\b/,
  memory: /\b(memoria|receipt|recall|contexto|embedding|embeddings|semantica)\b/,
  model: /\b(modelo|model|bge|llm|ollama|qwen|embedding|embeddings)\b/,
  video: /\b(video|remotion|ffmpeg|subtitulo|plantilla|flowmatik)\b/,
  browser: /\b(browser|playwright|navegador|web)\b/,
  commerce: /\b(comercio|ecommerce|shopify|producto|campana|paga)\b/,
  code: /\b(codigo|code|parser|test|prueba|api|cli|repositorio)\b/,
};

function normalize(value = "") {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function tokens(value = "") {
  return normalize(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function domains(value = "") {
  const normalized = normalize(value);
  return Object.entries(DOMAIN_PATTERNS)
    .filter(([, pattern]) => pattern.test(normalized))
    .map(([name]) => name);
}

function evaluateRecommendationFit(objective = "", candidate = "") {
  if (!String(candidate || "").trim()) return { accepted: true, score: 1, reason: "no external candidate supplied" };
  const goalTokens = new Set(tokens(objective));
  const candidateTokens = tokens(candidate);
  const overlap = candidateTokens.filter((token) => goalTokens.has(token)).length;
  const goalDomains = domains(objective);
  const candidateDomains = domains(candidate);
  const domainOverlap = candidateDomains.some((domain) => goalDomains.includes(domain));
  const score = Math.min(1, (overlap / Math.max(1, Math.min(goalTokens.size, 5))) + (domainOverlap ? 0.5 : 0));
  return {
    accepted: domainOverlap || score >= 0.4,
    score: Number(score.toFixed(2)),
    reason: domainOverlap || score >= 0.4
      ? "candidate matches the objective domain"
      : `domain mismatch: objective=${goalDomains.join(",") || "unknown"}; candidate=${candidateDomains.join(",") || "unknown"}`,
  };
}

function classify(objective = "") {
  const value = normalize(objective);
  if (/\b(publica|publish|paga|payment|compra|borra|delete|deploy|credencial|oauth|claim|salud|legal)\b/.test(value)) return "sensitive";
  if (/\b(prefieres|prefiero|quiero|gusta|color|estetica|opcion)\b/.test(value)) return "preference";
  if (/\b(actual|hoy|ultimo|ultima|mercado|precio|modelo|ley|normativa|existe)\b/.test(value)) return "current";
  return "technical";
}

function requiresExecution(objective = "") {
  return /\b(implementa|implementar|implement|anade|añade|anadir|añadir|agrega|cambia|corrige|crea|crear|build|fix|add|update|refactor)\b/.test(normalize(objective));
}

function addDays(iso, days) {
  const value = new Date(iso);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString();
}

function buildPreflight(objective = "", options = {}) {
  const goal = String(objective || "").trim();
  if (!goal) throw new Error("objective is required");
  const now = options.now || new Date().toISOString();
  const budget = Number.isInteger(options.budget) ? options.budget : 300;
  if (budget < 120 || budget > 600) throw new Error("budget must be an integer between 120 and 600");
  const recall = buildReceiptRecall(goal, { root: options.root, now, limit: 5 });
  const fit = evaluateRecommendationFit(goal, options.candidate || "");
  const kind = classify(goal);

  let decision;
  if (kind === "sensitive") {
    decision = {
      route: "approval_gate",
      memory_reused: [],
      research_needed: false,
      recommendation: "Stop before external effects and request explicit approval.",
      reason: "The objective includes a sensitive external action.",
      approval_needed: true,
      verification: "Record the approved scope and verify the external result.",
      expires_at: addDays(now, 1),
    };
  } else if (kind === "preference") {
    decision = {
      route: "ask_user",
      memory_reused: [],
      research_needed: false,
      recommendation: "Ask one short preference question with a recommended option.",
      reason: "Only Luciano can define this preference.",
      approval_needed: true,
      verification: "Record the selected option as a decision receipt.",
      expires_at: "",
    };
  } else if (kind === "current" || recall.stale_matches.length) {
    decision = {
      route: "research_primary_sources",
      memory_reused: [],
      research_needed: true,
      recommendation: "Check current primary sources, compare the smallest viable set, then recommend one route.",
      reason: recall.stale_matches.length ? "Matching memory is expired." : "The answer may have changed.",
      approval_needed: false,
      verification: "Cite primary sources and record the evidence date.",
      expires_at: addDays(now, 30),
    };
  } else if (requiresExecution(goal)) {
    decision = {
      route: "codex_execute",
      memory_reused: recall.reuse_candidates.slice(0, 5),
      research_needed: false,
      recommendation: recall.reuse_candidates.length
        ? "Use the fresh receipts as constraints, then execute a new bounded task with focused tests."
        : "Create a bounded task contract and let the selected executor run focused tests.",
      reason: recall.reuse_candidates.length
        ? "Fresh memory informs this new execution but does not replace it."
        : "The objective requests a new bounded execution.",
      approval_needed: false,
      verification: "Run the focused test and return an outcome receipt.",
      expires_at: addDays(now, 30),
    };
  } else if (recall.reuse_candidates.length) {
    decision = {
      route: "reuse_receipt",
      memory_reused: recall.reuse_candidates.slice(0, 5),
      research_needed: false,
      recommendation: recall.reuse_candidates[0],
      reason: "A matching verified receipt is still fresh.",
      approval_needed: false,
      verification: "Confirm the receipt still matches the requested output.",
      expires_at: recall.fresh_matches[0]?.expires_at || "",
    };
  } else {
    decision = {
      route: "codex_execute",
      memory_reused: [],
      research_needed: false,
      recommendation: "Create a bounded task contract and let Codex execute with focused tests.",
      reason: "The objective is technical, stable and within the existing architecture.",
      approval_needed: false,
      verification: "Run the focused test and return an outcome receipt.",
      expires_at: addDays(now, 30),
    };
  }

  if (!fit.accepted) {
    decision.reason = `${decision.reason} Rejected candidate: ${fit.reason}.`;
  }
  const card = buildPreflightCard({ objective: goal, ...decision });
  return { ...card, candidate_fit: fit, estimated_tokens: estimateTokens(card), budget };
}

function formatPreflight(card = {}, options = {}) {
  const budget = options.budget || card.budget || 300;
  const lines = [
    "# KAIZEN7 PREFLIGHT",
    `Objective: ${card.objective}`,
    `Route: ${card.route}`,
    `Memory: ${(card.memory_reused || []).join(" | ") || "none"}`,
    `Research: ${card.research_needed ? "yes" : "no"}`,
    `Approval: ${card.approval_needed ? "yes" : "no"}`,
    `Recommendation: ${card.recommendation}`,
    `Verification: ${card.verification}`,
  ];
  const maxChars = budget * 4;
  const output = `${lines.join("\n")}\n`;
  return output.length <= maxChars ? output : `${output.slice(0, maxChars - 16).trimEnd()}\n[truncated]\n`;
}

module.exports = {
  buildPreflight,
  classify,
  evaluateRecommendationFit,
  formatPreflight,
  requiresExecution,
};
