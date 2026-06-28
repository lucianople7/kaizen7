const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildHunterRoadmap,
  buildImplementationQueue,
  buildSignalQueue,
  buildSearchQueries,
  loadHunterRegistry,
  loadSignalInbox,
} = require("../lib/hunter");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-hunter-"));
fs.mkdirSync(path.join(root, "data"), { recursive: true });
const registryPath = path.join(root, "data", "hunter-registry.json");

fs.writeFileSync(registryPath, JSON.stringify({
  modules: {
    semantic_memory: {
      status: "approved_for_prototype",
      primary: {
        source: "huggingface",
        id: "BAAI/bge-m3",
        license: "mit",
        verdict: "adopt_now",
        reason: "Multilingual embeddings",
      },
      fallback: {
        source: "huggingface",
        id: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        license: "apache-2.0",
        verdict: "adapt_pattern",
        reason: "Small fallback",
      },
    },
    web_signal_ingestion: {
      status: "approved_for_prototype",
      primary: {
        source: "github",
        id: "unclecode/crawl4ai",
        license: "apache-2.0",
        verdict: "adopt_now",
        reason: "Web to Markdown",
      },
      reference: {
        source: "github",
        id: "firecrawl/firecrawl",
        license: "agpl-3.0",
        verdict: "reference_only",
        reason: "License risk",
      },
    },
    content_video_factory: {
      status: "approved_for_design",
      primary: {
        source: "github",
        id: "remotion-dev/remotion",
        license: "custom",
        verdict: "adapt_pattern",
        reason: "Programmatic video",
      },
    },
  },
}, null, 2));

const registry = loadHunterRegistry(registryPath);
assert.equal(Object.keys(registry.modules).length, 3);

const queue = buildImplementationQueue(registry);
assert.equal(queue[0].module, "semantic_memory");
assert.equal(queue[0].candidate, "BAAI/bge-m3");
assert.equal(queue[0].blocked, false);
assert.equal(queue[0].nextStep, "prototype");
assert(queue.some((item) => item.candidate === "remotion-dev/remotion" && item.blocked), "custom license candidates should be blocked until reviewed");
assert(!queue.some((item) => item.candidate === "firecrawl/firecrawl"), "reference-only candidates should not enter implementation queue");

const queries = buildSearchQueries(registry);
assert(queries.github.some((query) => query.includes("crawl4ai")), "GitHub queries should include GitHub candidates");
assert(queries.huggingface.some((query) => query.includes("BAAI/bge-m3")), "HF queries should include HF candidates");
assert(queries.github.length <= 10, "queries should stay token compact");
assert(queries.huggingface.length <= 10, "queries should stay token compact");

const roadmap = buildHunterRoadmap(registry);
assert.equal(roadmap.lanes[0].id, "semantic_memory");
assert.equal(roadmap.lanes[0].priority, "P0");
assert(roadmap.summary.includes("3 modules"));
assert(roadmap.tokenPolicy.includes("top 3"));
assert(roadmap.lanes.every((lane) => lane.output), "each lane should have a concrete output");

const inboxPath = path.join(root, "data", "signal-inbox.json");
fs.writeFileSync(inboxPath, JSON.stringify([
  {
    source: { type: "github", url: "https://github.com/browser-use/browser-use", domain: "github.com", fetchedAt: "2026-06-26T00:00:00Z" },
    content: { title: "GitHub repository signal", summary: "Browser automation agents with Playwright.", markdown: "Repository: browser-use/browser-use\nLicense: MIT\nStars: 23000\nNext: prototype supervised adapter." },
    confidence: "high",
    destination: "task",
    nextAction: "prototype browser-use/browser-use as a supervised KAIZEN7 adapter",
    github: {
      fullName: "browser-use/browser-use",
      license: "mit",
      score: 90,
      verdict: "adopt_now",
      blocked: false,
      reasons: ["safe_license", "strong_adoption", "recent_activity"],
    },
  },
  {
    source: { type: "github", url: "https://github.com/risk/agpl-tool", domain: "github.com", fetchedAt: "2026-06-26T00:00:00Z" },
    content: { title: "AGPL tool", summary: "License risk.", markdown: "License AGPL-3.0" },
    confidence: "high",
    destination: "decision",
    nextAction: "review license before implementation",
    github: {
      fullName: "risk/agpl-tool",
      license: "agpl-3.0",
      score: 40,
      verdict: "reference_only",
      blocked: true,
      reasons: ["license_review_required"],
    },
  },
  {
    source: { type: "text", url: "", domain: "", fetchedAt: "2026-06-26T00:00:00Z" },
    content: { title: "Weak note", summary: "Maybe useful later.", markdown: "Maybe useful later." },
    confidence: "low",
    destination: "signal_bowl",
    nextAction: "store",
  },
  {
    source: { type: "huggingface", url: "https://huggingface.co/BAAI/bge-m3", domain: "huggingface.co", fetchedAt: "2026-06-26T00:00:00Z" },
    content: { title: "Hugging Face repository signal", summary: "Multilingual embedding model.", markdown: "Repository: BAAI/bge-m3\nLicense: mit\nPipeline: feature-extraction\nNext: benchmark memory." },
    confidence: "high",
    destination: "task",
    nextAction: "prototype BAAI/bge-m3 as a supervised KAIZEN7 adapter",
    huggingface: {
      repoId: "BAAI/bge-m3",
      repoType: "model",
      license: "mit",
      pipeline: "feature-extraction",
      score: 95,
      verdict: "adopt_now",
      blocked: false,
      reasons: ["safe_license", "strong_usage", "recent_activity"],
    },
  },
], null, 2));

const inbox = loadSignalInbox(inboxPath);
assert.equal(inbox.length, 4);

const signalQueue = buildSignalQueue(inbox);
assert.equal(signalQueue.length, 2);
assert(signalQueue.some((item) => item.candidate === "browser-use/browser-use" && item.source === "github"));
assert(signalQueue.some((item) => item.candidate === "BAAI/bge-m3" && item.source === "huggingface"));
assert.equal(signalQueue[0].nextStep, "prototype");
assert.equal(signalQueue[0].blocked, false);
assert(signalQueue[0].score > 100, "high-value signals should outrank ordinary research spikes");

const queueWithSignals = buildImplementationQueue(registry, { signals: inbox, limit: 5 });
assert(queueWithSignals.some((item) => item.candidate === "browser-use/browser-use" && item.origin === "signal-inbox"));
assert(queueWithSignals.some((item) => item.candidate === "BAAI/bge-m3" && item.origin === "signal-inbox"));
assert(!queueWithSignals.some((item) => item.candidate === "risk/agpl-tool"), "blocked decision signals should not enter implementation queue");

console.log("hunter engine tests passed");
