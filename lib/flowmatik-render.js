const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { buildFlowmatikAudioPlan, generateFlowmatikAudio } = require("./flowmatik-audio");

const ROOT = path.resolve(__dirname, "..");
const ENTRY = path.join(ROOT, "remotion", "index.jsx");
const OUTPUT = path.join(ROOT, "content_library", "exports", "mr_kaizen_bangkok_energy_first_flow.mp4");
const STILL = path.join(ROOT, "content_library", "exports", "mr_kaizen_bangkok_energy_first_flow_frame.png");
const REMOTION_CLI = path.join(ROOT, "node_modules", "@remotion", "cli", "remotion-cli.js");

function buildFlowmatikRenderPlan(options = {}) {
  const output = path.resolve(options.output || OUTPUT);
  const audioPlan = buildFlowmatikAudioPlan();
  return {
    version: 1,
    status: "ready",
    mode: "flowmatik-remotion-render",
    composition: "MrKaizenFirstFlow",
    entry: ENTRY,
    output,
    still: path.resolve(options.still || STILL),
    format: {
      width: 1080,
      height: 1920,
      fps: 30,
      durationSeconds: 30,
      ratio: "9:16",
    },
    inputs: [
      path.join(ROOT, "content_library", "projects", "first_flow", "mr_kaizen_bangkok_energy_first_flow.json"),
      audioPlan.voice.output,
      audioPlan.music.output,
    ],
    audio: {
      voice: audioPlan.voice.publicPath,
      music: audioPlan.music.publicPath,
    },
    commands: {
      preview: "npx remotion studio remotion/index.jsx",
      still: `npx remotion still remotion/index.jsx MrKaizenFirstFlow ${path.relative(ROOT, path.resolve(options.still || STILL))} --frame=210`,
      render: `npx remotion render remotion/index.jsx MrKaizenFirstFlow ${path.relative(ROOT, output)}`,
    },
    verification: ["output_exists", "mp4_created", "9_16_composition"],
  };
}

function runRemotion(args, options = {}) {
  const result = spawnSync(process.execPath, [REMOTION_CLI, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: options.stdio || "pipe",
  });
  return result;
}

function renderStill(options = {}) {
  const plan = buildFlowmatikRenderPlan(options);
  generateFlowmatikAudio();
  fs.mkdirSync(path.dirname(plan.still), { recursive: true });
  const result = runRemotion(["still", "remotion/index.jsx", plan.composition, plan.still, "--frame=210"], {
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`Remotion still failed with status ${result.status}: ${result.error?.message || "unknown error"}`);
  return plan;
}

function renderVideo(options = {}) {
  const plan = buildFlowmatikRenderPlan(options);
  generateFlowmatikAudio();
  fs.mkdirSync(path.dirname(plan.output), { recursive: true });
  const result = runRemotion(["render", "remotion/index.jsx", plan.composition, plan.output], {
    stdio: "inherit",
  });
  if (result.status !== 0) throw new Error(`Remotion render failed with status ${result.status}: ${result.error?.message || "unknown error"}`);
  return plan;
}

function parseArgs(argv = []) {
  return {
    json: argv.includes("--json"),
    still: argv.includes("--still"),
    render: argv.includes("--render"),
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const plan = buildFlowmatikRenderPlan();
  if (args.render) renderVideo();
  else if (args.still) renderStill();
  else console.log(JSON.stringify(plan, null, args.json ? 2 : 2));
}

module.exports = {
  buildFlowmatikRenderPlan,
  renderStill,
  renderVideo,
};
