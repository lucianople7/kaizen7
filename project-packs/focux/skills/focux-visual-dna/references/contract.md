# focux-visual-dna planning contract, version 1.0.0

Manga is a transient separate overlay: baseline maximum two hits, each at most 0.5 seconds. Keep live-action identity visible before and after each hit. Inspect the rendered overlay; passing metadata cannot establish aesthetic quality.

The canonical input example is [baseline.json](../fixtures/baseline.json). The [regression cases](../fixtures/cases.json) pair inputs with expected outcomes; the negative case must fail with `dna.transient_layer`. Validation is implemented by the original `focux.skill_checks.check` function and returns skill, version, passed and sorted errors. All numeric values must be finite where checked. A malformed document fails with `input.schema` or `input.object`.

## Required baseline fields

`palette`, `camera_language`, `forbidden_traits`, `manga_hits`.

Keep the same field types as the baseline. Add context in extra fields when useful; unknown fields are preserved by the caller and ignored by this gate. A pass is limited to the documented rules, and never proves an asset exists or that a subjective review occurred.

## Pattern provenance

Original FOCUX implementation. See [research provenance](../../../docs/SKILL_PROVENANCE.md) for the primary sources studied, license verification, and explicit limits. No third-party code or media is copied into this skill.
