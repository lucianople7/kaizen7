const fs = require("node:fs");
const path = require("node:path");

const CANONICAL_FILES = [
  "AGENTS.md",
  "KAIZEN7_CONTEXT.md",
  "docs/KAIZEN7_TOOL.md",
  "docs/KAIZEN7_IDEA.md",
  "docs/KAIZEN7_METASKILLS.md",
  "docs/KAIZEN7_ANYTHING_CLI_NEXT.md",
  "docs/KAIZEN7_BEST_NOW.md",
  "docs/KAIZEN7_ONE_COMMAND.md",
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
    growth: entries.filter((name) => /^(k7|k7:(idea|best|now|jarvis|status|next|start|focus))$/.test(name)),
    agents: entries.filter((name) => /^k7:(agent|advise|codex|connect|run|loop|boost|super|brain|handoff(:json)?|metaskills(:map)?|anything-next)$/.test(name)),
    research: entries.filter((name) => /^k7:(hunter|github|hf|market|frontier|signal)$/.test(name)),
    content: entries.filter((name) => /^(flowmatik|omni|k7:omni)/.test(name)),
    verification: entries.filter((name) => /^(check|test|k7:check|k7:ready|k7:smoke|thefocux:status)/.test(name)),
  };
}

function buildAgentBrowser(root = process.cwd()) {
  const packageJson = readJson(path.join(root, "package.json"), {});
  const scripts = packageJson.scripts || {};
  const docs = listFiles(root, "docs", (name) => name.endsWith(".md"));
  const tests = listFiles(root, "tests", (name) => name.endsWith(".test.js") || name.endsWith(".py"));
  const routes = listFiles(root, "CAPABILITIES", (name) => name.endsWith(".md"));
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
    current_entrypoint: scripts.k7 ? "npm.cmd run k7 -- status" : "npm.cmd run k7:best",
    canonical_files: canonicalFiles,
    counts: {
      docs: docs.length,
      tests: tests.length,
      routes: routes.length,
      capabilities: routes.length,
      skills: skillDirs.length,
      scripts: Object.keys(scripts).length,
    },
    script_groups: scriptGroups,
    agent_rules: [
      "Start with AGENTS.md and KAIZEN7_CONTEXT.md.",
      "Run k7 -- status when you need the unified tool surface.",
      "Run k7 -- doctor when you need the professional readiness contract.",
      "Run k7 -- improve when the tool itself shows friction.",
      "Run k7:idea when you need the product idea in one view.",
      "Run k7:metaskills:map when you need the coordination layer.",
      "Run k7:anything-next when you need the next-generation external-tool route.",
      "Run k7:handoff when another agent needs minimal context.",
      "Run k7:best when you need the best current operating view.",
      "Run k7:smoke for a compact health and route check.",
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
    next_best_action: "Run npm.cmd run k7 -- status for the unified tool surface, then npm.cmd run k7 -- mission \"<objective>\".",
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
    `- routes: ${report.counts.routes || report.counts.capabilities}`,
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
