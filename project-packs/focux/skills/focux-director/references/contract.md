# focux-director planning contract, version 1.0.0

Require concept and music direction before story; freeze continuity and anchors before independent generation. Treat asset_gate_passed as supplied evidence to cross-check with focux assets validate, never proof by itself. Render only after the real asset gate passes. Use focux status and project show before resuming a production.

The canonical input example is [baseline.json](../fixtures/baseline.json). The [regression cases](../fixtures/cases.json) pair inputs with expected outcomes; the negative case must fail with `director.production_source`. Validation is implemented by the original `focux.skill_checks.check` function and returns skill, version, passed and sorted errors. All numeric values must be finite where checked. A malformed document fails with `input.schema` or `input.object`.

## Required baseline fields

`concept`, `music_direction`, `story`, `world_bible`, `anchors`, `shotlist`, `production_source`, `asset_gate_passed`, `external_spend`.

Keep the same field types as the baseline. Add context in extra fields when useful; unknown fields are preserved by the caller and ignored by this gate. A pass is limited to the documented rules, and never proves an asset exists or that a subjective review occurred.

## Pattern provenance

Original FOCUX implementation. See [research provenance](../../../docs/SKILL_PROVENANCE.md) for the primary sources studied, license verification, and explicit limits. No third-party code or media is copied into this skill.
