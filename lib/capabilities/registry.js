const fs = require("fs");
const path = require("path");

const REQUIRED_FIELDS = [
  "id",
  "domain",
  "purpose",
  "status",
  "inputs",
  "outputs",
  "requires",
  "tools",
  "approval",
  "verification",
  "writeback",
];

const VALID_STATUSES = new Set(["active", "experimental", "deprecated", "blocked"]);

function registryPath(root = process.cwd()) {
  return path.join(root, "data", "capabilities.json");
}

function loadCapabilityRegistry(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(registryPath(root), "utf8"));
}

function validateCapability(capability) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!(field in capability)) errors.push(`${capability.id || "unknown"} missing ${field}`);
  }
  if (capability.id && !/^[a-z0-9]+(\.[a-z0-9_]+)+$/.test(capability.id)) errors.push(`${capability.id} has invalid id`);
  if (capability.status && !VALID_STATUSES.has(capability.status)) errors.push(`${capability.id} has invalid status`);
  for (const field of ["inputs", "outputs", "requires", "tools", "approval", "verification"]) {
    if (field in capability && !Array.isArray(capability[field])) errors.push(`${capability.id} ${field} must be an array`);
  }
  return errors;
}

function validateCapabilityRegistry(registry = {}) {
  const errors = [];
  if (registry.schema !== "kaizen7.capabilities.v1") errors.push("registry schema must be kaizen7.capabilities.v1");
  if (!Array.isArray(registry.capabilities)) errors.push("registry capabilities must be an array");
  const ids = new Set();
  for (const capability of registry.capabilities || []) {
    errors.push(...validateCapability(capability));
    if (ids.has(capability.id)) errors.push(`${capability.id} duplicated`);
    ids.add(capability.id);
  }
  for (const capability of registry.capabilities || []) {
    for (const required of capability.requires || []) {
      if (required.includes(".") && !required.startsWith("memory.") && !required.startsWith("judge.") && !ids.has(required)) {
        errors.push(`${capability.id} requires missing capability ${required}`);
      }
    }
  }
  return errors;
}

function listCapabilities(options = {}) {
  const registry = options.registry || loadCapabilityRegistry(options.root);
  return (registry.capabilities || [])
    .filter((capability) => options.includeBlocked || capability.status !== "blocked")
    .filter((capability) => !options.domain || capability.domain === options.domain);
}

function getCapability(id, options = {}) {
  return listCapabilities({ ...options, includeBlocked: true }).find((capability) => capability.id === id) || null;
}

module.exports = {
  getCapability,
  listCapabilities,
  loadCapabilityRegistry,
  registryPath,
  validateCapabilityRegistry,
};
