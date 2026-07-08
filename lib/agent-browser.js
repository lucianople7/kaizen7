const fs = require("node:fs");
const path = require("node:path");

const CANONICAL_FILES = [
  "AGENTS.md",
  "KAIZEN7_CONTEXT.md",
  "docs/GROWTH_FOCUS_DIRECTIVE.md",
  "docs/GROWTH_SPRINT_01.md",
  "docs/MISSION_BRIEF.md",
  "docs/MISSION_OUTCOME_RECEIPT.md",
  "data/capabilities.json",
];

function exists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return fallback;
  }
}

function listFiles(root, relativeDir, matcher = () => true) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && matcher(entry.name))
    .map((entry) => path.join(relativeDir, entry.name).replaceAll("\\", "/"))
    .sort();
}

function listDirs(root, relativeDir) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(relativeDir, entry.name).replaceAll("\\", "/"))
    .sort();
}

function groupScripts(scripts = {}) {
  const entries = Object.keys(scripts).sort();
  return {
    growth: entries.filter((name) => /^k7:(now|jarvis|ready|next|start|focus)$/.test(name)),
    agents: entries.filter((name) => /^k7:(agent|advise|codex|connect|run|loop|boost|super|brain)$/.test(name)),
    research: entries.filter((name) => /^k7:(hunter|github|hf|market|frontier|signal)$/.test(name)),
    content: entries.filter((name) => /^(flowmatik|omni|k7:omni)/.test(name)),
    verification: entries.filter((name) => /^(check|test|k7:check|k7:ready)/.test(name)),
  };
}

function buildAgentBrowser(root = process.cwd()) {
  const packageJson = readJson(path.join(root, "package.json"), {});
  const scripts = packageJson.scripts || {};
  const docs = listFiles(root, "docs", (name) => name.endsWith(".md"));
  const tests = listFiles(root, "tests", (name) => name.endsWith(".test.js") || name.endsWith(".py"));
  const capabilities = listFiles(root, "CAPABILITIES", (name) => name.endsWith(".md"));
  const skillDirs = [
    ...listDirs(root, ".agents/skills"),
    ...listDirs(root, ".codex/skills"),
  ];

  const canonicalFiles = CANONICAL_FILES.filter((file) => exists(root, file));
  const scriptGroups = groupScripts(scripts);

  return {
    schema: "kaizen7.agent_browser.v1",
    root,
    identity: "KAIZEN7 repo intelligence for coding agents",
    current_entrypoint: scripts["k7:now"] ? "npm.cmd run k7:now" : "npm.cmd run k7:ready",
    canonical_files: canonicalFiles,
    counts: {
      docs: docs.length,
      tests: tests.length,
      capabilities: capabilities.length,
      skills: skillDirs.length,
      scripts: Object.keys(scripts).length,
    },
    script_groups: scriptGroups,
    agent_rules: [
      "Start with AGENTS.md and KAIZEN7_CONTEXT.md.",
      "Use k7:now when the objective is broad, strategic or growth-focused.",
      "Use Mission Brief before implementation and Mission Outcome Receipt after implementation.",
      "Read only files listed by the mission unless verification requires more.",
      "Never touch secrets, publishing, payments or destructive actions without explicit approval.",
    ],
    recommended_agent_files: {
      codex: ["AGENTS.md", "KAIZEN7_CONTEXT.md"],
      claude_code: ["AGENTS.md", "KAIZEN7_CONTEXT.md"],
      cursor: ["AGENTS.md", "KAIZEN7_CONTEXT.md"],
      qwen_code: ["AGENTS.md", "KAIZEN7_CONTEXT.md"],
    },
    next_best_action: "Run npm.cmd run k7:now, then execute the returned Mission Brief.",
  };
}

function formatAgentBrowser(report) {
  return [
    "# KAIZEN7 Agent Browser",
    "",
    `Entry: ${report.current_entrypoint}`,
    `Root: ${report.root}`,
    "",
    "## Repo Shape",
    `- docs: ${report.counts.docs}`,
    `- tests: ${report.counts.tests}`,
    `- capabilities: ${report.counts.capabilities}`,
    `- skills: ${report.counts.skills}`,
    `- scripts: ${report.counts.scripts}`,
    "",
    "## Canonical Files",
    ...report.canonical_files.map((file) => `- ${file}`),
    "",
    "## Useful Scripts",
    ...Object.entries(report.script_groups)
      .filter(([, items]) => items.length)
      .map(([group, items]) => `- ${group}: ${items.join(", ")}`),
    "",
    "## Agent Rules",
    ...report.agent_rules.map((rule) => `- ${rule}`),
    "",
    "## Next",
    `- ${report.next_best_action}`,
    "",
  ].join("\n");
}

if (require.main === module) {
  const report = buildAgentBrowser(process.cwd());
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatAgentBrowser(report)}\n`);
}

module.exports = {
  CANONICAL_FILES,
  buildAgentBrowser,
  formatAgentBrowser,
  groupScripts,
};
