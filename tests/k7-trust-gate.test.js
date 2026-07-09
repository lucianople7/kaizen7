const assert = require("node:assert/strict");
const {
  buildTrustGate,
  formatTrustGate,
} = require("../lib/k7-trust-gate");

const blocked = buildTrustGate("MCP tool that needs API key and can deploy");
assert.equal(blocked.schema, "kaizen7.trust_gate.v1");
assert.equal(blocked.decision, "block");
assert(blocked.findings.some((finding) => finding.id === "credentials"));
assert(blocked.findings.some((finding) => finding.id === "external_effects"));
assert(blocked.block_when.some((item) => item.includes("credentials")));
assert.equal(blocked.sandbox_policy.default, "dry-run first");

const review = buildTrustGate("browser session automation for web app");
assert.equal(review.decision, "review");
assert(review.findings.some((finding) => finding.id === "browser_session"));

const allowed = buildTrustGate("local formatter dry run");
assert.equal(allowed.decision, "allow_with_dry_run");

const formatted = formatTrustGate(blocked);
assert(formatted.includes("# KAIZEN7 TRUST GATE"));
assert(formatted.includes("## Required Evidence"));

console.log("k7 trust gate tests passed");
