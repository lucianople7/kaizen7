const { listCapabilities } = require("./registry");

const DOMAIN_HINTS = {
  super: [/super|mega|ecosistema|ecosystem|orquest|orquestar|rapido|eficaz|menos pasos|less steps|siguiente mejor|next best|tarjeta|run card|ejecucion compacta|veredicto|cierre|cerrar|aprendizaje mutuo|mutual learning|headroom|graphy|ponytail|memory plane|memoria operativa/i],
  world: [/world|mcp|clips|clip|artifact|artefacto/i],
  kernel: [/kernel|capability|capacidad|skill|habilidad|forge|forjar|registry|resolver/i],
  code: [/code|codigo|bug|test|tests|implementar|fix|refactor|kaizen7/i],
  content: [/reel|script|guion|kaizen|content|contenido|storyboard|video|flowmatik|bangkok/i],
  commerce: [/claim|claims|focux|producto|product|commerce|shopify|formula|supplier|proveedor/i],
  research: [/research|github|hugging|repo|modelo|paper|pattern|patron/i],
  memory: [/memory|memoria|obsidian|writeback|learning|aprendizaje/i],
  agent: [/agent|agente|handoff|delegate|delegar|receipt|bridge|cycle/i],
  app: [/app|application|aplicacion|connector|conectar|permisos|permissions|integration/i],
  project: [/project|proyecto|context|contexto|flowmatic|focus|kaizen/i],
};

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9_]+/i)
    .filter(Boolean);
}

function inferCapabilityDomain(objective = "") {
  const text = String(objective);
  const scores = Object.entries(DOMAIN_HINTS).map(([domain, patterns]) => {
    const score = patterns.reduce((total, pattern) => total + (pattern.test(text) ? 1 : 0), 0);
    return { domain, score };
  });

  scores.sort((left, right) => right.score - left.score);
  // Fallback intencional a null (no "code"): un prompt generico que no
  // matchea ningun dominio no deberia heredar los approval gates de
  // code.change (delete, credential_write, install_dependencies) solo por
  // el bonus de +5 que scoreCapability() da cuando domain === inferredDomain.
  return scores[0]?.score > 0 ? scores[0].domain : null;
}

function scoreCapability(tokens, capability, inferredDomain) {
  const searchableTokens = new Set(tokenize([
    capability.id,
    capability.domain,
    capability.description,
    ...(capability.triggers || []),
    ...(capability.keywords || []),
  ].join(" ")));

  const keywordScore = tokens.reduce((score, token) => {
    return searchableTokens.has(token) ? score + 2 : score;
  }, 0);

  const domainScore = capability.domain === inferredDomain ? 5 : 0;
  const stabilityScore = capability.status === "stable" ? 1 : 0;

  return domainScore + keywordScore + stabilityScore;
}

function expandRequires(selected, capabilitiesById) {
  const output = [];
  const seen = new Set();

  function add(capability) {
    if (!capability || seen.has(capability.id)) return;
    seen.add(capability.id);
    output.push(capability);
  }

  for (const capability of selected) {
    add(capability);
    for (const required of capability.requires || []) {
      add(capabilitiesById.get(required));
    }
  }

  return output;
}

function approvalGatesFor(capability) {
  return capability.approvalGates || capability.approval || [];
}

function resolveCapabilities(objective = "", options = {}) {
  // options.root lets callers anchor the registry lookup to an absolute path
  // instead of process.cwd() (this module is imported both from kaizen7/ and
  // from thefocuxOS/ via the Mastra kernel, which have different cwds).
  const capabilities = listCapabilities({ root: options.root });
  const capabilitiesById = new Map(capabilities.map((capability) => [capability.id, capability]));
  const inferredDomain = options.domain || inferCapabilityDomain(objective);
  const tokens = tokenize(objective);
  const limit = options.limit || 3;

  const ranked = capabilities
    .map((capability) => ({
      capability,
      score: scoreCapability(tokens, capability, inferredDomain),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.capability.id.localeCompare(right.capability.id);
    })
    .slice(0, limit)
    .map((entry) => entry.capability);

  const selected = expandRequires(ranked, capabilitiesById);

  return {
    status: selected.length > 0 ? "ready" : "needs_triage",
    objective,
    inferredDomain,
    selected,
    approvalGates: unique(selected.flatMap(approvalGatesFor)),
    verification: unique(selected.flatMap((capability) => capability.verification || [])),
  };
}

function normalizeMission(mission = {}) {
  return {
    goal: String(mission.goal || mission.objective || "").trim(),
    capability: String(mission.route || mission.capability || mission.skill || "").trim(),
    context_files: mission.context_files || mission.contextFiles || [],
    constraints: mission.constraints || [],
    acceptance_tests: mission.acceptance_tests || mission.acceptanceTests || [],
    risks: mission.risks || [],
    priority: mission.priority,
    estimated_scope: mission.estimated_scope || mission.estimatedScope,
  };
}

function resolveMissionContext(mission = {}, options = {}) {
  const normalized = normalizeMission(mission);
  const objective = [
    normalized.goal,
    normalized.capability,
    ...normalized.context_files,
  ].filter(Boolean).join(" ");
  const resolved = resolveCapabilities(objective, options);
  const selected = resolved.selected[0];
  const capability = normalized.capability || selected?.id || "needs_triage";
  const providedFiles = normalized.context_files.length;
  const contextFiles = unique([
    "AGENTS.md",
    "KAIZEN7_CONTEXT.md",
    ...normalized.context_files,
    ...(selected?.contextFiles || selected?.context_files || []),
  ]);

  return {
    status: resolved.status,
    goal: normalized.goal || "prepare KAIZEN7 mission",
    capability,
    priority: normalized.priority,
    estimated_scope: normalized.estimated_scope,
    context_files: contextFiles,
    constraints: normalized.constraints.length ? normalized.constraints : [
      "Keep scope small.",
      "Use skills and metaskills before adding new system layers.",
      "Do not publish, deploy, spend, delete, or touch credentials without explicit approval.",
    ],
    acceptance_tests: normalized.acceptance_tests.length ? normalized.acceptance_tests : [
      "Output is reusable or reduces future steps, tokens, context, or errors.",
      "Verification is reported.",
    ],
    risks: normalized.risks,
    next_action: resolved.status === "ready" ? "build_mission_brief" : "triage_skill_route",
    context_efficiency: {
      provided_files: providedFiles,
      selected_files: contextFiles.length,
      dropped_files: [],
      reduction_ratio: providedFiles ? Math.max(0, 1 - (contextFiles.length / providedFiles)) : 0,
    },
    legacy_resolution: resolved,
  };
}

module.exports = {
  inferCapabilityDomain,
  approvalGatesFor,
  resolveMissionContext,
  resolveCapabilities,
  scoreCapability,
  tokenize,
};
