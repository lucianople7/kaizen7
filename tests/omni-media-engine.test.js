const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildOmniMediaPlan,
  buildStructuredError,
  selectPreset,
  slugify,
  writeOmniSession,
} = require("../lib/omni-media-engine");

assert.equal(slugify("Mr. Kaizen en Bangkok: energia real"), "mr-kaizen-en-bangkok-energia-real");

const vertical = buildOmniMediaPlan({
  topic: "Mr Kaizen Bangkok energy",
  format: "vertical",
});
assert.equal(vertical.schema, "kaizen7.omni_media_plan.v1");
assert.equal(vertical.format.width, 1080);
assert.equal(vertical.format.height, 1920);
assert.equal(vertical.policy.not_reels_only, true);
assert.equal(vertical.providers.render.selected.id, "remotion");
assert(vertical.steps.some((step) => step.id === "render" && step.capability === "video.render"));
assert(vertical.error_contract.fields.includes("retry_step"));

const horizontal = buildOmniMediaPlan({
  topic: "THE FOCUX documentary",
  format: "horizontal",
});
assert.equal(horizontal.format.width, 1920);
assert.equal(horizontal.format.height, 1080);
assert(horizontal.format.channels.includes("YouTube"));

const square = selectPreset("square");
assert.equal(square.width, 1080);
assert.equal(square.height, 1080);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-omni-"));
const sessionPlan = buildOmniMediaPlan({
  topic: "Session write test",
  format: "square",
  stateRoot: tempRoot,
});
const stateFile = writeOmniSession(sessionPlan);
assert(fs.existsSync(stateFile));
const session = JSON.parse(fs.readFileSync(stateFile, "utf8"));
assert.equal(session.schema, "kaizen7.omni_session.v1");
assert.equal(session.state.current_step, "script");
assert(session.state.steps.some((step) => step.id === "verify"));

const structuredError = buildStructuredError(new Error("Missing clip asset"), {
  errorType: "ASSET_MISSING",
  step: "visual",
  format: "vertical",
  suggestedFix: "Seleccionar un clip local o generar una composicion Remotion.",
});
assert.equal(structuredError.schema, "kaizen7.omni_error.v1");
assert.equal(structuredError.error_type, "ASSET_MISSING");
assert.equal(structuredError.retry_step, "visual");
assert.equal(structuredError.recoverable, true);

console.log("omni media engine tests passed");
