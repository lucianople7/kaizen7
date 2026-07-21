# Programmatic Tool Calling Benchmark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reproducible, offline-first A/B benchmark that prevents KAIZEN7 from adopting Programmatic Tool Calling until a stable OpenAI Agents SDK export demonstrates equal-or-better evidence with at least 20% fewer tokens or model turns.

**Architecture:** A pure CommonJS benchmark kernel owns capability detection, deterministic quality scoring, lane normalization, verdicts, and idempotent JSONL receipts. A separate CommonJS CLI owns argument parsing, installed-package inspection, fixture execution, live-run safety gates, and human/machine output; it does not implement an unreleased SDK adapter. Production Repo Hunter remains untouched and the candidate can only be promoted from a completed live receipt.

**Tech Stack:** Node.js 20+, CommonJS, built-in `node:test`-style assertions via `node:assert/strict`, built-in `fs`, `path`, `crypto`, `perf_hooks`, existing npm scripts.

## Global Constraints

- Never install a Git commit, preview tarball, unpublished package, or prerelease SDK.
- Dry-run and fixture modes make no network request, need no credentials, and spend no API credits.
- Missing token usage remains `null`; it is never estimated.
- Only an explicit `--live` flag can enable live execution, and live execution also requires `OPENAI_API_KEY` plus a stable public SDK export.
- Only `--live --write` can persist a completed benchmark receipt under `data/benchmarks/programmatic-tool-calling.jsonl`.
- A fixture result is simulation evidence and is never eligible to promote production behavior.
- Repo Hunter production behavior remains unchanged.

---

### Task 1: Stable capability gate and deterministic quality judge

**Files:**
- Create: `lib/benchmarks/programmatic-tool-calling.js`
- Create: `tests/programmatic-tool-calling-benchmark.test.js`

**Interfaces:**
- Produces: `checkProgrammaticToolCapability({ version, exports, loadError }) -> { status, version, stable, exportName, reason }`.
- Produces: `judgeDiscoveryOutput(output) -> { score, checks, licenseCoverage }`.
- Produces: `normalizeUsage(usage) -> { inputTokens, outputTokens, totalTokens }`.
- The required stable public export name is the exact constant `programmaticToolCallingTool`; changing it requires updating this plan from official stable SDK documentation.

- [ ] **Step 1: Write failing capability and quality tests**

Add tests that call the not-yet-existing exports and assert:

```js
const unavailable = checkProgrammaticToolCapability({
  version: "0.13.5",
  exports: { Agent() {}, run() {} },
});
assert.equal(unavailable.status, "unavailable");

const prerelease = checkProgrammaticToolCapability({
  version: "0.14.0-beta.1",
  exports: { programmaticToolCallingTool() {} },
});
assert.equal(prerelease.status, "blocked");

const ready = checkProgrammaticToolCapability({
  version: "0.14.0",
  exports: { programmaticToolCallingTool() {} },
});
assert.equal(ready.status, "ready");

const judged = judgeDiscoveryOutput({
  findings: [
    { source: "github", url: "https://github.com/org/repo", license: "MIT" },
    { source: "huggingface", url: "https://huggingface.co/org/model", license: "apache-2.0" },
  ],
  nextAction: "Run one local benchmark.",
});
assert.equal(judged.score, 100);
assert.equal(judged.licenseCoverage, 1);
assert.deepEqual(normalizeUsage({}), {
  inputTokens: null,
  outputTokens: null,
  totalTokens: null,
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/programmatic-tool-calling-benchmark.test.js`

Expected: failure because `../lib/benchmarks/programmatic-tool-calling` does not exist.

- [ ] **Step 3: Implement the gate, usage normalization, and judge**

Implement stable-semver validation without adding a dependency. Treat missing/invalid version, prerelease versions, non-object export shapes, and load errors as `blocked`; treat a stable package without a callable `programmaticToolCallingTool` export as `unavailable`; otherwise return `ready`. Score six deterministic checks: GitHub present, Hugging Face present, every finding has an HTTPS URL, every finding has a non-empty license state, exactly one non-empty next action, and no finding with `blocked: true` has `recommended: true`. Assign each check an equal share normalized to an integer 0–100 and calculate `licenseCoverage` as licensed findings divided by findings, or `0` for an empty list.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node tests/programmatic-tool-calling-benchmark.test.js`

Expected: `programmatic tool calling benchmark tests passed`.

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/benchmarks/programmatic-tool-calling.js tests/programmatic-tool-calling-benchmark.test.js
git commit -m "feat: gate programmatic tool calling benchmark"
```

### Task 2: A/B kernel, verdict engine, and idempotent receipts

**Files:**
- Modify: `lib/benchmarks/programmatic-tool-calling.js`
- Modify: `tests/programmatic-tool-calling-benchmark.test.js`

**Interfaces:**
- Consumes: `checkProgrammaticToolCapability`, `judgeDiscoveryOutput`, and `normalizeUsage` from Task 1.
- Produces: `runProgrammaticToolBenchmark({ capability, baselineExecutor, candidateExecutor, mission, mode, now }) -> Promise<BenchmarkReport>`.
- Produces: `appendBenchmarkReceipt(report, { root }) -> { status, path, fingerprint }`.
- Produces: `redactError(error) -> string`.
- `BenchmarkReport` contains `schema`, `mode`, `simulated`, `eligibleForPromotion`, `mission`, `capability`, `baseline`, `candidate`, `deltas`, `verdict`, `nextAction`, `completedAt`, and `fingerprint`.

- [ ] **Step 1: Extend tests with failing A/B and receipt cases**

Use deterministic async executors returning the same complete discovery output. The baseline reports 1,000 total tokens and 5 model turns; the candidate reports 800 total tokens and 4 model turns. Assert `adopt`, `-20` percent token delta, and `-20` percent turn delta. Add separate cases asserting `reject` for missing candidate license evidence, `reject` for a new candidate tool failure, `waiting_for_stable_sdk` when the gate is unavailable, and `null` token deltas when usage is unknown. In a temporary root, assert two `appendBenchmarkReceipt` calls for the same report return `stored` then `duplicate`, and the JSONL file contains one line. Assert fixture reports have `simulated: true` and `eligibleForPromotion: false` even when their measured verdict is `adopt`.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/programmatic-tool-calling-benchmark.test.js`

Expected: failure because `runProgrammaticToolBenchmark` and `appendBenchmarkReceipt` are not functions.

- [ ] **Step 3: Implement measured lanes and verdicts**

Run each executor independently with the same deeply frozen mission, measure elapsed time with `performance.now()`, capture errors as redacted evidence, normalize findings and numeric metrics, and judge both outputs. Skip both executors when capability is not `ready`, returning `waiting_for_stable_sdk`. Calculate percentage deltas as `(candidate - baseline) / baseline * 100`, rounded to two decimals; return `null` when either value is unknown or the baseline is zero. Verdict precedence is: incomplete lane or lower quality/license coverage/new tool failures => `reject`; at least 20% fewer tokens or model turns with no material elapsed regression above 25% => `adopt`; otherwise => `hold`. Always include one compact next action. A fixture result may show the measured verdict but remains ineligible for promotion.

- [ ] **Step 4: Implement safe idempotent receipts**

Create a SHA-256 fingerprint from the stable mission, mode, capability version, normalized lane evidence, deltas, and verdict, excluding wall-clock timestamps. Write only completed reports to `data/benchmarks/programmatic-tool-calling.jsonl`, create the parent directory, detect an existing fingerprint before append, and return `duplicate` without adding a line. Reject persistence if `mode !== "live"`, either lane is incomplete, or the report has no fingerprint. Redact values matching API-key-like `sk-...` tokens and bearer authorization text from captured errors.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `node tests/programmatic-tool-calling-benchmark.test.js`

Expected: `programmatic tool calling benchmark tests passed`.

- [ ] **Step 6: Commit Task 2**

```bash
git add lib/benchmarks/programmatic-tool-calling.js tests/programmatic-tool-calling-benchmark.test.js
git commit -m "feat: measure programmatic tool calling evidence"
```

### Task 3: Safe CLI, offline fixture, documentation, and regression gate

**Files:**
- Create: `lib/programmatic-tool-benchmark-cli.js`
- Modify: `tests/programmatic-tool-calling-benchmark.test.js`
- Create: `docs/PROGRAMMATIC_TOOL_CALLING_BENCHMARK.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: benchmark exports from Task 2.
- Produces: `parseBenchmarkArgs(argv) -> { mode, write, compact }`.
- Produces: `loadInstalledAgentsSdk() -> Promise<{ version, exports, loadError }>` without network access.
- Produces: CLI command `npm run k7:benchmark:ptc -- [--dry-run|--fixture|--live] [--write] [--compact]`.

- [ ] **Step 1: Add failing CLI safety tests**

Assert the default and unknown flags never imply live mode, mutually exclusive mode flags throw, `--write` without `--live` throws, fixture executors are deterministic and contain one licensed GitHub plus one licensed Hugging Face finding, and live execution without either a ready stable capability or `OPENAI_API_KEY` returns a blocked report without calling an injected live adapter.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node tests/programmatic-tool-calling-benchmark.test.js`

Expected: failure because `../lib/programmatic-tool-benchmark-cli` does not exist.

- [ ] **Step 3: Implement the CLI and fixture**

Default to `dry-run`. Parse only the documented flags and reject unknown flags. Read the installed `@openai/agents` version from its resolved `package.json`, dynamically import its public exports, and return load errors as metadata rather than throwing. Dry-run outputs capability plus the immutable mission and does not invoke executors. Fixture mode injects a ready simulated capability and deterministic baseline/candidate evidence with 1,000/800 tokens and 5/4 model turns. Live mode checks stable capability and `OPENAI_API_KEY`, then returns a clear blocked report because the live adapter must be implemented only against a documented stable API surface; it must not silently use the ordinary SDK path. `--write` calls `appendBenchmarkReceipt` only after a completed live run. Output formatted JSON, or one line with `--compact`, and set a nonzero exit code only for invalid arguments or unsafe write attempts.

- [ ] **Step 4: Run CLI acceptance commands**

Run:

```bash
npm run k7:benchmark:ptc -- --dry-run --compact
npm run k7:benchmark:ptc -- --fixture --compact
```

Expected: dry-run reports the currently unavailable stable capability; fixture reports deterministic measured evidence, makes no network request, and is not eligible for promotion.

- [ ] **Step 5: Document operation and stable activation path**

Document the four commands, report schema, 20% adoption rule, 25% elapsed regression ceiling, fixture simulation limitation, JSONL receipt path, and exact activation sequence: wait for a normal stable npm release, verify the public export in official documentation, update the live adapter under TDD, run explicit live A/B, persist the result, and keep Repo Hunter unchanged unless the receipt verdict is `adopt` and `eligibleForPromotion` is true.

- [ ] **Step 6: Integrate the focused test into npm scripts**

Add `"k7:benchmark:ptc": "node lib/programmatic-tool-benchmark-cli.js"`. Add syntax checks for both new source files and `node tests/programmatic-tool-calling-benchmark.test.js` to the existing `check` script so CI executes the feature test.

- [ ] **Step 7: Run focused and full verification**

Run:

```bash
node --check lib/benchmarks/programmatic-tool-calling.js
node --check lib/programmatic-tool-benchmark-cli.js
node tests/programmatic-tool-calling-benchmark.test.js
npm run check
git diff --check
```

Expected: every command exits 0, the focused test prints its pass message, the existing suite remains green, and `git diff --check` prints nothing.

- [ ] **Step 8: Commit Task 3**

```bash
git add package.json lib/programmatic-tool-benchmark-cli.js tests/programmatic-tool-calling-benchmark.test.js docs/PROGRAMMATIC_TOOL_CALLING_BENCHMARK.md
git commit -m "feat: expose safe programmatic tool benchmark"
```
