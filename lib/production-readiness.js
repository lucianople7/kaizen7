const fs = require("node:fs");
const path = require("node:path");

const REQUIRED_MODULES = [
  ["agent-advisor", "lib/agent-advisor.js"],
  ["agent-runner", "lib/agent-runner.js"],
  ["codex-bridge", "lib/codex-bridge.js"],
  ["codex-realizer", "lib/codex-realizer.js"],
  ["connector-kernel", "lib/connector-kernel.js"],
  ["onboarding", "lib/onboarding.js"],
  ["self-improvement-loop", "lib/self-improvement-loop.js"],
  ["supertool-orchestrator", "lib/supertool-orchestrator.js"],
  ["second-brain", "lib/second-brain.js"],
  ["runtime-init", "lib/runtime-init.js"],
  ["hunter", "lib/hunter.js"],
  ["github-adapter", "lib/github-adapter.js"],
  ["huggingface-adapter", "lib/huggingface-adapter.js"],
  ["signal-ingestion", "lib/signal-ingestion.js"],
  ["skill-router", "lib/skill-router.js"],
  ["adapter-registry", "lib/adapter-registry.js"],
  ["frontier-operator", "lib/frontier-operator.js"],
  ["semantic-memory", "lib/semantic-memory.js"],
  ["agent-loop", "lib/agent-loop.js"],
  ["openai-agent-adapter", "lib/openai-agent-adapter.js"],
  ["smart-crons", "lib/smart-crons.js"],
  ["cron-doctor", "lib/cron-doctor.js"],
];

const REQUIRED_DATA = [
  ["hunter-registry", "data/hunter-registry.json"],
  ["smart-crons", "data/smart-crons.json"],
  ["frontier-watch", "data/frontier-watch.json"],
];

const RUNTIME_DATA = [
  ["signal-inbox", "data/signal-inbox.json"],
  ["kaizen-runtime", "data/kaizen-runtime.json"],
  ["kaizen-workspace", "data/kaizen-workspace.json"],
  ["kaizen-memory", "data/kaizen-memory.json"],
  ["kaizen-evaluations", "data/kaizen-evaluations.json"],
  ["metabrowser-runs", "data/metabrowser-runs.json"],
  ["product-genome", "data/product-genome.json"],
  ["semantic-memory", "data/semantic-memory.json"],
];

const REQUIRED_SKILLS = [
  ["repo-hunter-github", ".agents/skills/repo-hunter-github/SKILL.md"],
];

function exists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function check(id, status, message, relativePath = "") {
  return { id, status, message, path: relativePath };
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function checkProductionReadiness(options = {}) {
  const root = options.root || process.cwd();
  const checks = [];
  const blockers = [];
  const warnings = [];

  for (const [id, relativePath] of REQUIRED_MODULES) {
    const item = exists(root, relativePath)
      ? check(`module:${id}`, "pass", `${id} module present`, relativePath)
      : check(`module:${id}`, "block", `${id} module missing`, relativePath);
    checks.push(item);
    if (item.status === "block") blockers.push(item);
  }

  for (const [id, relativePath] of REQUIRED_DATA) {
    const item = exists(root, relativePath)
      ? check(`data:${id}`, "pass", `${id} data present`, relativePath)
      : check(`data:${id}`, "block", `${id} data missing`, relativePath);
    checks.push(item);
    if (item.status === "block") blockers.push(item);
  }

  for (const [id, relativePath] of RUNTIME_DATA) {
    if (!exists(root, relativePath)) {
      warnings.push(check(`runtime:${id}`, "warn", `${id} runtime data will be created on demand`, relativePath));
    }
  }

  if (exists(root, "data/smart-crons.json")) {
    const manifest = readJson(root, "data/smart-crons.json");
    const safe = manifest.policy === "propose-by-default" && (manifest.crons || []).every((cron) => cron.mode === "propose");
    const item = safe
      ? check("policy:smart-crons", "pass", "smart crons are propose-only", "data/smart-crons.json")
      : check("policy:smart-crons", "block", "smart crons must be propose-only", "data/smart-crons.json");
    checks.push(item);
    if (item.status === "block") blockers.push(item);
  }

  if (exists(root, "server.js")) {
    const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
    for (const [id, endpoint] of [["k7-run", "/api/k7/run"], ["k7-advise", "/api/k7/advise"], ["k7-codex", "/api/k7/codex"], ["k7-realize", "/api/k7/realize"], ["k7-connect", "/api/k7/connect"], ["k7-onboard", "/api/k7/onboard"], ["k7-improve", "/api/k7/improve"], ["k7-super", "/api/k7/super"], ["k7-brain", "/api/k7/brain"], ["k7-adapters-plan", "/api/k7/adapters/plan"], ["k7-frontier", "/api/k7/frontier"], ["k7-openai-activate", "/api/k7/openai/activate"]]) {
      const item = server.includes(endpoint)
        ? check(`api:${id}`, "pass", `KAIZEN7 ${id} API endpoint present`, "server.js")
        : check(`api:${id}`, "block", `KAIZEN7 ${id} API endpoint missing`, "server.js");
      checks.push(item);
      if (item.status === "block") blockers.push(item);
    }
  }

  for (const [id, relativePath] of REQUIRED_SKILLS) {
    const item = exists(root, relativePath)
      ? check(`skill:${id}`, "pass", `${id} skill present`, relativePath)
      : check(`skill:${id}`, "block", `${id} skill missing`, relativePath);
    checks.push(item);
    if (item.status === "block") blockers.push(item);
  }

  if (exists(root, "package.json")) {
    const pkg = readJson(root, "package.json");
    for (const script of ["check", "k7:init", "k7:super", "k7:brain", "k7:agent", "k7:advise", "k7:codex", "k7:real", "k7:connect", "k7:onboard", "k7:improve", "k7:adapt", "k7:openai", "k7:run", "k7:hunter", "k7:frontier", "k7:frontier:brief", "k7:github", "k7:hf", "k7:signal"]) {
      const item = pkg.scripts?.[script]
        ? check(`script:${script}`, "pass", `${script} script present`, "package.json")
        : check(`script:${script}`, "warn", `${script} script missing`, "package.json");
      checks.push(item);
      if (item.status === "warn") warnings.push(item);
    }
  } else {
    const item = check("package", "block", "package.json missing", "package.json");
    checks.push(item);
    blockers.push(item);
  }

  if (exists(root, ".env.example")) {
    const env = fs.readFileSync(path.join(root, ".env.example"), "utf8");
    for (const key of ["OPENAI_API_KEY", "META_ACCESS_TOKEN", "SHOPIFY_ADMIN_TOKEN"]) {
      const line = env.split(/\r?\n/).find((item) => item.startsWith(`${key}=`));
      if (line === `${key}=`) warnings.push(check(`env:${key}`, "warn", `${key} is documented but empty`, ".env.example"));
    }
  } else {
    warnings.push(check("env:example", "warn", ".env.example missing", ".env.example"));
  }

  return {
    status: blockers.length ? "blocked" : "ready",
    checks,
    blockers,
    warnings,
  };
}

function summarizeReadiness(report) {
  const lines = [
    `Status: ${report.status}`,
    `Checks: ${report.checks.length}`,
    `Blockers: ${report.blockers.length}`,
    ...report.blockers.map((item) => `- ${item.id}: ${item.message}`),
    "Warnings:",
    ...(report.warnings.length ? report.warnings.map((item) => `- ${item.id}: ${item.message}`) : ["- none"]),
  ];
  return lines.join("\n");
}

if (require.main === module) {
  const report = checkProductionReadiness();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${summarizeReadiness(report)}\n`);
  process.exitCode = report.status === "ready" ? 0 : 1;
}

module.exports = {
  checkProductionReadiness,
  summarizeReadiness,
};
