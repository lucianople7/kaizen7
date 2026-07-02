const assert = require("node:assert/strict");
const {
  buildAnythingToolsReport,
  loadAnythingTools,
  resolveAnythingTool,
} = require("../lib/anything-tool-registry");

const registry = loadAnythingTools();
assert.equal(registry.schema, "kaizen7.anything_tools.v1");
assert(registry.tools.some((tool) => tool.id === "remotion"));
assert(registry.tools.some((tool) => tool.id === "flowmatik-audio"));
assert(registry.tools.some((tool) => tool.id === "omni-media-engine"));
assert(registry.tools.some((tool) => tool.capabilities.includes("video.render")));

const report = buildAnythingToolsReport();
assert.equal(report.schema, "kaizen7.anything_tools_report.v1");
assert(report.tools.some((tool) => tool.id === "remotion" && tool.available));
assert(report.tools.some((tool) => tool.id === "flowmatik-audio" && tool.available));
assert(report.tools.some((tool) => tool.id === "omni-media-engine" && tool.available));
assert(report.available.includes("remotion"));
assert(report.available.includes("flowmatik-audio"));
assert(report.available.includes("omni-media-engine"));

const mediaPipeline = resolveAnythingTool("media.pipeline");
assert.equal(mediaPipeline.status, "ready");
assert.equal(mediaPipeline.selected.id, "omni-media-engine");
assert(mediaPipeline.evidence_required.includes("session_state_exists"));

const videoRender = resolveAnythingTool("video.render");
assert.equal(videoRender.schema, "kaizen7.anything_tool_resolution.v1");
assert.equal(videoRender.status, "ready");
assert.equal(videoRender.selected.id, "remotion");
assert(videoRender.evidence_required.includes("dimensions_9_16"));

const voiceLocal = resolveAnythingTool("voice.local");
assert.equal(voiceLocal.status, "ready");
assert.equal(voiceLocal.selected.id, "flowmatik-audio");

const imageGenerate = resolveAnythingTool("image.generate");
assert(["provider_unavailable", "ready"].includes(imageGenerate.status));
assert.equal(imageGenerate.selected.id, "comfyui");

const unsupported = resolveAnythingTool("space.teleport");
assert.equal(unsupported.status, "unsupported");
assert.equal(unsupported.next_action, "forge_new_provider");

console.log("anything tool registry tests passed");
