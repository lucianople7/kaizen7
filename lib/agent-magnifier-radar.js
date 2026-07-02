const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

const CANDIDATES = [
  {
    id: "projectmem",
    name: "projectmem",
    url: "https://github.com/riponcm/projectmem",
    layer: "K7 Memory Governance",
    license: "MIT",
    default_decision: "adopt_now_pattern",
    fit: ["local_first", "mcp", "memory", "judgment", "pre_action_gate", "no_telemetry"],
    risks: ["python_runtime", "new_project"],
    pattern:
      "Append-only local event log, compact agent summaries, stale-memory checks and pre-action warnings before repeated failed work.",
    kaizen7_adaptation:
      "Build a local memory-governance gate that warns Codex or any agent before repeating failed fixes, touching fragile files or ignoring prior decisions.",
  },
  {
    id: "deterministic-control-plane",
    name: "Deterministic Control Plane for LLM Coding Agents",
    url: "https://arxiv.org/abs/2606.26924",
    layer: "K7 Scope",
    license: "paper",
    default_decision: "adopt_now_pattern",
    fit: ["permissions", "supply_chain", "audit_log", "agent_config", "lockfile"],
    risks: ["paper_not_repo"],
    pattern:
      "Content-addressed agent definitions, signed lockfiles, hash-chained audit logs, tiered permissions and prompt-drift detection.",
    kaizen7_adaptation:
      "Treat AGENTS.md, skills, MCP configs and capability manifests as managed supply-chain inputs with hashes and explicit permission tiers.",
  },
  {
    id: "code2mcp",
    name: "Code2MCP",
    url: "https://github.com/DEFENSE-SEU/Code2MCP",
    layer: "Universal Capability Forge",
    license: "MIT",
    default_decision: "adapt_pattern",
    fit: ["mcp", "repo_to_tool", "adapter_generation", "run_review_fix"],
    risks: ["llm_required", "cloud_deploy_default"],
    pattern:
      "Analyze a repository, generate an MCP service, run it, review it, fix it and produce a report.",
    kaizen7_adaptation:
      "Build a local-only Capability MCP Builder that creates minimal wrappers for selected repos without deploying externally by default.",
  },
  {
    id: "archon",
    name: "Archon",
    url: "https://github.com/coleam00/Archon",
    layer: "K7 Harness",
    license: "open_source",
    default_decision: "adapt_pattern",
    fit: ["dag", "workflow", "plan_implement_validate", "worktree", "multi_agent_review"],
    risks: ["large_framework", "agent_specific"],
    pattern:
      "Deterministic agent workflows, Plan-Implement-Validate loops, worktree isolation and multi-agent review.",
    kaizen7_adaptation:
      "Add K7 Harness DAG packets so repeated missions run as verifiable phases instead of loose prompts.",
  },
  {
    id: "mcp-registry",
    name: "MCP Registry",
    url: "https://github.com/modelcontextprotocol/registry",
    layer: "Provider Radar",
    license: "Apache-2.0",
    default_decision: "adopt_as_signal_source",
    fit: ["mcp", "tool_discovery", "ecosystem", "standard"],
    risks: ["registry_preview", "tool_trust_needed"],
    pattern:
      "Registry of MCP servers, acting as a discovery layer for agent tools.",
    kaizen7_adaptation:
      "Provider Radar should check MCP Registry candidates before inventing a new adapter.",
  },
  {
    id: "mcp-reference-servers",
    name: "MCP reference servers",
    url: "https://github.com/modelcontextprotocol/servers",
    layer: "Provider Radar",
    license: "Apache-2.0",
    default_decision: "adopt_as_reference",
    fit: ["mcp", "filesystem", "git", "memory", "fetch", "time"],
    risks: ["reference_not_production"],
    pattern:
      "Official reference servers for filesystems, git, memory, fetch, time and sequential thinking.",
    kaizen7_adaptation:
      "Use as adapter contract examples and security baselines, not as blind production defaults.",
  },
  {
    id: "codebase-memory",
    name: "Codebase-Memory",
    url: "https://arxiv.org/abs/2603.27277",
    layer: "K7 Code Intelligence",
    license: "paper",
    default_decision: "test_later",
    fit: ["tree_sitter", "code_graph", "mcp", "impact_analysis", "token_reduction"],
    risks: ["graph_stack_complexity"],
    pattern:
      "Tree-Sitter code graph via MCP for structural queries, call graph traversal and impact analysis.",
    kaizen7_adaptation:
      "Start with a small local code-map and promote to graph intelligence only when repo navigation becomes a bottleneck.",
  },
  {
    id: "context-mode",
    name: "Context Mode",
    url: "https://github.com/mksglu/context-mode",
    layer: "K7 Context",
    license: "Elastic-2.0",
    default_decision: "already_adapted_pattern",
    fit: ["context_firewall", "tool_output_sandbox", "session_memory", "hooks"],
    risks: ["source_available_license"],
    pattern:
      "Store heavy tool output outside the prompt and feed agents compact references.",
    kaizen7_adaptation:
      "Already adapted as lib/context-firewall.js; next step is automatic capture from forge sessions.",
  },
  {
    id: "agent-sandbox",
    name: "agent-sandbox",
    url: "https://github.com/agent-sandbox/agent-sandbox",
    layer: "K7 Scope",
    license: "Apache-2.0",
    default_decision: "test_later",
    fit: ["sandbox", "untrusted_code", "browser_use", "computer_use", "e2b_compatible"],
    risks: ["kubernetes_heavy", "ops_cost"],
    pattern:
      "Per-agent isolated runtime for untrusted generated code, browser use, computer use and shell execution.",
    kaizen7_adaptation:
      "Absorb sandbox policy manifests now; only adopt runtime when local workspace isolation is insufficient.",
  },
  {
    id: "openhands",
    name: "OpenHands",
    url: "https://github.com/OpenHands/OpenHands",
    layer: "External Worker",
    license: "MIT",
    default_decision: "connect_not_core",
    fit: ["software_agent", "sandbox", "ui", "worker_backend"],
    risks: ["large_runtime", "duplicate_core"],
    pattern:
      "Generalist software-development agent with sandboxed execution and UI.",
    kaizen7_adaptation:
      "Keep as a worker provider target for K7 handoffs, not as KAIZEN7 core.",
  },
  {
    id: "playwright",
    name: "Playwright",
    url: "https://github.com/microsoft/playwright",
    layer: "K7 Browser Operator",
    license: "Apache-2.0",
    default_decision: "adopt_as_tooling_standard",
    fit: ["browser", "automation", "testing", "screenshots", "traces"],
    risks: ["browser_install_size"],
    pattern:
      "Cross-browser automation with screenshots, traces and reliable test runner.",
    kaizen7_adaptation:
      "Use as the default evidence-producing browser substrate for web tasks and UI validation.",
  },
  {
    id: "agent-supply-chain-risk",
    name: "Agent supply-chain risk",
    url: "https://www.tomshardware.com/tech-industry/cyber-security/ai-coding-agents-can-be-tricked-into-installing-malware-via-clean-github-repositories-mozillas-0din-team-shows-how-claude-code-can-be-exploited-by-its-own-helpfulness",
    layer: "K7 Scope",
    license: "research_signal",
    default_decision: "adopt_guardrail_now",
    fit: ["security", "repo_trust", "install_gate", "prompt_injection", "network_gate"],
    risks: ["news_source"],
    pattern:
      "Agents can be tricked into installing malicious code from apparently clean repositories.",
    kaizen7_adaptation:
      "Add a trust gate before clone/install/run: license, scripts, network calls, secrets exposure and human approval for untrusted setup.",
  },
];

const WEIGHTS = {
  local_first: 5,
  no_telemetry: 4,
  mcp: 4,
  memory: 5,
  judgment: 5,
  pre_action_gate: 5,
  permissions: 5,
  supply_chain: 5,
  audit_log: 4,
  lockfile: 4,
  repo_to_tool: 5,
  adapter_generation: 4,
  run_review_fix: 4,
  dag: 4,
  workflow: 3,
  plan_implement_validate: 5,
  tool_discovery: 4,
  standard: 3,
  code_graph: 3,
  token_reduction: 4,
  context_firewall: 5,
  sandbox: 4,
  untrusted_code: 5,
  browser: 3,
  automation: 3,
  testing: 4,
  security: 5,
  repo_trust: 5,
  install_gate: 5,
};

function scoreCandidate(candidate) {
  const base = candidate.fit.reduce((total, key) => total + (WEIGHTS[key] || 1), 0);
  const riskPenalty = candidate.risks.length;
  const bonus = candidate.default_decision.includes("adopt") ? 5 : 0;
  return base + bonus - riskPenalty;
}

function getMagnifierRadar(options = {}) {
  const limit = options.limit || CANDIDATES.length;
  const layer = options.layer;
  return CANDIDATES
    .filter((candidate) => !layer || candidate.layer.toLowerCase().includes(String(layer).toLowerCase()))
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate),
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function buildMacroSearchPacket(options = {}) {
  const ranked = getMagnifierRadar(options);
  return {
    schema: "kaizen7.agent_magnifier_radar.v1",
    generated_at: new Date().toISOString(),
    objective:
      "Magnify KAIZEN7 as a Universal Capability Forge for Codex, Claude Code, OpenHands and generic agents.",
    filters: [
      "free_or_open_source_first",
      "cpu_or_local_first_when_practical",
      "mcp_or_agent_readable_interface",
      "evidence_before_install",
      "no_cloud_or_paid_default",
      "security_gate_before_untrusted_run",
    ],
    ranked,
    next_build_order: ranked.slice(0, 5).map((candidate) => ({
      id: candidate.id,
      layer: candidate.layer,
      decision: candidate.default_decision,
      adaptation: candidate.kaizen7_adaptation,
    })),
  };
}

function writeMacroSearchPacket(root = ROOT) {
  const file = path.join(root, "content_library", "evolution", "agent-magnifier-radar.json");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(buildMacroSearchPacket(), null, 2)}\n`, "utf8");
  return file;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || "rank";
  if (command === "write") {
    const file = writeMacroSearchPacket();
    process.stdout.write(`${file}\n`);
  } else {
    process.stdout.write(`${JSON.stringify(buildMacroSearchPacket(), null, 2)}\n`);
  }
}

module.exports = {
  buildMacroSearchPacket,
  getMagnifierRadar,
  writeMacroSearchPacket,
};
