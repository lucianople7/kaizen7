const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  OFFICIAL_SMOKE_ARGS,
  assertWorkspacePath,
  detectSkillOpt,
  prepareSkillOptRun,
  providerCredentialNames,
  runChild,
  runSkillOptSmoke,
  sha256File,
} = require("../lib/skillopt-adapter");

assert.deepEqual(providerCredentialNames({ NODE_REPL_AUTH_TOKEN: "runtime-only" }), []);
assert.deepEqual(providerCredentialNames({ OPENAI_API_KEY: "provider-secret" }), ["OPENAI_API_KEY"]);

(async () => {
  const calls = [];
  const ready = await detectSkillOpt({
    python: "python-test",
    env: {
      PATH: process.env.PATH,
      OPENAI_API_KEY: "secret-openai",
      AZURE_OPENAI_API_KEY: "secret-azure",
      ANTHROPIC_API_KEY: "secret-anthropic",
    },
    runner: async (command, args, options) => {
      calls.push({ command, args, options });
      return {
        code: 0,
        stdout: JSON.stringify({ python: "3.11.9", skillopt: "0.2.0" }),
        stderr: "",
        timedOut: false,
      };
    },
  });
  assert.equal(ready.status, "ready");
  assert.equal(ready.pythonVersion, "3.11.9");
  assert.equal(ready.skilloptVersion, "0.2.0");
  assert.equal(calls[0].command, "python-test");
  assert(Array.isArray(calls[0].args));
  assert.equal(calls[0].options.shell, false);
  assert.equal(typeof calls[0].options.timeoutMs, "number");
  assert.equal(calls[0].options.env.OPENAI_API_KEY, undefined);
  assert.equal(calls[0].options.env.AZURE_OPENAI_API_KEY, undefined);
  assert.equal(calls[0].options.env.ANTHROPIC_API_KEY, undefined);

  const unsupported = await detectSkillOpt({
    runner: async () => ({
      code: 0,
      stdout: JSON.stringify({ python: "3.12.0", skillopt: "0.3.0" }),
      stderr: "",
      timedOut: false,
    }),
  });
  assert.equal(unsupported.status, "unsupported_version");

  const unavailable = await detectSkillOpt({
    runner: async () => ({ code: 127, stdout: "", stderr: "not found", timedOut: false }),
  });
  assert.equal(unavailable.status, "unavailable");

  const malformed = await detectSkillOpt({
    runner: async () => ({ code: 0, stdout: "not-json", stderr: "", timedOut: false }),
  });
  assert.equal(malformed.status, "blocked");

  const oldPython = await detectSkillOpt({
    runner: async () => ({
      code: 0,
      stdout: JSON.stringify({ python: "3.9.18", skillopt: "0.2.0" }),
      stderr: "",
      timedOut: false,
    }),
  });
  assert.equal(oldPython.status, "blocked");

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-skillopt-adapter-"));
  const source = path.join(root, ".agents", "skills", "k7-self-evolution-loop", "SKILL.md");
  fs.mkdirSync(path.dirname(source), { recursive: true });
  fs.writeFileSync(source, "# Self Evolution\n\nImprove one verified friction.\n", "utf8");

  assert.equal(assertWorkspacePath(source, { root }), source);
  assert.throws(() => assertWorkspacePath(path.join(root, "..", "outside.md"), { root }), /outside workspace/i);

  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "k7-skillopt-outside-"));
  const outsideFile = path.join(outside, "secret.md");
  fs.writeFileSync(outsideFile, "outside", "utf8");
  const escapingLink = path.join(root, "escaping-link.md");
  fs.symlinkSync(outsideFile, escapingLink);
  assert.throws(() => assertWorkspacePath(escapingLink, { root }), /outside workspace/i);

  const sourceBefore = fs.readFileSync(source, "utf8");
  const prepared = prepareSkillOptRun(".agents/skills/k7-self-evolution-loop/SKILL.md", {
    root,
    now: () => "2026-07-21T09:00:00.000Z",
  });
  const expectedHash = sha256File(source);
  assert.equal(prepared.status, "prepared");
  assert.equal(prepared.runId, `k7s-${expectedHash.slice(0, 12)}`);
  assert.equal(prepared.manifest.sourceHash, expectedHash);
  assert.equal(prepared.manifest.baselineHash, expectedHash);
  assert.equal(fs.readFileSync(source, "utf8"), sourceBefore);
  assert.equal(fs.readFileSync(path.join(prepared.runDirectory, "baseline", "SKILL.md"), "utf8"), sourceBefore);
  assert.equal(JSON.parse(fs.readFileSync(path.join(prepared.runDirectory, "manifest.json"), "utf8")).runId, prepared.runId);
  assert.equal(prepareSkillOptRun(source, { root }).status, "existing");

  let smokeCalls = 0;
  const blockedSmoke = await runSkillOptSmoke({
    env: { OPENAI_API_KEY: "must-not-use" },
    runner: async () => { smokeCalls += 1; },
  });
  assert.equal(blockedSmoke.status, "blocked");
  assert.equal(smokeCalls, 0);

  const smokeArgs = [];
  const passedSmoke = await runSkillOptSmoke({
    root,
    python: "python-test",
    env: { PATH: process.env.PATH },
    runner: async (command, args) => {
      smokeArgs.push({ command, args });
      if (args.some((arg) => arg.includes("importlib.metadata"))) {
        return {
          code: 0,
          stdout: JSON.stringify({ python: "3.11.9", skillopt: "0.2.0" }),
          stderr: "",
          timedOut: false,
        };
      }
      return { code: 0, stdout: "experiment improved", stderr: "", timedOut: false };
    },
  });
  assert.equal(passedSmoke.status, "passed");
  assert.equal(passedSmoke.outputTrust, "untrusted_upstream_text");
  assert.deepEqual(smokeArgs[1].args, OFFICIAL_SMOKE_ARGS);

  const childResult = await runChild(process.execPath, ["-e", "process.stdout.write('1234567890')"], {
    cwd: root,
    env: { PATH: process.env.PATH },
    maxOutputBytes: 5,
    timeoutMs: 1000,
  });
  assert.equal(childResult.code, 0);
  assert.equal(childResult.stdout, "12345");
  assert.equal(childResult.truncated, true);

  console.log("skillopt adapter tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
