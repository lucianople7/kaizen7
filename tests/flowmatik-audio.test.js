const assert = require("node:assert/strict");
const {
  buildFlowmatikAudioPlan,
  generateMusicSamples,
} = require("../lib/flowmatik-audio");

const plan = buildFlowmatikAudioPlan();

assert.equal(plan.status, "ready");
assert.equal(plan.mode, "flowmatik-audio");
assert.equal(plan.voice.provider, "windows-sapi");
assert.equal(plan.music.provider, "node-wav-generator");
assert(plan.voice.script.includes("THE FOCUX"));
assert(plan.evidence.includes("voice_wav_exists"));

const samples = generateMusicSamples(1);
assert.equal(samples.length, 44100);
assert(samples.some((sample) => sample !== 0));

console.log("flowmatik audio tests passed");
