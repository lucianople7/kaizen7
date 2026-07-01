const { buildCapabilitySpec } = require("./capability-spec");
const { inferCapabilityDomain, tokenize } = require("./resolver");
const { loadCapabilityRegistry, validateCapabilityRegistry } = require("./registry");

function normalizeId(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function defaultCapabilityId(objective = "", domain = "") {
  const tokens = tokenize(objective)
    .filter((token) => !["crear", "create", "capacidad", "capability", "para", "con", "and"].includes(token))
    .slice(0, 3);
  return `${domain}.${normalizeId(tokens.join("_") || "new_capability")}`;
}

function buildCapabilityDraft(objective = "", options = {}) {
  const domain = options.domain || inferCapabilityDomain(objective);
  return {
    id: options.id || defaultCapabilityId(objective, domain),
    domain,
    purpose: options.purpose || `Enable agents to ${String(objective || "complete the requested capability").trim()}.`,
    status: "experimental",
    inputs: options.inputs || ["objective", "context", "constraints"],
    outputs: options.outputs || ["capability_result", "evidence", "memory_draft"],
    requires: options.requires || ["kernel.capability_resolver"],
    tools: options.tools || ["codex"],
    approval: options.approval || [],
    verification: options.verification || ["evidence_present", "risks_reported", "memory_draft_present"],
    writeback: options.writeback || `${domain}_learning`,
    keywords: options.keywords || tokenize(objective).slice(0, 8),
  };
}

function buildCapabilityForge(objective = "", options = {}) {
  const draft = buildCapabilityDraft(objective, options);
  const registry = options.registry || loadCapabilityRegistry(options.root);
  const validationRegistry = { ...registry, capabilities: [...(registry.capabilities || []), draft] };
  const validationErrors = validateCapabilityRegistry(validationRegistry);

  return {
    schema: "kaizen7.capability_forge.v1",
    version: 1,
    objective,
    draft,
    spec: buildCapabilitySpec(draft),
    validation_errors: validationErrors,
    registration: {
      target: "data/capabilities.json",
      mode: "review_required",
      rule: "register only after validation errors are empty and capability is still useful outside one task",
    },
    next_action: validationErrors.length ? "repair_draft" : "review_then_register",
  };
}

module.exports = {
  buildCapabilityDraft,
  buildCapabilityForge,
  defaultCapabilityId,
  normalizeId,
};
