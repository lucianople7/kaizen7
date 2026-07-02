const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { buildFirstFlow } = require("./first-flow");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_AUDIO_DIR = path.join(ROOT, "public", "flowmatik", "first_flow");
const CONTENT_AUDIO_DIR = path.join(ROOT, "content_library", "audio", "first_flow");
const VOICE_WAV = path.join(PUBLIC_AUDIO_DIR, "voice.wav");
const MUSIC_WAV = path.join(PUBLIC_AUDIO_DIR, "music.wav");
const SCRIPT_TXT = path.join(CONTENT_AUDIO_DIR, "voiceover.txt");
const SAMPLE_RATE = 44100;

function writeWav(filePath, samples, sampleRate = SAMPLE_RATE) {
  const bytesPerSample = 2;
  const channels = 1;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + index * 2);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function envelope(t, duration) {
  const attack = Math.min(1, t / 0.5);
  const release = Math.min(1, (duration - t) / 1.5);
  return Math.max(0, Math.min(attack, release));
}

function generateMusicSamples(durationSeconds = 30) {
  const total = durationSeconds * SAMPLE_RATE;
  const notes = [110, 164.81, 220, 246.94, 329.63];
  const samples = new Array(total);

  for (let index = 0; index < total; index += 1) {
    const t = index / SAMPLE_RATE;
    const beat = Math.sin(2 * Math.PI * 2 * t) > 0.985 ? 0.18 : 0;
    const pad = notes.reduce((sum, frequency, noteIndex) => {
      const wobble = Math.sin(2 * Math.PI * 0.08 * t + noteIndex) * 1.5;
      return sum + Math.sin(2 * Math.PI * (frequency + wobble) * t) * 0.045;
    }, 0);
    const shimmer = Math.sin(2 * Math.PI * 659.25 * t) * 0.015 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.25 * t));
    samples[index] = (pad + shimmer + beat) * envelope(t, durationSeconds);
  }

  return samples;
}

function powershellString(value) {
  return String(value).replaceAll("'", "''");
}

function synthesizeVoiceWithWindows(text, outputPath) {
  const command = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $synth.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1
if ($voice) { $synth.SelectVoice($voice.VoiceInfo.Name) }
$synth.Rate = -1
$synth.Volume = 100
$synth.SetOutputToWaveFile('${powershellString(outputPath)}')
$synth.Speak('${powershellString(text)}')
$synth.Dispose()
`;
  const encoded = Buffer.from(command, "utf16le").toString("base64");
  const result = spawnSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 120000,
  });
  return {
    ok: result.status === 0 && fs.existsSync(outputPath),
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function buildFlowmatikAudioPlan(options = {}) {
  const flow = options.flow || buildFirstFlow();
  return {
    version: 1,
    status: "ready",
    mode: "flowmatik-audio",
    voice: {
      provider: "windows-sapi",
      output: VOICE_WAV,
      publicPath: "flowmatik/first_flow/voice.wav",
      script: flow.script.voiceover,
    },
    music: {
      provider: "node-wav-generator",
      output: MUSIC_WAV,
      publicPath: "flowmatik/first_flow/music.wav",
      durationSeconds: 30,
    },
    transcript: SCRIPT_TXT,
    evidence: ["voice_wav_exists", "music_wav_exists", "script_saved"],
  };
}

function generateFlowmatikAudio(options = {}) {
  const plan = buildFlowmatikAudioPlan(options);
  fs.mkdirSync(PUBLIC_AUDIO_DIR, { recursive: true });
  fs.mkdirSync(CONTENT_AUDIO_DIR, { recursive: true });
  fs.writeFileSync(plan.transcript, `${plan.voice.script}\n`);
  writeWav(plan.music.output, generateMusicSamples(plan.music.durationSeconds));

  const voice = synthesizeVoiceWithWindows(plan.voice.script, plan.voice.output);
  if (!voice.ok) {
    writeWav(plan.voice.output, new Array(SAMPLE_RATE * 2).fill(0));
    plan.voice.warning = "Windows voice synthesis failed; wrote silent placeholder.";
    plan.voice.error = voice.stderr || voice.stdout || `status ${voice.status}`;
  }

  return {
    ...plan,
    status: fs.existsSync(plan.voice.output) && fs.existsSync(plan.music.output) ? "ready" : "blocked",
  };
}

if (require.main === module) {
  if (process.argv.includes("--generate")) console.log(JSON.stringify(generateFlowmatikAudio(), null, 2));
  else console.log(JSON.stringify(buildFlowmatikAudioPlan(), null, 2));
}

module.exports = {
  buildFlowmatikAudioPlan,
  generateFlowmatikAudio,
  generateMusicSamples,
  synthesizeVoiceWithWindows,
  writeWav,
};
