# KAIZEN7 Repo Pruning 2026-07-02

## Decision

Start pruning the repository around the Agent Product Core.

## Incorporated

- K7 operating/state modules.
- Capability provider registry.
- Local capability manifest layer.
- Flowmatik/Remotion/Omni as optional providers, not product center.

## Removed From Git Surface

Generated outputs should stay local:

- rendered videos,
- still frames,
- generated WAV files,
- context-firewall runtime evidence,
- temporary dependency folders,
- session outputs.

## Rule

Provider code can stay if it gives KAIZEN7 a reusable capability. Runtime artifacts do not stay in git.

## Next Cleanup Pass

After this pass, review optional providers one by one:

1. Keep if tested and agent-readable.
2. Move to optional provider docs if useful but not core.
3. Delete if it duplicates the forge or cannot produce evidence.
