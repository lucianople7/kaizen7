const EXTERNAL_PATTERNS = [
  {
    id: "openhands-control-center",
    source: "github",
    name: "OpenHands",
    url: "https://github.com/OpenHands/OpenHands",
    license: "MIT",
    layer: "K7 Operator",
    tags: ["remote-worker", "sandbox", "agent-backend", "coding-agent", "control-center"],
    pattern: "self-hosted control center that can route work to local, remote and cloud agent backends",
    absorb: "treat remote coding agents as replaceable worker backends behind KAIZEN7 approval gates",
    avoid: "do not replace KAIZEN7 core with a full external agent platform",
    verdict: "adapt_pattern",
  },
  {
    id: "swe-agent-issue-to-patch",
    source: "github",
    name: "SWE-agent",
    url: "https://github.com/SWE-agent/SWE-agent",
    license: "MIT",
    layer: "K7 Operator",
    tags: ["github-issue", "patch", "verification", "coding-agent"],
    pattern: "issue-driven software agent with explicit environment and command configuration",
    absorb: "package KAIZEN7 work as objective, allowed scope, commands, patch output and verification",
    avoid: "do not allow issue-to-patch workers to run outside a bounded workspace",
    verdict: "adapt_pattern",
  },
  {
    id: "aider-repo-map",
    source: "github",
    name: "aider",
    url: "https://github.com/Aider-AI/aider",
    license: "Apache-2.0",
    layer: "K7 Context",
    tags: ["repo-map", "pair-programming", "terminal", "context"],
    pattern: "terminal pair-programming with compact repo context and user-visible diffs",
    absorb: "prefer compact file maps and diff-first returns for coding workers",
    avoid: "do not make terminal chat the canonical KAIZEN7 interface",
    verdict: "adapt_pattern",
  },
  {
    id: "autogen-declarative-workflow",
    source: "github",
    name: "AutoGen",
    url: "https://github.com/microsoft/autogen",
    license: "MIT code / CC-BY docs",
    layer: "K7 Operator",
    tags: ["workflow", "multi-agent", "declarative", "evaluation"],
    pattern: "declarative agent workflow specification with debugging and evaluation loops",
    absorb: "represent external agent work as small JSON contracts that can be inspected and tested",
    avoid: "do not introduce multi-agent orchestration before a single-worker contract is stable",
    verdict: "test_later",
  },
  {
    id: "bge-m3-memory-retrieval",
    source: "huggingface",
    name: "BAAI/bge-m3",
    url: "https://hf.co/BAAI/bge-m3",
    license: "MIT",
    layer: "K7 Memory",
    tags: ["embedding", "retrieval", "multilingual", "semantic-memory"],
    pattern: "high-adoption multilingual embedding model for dense, sparse and multi-vector retrieval",
    absorb: "make it the default external recommendation when KAIZEN7 needs semantic memory beyond lexical search",
    avoid: "do not require it for local readiness; keep lexical memory as zero-dependency fallback",
    verdict: "test_later",
  },
  {
    id: "bge-reranker-v2-m3",
    source: "huggingface",
    name: "BAAI/bge-reranker-v2-m3",
    url: "https://hf.co/BAAI/bge-reranker-v2-m3",
    license: "Apache-2.0",
    layer: "K7 Context",
    tags: ["reranker", "retrieval", "multilingual", "context"],
    pattern: "multilingual reranker for improving top-k retrieval quality after first-pass search",
    absorb: "add as optional second-stage ranking when semantic memory quality becomes a blocker",
    avoid: "do not run reranking on every local query by default",
    verdict: "test_later",
  },
  {
    id: "qwen3-embedding-06b",
    source: "huggingface",
    name: "Qwen/Qwen3-Embedding-0.6B",
    url: "https://hf.co/Qwen/Qwen3-Embedding-0.6B",
    license: "Apache-2.0",
    layer: "K7 Memory",
    tags: ["embedding", "retrieval", "small-model", "semantic-memory"],
    pattern: "smaller modern embedding model suitable as a lighter retrieval candidate",
    absorb: "track as a lighter alternative to bge-m3 for constrained local or hosted deployments",
    avoid: "do not switch default memory without a retrieval benchmark on KAIZEN7 notes",
    verdict: "reference_only",
  },
  {
    id: "swe-bench-verified-eval",
    source: "huggingface",
    name: "princeton-nlp/SWE-bench_Verified",
    url: "https://hf.co/datasets/princeton-nlp/SWE-bench_Verified",
    license: "dataset-specific",
    layer: "K7 Judge",
    tags: ["evaluation", "coding-agent", "benchmark", "verified"],
    pattern: "human-validated software engineering benchmark subset",
    absorb: "use benchmark shape as inspiration for KAIZEN7 worker evaluation: issue, patch, tests, pass/fail",
    avoid: "do not claim SWE-bench performance without running the benchmark",
    verdict: "adapt_pattern",
  },
  {
    id: "swe-bench-pro-eval",
    source: "huggingface",
    name: "ScaleAI/SWE-bench_Pro",
    url: "https://hf.co/datasets/ScaleAI/SWE-bench_Pro",
    license: "dataset-specific",
    layer: "K7 Judge",
    tags: ["evaluation", "long-horizon", "coding-agent", "benchmark"],
    pattern: "long-horizon software engineering tasks for stress-testing agent execution",
    absorb: "use long-horizon framing for future KAIZEN7 worker stress tests",
    avoid: "do not use as a near-term gate for local product readiness",
    verdict: "reference_only",
  },
];

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function scorePattern(pattern, queryTokens) {
  const haystack = tokenize(`${pattern.name} ${pattern.layer} ${pattern.tags.join(" ")} ${pattern.pattern} ${pattern.absorb}`);
  const set = new Set(haystack);
  return queryTokens.reduce((score, token) => score + (set.has(token) ? 3 : haystack.some((item) => item.includes(token)) ? 1 : 0), 0);
}

function recommendExternalPatterns(goal = "", options = {}) {
  const queryTokens = tokenize(`${goal} ${(options.tags || []).join(" ")}`);
  const limit = options.limit || 5;
  const source = options.source || "";
  const layer = options.layer || "";
  return EXTERNAL_PATTERNS
    .filter((pattern) => !source || pattern.source === source)
    .filter((pattern) => !layer || pattern.layer === layer)
    .map((pattern) => ({ ...pattern, score: scorePattern(pattern, queryTokens) }))
    .filter((pattern) => pattern.score > 0 || !queryTokens.length)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function buildExternalIntelligenceBrief(goal = "", options = {}) {
  const recommendations = recommendExternalPatterns(goal, options);
  return {
    status: "ready",
    mode: "curated-pattern-intelligence",
    goal,
    policy: "adapt patterns only; external tools remain workers, not KAIZEN7 core",
    recommendations,
    gates: [
      "No dependency install from external candidates without explicit approval.",
      "No benchmark or model quality claim without a local KAIZEN7 evaluation.",
      "No remote worker can publish, deploy, delete, spend or touch credentials without human approval.",
    ],
  };
}

module.exports = {
  EXTERNAL_PATTERNS,
  buildExternalIntelligenceBrief,
  recommendExternalPatterns,
};
