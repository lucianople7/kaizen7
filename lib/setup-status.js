const fs = require("node:fs");
const path = require("node:path");
const { checkProductionReadiness } = require("./production-readiness");

const RUNTIME_FILES = [
  ["kaizen-runtime", "data/kaizen-runtime.json"],
  ["kaizen-workspace", "data/kaizen-workspace.json"],
  ["signal-inbox", "data/signal-inbox.json"],
  ["product-genome", "data/product-genome.json"],
  ["semantic-memory", "data/semantic-memory.json"],
];

function hasValue(env, key) {
  return Boolean(String(env[key] || "").trim());
}

function runtimeStatus(root) {
  return RUNTIME_FILES.map(([id, relativePath]) => ({
    id,
    path: relativePath,
    status: fs.existsSync(path.join(root, relativePath)) ? "ready" : "missing",
  }));
}

function serviceStatus(env, connectors = []) {
  const connectorReady = (name) => connectors.some((connector) => connector.name === name && connector.configured);
  const mcpReady = connectors.some((connector) => String(connector.name || "").startsWith("mcp:") && connector.configured);
  return [
    {
      id: "openai",
      label: "OpenAI",
      status: hasValue(env, "OPENAI_API_KEY") || connectorReady("openai") ? "ready" : "missing",
      required: false,
      command: "configure OPENAI_API_KEY for enhanced mode",
    },
    {
      id: "github",
      label: "GitHub",
      status: hasValue(env, "GITHUB_TOKEN") || hasValue(env, "GH_TOKEN") ? "ready" : "optional",
      required: false,
      command: "paste public repo URLs or configure GITHUB_TOKEN later",
    },
    {
      id: "huggingface",
      label: "Hugging Face",
      status: hasValue(env, "HF_TOKEN") || hasValue(env, "HUGGINGFACE_TOKEN") ? "ready" : "optional",
      required: false,
      command: "paste public HF URLs or configure HF_TOKEN later",
    },
    {
      id: "mcp",
      label: "MCP",
      status: mcpReady ? "ready" : "optional",
      required: false,
      command: "register MCP servers in kaizen.connectors.json",
    },
  ];
}

function productMode(readiness, services) {
  if (readiness.status === "blocked") return "blocked";
  if (services.some((service) => service.id === "openai" && service.status === "ready")) return "enhanced";
  return "local-only";
}

function buildSetupStatus(options = {}) {
  const root = options.root || process.cwd();
  const env = options.env || process.env;
  const readiness = options.readiness ? options.readiness({ root }) : checkProductionReadiness({ root });
  const connectors = options.connectors || [];
  const services = serviceStatus(env, connectors);
  const runtime = runtimeStatus(root);
  return {
    version: 1,
    status: productMode(readiness, services),
    readiness: {
      status: readiness.status,
      blockers: readiness.blockers || [],
      warnings: readiness.warnings || [],
    },
    services,
    runtime,
    actions: [
      "npm.cmd run k7:init",
      "npm.cmd run k7:ready",
      "npm.cmd run k7:onboard -- --preset codex \"connect Codex\"",
      "npm.cmd run k7:improve -- \"mejorar KAIZEN7\"",
      "npm.cmd run check",
    ],
    notes: [
      "Local-only mode works without API keys.",
      "Enhanced mode starts when OPENAI_API_KEY is configured.",
      "External publish, deploy, spend, delete and credential writes still require approval.",
    ],
  };
}

function formatSetupStatus(report) {
  return [
    "## KAIZEN7 Setup Status",
    "",
    `Status: ${report.status}`,
    `Readiness: ${report.readiness.status}`,
    "",
    "### Services",
    ...report.services.map((service) => `- ${service.label}: ${service.status}`),
    "",
    "### Runtime",
    ...report.runtime.map((item) => `- ${item.id}: ${item.status}`),
    "",
    "### Actions",
    ...report.actions.map((action) => `- ${action}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const report = buildSetupStatus();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatSetupStatus(report)}\n`);
}

module.exports = {
  buildSetupStatus,
  formatSetupStatus,
};
