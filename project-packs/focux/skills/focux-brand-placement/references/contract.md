# focux-brand-placement planning contract, version 1.0.0

Baseline permits zero to two placements and at most eight percent frame area per placement. Composite the canonical mark with perspective and lighting appropriate to the surface. Record canonical logo provenance. Review spelling and naturalness visually; never use generated text as canonical identity.

The canonical input example is [baseline.json](../fixtures/baseline.json). The [regression cases](../fixtures/cases.json) pair inputs with expected outcomes; the negative case must fail with `brand.prominence`. Validation is implemented by the original `focux.skill_checks.check` function and returns skill, version, passed and sorted errors. All numeric values must be finite where checked. A malformed document fails with `input.schema` or `input.object`.

## Required baseline fields

`canonical_logo_id`, `placements`.

Keep the same field types as the baseline. Add context in extra fields when useful; unknown fields are preserved by the caller and ignored by this gate. A pass is limited to the documented rules, and never proves an asset exists or that a subjective review occurred.

## Pattern provenance

Original FOCUX implementation. See [research provenance](../../../docs/SKILL_PROVENANCE.md) for the primary sources studied, license verification, and explicit limits. No third-party code or media is copied into this skill.
