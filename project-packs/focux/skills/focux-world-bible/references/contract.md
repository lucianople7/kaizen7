# focux-world-bible planning contract, version 1.0.0

Complete every continuity field before generation. Anchor ids must resolve to available references; record deliberate changes as versions. Wardrobe and hair are separate fields so drift can be diagnosed. Preserve forbidden traits alongside positive references.

The canonical input example is [baseline.json](../fixtures/baseline.json). The [regression cases](../fixtures/cases.json) pair inputs with expected outcomes; the negative case must fail with `world.required_continuity`. Validation is implemented by the original `focux.skill_checks.check` function and returns skill, version, passed and sorted errors. All numeric values must be finite where checked. A malformed document fails with `input.schema` or `input.object`.

## Required baseline fields

`world`, `city`, `environments`, `time`, `weather`, `lighting`, `palette`, `camera_language`, `lenses`, `grain`, `protagonist_anchor`, `wardrobe`, `hair`, `props`, `mood`, `visual_dna`, `manga_rules`, `forbidden_traits`.

Keep the same field types as the baseline. Add context in extra fields when useful; unknown fields are preserved by the caller and ignored by this gate. A pass is limited to the documented rules, and never proves an asset exists or that a subjective review occurred.

## Pattern provenance

Original FOCUX implementation. See [research provenance](../../../docs/SKILL_PROVENANCE.md) for the primary sources studied, license verification, and explicit limits. No third-party code or media is copied into this skill.
