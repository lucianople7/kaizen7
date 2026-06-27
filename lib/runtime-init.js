const fs = require("node:fs");
const path = require("node:path");

const RUNTIME_FILES = [
  ["data/kaizen-runtime.json", { version: 1, runs: [], approvals: [], tools: [], updatedAt: null }],
  ["data/kaizen-workspace.json", { version: 1, projects: [], campaigns: [], tasks: [], content: [], updatedAt: null }],
  ["data/kaizen-memory.json", { version: 1, memories: [], updatedAt: null }],
  ["data/kaizen-evaluations.json", { version: 1, evaluations: [], updatedAt: null }],
  ["data/metabrowser-runs.json", { version: 1, runs: [] }],
  ["data/product-genome.json", { version: 1, products: [], experiments: [], learnings: [], suppliers: [], creatives: [], updatedAt: null }],
  ["data/semantic-memory.json", { version: 1, root: "", generatedAt: null, documents: [] }],
  ["data/signal-inbox.json", []],
];

function runtimeFiles() {
  return RUNTIME_FILES.map(([filePath, seed]) => ({ path: filePath, seed }));
}

function initRuntime(options = {}) {
  const root = options.root || process.cwd();
  const created = [];
  const skipped = [];
  for (const [relativePath, seed] of RUNTIME_FILES) {
    const target = path.join(root, relativePath);
    if (fs.existsSync(target) && !options.force) {
      skipped.push(relativePath);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(seed, null, 2)}\n`);
    created.push(relativePath);
  }
  return {
    status: "ready",
    created,
    skipped,
  };
}

function formatInit(result) {
  return [
    "## KAIZEN7 Runtime Init",
    "",
    `Status: ${result.status}`,
    `Created: ${result.created.length}`,
    `Skipped: ${result.skipped.length}`,
    "",
    ...(result.created.length ? result.created.map((item) => `+ ${item}`) : ["No files created."]),
    "",
  ].join("\n");
}

if (require.main === module) {
  const result = initRuntime({ force: process.argv.includes("--force") });
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else process.stdout.write(`${formatInit(result)}\n`);
}

module.exports = {
  initRuntime,
  runtimeFiles,
};
