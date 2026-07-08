/**
 * Capability registry: policy/routing metadata, NOT a loadable module.
 *
 * "capability" != "skill" en este repo, y es a proposito:
 *  - capability (aca, data/capabilities.json): una fila de politica que dice
 *    que dominio es, que approval gates dispara (publish/delete/credential_write/
 *    install_dependencies/medical_claims), que otras capabilities requiere, y
 *    que tools/verificacion aplican. Nunca se importa ni se ejecuta directo --
 *    solo se consulta desde resolveCapabilities()/handleKaizenPrompt() para
 *    decidir SI se puede avanzar y bajo que reglas.
 *  - skill (lib/skills/*, .agents/skills/*): un modulo Mastra Agent Skill real,
 *    formato SKILL.md/agentskills.io, que un agente CARGA y ejecuta (kaizen7
 *    -brand-doctrine, kaizen-video-iteration-agent, y los que forje o instale
 *    cli-hub como cli-hub-meta-skill). Es la misma nocion de "skill" que usa
 *    CLI-Anything/SKILL.md, portable entre Claude Code/OpenClaw/Codex.
 *
 * Si algo necesita nombre nuevo, que sea "capability" (politica) o "skill"
 * (modulo cargable) -- no un tercer sinonimo.
 */
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
