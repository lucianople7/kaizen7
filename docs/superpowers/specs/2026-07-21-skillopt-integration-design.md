# SkillOpt Integration Design

## Goal

Integrate Microsoft SkillOpt into the KAIZEN7 kernel as an optional, version-gated skill optimization adapter that can prove improvement on a copied skill without modifying production skills, using reproducible tests and a reviewable promotion receipt.

The first target is a copied `k7-self-evolution-loop` skill. Success means KAIZEN7 can detect the supported SkillOpt installation, run a credential-free official smoke experiment, stage an optimization result, judge it against its baseline, and return exactly one guarded recommendation.

## Verified upstream basis

- Official source: `https://github.com/microsoft/SkillOpt`.
- Supported integration baseline: PyPI `skillopt==0.2.0`, released 2026-07-02.
- License: MIT.
- Runtime: Python 3.10 or newer.
- Stable entry points: `skillopt-train`, `skillopt-eval`, and `skillopt-sleep`.
- SkillOpt-Sleep supplies the relevant cycle: harvest, mine, replay, consolidate, held-out validation gate, staged proposal, and explicit adoption.
- The stable mock backend makes no provider calls and is the only backend allowed in automated KAIZEN7 tests.
- The official deterministic experiment `python -m skillopt_sleep.experiments.run_experiment --persona researcher --assert-improves` is the real upstream smoke probe.
- The handoff backend documented in the upstream changelog remains unreleased. KAIZEN7 must report it as unavailable rather than installing SkillOpt from `main`.

SkillOpt is classified upstream as alpha software. Microsoft and its contributor team provide strong technical evidence, but team reputation does not bypass KAIZEN7 verification.

## Considered approaches

### A. Stable SkillOpt-Sleep adapter with staged promotion — selected

Pin `skillopt==0.2.0` in an optional Python requirements file. Add a small Node adapter that discovers Python/SkillOpt, validates the installed version, invokes subprocesses without a shell, parses only workspace-scoped artifacts, and converts results into a KAIZEN7 report and receipt.

This uses the official deployment-oriented engine, provides a genuine no-credential test path, and leaves upstream replaceable.

### B. Install SkillOpt directly from GitHub `main`

This would expose the handoff backend immediately, but it would depend on an unreleased and changing source snapshot. It is rejected until an official stable release contains that backend.

### C. Reimplement SkillOpt's optimizer inside KAIZEN7

This would duplicate research code, increase maintenance, and discard the value of the upstream team. It is rejected. KAIZEN7 owns coordination, gates, receipts, and promotion policy; SkillOpt owns textual optimization.

## Architecture

### Optional dependency boundary

`requirements/skillopt.txt` pins exactly `skillopt==0.2.0`. SkillOpt is not added to npm dependencies and is never installed implicitly by `npm install`, `npm run check`, status, fixture, or dry-run commands.

Documentation provides an explicit isolated-environment installation command. The environment directory is ignored by Git. Installation remains an operator action and makes no model call.

### Node adapter

`lib/skillopt-adapter.js` is the only KAIZEN7 module that knows the SkillOpt process contract. It must:

1. detect an injected or configured Python executable;
2. read the installed `skillopt` version without network access;
3. require exact version `0.2.0` for this integration revision;
4. build subprocess argument arrays and invoke them with `shell: false`;
5. enforce timeouts and bounded captured output;
6. redact secret-shaped values from errors;
7. accept only paths contained by the configured workspace root;
8. return structured status instead of throwing for missing or unsupported installations.

Adapter states are:

- `ready`: Python is compatible and SkillOpt `0.2.0` is installed;
- `unavailable`: Python or SkillOpt is absent;
- `unsupported_version`: SkillOpt exists but is not exactly `0.2.0`;
- `blocked`: a boundary, timeout, malformed output, or execution policy failed.

The adapter exposes no install, schedule, adopt, network-provider, or auto-promotion operation.

### Commands

`lib/skillopt-cli.js` and the package script `k7:skillopt` expose five explicit modes:

```text
npm run k7:skillopt -- --status
npm run k7:skillopt -- --fixture
npm run k7:skillopt -- --smoke
npm run k7:skillopt -- --prepare [.agents/skills/k7-self-evolution-loop/SKILL.md]
npm run k7:skillopt -- --evaluate <run-directory> [--write]
```

- `--status` performs offline capability detection only.
- `--fixture` validates KAIZEN7 report, gate, and receipt behavior against deterministic local artifacts. It never starts Python.
- `--smoke` runs the official deterministic upstream experiment with the installed stable package and no provider credentials.
- `--prepare` creates a hashed, workspace-scoped copy and manifest under `data/skillopt/runs/<run-id>/`; its default source is `.agents/skills/k7-self-evolution-loop/SKILL.md`. It does not run SkillOpt.
- `--evaluate` reads a completed run directory under the repository workspace and evaluates its baseline/candidate evidence. It does not run training and cannot adopt a skill.
- `--write` is valid only with `--evaluate` and appends an idempotent receipt after a complete evaluation. Evaluation remains read-only without it.

Modes are mutually exclusive. With no mode, the CLI returns help and a nonzero usage status. No flag implicitly enables network or writes to a production skill.

### Controlled target and staging

The initial target is a copied `k7-self-evolution-loop` skill stored only inside a gitignored run directory under `data/skillopt/runs/<run-id>/`. A manifest records:

- integration schema and SkillOpt version;
- source skill relative path and SHA-256 hash;
- copied baseline skill path and hash;
- candidate `best_skill.md` path and hash;
- train, validation, and test item identifiers;
- commands executed and exit codes;
- accuracy, token, latency, and failure evidence when supplied by SkillOpt;
- creation timestamp and run fingerprint.

KAIZEN7 never harvests Codex transcripts automatically in this revision. This avoids sending or persisting broad private session context. A future transcript workflow requires a separate design and privacy review.

### Evaluation and promotion gate

`lib/skillopt-gate.js` evaluates normalized evidence. A candidate is `promotable` only when all conditions hold:

1. the run used supported stable SkillOpt `0.2.0`;
2. baseline and candidate skill hashes are present and differ;
3. validation and held-out test evidence are complete;
4. train, validation, and test item identifiers are present, and at least one recorded run command completed with exit code zero;
5. candidate validation score is strictly greater than baseline validation score;
6. candidate held-out test score is not lower than baseline held-out test score;
7. candidate introduces no new execution failures;
8. token and latency values are real measurements or `null`, never estimates;
9. the source skill still matches the hash recorded at run start;
10. production writes are explicitly declared and no production path was written during the run.

Verdicts are exactly:

- `promotable`: all gates pass;
- `hold`: complete evidence shows no regression but insufficient improvement;
- `reject`: quality regresses, failures increase, or the candidate violates a gate;
- `incomplete`: required evidence or supported runtime is missing.

Every report contains exactly one next action. `promotable` means “prepare a human-reviewed patch”; it does not change the source skill.

### Receipt and rollback

Completed evaluations produce a `kaizen7.skillopt_evaluation.v1` object containing the manifest, normalized metrics, verdict, reasons, one next action, and rollback data. Receipt writing is opt-in and appends idempotently to `data/skillopt/receipts.jsonl` using the run fingerprint.

Rollback is guaranteed by design because production files are never modified. If a future PR promotes a candidate, the original hash and Git commit provide the rollback reference.

## Data flow

```text
source skill (read only)
  -> workspace-scoped copy + manifest
  -> SkillOpt stable process (explicit operator run)
  -> staged best_skill.md + upstream evidence
  -> KAIZEN7 normalization
  -> held-out quality and safety gate
  -> report / optional receipt
  -> human-reviewed patch in a separate PR
```

The stable smoke path is smaller:

```text
k7:skillopt --smoke
  -> version gate
  -> official deterministic SkillOpt experiment
  -> bounded/redacted result
  -> pass, fail, or blocked status
```

## Error handling and security

- No command is constructed as a shell string.
- Run paths are resolved and rejected unless contained by the repository root.
- Symlinked artifacts that escape the run directory are rejected.
- Provider-related environment values are not printed or persisted.
- Captured stdout/stderr is truncated and secret-redacted before inclusion in reports.
- Timeouts terminate the child process and return `blocked` evidence.
- Missing or malformed metrics remain `null` and make the verdict `incomplete` when required.
- `--smoke` refuses to run if provider credentials are detected in the child environment; the deterministic proof must remain credential-free.
- Automated tests never install packages, access the network, harvest transcripts, call model providers, schedule jobs, or adopt skills.

## Testing strategy

Implementation follows red-green-refactor TDD. Tests must prove:

1. exact `0.2.0` detection returns `ready` and other/malformed versions do not;
2. missing Python or package returns structured `unavailable` status;
3. subprocess calls use argument arrays, `shell: false`, timeout, bounded output, and a sanitized environment;
4. path traversal and escaping symlinks are blocked;
5. fixture mode never starts Python or performs writes outside its temporary root;
6. strict validation improvement plus non-regressing held-out score can be `promotable`;
7. unchanged quality returns `hold`;
8. regression, new failures, or changed source hash returns `reject`;
9. missing real metrics remain `null` and required missing evidence returns `incomplete`;
10. reports always return exactly one next action;
11. receipt writes are opt-in and idempotent;
12. CLI modes are mutually exclusive and never imply install, provider use, scheduling, adoption, or promotion;
13. prepare mode copies the default target, records hashes, and refuses sources or destinations outside the repository;
14. the real stable smoke probe passes in an isolated Python environment when SkillOpt `0.2.0` is installed;
15. the full existing `npm run check` suite remains green.

The real smoke probe validates upstream packaging and integration compatibility. It does not prove that KAIZEN7 skills improve. A separate evidence-producing optimization run is required before any candidate can be called promotable.

## Acceptance criteria

- KAIZEN7 has an optional, documented SkillOpt `0.2.0` integration with no implicit installation.
- Status and fixture modes work offline and without Python dependencies.
- Prepare mode creates a traceable staging run without modifying the source skill.
- The official no-credential SkillOpt deterministic experiment is callable through `--smoke`.
- The adapter cannot schedule SkillOpt-Sleep, harvest transcripts, use provider credentials, adopt, or overwrite a skill.
- A copied skill and completed evidence can be judged reproducibly.
- No candidate reaches `promotable` without strictly better validation and non-regressing held-out results.
- Every complete run is traceable through hashes, version, commands, metrics, fingerprint, and an optional idempotent receipt.
- Tests integrate into `npm run check` and all existing tests pass.
- Documentation explains installation, modes, evidence limits, privacy boundary, promotion, and rollback.

## Out of scope

- Automatic transcript harvesting.
- Nightly scheduling.
- Provider-backed training using API keys or paid services.
- Installing unreleased SkillOpt source.
- Using the unreleased handoff backend.
- Automatic adoption or modification of production skills.
- Optimizing every KAIZEN7 skill in the first integration.
- Reimplementing or forking SkillOpt research code.
