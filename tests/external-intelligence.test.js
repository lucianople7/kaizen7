const assert = require("node:assert/strict");
const {
  EXTERNAL_PATTERNS,
  buildExternalIntelligenceBrief,
  recommendExternalPatterns,
} = require("../lib/external-intelligence");

assert(EXTERNAL_PATTERNS.some((item) => item.id === "openhands-control-center"));
assert(EXTERNAL_PATTERNS.some((item) => item.id === "bge-m3-memory-retrieval"));

const workers = recommendExternalPatterns("remote coding worker with sandbox and tests", { limit: 3 });
assert(workers.some((item) => item.id === "openhands-control-center"));
assert(workers.some((item) => item.source === "github"));

const memory = recommendExternalPatterns("semantic memory embedding retrieval multilingual", {
  source: "huggingface",
  limit: 3,
});
assert(memory.some((item) => item.id === "bge-m3-memory-retrieval"));
assert(memory.every((item) => item.source === "huggingface"));

const brief = buildExternalIntelligenceBrief("evaluate coding agents with verified benchmark", {
  tags: ["evaluation", "coding-agent"],
});
assert.equal(brief.status, "ready");
assert.equal(brief.policy.includes("workers, not KAIZEN7 core"), true);
assert(brief.gates.some((gate) => gate.includes("No benchmark")));
assert(brief.recommendations.some((item) => item.id === "swe-bench-verified-eval"));

console.log("external intelligence tests passed");
