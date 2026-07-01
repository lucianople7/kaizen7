const { buildAgentContract } = require("./agent-contract");
const { resolveCapabilities } = require("./resolver");

const FORBIDDEN_ACTIONS = [
  "publish",
  "deploy",
  "delete",
  "spend",
  "credential_write",
  "install_dependencies_without_approval",
];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function defaultAllowedFiles(plan) {
  if (plan.inferredDomain === "code" || plan.inferredDomain === "kernel") {
    return ["lib/capabilities/", "tests/capabilities.test.js", "data/capabilities.json"];
  }
  return ["data/capabilities.json", "docs/CAPABILITY_KERNEL.md"];
}

function defaultContext() {
  return [
    "docs/ARCHITECTURE.md",
    "docs/superpowers/specs/2026-07-01-kaizen7-capability-kernel-design.md",
    "Obsidian/Flowmatik/Arquitectura/KAIZEN7 Clean Start Method 2026-07-01.md",
  ];
}

function buildCapabilityPacket(objective = "", options = {}) {
  const plan = options.plan || resolveCapabilities(objective, options);
  const agentContract = options.agentContract || buildAgentContract(objective, { ...options, plan });

  return {
    version: 1,
    mode: "k7-execution-packet",
    objective,
    operator: options.operator || "codex",
    agent_contract: agentContract,
    capabilities: plan.selected.map((capability) => capability.id),
    capability_plan: {
      inferred_domain: plan.inferredDomain,
      approval_gates: plan.approvalGates,
      verification: plan.verification,
      missing_inputs: plan.missingInputs || [],
    },
    allowed_files: unique(options.allowedFiles || defaultAllowedFiles(plan)),
    context: unique(options.context || defaultContext()),
    forbidden_actions: FORBIDDEN_ACTIONS,
    commands: unique(["node tests/capabilities.test.js", "npm.cmd run check"]),
    evidence_required: ["diff", "tests", "risks"],
    expected_output: {
      claims: "What changed and why.",
      evidence: "Exact commands and results.",
      risks: "Remaining risks or approvals.",
      memory_draft: "Reusable learning only.",
    },
    writeback: {
      target: "Obsidian/Flowmatik/Arquitectura/",
      rule: "write only reusable learning; no secrets",
      mode: "draft_only",
    },
  };
}

module.exports = {
  FORBIDDEN_ACTIONS,
  buildCapabilityPacket,
};
