const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const REGISTRY_PATH = path.join(ROOT, "data", "anything-tools.json");

function loadAnythingTools(filePath = REGISTRY_PATH) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function commandExists(command, args = []) {
  if (process.platform === "win32") {
    const result = spawnSync("where.exe", [command], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 5000,
    });
    return result.status === 0;
  }
  const result = spawnSync("command", ["-v", command], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true,
    timeout: 5000,
  });
  return result.status === 0;
}

function detectTool(tool, root = ROOT) {
  const detect = tool.detect || {};
  if (detect.type === "local_path") {
    return fs.existsSync(path.join(root, detect.path));
  }
  if (detect.type === "command") {
    return commandExists(detect.command, detect.args || []);
  }
  if (detect.type === "http") {
    return false;
  }
  return false;
}

function listAnythingTools(options = {}) {
  const root = options.root || ROOT;
  const registry = options.registry || loadAnythingTools();
  return registry.tools.map((tool) => ({
    ...tool,
    available: detectTool(tool, root),
  }));
}

function rankProvider(tool, capability) {
  let score = 0;
  if (tool.capabilities.includes(capability)) score += 100;
  if (tool.available) score += 50;
  if (tool.id === "remotion" && capability === "video.render") score += 20;
  if (tool.id === "remotion-ffmpeg" && ["video.encode", "audio.mix", "media.probe"].includes(capability)) score += 15;
  if (tool.risk.includes("manual")) score -= 15;
  if (tool.risk.includes("optional")) score -= 10;
  return score;
}

function resolveAnythingTool(capability, options = {}) {
  const tools = listAnythingTools(options)
    .filter((tool) => tool.capabilities.includes(capability))
    .map((tool) => ({ ...tool, score: rankProvider(tool, capability) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const selected = tools.find((tool) => tool.available) || tools[0] || null;
  return {
    schema: "kaizen7.anything_tool_resolution.v1",
    capability,
    status: selected ? (selected.available ? "ready" : "provider_unavailable") : "unsupported",
    selected,
    providers: tools,
    evidence_required: selected?.evidence || [],
    next_action: selected
      ? selected.available
        ? "execute_provider_with_evidence"
        : "install_or_start_provider"
      : "forge_new_provider",
  };
}

function buildAnythingToolsReport(options = {}) {
  const tools = listAnythingTools(options);
  return {
    schema: "kaizen7.anything_tools_report.v1",
    version: 1,
    tools,
    available: tools.filter((tool) => tool.available).map((tool) => tool.id),
    unavailable: tools.filter((tool) => !tool.available).map((tool) => tool.id),
  };
}

function formatAnythingToolsReport(report) {
  return [
    "## KAIZEN7 Anything Tools",
    "",
    `Available: ${report.available.length}`,
    `Unavailable: ${report.unavailable.length}`,
    "",
    ...report.tools.map((tool) => `- ${tool.available ? "ready" : "missing"} ${tool.id}: ${tool.capabilities.join(", ")}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const capabilityIndex = process.argv.indexOf("--capability");
  if (capabilityIndex >= 0) {
    console.log(JSON.stringify(resolveAnythingTool(process.argv[capabilityIndex + 1] || ""), null, 2));
  } else {
    console.log(JSON.stringify(buildAnythingToolsReport(), null, 2));
  }
}

module.exports = {
  buildAnythingToolsReport,
  detectTool,
  formatAnythingToolsReport,
  listAnythingTools,
  loadAnythingTools,
  resolveAnythingTool,
};
