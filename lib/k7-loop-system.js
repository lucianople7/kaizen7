const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_POLICY_PATH = path.join(__dirname, "..", "data", "k7-loop-policy.json");

function validateLoopPolicy(policy = {}) {
  if (policy.schema !== "kaizen7.loop_policy.v1") throw new Error("invalid loop policy schema");
  if (!policy.system?.id) throw new Error("loop policy system.id is required");
  for (const role of ["frontend", "coordinator", "technical_executor", "creative_executor", "authority"]) {
    if (!policy.roles?.[role]) throw new Error(`loop policy roles.${role} is required`);
  }
  if (!Array.isArray(policy.flow) || policy.flow.length < 8) throw new Error("loop policy flow is incomplete");
  if (!Array.isArray(policy.human_gates) || !policy.human_gates.length) throw new Error("loop policy human_gates are required");
  if (!Number.isInteger(policy.limits?.max_iterations) || policy.limits.max_iterations < 1) {
    throw new Error("loop policy max_iterations must be a positive integer");
  }
  if (!Number.isInteger(policy.limits?.token_budget) || policy.limits.token_budget < 120) {
    throw new Error("loop policy token_budget must be at least 120");
  }
  if (!Number.isInteger(policy.learning?.minimum_verified_uses) || policy.learning.minimum_verified_uses < 1) {
    throw new Error("loop policy minimum_verified_uses must be a positive integer");
  }
  if (policy.learning.promote_failed_outcomes !== false) {
    throw new Error("loop policy must reject failed-outcome promotion");
  }
  for (const profile of ["research", "technical", "creative", "commerce", "tool", "memory", "general"]) {
    if (!policy.profiles?.[profile]) throw new Error(`loop policy profiles.${profile} is required`);
    if (!Array.isArray(policy.profiles[profile].stages) || !policy.profiles[profile].stages.includes("verify")) {
      throw new Error(`loop policy profiles.${profile}.stages must include verify`);
    }
  }
  return policy;
}

function loadLoopPolicy(options = {}) {
  if (options.policy) return validateLoopPolicy(options.policy);
  const policyPath = options.path || DEFAULT_POLICY_PATH;
  return validateLoopPolicy(JSON.parse(fs.readFileSync(policyPath, "utf8")));
}

function buildLoopSystemDefinition(input) {
  const policy = validateLoopPolicy(input || loadLoopPolicy());
  return {
    schema: "kaizen7.loop_system.v1",
    status: "defined",
    id: policy.system.id,
    name: policy.system.name,
    version: policy.system.version,
    principle: policy.system.principle,
    roles: policy.roles,
    flow: policy.flow,
    states: policy.states,
    limits: policy.limits,
    learning: policy.learning,
    loop_profiles: policy.profiles,
    human_gates: policy.human_gates,
    autonomy: {
      mode: "controlled_constructor",
      operational_doubts: "kaizen7_first",
      human_intervention: "preference_or_authority_only",
      execution: "bounded_until_terminal_state",
      learning: "verified_outcomes_only",
    },
    commands: {
      do: "k7 do \"<objective>\"",
      decide: "k7 preflight --budget 300 \"<objective>\"",
      run: "k7 loop --max-iterations 8 --token-budget 1200 \"<objective>\"",
      inspect: "k7 system --json",
    },
  };
}

function formatLoopSystemDefinition(system = buildLoopSystemDefinition()) {
  return [
    "# KAIZEN7 LOOP OS",
    `Status: ${system.status}`,
    `Version: ${system.version}`,
    `Principle: ${system.principle}`,
    `Flow: ${(system.flow || []).join(" -> ")}`,
    `Human: ${system.autonomy?.human_intervention || ""}`,
    `Run: ${system.commands?.run || ""}`,
    "",
  ].join("\n");
}

module.exports = {
  DEFAULT_POLICY_PATH,
  buildLoopSystemDefinition,
  formatLoopSystemDefinition,
  loadLoopPolicy,
  validateLoopPolicy,
};
