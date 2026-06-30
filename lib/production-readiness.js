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
  ["weakness-to-strength", "lib/weakness-to-strength.js"],
  ["evolution-inbox", "lib/evolution-inbox.js"],
  ["action-queue-tickets", "lib/action-queue-tickets.js"],
  ["supertool-orchestrator", "lib/supertool-orchestrator.js"],
  ["second-brain", "lib/second-brain.js"],
  ["activation-demo", "lib/activation-demo.js"],
  ["activation-cockpit", "lib/activation-cockpit.js"],
  ["eval-harness", "lib/eval-harness.js"],
  ["wisdom-filter", "lib/wisdom-filter.js"],
  ["start-hub", "lib/start-hub.js"],
  ["body-bridge", "lib/body-bridge.js"],
  ["runtime-init", "lib/runtime-init.js"],
  ["setup-status", "lib/setup-status.js"],
  ["hunter", "lib/hunter.js"],
  ["github-adapter", "lib/github-adapter.js"],
  ["huggingface-adapter", "lib/huggingface-adapter.js"],
  ["signal-ingestion", "lib/signal-ingestion.js"],
  ["skill-router", "lib/skill-router.js"],
  ["adapter-registry", "lib/adapter-registry.js"],
  ["openhands-adapter", "lib/openhands-adapter.js"],
  ["claude-flow-adapter", "lib/claude-flow-adapter.js"],
  ["hermes-agent-adapter", "lib/hermes-agent-adapter.js"],
  ["jcode-adapter", "lib/jcode-adapter.js"],
  ["jcode-smoke", "lib/jcode-smoke.js"],
  ["k7-operating-layer", "lib/k7-operating-layer.js"],
  ["headroom-adapter", "lib/headroom-adapter.js"],
  ["k7-context-layer", "lib/k7-context-layer.js"],
  ["paperclip-adapter", "lib/paperclip-adapter.js"],
  ["k7-control-plane", "lib/k7-control-plane.js"],
  ["k7-state", "lib/k7-state.js"],
  ["k7-next", "lib/k7-next.js"],
  ["k7-self-test", "lib/k7-self-test.js"],
  ["toolchain-router", "lib/toolchain-router.js"],
  ["k7-mission-packet", "lib/k7-mission-packet.js"],
  ["k7-harness-router", "lib/k7-harness-router.js"],
  ["frontier-operator", "lib/frontier-operator.js"],
  ["prompt-filter", "lib/prompt-filter.js"],
  ["semantic-memory", "lib/semantic-memory.js"],
  ["agent-loop", "lib/agent-loop.js"],
  ["openai-agent-adapter", "lib/openai-agent-adapter.js"],
  ["model-gateway", "lib/model-gateway.js"],
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
  ["k7-self-evolution-loop", ".agents/skills/k7-self-evolution-loop/SKILL.md"],
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
    for (const [id, endpoint] of [["k7-setup", "/api/k7/setup"], ["k7-activate", "/api/k7/activate"], ["k7-cockpit", "/api/k7/cockpit"], ["k7-start", "/api/k7/start"], ["k7-bridge", "/api/k7/bridge"], ["k7-strength", "/api/k7/strength"], ["k7-evolve", "/api/k7/evolve"], ["k7-tickets", "/api/k7/tickets"], ["k7-eval", "/api/k7/eval"], ["k7-loop", "/api/k7/loop"], ["k7-handoff-validate", "/api/k7/handoff/validate"], ["k7-models", "/api/k7/models"], ["k7-run", "/api/k7/run"], ["k7-advise", "/api/k7/advise"], ["k7-codex", "/api/k7/codex"], ["k7-realize", "/api/k7/realize"], ["k7-connect", "/api/k7/connect"], ["k7-onboard", "/api/k7/onboard"], ["k7-improve", "/api/k7/improve"], ["k7-super", "/api/k7/super"], ["k7-brain", "/api/k7/brain"], ["k7-adapters-plan", "/api/k7/adapters/plan"], ["k7-openhands", "/api/k7/openhands"], ["k7-claude-flow", "/api/k7/claude-flow"], ["k7-hermes", "/api/k7/hermes"], ["k7-jcode", "/api/k7/jcode"], ["k7-operating", "/api/k7/operating"], ["k7-headroom", "/api/k7/headroom"], ["k7-context", "/api/k7/context"], ["k7-paperclip", "/api/k7/paperclip"], ["k7-control", "/api/k7/control"], ["k7-toolchain", "/api/k7/toolchain"], ["k7-mission", "/api/k7/mission"], ["k7-harness-route", "/api/k7/harness/route"], ["k7-harness-dry-run", "/api/k7/harness/dry-run"], ["k7-frontier", "/api/k7/frontier"], ["k7-openai-activate", "/api/k7/openai/activate"]]) {
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
    for (const script of ["check", "k7:state", "k7:next", "k7:self-test", "k7:init", "k7:setup", "k7:start", "k7:bridge", "k7:strength", "k7:evolve", "k7:tickets", "k7:super", "k7:brain", "k7:activate", "k7:cockpit", "k7:eval", "k7:prompt", "k7:wisdom", "k7:agent", "k7:advise", "k7:codex", "k7:real", "k7:connect", "k7:onboard", "k7:improve", "k7:adapt", "k7:openhands", "k7:claude-flow", "k7:hermes", "k7:jcode", "k7:jcode:smoke", "k7:operating", "k7:headroom", "k7:context", "k7:paperclip", "k7:control", "k7:toolchain", "k7:mission", "k7:harness", "k7:openai", "k7:models", "k7:run", "k7:hunter", "k7:frontier", "k7:frontier:brief", "k7:github", "k7:hf", "k7:signal"]) {
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
