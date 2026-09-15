# focux-critic planning contract, version 1.0.0

Reconcile all G01–G18 evidence ids with actual receipts. A missing, failed or skipped gate blocks this acceptance contract. Keep visual review explicitly pending until performed; deterministic metadata gates cannot judge visual quality or logo naturalness. Report individual failures instead of averaging them away.

The canonical input example is [baseline.json](../fixtures/baseline.json). The [regression cases](../fixtures/cases.json) pair inputs with expected outcomes; the negative case must fail with `critic.visual_review_pending`. Validation is implemented by the original `focux.skill_checks.check` function and returns skill, version, passed and sorted errors. All numeric values must be finite where checked. A malformed document fails with `input.schema` or `input.object`.

## Required baseline fields

`gates`, `visual_review`.

Keep the same field types as the baseline. Add context in extra fields when useful; unknown fields are preserved by the caller and ignored by this gate. A pass is limited to the documented rules, and never proves an asset exists or that a subjective review occurred.

## Pattern provenance

Original FOCUX implementation. See [research provenance](../../../docs/SKILL_PROVENANCE.md) for the primary sources studied, license verification, and explicit limits. No third-party code or media is copied into this skill.
