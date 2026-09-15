# focux-learning planning contract, version 1.0.0

Change exactly one meaningful variable and link unique evidence ids to the experiment context. Promotion requires at least max(3,min_samples) observations and confidence >=0.8. This is a configurable baseline, not statistical significance. Confidence must come from the experiment analysis. Preserve the champion policy for rollback; a single observation is a hypothesis only.

The canonical input example is [baseline.json](../fixtures/baseline.json). The [regression cases](../fixtures/cases.json) pair inputs with expected outcomes; the negative case must fail with `learning.insufficient_evidence`. Validation is implemented by the original `focux.skill_checks.check` function and returns skill, version, passed and sorted errors. All numeric values must be finite where checked. A malformed document fails with `input.schema` or `input.object`.

## Required baseline fields

`sample_size`, `context`, `confidence`, `evidence_ids`, `changed_variables`, `rollback_policy`, `min_samples`, `promote`.

Keep the same field types as the baseline. Add context in extra fields when useful; unknown fields are preserved by the caller and ignored by this gate. A pass is limited to the documented rules, and never proves an asset exists or that a subjective review occurred.

## Pattern provenance

Original FOCUX implementation. See [research provenance](../../../docs/SKILL_PROVENANCE.md) for the primary sources studied, license verification, and explicit limits. No third-party code or media is copied into this skill.
