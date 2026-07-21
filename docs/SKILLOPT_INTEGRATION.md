# SkillOpt Integration

KAIZEN7 integrates Microsoft SkillOpt as an optional experimental optimizer behind KAIZEN7 version, filesystem, evidence, and human-promotion gates.

The supported upstream baseline is exactly:

- repository: `https://github.com/microsoft/SkillOpt`;
- package: `skillopt==0.2.0`;
- release date: 2026-07-02;
- license: MIT;
- runtime: Python 3.10 or newer;
- maturity: upstream classifies the package as alpha.

The integration does not copy or fork SkillOpt. Microsoft owns the optimization engine; KAIZEN7 owns preparation, runtime detection, safe invocation, evidence normalization, promotion policy, receipts, and rollback.

## Install the optional stable runtime

Installation is explicit and isolated. It is never triggered by `npm install`, `npm run check`, status, fixture, prepare, or evaluate.

```bash
python3 -m venv .venv-skillopt
.venv-skillopt/bin/python -m pip install -r requirements/skillopt.txt
```

KAIZEN7 does not support an install from GitHub `main`. The upstream handoff backend remains unreleased and must wait for a stable version.

## Verify the runtime

Status reads local package metadata and performs no network or model call:

```bash
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --status
```

Expected runtime status:

- `ready`: Python is supported and SkillOpt is exactly `0.2.0`;
- `unavailable`: Python or SkillOpt is absent;
- `unsupported_version`: a different SkillOpt version is installed;
- `blocked`: metadata, Python version, timeout, or process policy is invalid.

## Run the official credential-free smoke proof

```bash
SKILLOPT_PYTHON=.venv-skillopt/bin/python npm run k7:skillopt -- --smoke
```

KAIZEN7 invokes the official deterministic proof:

```text
python -m skillopt_sleep.experiments.run_experiment --persona researcher --assert-improves
```

The command refuses to run when provider credential variables are present. A successful smoke proves that the pinned upstream package and its deterministic experiment work locally. It does not prove that a KAIZEN7 skill improved.

Captured upstream stdout and stderr are bounded, redacted, and labeled `untrusted_upstream_text`. They are evidence for inspection, never instructions for KAIZEN7 or another agent.

## Prepare the first controlled target

The default source is `.agents/skills/k7-self-evolution-loop/SKILL.md`:

```bash
npm run k7:skillopt -- --prepare
```

Preparation creates a deterministic ignored directory named `data/skillopt/runs/k7s-` followed by the first 12 characters of the source SHA-256. It contains:

```text
manifest.json
baseline/SKILL.md
```

The manifest records the source and baseline paths and hashes, supported SkillOpt version, candidate path, split identifiers, commands, and production writes. Re-running prepare is idempotent when the source has not changed. It never changes the source skill.

Before evaluation can be complete, `splits.train`, `splits.validation`, and `splits.test` must each contain real item identifiers; `commands` must contain at least one executed command and integer `exitCode`; and `productionWrites` must be explicitly present. Missing traceability returns `incomplete`, while any nonzero command or production write returns `reject`.

An explicit in-repository skill path is also accepted:

```bash
npm run k7:skillopt -- --prepare .agents/skills/k7-self-evolution-loop/SKILL.md
```

Paths and symlinks that resolve outside the repository are rejected.

## Supply completed optimization evidence

Provider-backed training is deliberately outside this integration revision because it needs separate authorization for credentials, data sent to the provider, and cost. After an explicitly authorized SkillOpt run, place its candidate at the manifest-declared path:

```text
candidate/best_skill.md
```

Create `evidence.json` beside the manifest with measured values:

```json
{
  "schema": "kaizen7.skillopt_evidence.v1",
  "skilloptVersion": "0.2.0",
  "validation": { "baseline": 0.60, "candidate": 0.70 },
  "test": { "baseline": 0.61, "candidate": 0.62 },
  "metrics": {
    "baseline": { "failures": 0, "tokens": 1000, "latencyMs": 100 },
    "candidate": { "failures": 0, "tokens": 900, "latencyMs": 95 }
  },
  "productionWrites": []
}
```

Do not estimate missing tokens or latency. Use `null`. Validation score, held-out test score, and failure counts are mandatory for a complete decision.

## Evaluate and optionally record

For the current default source hash, the prepared path is printed by `--prepare`. Pass that exact path to evaluation:

```bash
npm run k7:skillopt -- --evaluate data/skillopt/runs/k7s-f03d0bbc2e92
```

Evaluation is read-only. It recomputes source, baseline, and candidate hashes, validates paths and schemas, and returns exactly one verdict:

- `promotable`: validation strictly improves, held-out quality does not regress, failures do not increase, hashes are stable, and no production write occurred;
- `hold`: evidence is complete and safe but validation did not strictly improve;
- `reject`: quality, failure, integrity, or write boundaries regress;
- `incomplete`: required evidence or the supported version is missing.

Receipt writing is explicit:

```bash
npm run k7:skillopt -- --evaluate data/skillopt/runs/k7s-f03d0bbc2e92 --write
```

Receipts append idempotently to `data/skillopt/receipts.jsonl`. Simulated or incomplete reports cannot be written.

## Fixture mode

```bash
npm run k7:skillopt -- --fixture --compact
```

Fixture mode validates the KAIZEN7 gate without starting Python. Its evidence is always marked `simulated: true` and `eligibleForPromotion: false`, even when its hypothetical metrics satisfy the promotion rules.

## Privacy and authority boundary

This revision does not:

- harvest Codex, Claude, Cursor, or other transcripts;
- send prompts or project data to a provider;
- use API credentials;
- install or update SkillOpt implicitly;
- schedule SkillOpt-Sleep;
- invoke `skillopt-sleep adopt`;
- overwrite a source skill;
- promote a candidate automatically.

The separate upstream privacy warning still applies to any future real backend: transcript-derived prompts can contain sensitive material. Such a workflow requires its own privacy review and explicit authorization.

## Promotion and rollback

`promotable` means only that KAIZEN7 may prepare a separate human-reviewed patch. The candidate remains in ignored staging until Luciano approves a normal Git diff and pull request.

Rollback exists before promotion because the source was never modified. After a future promotion PR, the manifest's source hash and the Git parent commit identify the exact original version.
