const RUNTIME_LANGUAGE = ["npm.cmd", "PowerShell", "bash", "Windows", "Linux"];

const SCHEMA_REQUIRED_FIELDS = {
  "kaizen7.agent_contract.v1": ["objective", "intent", "route", "capabilities", "boundary", "context", "evidence", "done", "memory"],
  "kaizen7.agent_brief.v1": ["objective", "intent", "first_move", "focus", "avoid", "evidence_needed", "stop_when", "return"],
  "kaizen7.agent_handoff.v1": ["contract", "brief", "expected_receipt_schema", "handoff_rule"],
  "kaizen7.agent_receipt.v1": ["objective", "intent", "verdict", "summary", "evidence", "missing_evidence", "next_action", "memory_draft"],
};

function findRuntimeLanguage(value = {}) {
  const text = JSON.stringify(value);
  return RUNTIME_LANGUAGE.filter((term) => text.includes(term));
}

function listAgentLanguageSchemas() {
  return Object.keys(SCHEMA_REQUIRED_FIELDS);
}

function validateAgentLanguage(value = {}, expectedSchema = "") {
  const schema = value.schema || "unknown";
  const required = SCHEMA_REQUIRED_FIELDS[expectedSchema || schema] || [];
  const missing = required.filter((field) => !(field in value));
  const runtimeLanguage = findRuntimeLanguage(value);
  const schemaMismatch = expectedSchema && schema !== expectedSchema ? [expectedSchema] : [];

  return {
    schema,
    expected_schema: expectedSchema || schema,
    verdict: missing.length || runtimeLanguage.length || schemaMismatch.length ? "block" : "pass",
    missing,
    runtime_language: runtimeLanguage,
    schema_mismatch: schemaMismatch,
  };
}

module.exports = {
  RUNTIME_LANGUAGE,
  SCHEMA_REQUIRED_FIELDS,
  findRuntimeLanguage,
  listAgentLanguageSchemas,
  validateAgentLanguage,
};
