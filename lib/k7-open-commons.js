const COMMONS_CANDIDATES = [
  {
    id: "local-first-memory",
    lane: "memory",
    examples: ["Recall", "projectmem", "MemoryOS patterns"],
    use_when: "An agent needs to resume without replaying broad history.",
    absorb: "append-only event log, compact context, trust boundary, redaction and deterministic summaries",
    avoid: "sending private project memory to a paid summarizer by default",
  },
  {
    id: "terminal-agent-harness",
    lane: "agent-execution",
    examples: ["OPENDEV patterns", "OpenClaw-style local agent", "user-provided coding agents"],
    use_when: "A developer wants agent work from the terminal with local project context.",
    absorb: "planner/executor separation, lazy tool discovery, context compaction and explicit phases",
    avoid: "hard-wiring one IDE, one model provider or one cloud runtime",
  },
  {
    id: "browser-automation",
    lane: "external-tools",
    examples: ["Playwright", "browser-use patterns", "PageGuide/SuperBrowser research patterns"],
    use_when: "The useful workflow exists in a browser and no stable API exists.",
    absorb: "DOM evidence, screenshots, step ledger, bounded actions and human approval on credentials",
    avoid: "credentialed browser actions without trust gate and dry-run evidence",
  },
  {
    id: "mcp-and-tool-sandbox",
    lane: "tool-trust",
    examples: ["MCP SandboxScan pattern", "WASM/WASI sandboxing", "static manifest review"],
    use_when: "A tool, MCP server or connector is proposed by the user or project.",
    absorb: "permission manifest, runtime provenance, source-to-sink checks and audit receipt",
    avoid: "trusting tool descriptions, metadata or server claims as instructions",
  },
  {
    id: "open-observability",
    lane: "production",
    examples: ["OpenTelemetry", "OpenInference", "self-hosted Langfuse", "self-hosted Phoenix"],
    use_when: "A team needs traces, evals, costs and latency without vendor lock-in.",
    absorb: "neutral JSON traces first, optional OTLP export later",
    avoid: "building a full paid observability backend inside KAIZEN7",
  },
  {
    id: "local-model-runtime",
    lane: "model-runtime",
    examples: ["llama.cpp-compatible runtimes", "Ollama-compatible local models", "user-provided endpoints"],
    use_when: "The user wants free or private inference where quality is sufficient.",
    absorb: "bring-your-own model endpoint contract and fallback routing",
    avoid: "requiring OpenAI, Anthropic, cloud credits or one hosted API",
  },
  {
    id: "repo-pattern-hunting",
    lane: "self-improvement",
    examples: ["GitHub repos", "papers with code", "awesome lists", "project-specific scripts"],
    use_when: "KAIZEN7 lacks a route and a mature free pattern likely exists.",
    absorb: "interfaces, tests, receipts, scoring and small adapters",
    avoid: "copying whole frameworks or adding dependencies before repeated proof",
  },
];

function buildOpenCommonsPack(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "keep KAIZEN7 free-first, open and agent-agnostic";
  const ranked = rankCandidates(goal);
  return {
    schema: "kaizen7.open_commons_pack.v1",
    objective: goal,
    identity: "KAIZEN7 open commons pack",
    doctrine: "Free-first. Local-first when possible. Bring your own tools. No vendor lock-in. Receipts decide.",
    agent_agnostic: true,
    paid_services_policy: {
      default: "do not require paid services",
      allowed_only_when: [
        "the human explicitly approves",
        "a free/local path is insufficient",
        "cost and credential risk are visible",
        "the route remains replaceable",
      ],
      never_store: ["API keys", "tokens", "billing credentials", "private cookies"],
    },
    bring_your_own_connections: [
      "local CLI",
      "MCP server",
      "browser automation",
      "desktop app adapter",
      "file import/export",
      "local model endpoint",
      "self-hosted observability",
      "repo-derived script",
      "manual human approval step",
    ],
    ranked_candidates: ranked,
    selection_rules: [
      "Prefer an existing local script, receipt or command before any framework.",
      "Prefer free/open/local routes before hosted or paid services.",
      "Accept any user-provided connector only after k7 trust.",
      "Use repo hunting to absorb patterns, not platforms.",
      "Promote a route only after repeated verified receipts.",
      "Keep every provider replaceable through a manifest and receipt.",
    ],
    route_contract: {
      name: "",
      type: "cli | mcp | browser | desktop | file_exchange | local_model | observability | repo_script | manual",
      cost: "free | user-provided | paid-approved",
      local_first: true,
      requires_credentials: false,
      command_or_endpoint: "",
      dry_run: "",
      verify: "",
      receipt_required: true,
      discard_when: "",
    },
    next_commands: [
      `npm.cmd run k7 -- trust "${shellSafeText(goal)}"`,
      `npm.cmd run k7 -- eval "${shellSafeText(goal)}"`,
      `npm.cmd run k7 -- recall "${shellSafeText(goal)}"`,
      "npm.cmd run k7 -- remember \"<receipt-json>\"",
    ],
  };
}

function rankCandidates(goal = "") {
  const terms = tokenize(goal);
  return COMMONS_CANDIDATES
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, terms),
    }))
    .sort((left, right) => right.score - left.score);
}

function scoreCandidate(candidate, terms) {
  if (!terms.length) return 1;
  const haystack = [
    candidate.id,
    candidate.lane,
    candidate.use_when,
    candidate.absorb,
    candidate.avoid,
    ...candidate.examples,
  ].join(" ").toLowerCase();
  return terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0) || 1;
}

function formatOpenCommonsPack(pack = buildOpenCommonsPack()) {
  return [
    "# KAIZEN7 OPEN COMMONS PACK",
    "",
    `Objective: ${pack.objective}`,
    `Doctrine: ${pack.doctrine}`,
    "",
    "## Free-First Policy",
    `- Default: ${pack.paid_services_policy.default}`,
    ...pack.paid_services_policy.allowed_only_when.map((item) => `- Paid allowed only when: ${item}`),
    "",
    "## Bring Your Own Connections",
    ...pack.bring_your_own_connections.map((item) => `- ${item}`),
    "",
    "## Ranked Candidates",
    ...pack.ranked_candidates.map((item) => `- ${item.id}: ${item.use_when} Absorb: ${item.absorb}. Avoid: ${item.avoid}.`),
    "",
    "## Selection Rules",
    ...pack.selection_rules.map((item) => `- ${item}`),
    "",
    "## Route Contract",
    ...Object.keys(pack.route_contract).map((key) => `${key}:`),
    "",
    "## Next Commands",
    ...pack.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  COMMONS_CANDIDATES,
  buildOpenCommonsPack,
  formatOpenCommonsPack,
  rankCandidates,
};
