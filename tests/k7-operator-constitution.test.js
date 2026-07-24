const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildOperatorContract,
  loadOperatorConstitution,
} = require("../lib/k7-operator-constitution");

const constitution = loadOperatorConstitution();
assert.equal(constitution.schema, "kaizen7.operator_constitution.v1");
assert.equal(constitution.version, 1);
assert.equal(constitution.operator.name, "Luciano López Barba");
assert.equal(constitution.operator.role, "final_human_authority");
assert.equal(
  constitution.intent,
  "Cuanto mejor va el proyecto, mejor va mi vida.",
);

const contract = buildOperatorContract();
assert.equal(contract.schema, "kaizen7.operator_contract.v1");
assert.deepEqual(contract.principal, {
  id: "luciano-lopez-barba",
  name: "Luciano López Barba",
  role: "final_human_authority",
});
assert.equal(
  contract.recommendation_policy,
  "recommend_best_supported_route_first",
);
assert(contract.protected_values.includes("calm"));
assert(contract.protected_values.includes("privacy"));
assert.equal(
  contract.ecosystem_roles["Flowmatik Studio"],
  "creative_factory_and_audiovisual_execution",
);
assert.equal(
  contract.ecosystem_roles["THE FOCUX"],
  "public_brand_and_business_value_receiver",
);
assert.equal(
  Object.prototype.hasOwnProperty.call(contract, "privacy"),
  false,
);
assert(!JSON.stringify(contract).includes("raw_conversation"));

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-operator-"));
const missingPath = path.join(temporaryRoot, "missing.json");
assert.throws(
  () => loadOperatorConstitution({ filePath: missingPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_MISSING",
);

const malformedPath = path.join(temporaryRoot, "malformed.json");
fs.writeFileSync(malformedPath, "{");
assert.throws(
  () => loadOperatorConstitution({ filePath: malformedPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_INVALID",
);

const invalidRolePath = path.join(temporaryRoot, "invalid-role.json");
fs.writeFileSync(invalidRolePath, JSON.stringify({
  ...constitution,
  operator: { ...constitution.operator, role: "autonomous_agent" },
}));
assert.throws(
  () => loadOperatorConstitution({ filePath: invalidRolePath }),
  (error) => error.code === "K7_OPERATOR_AUTHORITY_INVALID",
);

const forbiddenPath = path.join(temporaryRoot, "forbidden.json");
fs.writeFileSync(forbiddenPath, JSON.stringify({
  ...constitution,
  private_profile: { health: "must never be stored here" },
}));
assert.throws(
  () => loadOperatorConstitution({ filePath: forbiddenPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_INVALID"
    && error.field === "private_profile.health",
);

const versionPath = path.join(temporaryRoot, "version.json");
fs.writeFileSync(versionPath, JSON.stringify({
  ...constitution,
  version: 2,
}));
assert.throws(
  () => loadOperatorConstitution({ filePath: versionPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_VERSION",
);

console.log("k7 operator constitution tests passed");
