const { listCapabilities } = require("./registry");

const DOMAIN_HINTS = {
  code: [/code|codigo|bug|test|tests|implementar|fix|refactor|kaizen7/i],
  content: [/reel|script|guion|mr kaizen|content|contenido|storyboard|video|flowmatik|bangkok/i],
  commerce: [/claim|claims|focux|producto|product|commerce|shopify|formula|supplier|proveedor/i],
  research: [/research|github|hugging|repo|modelo|paper|pattern|patron/i],
  memory: [/memory|memoria|obsidian|writeback|learning|aprendizaje/i],
  agent: [/agent|agente|handoff|delegate|delegar|receipt|bridge|cycle/i],
  app: [/app|application|aplicacion|connector|conectar|permisos|permissions|integration/i],
  project: [/project|proyecto|context|contexto|flowmatic|focus|mr kaizen/i],
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
  return scores[0]?.score > 0 ? scores[0].domain : "code";
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
  const capabilities = listCapabilities();
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

module.exports = {
  inferCapabilityDomain,
  approvalGatesFor,
  resolveCapabilities,
  scoreCapability,
  tokenize,
};
