const { resolveCapabilities } = require("./resolver");

const DOMAIN_INTENTS = {
  code: "code_change",
  content: "content_creation",
  commerce: "commerce_work",
  research: "research_intake",
  memory: "memory_writeback",
  video: "video_planning",
  kernel: "kernel_improvement",
};

const DOMAIN_CAPABILITIES = {
  code: ["modify_code", "verify_result", "report_risks"],
  content: ["shape_content", "check_claims", "report_risks"],
  commerce: ["check_claims", "shape_offer", "report_risks"],
  research: ["inspect_sources", "extract_patterns", "report_risks"],
  memory: ["draft_memory", "avoid_secrets"],
  video: ["plan_artifacts", "report_risks"],
  kernel: ["improve_kernel", "verify_result", "report_risks"],
};

const DEFAULT_ROUTE = ["understand_scope", "act_within_boundary", "verify_result", "report_risks", "draft_memory"];
const CODE_ROUTE = ["understand_scope", "modify_code", "verify_result", "report_risks", "draft_memory"];
const CONTENT_ROUTE = ["understand_scope", "shape_content", "check_claims", "report_risks", "draft_memory"];
const RESEARCH_ROUTE = ["understand_scope", "inspect_sources", "extract_patterns", "report_risks", "draft_memory"];

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function inferAgentIntent(plan = {}, objective = "") {
  const domain = plan.inferredDomain || "";
  if (/kernel|capabilit|contract/i.test(objective) && domain === "code") return "kernel_improvement";
  return DOMAIN_INTENTS[domain] || "general_work";
}

function buildAgentRoute(plan = {}) {
  if (plan.inferredDomain === "code" || plan.inferredDomain === "kernel") return CODE_ROUTE;
  if (["content", "commerce", "video"].includes(plan.inferredDomain)) return CONTENT_ROUTE;
  if (plan.inferredDomain === "research") return RESEARCH_ROUTE;
  return DEFAULT_ROUTE;
}

function buildBoundary(plan = {}) {
  return {
    scope: "smallest_useful_change",
    avoid: unique([
      "broad_refactor",
      "secrets",
      "external_publish",
      "unapproved_delete",
      ...(plan.approvalGates || []).map((gate) => `unapproved_${gate}`),
    ]),
  };
}

function buildAgentContract(objective = "", options = {}) {
  const plan = options.plan || resolveCapabilities(objective, options);
  const domain = plan.inferredDomain || "general";

  return {
    schema: "kaizen7.agent_contract.v1",
    version: 1,
    objective,
    intent: inferAgentIntent(plan, objective),
    route: buildAgentRoute(plan),
    capabilities: unique(DOMAIN_CAPABILITIES[domain] || ["act_within_boundary", "verify_result", "report_risks"]),
    boundary: buildBoundary(plan),
    context: {
      mode: "minimal",
      references: unique(options.context || ["docs/CAPABILITY_KERNEL.md", "docs/AGENT_LANGUAGE.md"]),
    },
    evidence: {
      required: ["changed_surface", "verification_result", "remaining_risks"],
    },
    done: {
      rule: "do_not_complete_until_required_evidence_is_present",
    },
    memory: {
      rule: "draft_reusable_learning_only",
    },
  };
}

module.exports = {
  buildAgentContract,
  buildAgentRoute,
  inferAgentIntent,
};
