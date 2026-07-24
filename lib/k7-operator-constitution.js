const fs = require("node:fs");
const path = require("node:path");

const EXPECTED_SCHEMA = "kaizen7.operator_constitution.v1";
const EXPECTED_VERSION = 1;
const EXPECTED_AUTHORITY = "final_human_authority";
const DEFAULT_PATH = path.join(__dirname, "../data/operator-constitution.json");
const FORBIDDEN_FIELD = /(^|_)(secret|secrets|credential|credentials|token|password|health|medical|family|housing|financial|bank|banking|identity_document|identity_documents|raw_conversation|raw_conversations)(_|$)/i;

function contractError(code, message, details = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function findForbiddenField(value, trail = []) {
  if (!value || typeof value !== "object") return "";
  for (const [key, nested] of Object.entries(value)) {
    const nextTrail = [...trail, key];
    if (FORBIDDEN_FIELD.test(key)) return nextTrail.join(".");
    const found = findForbiddenField(nested, nextTrail);
    if (found) return found;
  }
  return "";
}

function requireString(value, field) {
  if (!String(value || "").trim()) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Operator constitution requires ${field}`,
      { field },
    );
  }
}

function requireNonEmptyArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Operator constitution requires non-empty ${field}`,
      { field },
    );
  }
}

function validateOperatorConstitution(constitution) {
  if (!constitution || typeof constitution !== "object" || Array.isArray(constitution)) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      "Operator constitution must be an object",
    );
  }
  if (constitution.schema !== EXPECTED_SCHEMA) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Unsupported operator constitution schema: ${constitution.schema || "missing"}`,
      { field: "schema" },
    );
  }
  if (constitution.version !== EXPECTED_VERSION) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_VERSION",
      `Unsupported operator constitution version: ${constitution.version}`,
      { expectedVersion: EXPECTED_VERSION },
    );
  }
  requireString(constitution.operator?.id, "operator.id");
  requireString(constitution.operator?.name, "operator.name");
  if (constitution.operator?.role !== EXPECTED_AUTHORITY) {
    throw contractError(
      "K7_OPERATOR_AUTHORITY_INVALID",
      `Operator role must be ${EXPECTED_AUTHORITY}`,
      { field: "operator.role" },
    );
  }
  requireString(constitution.intent, "intent");
  requireString(
    constitution.decision_contract?.recommendation_policy,
    "decision_contract.recommendation_policy",
  );
  requireNonEmptyArray(constitution.protected_values, "protected_values");
  requireNonEmptyArray(constitution.authority_gates, "authority_gates");
  if (
    !constitution.ecosystem_roles
    || typeof constitution.ecosystem_roles !== "object"
    || Array.isArray(constitution.ecosystem_roles)
  ) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      "Operator constitution requires ecosystem_roles",
      { field: "ecosystem_roles" },
    );
  }
  const forbidden = findForbiddenField(constitution);
  if (forbidden) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Forbidden sensitive field in operator constitution: ${forbidden}`,
      { field: forbidden },
    );
  }
  return constitution;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function loadOperatorConstitution(options = {}) {
  const filePath = options.filePath || DEFAULT_PATH;
  if (!fs.existsSync(filePath)) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_MISSING",
      `Operator constitution not found: ${filePath}`,
      { filePath },
    );
  }
  let constitution;
  try {
    constitution = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (cause) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Operator constitution is not valid JSON: ${filePath}`,
      { filePath, cause },
    );
  }
  validateOperatorConstitution(constitution);
  return deepFreeze(constitution);
}

function buildOperatorContract(options = {}) {
  const constitution = loadOperatorConstitution(options);
  return deepFreeze({
    schema: "kaizen7.operator_contract.v1",
    principal: {
      id: constitution.operator.id,
      name: constitution.operator.name,
      role: constitution.operator.role,
    },
    intent: constitution.intent,
    recommendation_policy: constitution.decision_contract.recommendation_policy,
    authority_gates: [...constitution.authority_gates],
    protected_values: [...constitution.protected_values],
    ecosystem_roles: { ...constitution.ecosystem_roles },
  });
}

module.exports = {
  DEFAULT_PATH,
  buildOperatorContract,
  findForbiddenField,
  loadOperatorConstitution,
  validateOperatorConstitution,
};
