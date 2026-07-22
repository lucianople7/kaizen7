# SkillOpt Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe, optional SkillOpt 0.2.0 adapter that can prepare a copied KAIZEN7 skill, run the official credential-free smoke proof, evaluate staged evidence, and emit guarded, idempotent receipts without modifying production skills.

**Architecture:** Keep Microsoft SkillOpt behind one process adapter and exact-version gate. Keep deterministic evidence judgment in a pure module, then expose status, fixture, smoke, prepare, and evaluate modes through a narrow CLI. All subprocess, filesystem, promotion, and receipt boundaries remain controlled by KAIZEN7.

**Tech Stack:** Node.js 20 CommonJS, built-in `node:test`-style assertions used by this repository, Python 3.10+, optional `skillopt==0.2.0`, SHA-256 manifests, JSON/JSONL receipts.

## Global Constraints

- Only PyPI `skillopt==0.2.0` is supported; never install from GitHub `main`.
- Automated tests make no network calls, model calls, transcript reads, schedules, adoptions, or production skill writes.
- Only `--prepare` and `--evaluate --write` may write, and only below the configured workspace root.
- Subprocesses use argument arrays with `shell: false`, timeouts, bounded output, redaction, and sanitized environments.
- A candidate is only `promotable` after strictly better validation, non-regressing held-out score, no new failures, stable source hash, distinct candidate hash, and no production writes.
- `promotable` never edits a source skill; it only recommends a separate human-reviewed patch.

---

## File structure

- `lib/skillopt-gate.js`: pure metric normalization, verdict, fingerprint, and optional JSONL receipt.
- `lib/skillopt-adapter.js`: exact version detection, safe child process execution, path containment, hashing, preparation, and smoke probe.
- `lib/skillopt-cli.js`: argument parsing, mode orchestration, fixture, run evaluation, and JSON output.
- `tests/skillopt-gate.test.js`: evidence/verdict/receipt contract.
- `tests/skillopt-adapter.test.js`: process, environment, paths, staging, and smoke contract.
- `tests/skillopt-cli.test.js`: mode parsing and end-to-end fixture/prepare/evaluate orchestration.
- `requirements/skillopt.txt`: exact optional Python dependency pin.
- `docs/SKILLOPT_INTEGRATION.md`: operator guide and evidence limits.
- `.gitignore`: local virtual environment, runs, and receipts.
- `package.json`: `k7:skillopt`, syntax checks, and the three tests.

### Task 1: Pure evidence gate and receipt

**Files:**
- Create: `lib/skillopt-gate.js`
- Create: `tests/skillopt-gate.test.js`

**Interfaces:**
- Consumes: a normalized object with `skilloptVersion`, hashes, split scores, failures, optional token/latency metrics, and `productionWrites`.
- Produces: `normalizeSkillOptEvidence(input)`, `evaluateSkillOptEvidence(input, options)`, `skillOptFingerprint(report)`, and `appendSkillOptReceipt(report, options)`.

- [ ] **Step 1: Write failing evidence-gate tests**

```js
const assert = require("node:assert/strict");
const { evaluateSkillOptEvidence } = require("../lib/skillopt-gate");

const good = {
  skilloptVersion: "0.2.0",
  sourceHash: "a".repeat(64), currentSourceHash: "a".repeat(64),
  baselineHash: "b".repeat(64), candidateHash: "c".repeat(64),
  validation: { baseline: 0.6, candidate: 0.7 },
  test: { baseline: 0.61, candidate: 0.61 },
  metrics: {
    baseline: { failures: 0, tokens: 1000, latencyMs: 100 },
    candidate: { failures: 0, tokens: 900, latencyMs: 95 },
  },
  productionWrites: [],
};
assert.equal(evaluateSkillOptEvidence(good).verdict, "promotable");
assert.equal(evaluateSkillOptEvidence({ ...good, validation: { baseline: 0.6, candidate: 0.6 } }).verdict, "hold");
assert.equal(evaluateSkillOptEvidence({ ...good, test: { baseline: 0.61, candidate: 0.5 } }).verdict, "reject");
assert.equal(evaluateSkillOptEvidence({ ...good, currentSourceHash: "d".repeat(64) }).verdict, "reject");
assert.equal(evaluateSkillOptEvidence({ ...good, validation: { baseline: null, candidate: null } }).verdict, "incomplete");
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node tests/skillopt-gate.test.js`

Expected: FAIL with `Cannot find module '../lib/skillopt-gate'`.

- [ ] **Step 3: Implement normalization and verdict**

Implement exact version/hash/completeness checks, preserve absent tokens and latency as `null`, return schema `kaizen7.skillopt_evaluation.v1`, a `reasons` array, `eligibleForPromotion`, and exactly one string `nextAction`.

```js
function evaluateSkillOptEvidence(input = {}, options = {}) {
  const evidence = normalizeSkillOptEvidence(input);
  const reasons = [];
  let verdict = "promotable";
  if (!hasCompleteRequiredEvidence(evidence)) verdict = "incomplete";
  else if (hasRegressionOrBoundaryFailure(evidence)) verdict = "reject";
  else if (evidence.validation.candidate <= evidence.validation.baseline) verdict = "hold";
  return {
    schema: "kaizen7.skillopt_evaluation.v1",
    simulated: options.simulated === true,
    evidence,
    verdict,
    reasons,
    eligibleForPromotion: verdict === "promotable" && options.simulated !== true,
    nextAction: nextActionFor(verdict, options.simulated === true),
  };
}
```

- [ ] **Step 4: Run the gate tests and verify GREEN**

Run: `node tests/skillopt-gate.test.js`

Expected: `skillopt gate tests passed`.

- [ ] **Step 5: Add receipt tests, verify RED, then implement**

Test two identical writes to a temporary root. The first must return `stored`, the second `duplicate`, and the ledger must contain one line. Reject simulated, incomplete, or fingerprint-mismatched reports.

```js
const first = appendSkillOptReceipt(report, { root });
const second = appendSkillOptReceipt(report, { root });
assert.equal(first.status, "stored");
assert.equal(second.status, "duplicate");
assert.equal(fs.readFileSync(first.path, "utf8").trim().split(/\r?\n/).length, 1);
```

Run before implementation: `node tests/skillopt-gate.test.js`

Expected RED: `appendSkillOptReceipt is not a function`.

Run after implementation: `node tests/skillopt-gate.test.js`

Expected GREEN: `skillopt gate tests passed`.

- [ ] **Step 6: Commit Task 1**

```bash
git add lib/skillopt-gate.js tests/skillopt-gate.test.js
git commit -m "feat: add SkillOpt evidence gate"
```

### Task 2: Safe SkillOpt process adapter and preparation

**Files:**
- Create: `lib/skillopt-adapter.js`
- Create: `tests/skillopt-adapter.test.js`

**Interfaces:**
- Consumes: `{ python, runner, env, root, timeoutMs, maxOutputBytes }`.
- Produces: `detectSkillOpt(options)`, `runSkillOptSmoke(options)`, `prepareSkillOptRun(source, options)`, `assertWorkspacePath(target, options)`, `sha256File(file)`, `runChild(command, args, options)`, and `redactProcessText(value)`.

- [ ] **Step 1: Write failing version and process-boundary tests**

Use injected runners returning JSON for Python `3.11.9` and SkillOpt `0.2.0`, then assert `ready`. Assert `0.3.0` returns `unsupported_version`, exit 127 returns `unavailable`, and malformed JSON returns `blocked`. Capture runner input and assert an argument array, `shell: false`, timeout, and absence of `OPENAI_API_KEY`, `AZURE_OPENAI_API_KEY`, and `ANTHROPIC_API_KEY`.

- [ ] **Step 2: Run and verify RED**

Run: `node tests/skillopt-adapter.test.js`

Expected: FAIL with missing adapter module.

- [ ] **Step 3: Implement exact-version detection and safe runner**

Use this offline probe:

```js
const VERSION_PROBE = [
  "-c",
  "import json,sys; from importlib.metadata import version; print(json.dumps({'python': '.'.join(map(str, sys.version_info[:3])), 'skillopt': version('skillopt')}))",
];
```

`runChild` uses `child_process.spawn(command, args, { shell: false, cwd, env, stdio: ["ignore", "pipe", "pipe"] })`, truncates buffers, kills on timeout, and always resolves a structured result.

- [ ] **Step 4: Run adapter tests and verify GREEN**

Run: `node tests/skillopt-adapter.test.js`

Expected: version/process tests pass.

- [ ] **Step 5: Write failing path, prepare, and smoke tests**

Create a temporary repository root and source skill. Assert prepare derives the run directory as `data/skillopt/runs/k7s-` plus the first 12 characters of the source SHA-256, creates `baseline/SKILL.md` plus `manifest.json`, preserves the source, and records matching SHA-256 hashes. Assert `../outside`, an absolute outside path, and a symlink escaping the root are blocked. Assert smoke refuses when provider credentials exist and otherwise calls:

```js
["-m", "skillopt_sleep.experiments.run_experiment", "--persona", "researcher", "--assert-improves"]
```

- [ ] **Step 6: Run RED, implement path/staging/smoke, then run GREEN**

Run before implementation: `node tests/skillopt-adapter.test.js`

Expected RED: missing preparation and smoke functions.

Run after implementation: `node tests/skillopt-adapter.test.js`

Expected GREEN: `skillopt adapter tests passed`.

- [ ] **Step 7: Commit Task 2**

```bash
git add lib/skillopt-adapter.js tests/skillopt-adapter.test.js
git commit -m "feat: add safe SkillOpt process adapter"
```

### Task 3: KAIZEN7 SkillOpt CLI

**Files:**
- Create: `lib/skillopt-cli.js`
- Create: `tests/skillopt-cli.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: CLI flags and the Task 1/2 modules.
- Produces: `parseSkillOptArgs(argv)`, `buildFixtureEvidence()`, `evaluateRunDirectory(runDirectory, options)`, and `runSkillOptCommand(options)`.

- [ ] **Step 1: Write failing CLI parsing tests**

Assert the five explicit modes, optional `--compact`, and `--write` only with evaluate. Assert empty arguments, conflicting modes, unknown flags, and missing evaluate paths throw usage errors.

```js
assert.deepEqual(parseSkillOptArgs(["--status"]), { mode: "status", compact: false, write: false, target: null });
assert.deepEqual(parseSkillOptArgs(["--evaluate", "data/skillopt/runs/a", "--write"]), {
  mode: "evaluate", compact: false, write: true, target: "data/skillopt/runs/a",
});
assert.throws(() => parseSkillOptArgs([]), /Choose exactly one/);
assert.throws(() => parseSkillOptArgs(["--status", "--smoke"]), /exactly one/);
```

- [ ] **Step 2: Run and verify RED**

Run: `node tests/skillopt-cli.test.js`

Expected: FAIL with missing CLI module.

- [ ] **Step 3: Implement parsing and status/fixture/smoke/prepare orchestration**

Fixture evidence must satisfy the pure gate but call it with `{ simulated: true }`, so the report is visibly hypothetical and `eligibleForPromotion` is false. Inject adapter functions in tests so fixture proves it never invokes Python.

- [ ] **Step 4: Run the focused CLI tests and verify GREEN**

Run: `node tests/skillopt-cli.test.js`

Expected: parsing and four non-evaluate modes pass.

- [ ] **Step 5: Write failing evaluate and receipt tests**

Build a temporary prepared run containing `manifest.json`, `evidence.json`, and `candidate/best_skill.md`. Assert evaluate recomputes source and candidate hashes, blocks an escaping candidate symlink, returns one next action, and writes only when `--write` is set.

- [ ] **Step 6: Run RED, implement evaluate, then run GREEN**

Run before implementation: `node tests/skillopt-cli.test.js`

Expected RED: evaluation mode is not implemented.

Run after implementation: `node tests/skillopt-cli.test.js`

Expected GREEN: `skillopt cli tests passed`.

- [ ] **Step 7: Register script and regression checks**

Add:

```json
"k7:skillopt": "node lib/skillopt-cli.js"
```

Add `node --check lib/skillopt-gate.js`, `node --check lib/skillopt-adapter.js`, `node --check lib/skillopt-cli.js`, and the three focused tests to `check`.

Run: `npm run k7:skillopt -- --fixture --compact`

Expected: JSON with `simulated:true`, `eligibleForPromotion:false`, and one `nextAction`.

- [ ] **Step 8: Commit Task 3**

```bash
git add lib/skillopt-cli.js tests/skillopt-cli.test.js package.json
git commit -m "feat: expose guarded SkillOpt workflow"
```

### Task 4: Optional dependency, operator documentation, and real verification

**Files:**
- Create: `requirements/skillopt.txt`
- Create: `docs/SKILLOPT_INTEGRATION.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: commands delivered in Tasks 1–3.
- Produces: reproducible isolated installation and operator workflow.

- [ ] **Step 1: Pin and ignore local state**

Create `requirements/skillopt.txt` containing exactly:

```text
skillopt==0.2.0
```

Ignore `.venv-skillopt/`, `data/skillopt/runs/`, and `data/skillopt/receipts.jsonl`, while keeping documentation and requirements tracked.

- [ ] **Step 2: Document the complete workflow**

Document these exact operator commands, privacy boundary, expected statuses, manifest/evidence JSON fields, promotion rules, and rollback:

```bash
python3 -m venv .venv-skillopt
.venv-skillopt/bin/python -m pip install -r requirements/skillopt.txt
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --status
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --smoke
npm run k7:skillopt -- --prepare
npm run k7:skillopt -- --evaluate data/skillopt/runs/k7s-f03d0bbc2e92
npm run k7:skillopt -- --evaluate data/skillopt/runs/k7s-f03d0bbc2e92 --write
```

State explicitly that KAIZEN7 does not harvest transcripts, call providers, schedule Sleep, adopt, or edit a production skill.

- [ ] **Step 3: Run all offline focused tests**

Run:

```bash
node tests/skillopt-gate.test.js
node tests/skillopt-adapter.test.js
node tests/skillopt-cli.test.js
npm run k7:skillopt -- --fixture --compact
```

Expected: all tests pass and fixture is simulated/non-promotable.

- [ ] **Step 4: Install stable SkillOpt in the isolated ignored environment**

Run:

```bash
python3 -m venv .venv-skillopt
.venv-skillopt/bin/python -m pip install -r requirements/skillopt.txt
```

Expected: `skillopt==0.2.0` installs without changing tracked dependency state.

- [ ] **Step 5: Run real upstream status and smoke probes**

Run:

```bash
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --status
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --smoke
```

Expected: status `ready`; smoke reports a zero-credential successful official deterministic experiment. If upstream packaging fails, record the exact blocker and do not weaken the gate.

- [ ] **Step 6: Run the full regression suite**

Run: `npm run check`

Expected: exit code 0 and all existing plus SkillOpt tests pass.

- [ ] **Step 7: Commit Task 4**

```bash
git add .gitignore requirements/skillopt.txt docs/SKILLOPT_INTEGRATION.md
git commit -m "docs: add reproducible SkillOpt workflow"
```

### Task 5: Review, verification, and PR handoff

**Files:**
- Modify only files required to address confirmed review findings.

**Interfaces:**
- Consumes: the complete branch diff and verification evidence.
- Produces: review-clean branch and complete PR description.

- [ ] **Step 1: Review the branch against the approved specification**

Check for production writes, shell invocation, path escapes, credential leakage, fabricated metrics, version drift, implicit install/adopt behavior, and fixture promotion.

- [ ] **Step 2: Run final verification after any review fixes**

Run:

```bash
git diff --check main...HEAD
npm run check
npm run k7:skillopt -- --fixture --compact
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --smoke
git status --short
```

Expected: clean diff, all checks green, simulated fixture non-promotable, real smoke successful, and no uncommitted tracked changes.

- [ ] **Step 3: Prepare the pull request**

PR description must include the SkillOpt mission, files changed, tests and real smoke evidence, alpha/upstream risks, no-credential/no-production-write boundaries, and memory recommendation: record SkillOpt as KAIZEN7's experimental skill optimizer only after the PR is reviewed and merged.
