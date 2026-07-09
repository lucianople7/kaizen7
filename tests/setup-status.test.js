const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildSetupStatus,
  formatSetupStatus,
} = require("../lib/setup-status");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-setup-"));
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data", "kaizen-runtime.json"), "{}\n");

const report = buildSetupStatus({
  root,
  env: {
    OPENAI_API_KEY: "",
    GITHUB_TOKEN: "ghp_test",
    HF_TOKEN: "",
  },
  readiness: () => ({
    status: "ready",
    blockers: [],
    warnings: [{ id: "env:OPENAI_API_KEY", status: "warn" }],
  }),
  connectors: [
    { name: "openai", configured: false },
    { name: "mcp:example-local", configured: true },
  ],
});

assert.equal(report.status, "local-only");
assert.equal(report.readiness.status, "ready");
assert(report.services.some((service) => service.id === "openai" && service.status === "missing"));
assert(report.services.some((service) => service.id === "github" && service.status === "ready"));
assert(report.services.some((service) => service.id === "mcp" && service.status === "ready"));
assert(report.runtime.some((item) => item.id === "kaizen-runtime" && item.status === "ready"));
assert(report.actions.includes("npm.cmd run k7:init"));
assert(report.actions.includes("npm.cmd run k7:onboard -- --preset codex \"connect Codex\""));

const enhanced = buildSetupStatus({
  root,
  env: { OPENAI_API_KEY: "sk-test" },
  readiness: () => ({ status: "ready", blockers: [], warnings: [] }),
  connectors: [{ name: "openai", configured: true }],
});
assert.equal(enhanced.status, "enhanced");

const formatted = formatSetupStatus(report);
assert(formatted.includes("KAIZEN7 Setup Status"));
assert(formatted.includes("local-only"));

console.log("setup status tests passed");
