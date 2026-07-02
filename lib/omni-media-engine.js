const fs = require("node:fs");
const path = require("node:path");
const { resolveAnythingTool } = require("./anything-tool-registry");

const ROOT = path.resolve(__dirname, "..");
const PRESETS_PATH = path.join(ROOT, "data", "omni-presets.json");

function loadOmniPresets(filePath = PRESETS_PATH) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function slugify(value) {
  return String(value || "omni-media-session")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "omni-media-session";
}

function selectPreset(format, presets = loadOmniPresets()) {
  const selected = presets.presets[format || "vertical"];
  if (!selected) {
    throw new Error(`Unknown omni media format: ${format}`);
  }
  return selected;
}

function compactResolution(resolution) {
  return {
    capability: resolution.capability,
    status: resolution.status,
    selected: resolution.selected
      ? {
          id: resolution.selected.id,
          kind: resolution.selected.kind,
          available: resolution.selected.available,
          commands: resolution.selected.commands,
        }
      : null,
    next_action: resolution.next_action,
  };
}

function buildOmniSteps() {
  return [
    {
      id: "script",
      capability: "content.script",
      status: "manual_input",
      output: "Guion pegado o generado por Mr. Kaizen Writer",
      evidence: ["script_present", "hook_present", "cta_present"],
    },
    {
      id: "audio",
      capability: "voice.local",
      status: "ready",
      output: "Voiceover WAV local y musica base",
      evidence: ["voice_wav_exists", "music_wav_exists"],
    },
    {
      id: "visual",
      capability: "visual.asset_select",
      status: "manual_or_library",
      output: "Clips, imagenes o composicion Remotion",
      evidence: ["assets_selected", "brand_style_present"],
    },
    {
      id: "render",
      capability: "video.render",
      status: "ready",
      output: "MP4 exportado en el formato objetivo",
      evidence: ["output_exists", "dimensions_valid", "duration_valid"],
    },
    {
      id: "verify",
      capability: "media.probe",
      status: "ready",
      output: "Comprobacion tecnica del archivo final",
      evidence: ["probe_passed", "audio_present", "video_present"],
    },
    {
      id: "memory",
      capability: "memory.capture",
      status: "pending",
      output: "Sesion, decisiones y assets guardados",
      evidence: ["session_json_exists", "handoff_note_exists"],
    },
  ];
}

function buildStructuredError(error, context = {}) {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  const errorType = context.errorType || context.error_type || "OMNI_MEDIA_ERROR";
  const retryStep = context.step || "plan";
  return {
    schema: "kaizen7.omni_error.v1",
    status: "error",
    error_type: errorType,
    message,
    recoverable: context.recoverable !== false,
    retry_step: retryStep,
    suggested_fix: context.suggestedFix || `Revisar la entrada de ${retryStep} y volver a ejecutar la sesion.`,
    context: {
      format: context.format || null,
      session_id: context.session_id || null,
      provider: context.provider || null,
    },
  };
}

function buildOmniMediaPlan(options = {}) {
  const presets = loadOmniPresets(options.presetsPath);
  const formatKey = options.format || "vertical";
  const preset = selectPreset(formatKey, presets);
  const topic = options.topic || "Mr. Kaizen content system";
  const duration = Number(options.durationSeconds || options.duration || preset.default_duration_seconds);
  const stateRoot = options.stateRoot || options.root || ROOT;
  const providerRoot = options.providerRoot || ROOT;
  const sessionId = `${slugify(topic)}-${formatKey}`;
  const sessionDir = path.join(stateRoot, "content_library", "omni", "sessions", sessionId);

  const providers = {
    voice: compactResolution(resolveAnythingTool("voice.local", { root: providerRoot })),
    music: compactResolution(resolveAnythingTool("music.generate", { root: providerRoot })),
    render: compactResolution(resolveAnythingTool("video.render", { root: providerRoot })),
    probe: compactResolution(resolveAnythingTool("media.probe", { root: providerRoot })),
  };

  return {
    schema: "kaizen7.omni_media_plan.v1",
    version: 1,
    created_at: new Date().toISOString(),
    session_id: sessionId,
    objective: "Crear una pieza audiovisual reproducible para Flowmatik, Mr. Kaizen o THE FOCUX.",
    topic,
    format: {
      key: formatKey,
      label: preset.label,
      width: preset.width,
      height: preset.height,
      fps: preset.fps,
      duration_seconds: duration,
      channels: preset.channels,
    },
    policy: {
      local_first: true,
      external_apis: false,
      capability_first: true,
      provider_replaceable: true,
      not_reels_only: true,
    },
    session: {
      dir: sessionDir,
      state_file: path.join(sessionDir, "session.json"),
    },
    providers,
    steps: buildOmniSteps(),
    error_contract: {
      schema: "kaizen7.omni_error.v1",
      fields: ["status", "error_type", "message", "recoverable", "retry_step", "suggested_fix", "context"],
    },
    next_action: "write_session_or_execute_first_provider",
  };
}

function writeOmniSession(plan) {
  fs.mkdirSync(plan.session.dir, { recursive: true });
  const session = {
    schema: "kaizen7.omni_session.v1",
    status: "planned",
    plan,
    state: {
      current_step: "script",
      steps: plan.steps.map((step) => ({
        id: step.id,
        status: step.status,
        evidence: [],
        updated_at: null,
      })),
      assets: [],
      outputs: [],
      errors: [],
    },
  };
  fs.writeFileSync(plan.session.state_file, `${JSON.stringify(session, null, 2)}\n`);
  return plan.session.state_file;
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--format") options.format = argv[++index];
    else if (arg === "--topic") options.topic = argv[++index];
    else if (arg === "--duration") options.duration = argv[++index];
    else if (arg === "--write") options.write = true;
    else if (arg === "--json") options.json = true;
  }
  return options;
}

function formatOmniPlan(plan, wroteFile) {
  return [
    "## KAIZEN7 Omni-Media Engine",
    "",
    `Session: ${plan.session_id}`,
    `Format: ${plan.format.key} (${plan.format.width}x${plan.format.height}, ${plan.format.duration_seconds}s)`,
    `Channels: ${plan.format.channels.join(", ")}`,
    `State: ${wroteFile || plan.session.state_file}`,
    "",
    "Providers:",
    `- voice: ${plan.providers.voice.selected?.id || "missing"} (${plan.providers.voice.status})`,
    `- music: ${plan.providers.music.selected?.id || "missing"} (${plan.providers.music.status})`,
    `- render: ${plan.providers.render.selected?.id || "missing"} (${plan.providers.render.status})`,
    `- probe: ${plan.providers.probe.selected?.id || "missing"} (${plan.providers.probe.status})`,
    "",
    "Steps:",
    ...plan.steps.map((step) => `- ${step.id}: ${step.capability} -> ${step.status}`),
    "",
  ].join("\n");
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const plan = buildOmniMediaPlan(options);
    const wroteFile = options.write ? writeOmniSession(plan) : null;
    if (options.json) {
      console.log(JSON.stringify({ plan, wroteFile }, null, 2));
    } else {
      console.log(formatOmniPlan(plan, wroteFile));
    }
  } catch (error) {
    const structured = buildStructuredError(error, { step: "plan", recoverable: true });
    console.error(JSON.stringify(structured, null, 2));
    process.exitCode = 1;
  }
}

module.exports = {
  buildOmniMediaPlan,
  buildStructuredError,
  formatOmniPlan,
  loadOmniPresets,
  selectPreset,
  slugify,
  writeOmniSession,
};
