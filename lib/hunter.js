const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_REGISTRY = path.join(__dirname, "..", "data", "hunter-registry.json");
const DEFAULT_SIGNAL_INBOX = path.join(__dirname, "..", "data", "signal-inbox.json");
const SAFE_LICENSES = new Set(["mit", "apache-2.0", "bsd-3-clause", "platform"]);
const BLOCKED_LICENSES = new Set(["agpl-3.0", "gpl-3.0", "custom", "unknown"]);

const MODULE_OUTPUTS = {
  semantic_memory: "semantic search over Obsidian, Notion exports, Signal Bowl and project specs",
  web_signal_ingestion: "clean Markdown packets with source, date, links, confidence and next action",
  browser_automation: "repeatable browser tasks only after a manual workflow proves recurring value",
  vector_store: "local retrieval store for low-friction memory and RAG prototypes",
  content_video_factory: "repeatable scripts, subtitles and video templates for NEUROCITY/content",
  ocr_and_packaging_intelligence: "label, table and packaging text extraction for K7 Judge review",
  agent_evaluation: "small benchmark that proves whether a new module improves KAIZEN7",
  prototyping_runtime: "Gradio/HF Space demos for claim checkers, quizzes and internal tools",
  social_distribution: "scheduling and analytics pattern without unsafe platform automation",
};

function loadHunterRegistry(filePath = DEFAULT_REGISTRY) {
  const registry = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!registry.modules || typeof registry.modules !== "object") {
    throw new Error("Invalid Hunter registry: missing modules");
  }
  return registry;
}

function loadSignalInbox(filePath = DEFAULT_SIGNAL_INBOX) {
  if (!fs.existsSync(filePath)) return [];
  const inbox = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(inbox)) throw new Error("Invalid Signal inbox: expected array");
  return inbox;
}

function candidateEntries(moduleConfig) {
  const entries = [];
  for (const key of ["primary", "fallback", "scale_option", "transcription", "editor_reference", "mcp_reference", "reference"]) {
    if (moduleConfig[key]) entries.push({ role: key, ...moduleConfig[key] });
  }
  if (Array.isArray(moduleConfig.datasets)) {
    entries.push(...moduleConfig.datasets.map((entry) => ({ role: "dataset", ...entry })));
  }
  return entries;
}

function normalizeCandidates(registry) {
  const candidates = [];
  for (const [moduleName, moduleConfig] of Object.entries(registry.modules)) {
    for (const entry of candidateEntries(moduleConfig)) {
      candidates.push({
        module: moduleName,
        role: entry.role,
        candidate: entry.id || entry.source || "unknown",
        source: entry.source || "unknown",
        license: (entry.license || "unknown").toLowerCase(),
        verdict: entry.verdict || "test_later",
        status: moduleConfig.status || "",
        reason: entry.reason || "",
        url: entry.url || "",
      });
    }
  }
  return candidates;
}

function scoreCandidate(candidate) {
  let score = 0;
  if (candidate.verdict === "adopt_now") score += 100;
  if (candidate.verdict === "adapt_pattern") score += 75;
  if (candidate.verdict === "test_later") score += 45;
  if (/approved/i.test(candidate.status)) score += 20;
  if (["semantic_memory", "web_signal_ingestion", "agent_evaluation"].includes(candidate.module)) score += 20;
  if (SAFE_LICENSES.has(candidate.license)) score += 10;
  if (BLOCKED_LICENSES.has(candidate.license)) score -= 30;
  return score;
}

function nextStepFor(candidate) {
  if (candidate.verdict === "adopt_now") return "prototype";
  if (candidate.verdict === "adapt_pattern") return "design_adapter";
  return "research_spike";
}

function isBlocked(candidate) {
  return BLOCKED_LICENSES.has(candidate.license);
}

function signalCandidate(signal) {
  const github = signal.github || {};
  const huggingface = signal.huggingface || {};
  const frontier = signal.frontier || null;
  const candidate = github.fullName || huggingface.repoId || signal.source?.url || signal.content?.title || "unknown";
  const license = (github.license || huggingface.license || "unknown").toLowerCase();
  const verdict = github.verdict || huggingface.verdict || (signal.destination === "task" ? "adapt_pattern" : "test_later");
  const blocked = Boolean(github.blocked) || Boolean(huggingface.blocked) || signal.destination === "decision" || ["reference_only", "reject"].includes(verdict) || (BLOCKED_LICENSES.has(license) && !frontier);
  const baseScore = Number(github.score || huggingface.score || 0);
  const confidenceScore = signal.confidence === "high" ? 30 : signal.confidence === "medium" ? 15 : 0;
  const actionScore = signal.destination === "task" ? 25 : signal.destination === "research" ? 10 : 0;
  const frontierScore = frontier ? { P0: 40, P1: 30, P2: 20, P3: 10 }[frontier.priority] || 10 : 0;
  return {
    origin: frontier ? "frontier-watch" : "signal-inbox",
    module: github.module || moduleFromSignal(signal),
    role: "signal",
    candidate,
    source: signal.source?.type || "signal",
    license,
    verdict,
    status: signal.destination || "",
    reason: signal.content?.summary || signal.nextAction || "",
    url: signal.source?.url || "",
    score: baseScore + confidenceScore + actionScore + frontierScore,
    blocked,
    nextStep: verdict === "adopt_now" ? "prototype" : verdict === "adapt_pattern" ? "design_adapter" : "research_spike",
    output: MODULE_OUTPUTS[moduleFromSignal(signal)] || "verified improvement packet",
    nextAction: signal.nextAction || "",
    fetchedAt: signal.source?.fetchedAt || "",
    frontier: frontier ? {
      targetId: frontier.targetId || "",
      priority: frontier.priority || "P3",
      kind: frontier.kind || "",
    } : null,
  };
}

function moduleFromSignal(signal) {
  const frontier = signal.frontier || null;
  if (frontier?.kind === "agent") return "agent_evaluation";
  if (frontier?.kind === "mcp") return "web_signal_ingestion";
  if (frontier?.kind === "cli") return "browser_automation";
  if (frontier?.kind === "sdk") return "prototyping_runtime";
  if (frontier?.kind === "api") return "web_signal_ingestion";
  const huggingface = signal.huggingface || {};
  if (huggingface.repoType === "space") return "prototyping_runtime";
  if (huggingface.repoType === "dataset") return "agent_evaluation";
  if (/feature-extraction|sentence-similarity|embedding/i.test(huggingface.pipeline || "")) return "semantic_memory";
  const text = `${signal.content?.title || ""} ${signal.content?.summary || ""} ${signal.content?.markdown || ""}`.toLowerCase();
  const tools = (signal.signals?.tools || []).join(" ").toLowerCase();
  if (/browser|playwright|browser-use/.test(`${text} ${tools}`)) return "browser_automation";
  if (/crawl|markdown|web/.test(`${text} ${tools}`)) return "web_signal_ingestion";
  if (/embedding|retrieval|bge|memory/.test(`${text} ${tools}`)) return "semantic_memory";
  if (/ocr|packaging|label/.test(`${text} ${tools}`)) return "ocr_and_packaging_intelligence";
  if (/video|remotion|shorts|reels/.test(`${text} ${tools}`)) return "content_video_factory";
  return "web_signal_ingestion";
}

function buildSignalQueue(signals = [], options = {}) {
  const limit = options.limit || 10;
  return signals
    .map(signalCandidate)
    .filter((candidate) => !candidate.blocked && candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildImplementationQueue(registry, options = {}) {
  const limit = options.limit || 12;
  const registryQueue = normalizeCandidates(registry)
    .filter((candidate) => !["reference_only", "reject"].includes(candidate.verdict))
    .map((candidate) => ({
      origin: "registry",
      ...candidate,
      score: scoreCandidate(candidate),
      blocked: isBlocked(candidate),
      nextStep: nextStepFor(candidate),
      output: MODULE_OUTPUTS[candidate.module] || "verified improvement packet",
    }));
  const signalQueue = buildSignalQueue(options.signals || []);
  return [...registryQueue, ...signalQueue]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildSearchQueries(registry, options = {}) {
  const limit = options.limit || 10;
  const github = [];
  const huggingface = [];
  for (const candidate of normalizeCandidates(registry)) {
    if (candidate.verdict === "reject") continue;
    if (candidate.source === "github") {
      github.push(`repo:${candidate.candidate} releases license issues`);
      github.push(`${candidate.candidate} examples integration docs`);
    }
    if (candidate.source === "huggingface") {
      huggingface.push(`${candidate.candidate} model dataset space license examples`);
      if (candidate.module) huggingface.push(`${candidate.module} ${candidate.candidate}`);
    }
  }
  return {
    github: [...new Set(github)].slice(0, limit),
    huggingface: [...new Set(huggingface)].slice(0, limit),
  };
}

function priorityFor(lane) {
  const top = lane.queue[0];
  if (!top) return "P3";
  if (top.verdict === "adopt_now" && !top.blocked) return "P0";
  if (top.verdict === "adapt_pattern" && !top.blocked) return "P1";
  return "P2";
}

function buildHunterRoadmap(registry) {
  const queue = buildImplementationQueue(registry, { limit: 50 });
  const lanes = Object.keys(registry.modules).map((moduleName) => {
    const moduleQueue = queue.filter((item) => item.module === moduleName);
    return {
      id: moduleName,
      priority: priorityFor({ queue: moduleQueue }),
      output: MODULE_OUTPUTS[moduleName] || "verified improvement packet",
      candidates: moduleQueue.slice(0, 3),
    };
  }).sort((a, b) => a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id));
  return {
    summary: `${lanes.length} modules mapped for daily evolution`,
    tokenPolicy: "Run top 3 actions first; keep reference-only items out of execution context.",
    lanes,
  };
}

module.exports = {
  buildHunterRoadmap,
  buildImplementationQueue,
  buildSignalQueue,
  buildSearchQueries,
  loadHunterRegistry,
  loadSignalInbox,
  normalizeCandidates,
  scoreCandidate,
};

if (require.main === module) {
  const command = process.argv[2] || "roadmap";
  const registry = loadHunterRegistry();
  const signals = loadSignalInbox();
  const output = command === "queue"
    ? buildImplementationQueue(registry, { signals }).slice(0, 10)
    : command === "queries"
      ? buildSearchQueries(registry)
      : command === "signals"
        ? buildSignalQueue(signals)
      : buildHunterRoadmap(registry);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}
