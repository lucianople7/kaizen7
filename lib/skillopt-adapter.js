const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { SUPPORTED_SKILLOPT_VERSION } = require("./skillopt-gate");

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_OUTPUT_BYTES = 64 * 1024;
const VERSION_PROBE = [
  "-c",
  "import json,sys; from importlib.metadata import version; print(json.dumps({'python': '.'.join(map(str, sys.version_info[:3])), 'skillopt': version('skillopt')}))",
];
const OFFICIAL_SMOKE_ARGS = [
  "-m",
  "skillopt_sleep.experiments.run_experiment",
  "--persona",
  "researcher",
  "--assert-improves",
];
const SAFE_ENV_KEYS = new Set([
  "PATH",
  "Path",
  "SYSTEMROOT",
  "SystemRoot",
  "WINDIR",
  "TEMP",
  "TMP",
  "TMPDIR",
  "LANG",
  "LC_ALL",
  "HOME",
  "USERPROFILE",
]);
const PROVIDER_CREDENTIAL_PATTERN = /^(?:OPENAI|AZURE_OPENAI|ANTHROPIC|MINIMAX|QWEN|DEEPSEEK|HUGGINGFACE|HF|SKILLOPT(?:_[A-Z0-9]+)*)_(?:API_KEY|ACCESS_TOKEN|AUTH_TOKEN|BEARER_TOKEN|TOKEN)$/i;

function redactProcessText(value = "") {
  return String(value)
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]{6,}/gi, "Bearer [REDACTED]")
    .replace(/((?:api[_ -]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[REDACTED]");
}

function sanitizedEnvironment(env = {}) {
  return Object.fromEntries(Object.entries(env).filter(([key]) => SAFE_ENV_KEYS.has(key)));
}

function providerCredentialNames(env = {}) {
  return Object.entries(env)
    .filter(([key, value]) => value && PROVIDER_CREDENTIAL_PATTERN.test(key))
    .map(([key]) => key)
    .sort();
}

function appendBounded(current, chunk, maxBytes) {
  const available = Math.max(0, maxBytes - Buffer.byteLength(current));
  if (!available) return { value: current, truncated: true };
  const buffer = Buffer.from(chunk);
  const next = buffer.subarray(0, available).toString("utf8");
  return { value: current + next, truncated: buffer.length > available };
}

function runChild(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    const maxOutputBytes = options.maxOutputBytes || DEFAULT_MAX_OUTPUT_BYTES;
    let stdout = "";
    let stderr = "";
    let truncated = false;
    let settled = false;
    let child;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        code: result.code,
        signal: result.signal || null,
        stdout: redactProcessText(stdout),
        stderr: redactProcessText(stderr),
        timedOut: result.timedOut === true,
        truncated,
        error: result.error ? redactProcessText(result.error.message || result.error) : null,
      });
    };

    try {
      child = spawn(command, args, {
        cwd: options.cwd,
        env: options.env,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      resolve({ code: null, signal: null, stdout, stderr, timedOut: false, truncated, error: redactProcessText(error.message) });
      return;
    }

    child.stdout.on("data", (chunk) => {
      const bounded = appendBounded(stdout, chunk, maxOutputBytes);
      stdout = bounded.value;
      truncated ||= bounded.truncated;
    });
    child.stderr.on("data", (chunk) => {
      const bounded = appendBounded(stderr, chunk, maxOutputBytes);
      stderr = bounded.value;
      truncated ||= bounded.truncated;
    });
    child.on("error", (error) => finish({ code: null, error }));
    child.on("close", (code, signal) => finish({ code, signal }));

    const timer = setTimeout(() => {
      if (settled) return;
      child.kill("SIGTERM");
      finish({ code: null, signal: "SIGTERM", timedOut: true });
    }, timeoutMs);
  });
}

function parsePythonVersion(version = "") {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(version).trim());
  if (!match) return null;
  return match.slice(1).map(Number);
}

function supportedPython(version) {
  const parsed = parsePythonVersion(version);
  return Boolean(parsed && (parsed[0] > 3 || (parsed[0] === 3 && parsed[1] >= 10)));
}

async function detectSkillOpt(options = {}) {
  const env = options.env || process.env;
  const python = options.python || env.SKILLOPT_PYTHON || "python3";
  const runner = options.runner || runChild;
  let result;
  try {
    result = await runner(python, VERSION_PROBE, {
      cwd: path.resolve(options.root || process.cwd()),
      env: sanitizedEnvironment(env),
      shell: false,
      timeoutMs: options.timeoutMs || 15_000,
      maxOutputBytes: options.maxOutputBytes || 8_192,
    });
  } catch (error) {
    return { status: error?.code === "ENOENT" ? "unavailable" : "blocked", reason: redactProcessText(error.message) };
  }

  if (!result || result.code !== 0) {
    return {
      status: "unavailable",
      reason: result?.timedOut ? "SkillOpt version probe timed out." : "Python or SkillOpt 0.2.0 is unavailable.",
      detail: redactProcessText(result?.stderr || result?.error || ""),
    };
  }

  let metadata;
  try {
    const lastLine = String(result.stdout || "").trim().split(/\r?\n/).filter(Boolean).at(-1);
    metadata = JSON.parse(lastLine);
  } catch {
    return { status: "blocked", reason: "SkillOpt version probe returned malformed metadata." };
  }
  if (!supportedPython(metadata.python)) {
    return { status: "blocked", pythonVersion: metadata.python || null, skilloptVersion: metadata.skillopt || null, reason: "Python 3.10 or newer is required." };
  }
  if (metadata.skillopt !== SUPPORTED_SKILLOPT_VERSION) {
    return {
      status: "unsupported_version",
      pythonVersion: metadata.python,
      skilloptVersion: metadata.skillopt || null,
      supportedVersion: SUPPORTED_SKILLOPT_VERSION,
      reason: `SkillOpt ${SUPPORTED_SKILLOPT_VERSION} is required by this integration revision.`,
    };
  }
  return {
    status: "ready",
    python,
    pythonVersion: metadata.python,
    skilloptVersion: metadata.skillopt,
    supportedVersion: SUPPORTED_SKILLOPT_VERSION,
    reason: "Stable SkillOpt runtime is available.",
  };
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function closestExistingPath(target) {
  let current = target;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
  return current;
}

function assertWorkspacePath(target, options = {}) {
  const root = fs.realpathSync(path.resolve(options.root || process.cwd()));
  const absolute = path.resolve(root, String(target || ""));
  if (!isWithin(root, absolute)) throw new Error(`Path is outside workspace: ${target}`);

  const mustExist = options.mustExist !== false;
  if (mustExist && !fs.existsSync(absolute)) throw new Error(`Workspace path does not exist: ${target}`);
  const existing = closestExistingPath(absolute);
  const realExisting = fs.realpathSync(existing);
  if (!isWithin(root, realExisting)) throw new Error(`Path resolves outside workspace: ${target}`);
  if (fs.existsSync(absolute)) {
    const realTarget = fs.realpathSync(absolute);
    if (!isWithin(root, realTarget)) throw new Error(`Path resolves outside workspace: ${target}`);
    return realTarget;
  }
  return absolute;
}

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function toRelativePosix(root, target) {
  return path.relative(root, target).split(path.sep).join("/");
}

function prepareSkillOptRun(source = ".agents/skills/k7-self-evolution-loop/SKILL.md", options = {}) {
  const root = fs.realpathSync(path.resolve(options.root || process.cwd()));
  const sourcePath = assertWorkspacePath(source, { root });
  if (!fs.statSync(sourcePath).isFile()) throw new Error("SkillOpt source must be a file.");
  const sourceHash = sha256File(sourcePath);
  const runId = `k7s-${sourceHash.slice(0, 12)}`;
  const runDirectory = assertWorkspacePath(path.join(root, "data", "skillopt", "runs", runId), { root, mustExist: false });
  const manifestPath = path.join(runDirectory, "manifest.json");

  if (fs.existsSync(runDirectory)) {
    assertWorkspacePath(runDirectory, { root });
    if (!fs.existsSync(manifestPath)) throw new Error("Existing SkillOpt run directory has no manifest; refusing to overwrite it.");
    const manifest = JSON.parse(fs.readFileSync(assertWorkspacePath(manifestPath, { root }), "utf8"));
    if (manifest.sourceHash !== sourceHash || manifest.sourceSkill !== toRelativePosix(root, sourcePath)) {
      throw new Error("Existing SkillOpt run manifest does not match the requested source.");
    }
    return { status: "existing", runId, runDirectory, manifestPath, manifest };
  }

  const baselineDirectory = path.join(runDirectory, "baseline");
  fs.mkdirSync(baselineDirectory, { recursive: true });
  const baselinePath = path.join(baselineDirectory, "SKILL.md");
  fs.copyFileSync(sourcePath, baselinePath, fs.constants.COPYFILE_EXCL);
  const baselineHash = sha256File(baselinePath);
  const manifest = {
    schema: "kaizen7.skillopt_run.v1",
    runId,
    skilloptVersion: SUPPORTED_SKILLOPT_VERSION,
    createdAt: options.now ? options.now() : new Date().toISOString(),
    sourceSkill: toRelativePosix(root, sourcePath),
    sourceHash,
    baselineSkill: "baseline/SKILL.md",
    baselineHash,
    candidateSkill: "candidate/best_skill.md",
    candidateHash: null,
    splits: { train: [], validation: [], test: [] },
    commands: [],
    productionWrites: [],
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { status: "prepared", runId, runDirectory, manifestPath, manifest };
}

async function runSkillOptSmoke(options = {}) {
  const env = options.env || process.env;
  const credentialNames = providerCredentialNames(env);
  if (credentialNames.length) {
    return {
      schema: "kaizen7.skillopt_smoke.v1",
      status: "blocked",
      reason: "Provider credentials are present; the SkillOpt smoke proof must remain credential-free.",
      credentialNames,
    };
  }
  const runtime = await detectSkillOpt(options);
  if (runtime.status !== "ready") {
    return { schema: "kaizen7.skillopt_smoke.v1", status: "blocked", runtime, reason: runtime.reason };
  }
  const runner = options.runner || runChild;
  const result = await runner(runtime.python, OFFICIAL_SMOKE_ARGS, {
    cwd: path.resolve(options.root || process.cwd()),
    env: sanitizedEnvironment(env),
    shell: false,
    timeoutMs: options.timeoutMs || DEFAULT_TIMEOUT_MS,
    maxOutputBytes: options.maxOutputBytes || DEFAULT_MAX_OUTPUT_BYTES,
  });
  return {
    schema: "kaizen7.skillopt_smoke.v1",
    status: result?.code === 0 && !result?.timedOut ? "passed" : "failed",
    runtime,
    command: { executable: runtime.python, args: OFFICIAL_SMOKE_ARGS },
    exitCode: result?.code ?? null,
    timedOut: result?.timedOut === true,
    truncated: result?.truncated === true,
    outputTrust: "untrusted_upstream_text",
    stdout: redactProcessText(result?.stdout || ""),
    stderr: redactProcessText(result?.stderr || result?.error || ""),
    reason: result?.code === 0 && !result?.timedOut
      ? "Official deterministic SkillOpt experiment passed without provider credentials."
      : "Official deterministic SkillOpt experiment did not pass.",
  };
}

module.exports = {
  DEFAULT_MAX_OUTPUT_BYTES,
  DEFAULT_TIMEOUT_MS,
  OFFICIAL_SMOKE_ARGS,
  VERSION_PROBE,
  assertWorkspacePath,
  detectSkillOpt,
  prepareSkillOptRun,
  providerCredentialNames,
  redactProcessText,
  runChild,
  runSkillOptSmoke,
  sanitizedEnvironment,
  sha256File,
};
