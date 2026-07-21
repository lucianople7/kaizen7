# Programmatic Tool Calling Benchmark Design

## Goal

Create a reproducible A/B benchmark that determines whether OpenAI Agents SDK Programmatic Tool Calling materially improves KAIZEN7 discovery work before it is allowed into Repo Hunter or Provider Intelligence.

The benchmark must measure evidence, not technology enthusiasm:

`same or better verified result -> fewer model turns, fewer tokens and less elapsed time`

## Current evidence and constraint

- KAIZEN7 currently declares `@openai/agents` `^0.12.0`.
- npm reports `0.13.5` as the latest stable version, published on 2026-07-17.
- Programmatic Tool Calling was merged into the official SDK repository on 2026-07-18, after that release.
- Therefore the feature is not considered stable or available until the installed SDK exposes the required public API from a normal npm release.
- The benchmark must never install a Git commit, preview tarball or unpublished package.

The previous local Live Repo Hunter commits were not present in the restored GitHub clone. This benchmark is deliberately independent from those lost workspace files. It will use a small discovery contract that can later be connected to Live Repo Hunter without changing the benchmark rules.

## Considered approaches

### A. Stable-gated, injectable benchmark — selected

Build a small benchmark kernel with injected baseline and candidate executors. Unit tests use deterministic fixtures; live execution is optional and requires an explicit flag plus credentials. A capability gate checks the installed SDK export shape before the candidate lane can run.

Benefits: safe, testable now, reusable later, no dependency on an unreleased API.

### B. Install the SDK from GitHub main

This would make the experiment immediately executable but would mix unpublished behavior into KAIZEN7 and make results difficult to reproduce. Rejected.

### C. Synthetic timing comparison only

This would be cheap but would not measure model turns, token usage or output equivalence. Rejected as insufficient evidence.

## Benchmark scenario

Both lanes receive the same immutable mission:

1. obtain one GitHub repository signal;
2. obtain one Hugging Face asset signal;
3. verify license and return one compact recommendation.

The baseline lane represents ordinary model-managed tool calls. The candidate lane represents Programmatic Tool Calling coordinating the same read-only tools. Tools may run concurrently, but both lanes must receive identical inputs and produce the same normalized output contract.

No benchmark tool may publish, install, deploy, write externally, spend money or use credentials without an explicit live-run flag.

## Components

### Capability gate

Inspect the installed package version and public exports without triggering an API request. Candidate status is one of:

- `ready`: a stable installed package exposes the required API;
- `unavailable`: the export is absent;
- `blocked`: package metadata is invalid, version is prerelease, or the runtime cannot load it.

An unavailable candidate produces a readiness report, not a failed benchmark.

### Benchmark kernel

Accept injected `baselineExecutor` and `candidateExecutor` functions. Measure each lane independently and normalize:

- elapsed milliseconds;
- model turns;
- input, output and total tokens;
- tool calls;
- tool failures;
- normalized findings;
- license coverage;
- quality score.

The kernel contains no network clients and no OpenAI-specific tool definitions. That separation keeps deterministic tests possible and lets the live adapter evolve with the SDK.

### Quality judge

Use deterministic contract checks rather than a second paid model:

- GitHub result present;
- Hugging Face result present;
- every selected asset has a source URL;
- every selected asset has an explicit license state;
- exactly one next action;
- no blocked candidate is recommended for adoption.

The score is 0–100 and the same judge evaluates both lanes.

### Verdict engine

Return exactly one verdict:

- `adopt`: candidate quality is not worse, there are no new failures and either total tokens or model turns improve by at least 20%;
- `hold`: candidate ran, but improvement is below the threshold or elapsed time regresses materially;
- `reject`: candidate loses quality, omits licensing evidence or adds tool failures;
- `waiting_for_stable_sdk`: capability gate is not ready.

The verdict must include the measured deltas and one next action.

### CLI and receipts

Commands:

```text
npm run k7:benchmark:ptc -- --dry-run
npm run k7:benchmark:ptc -- --fixture
npm run k7:benchmark:ptc -- --live
npm run k7:benchmark:ptc -- --live --write
```

- `--dry-run` reports SDK readiness and benchmark contract only.
- `--fixture` executes deterministic local lanes without credentials or network.
- `--live` is refused unless the stable capability gate passes and `OPENAI_API_KEY` exists.
- `--write` is valid only with a completed run and appends a JSONL receipt under `data/benchmarks/`.

Default behavior is read-only and free.

## Error handling

- One lane failure is captured as evidence and never crashes the other lane.
- Missing token usage is represented as `null`, never estimated.
- SDK/API errors are redacted before inclusion in a receipt.
- A partial run cannot produce `adopt`.
- Repeated receipts use a run fingerprint so identical fixture runs are not duplicated.

## Testing

Tests are written first and must prove:

1. the current stable SDK without the export returns `waiting_for_stable_sdk`;
2. prerelease versions are blocked;
3. identical outputs plus a 20% token/turn improvement produce `adopt`;
4. missing license evidence produces `reject`;
5. candidate tool failures prevent adoption;
6. missing usage remains unknown rather than fabricated;
7. receipt writes are opt-in and idempotent;
8. CLI parsing never turns on live execution implicitly.

The full existing `npm run check` suite remains the final regression gate.

## Acceptance criteria

- Works entirely offline in fixture mode.
- Makes no API call in dry-run or fixture mode.
- Does not upgrade `@openai/agents` automatically.
- Refuses unpublished or prerelease SDK surfaces.
- Produces a machine-readable report with baseline, candidate, deltas, verdict and one next action.
- Integrates into the existing test suite and documentation.
- Leaves Repo Hunter production behavior unchanged until an `adopt` receipt exists.

## Out of scope

- Rebuilding the removed Live Repo Hunter commits.
- Installing or evaluating an unreleased OpenAI SDK commit.
- Spending API credits during automated tests.
- Automatically promoting the candidate into production.
