# KAIZEN7 Repo Pruning Decision

Date: 2026-07-02

This cleanup moves the repository toward the KAIZEN7 Agent Product Core.

## Keep In Core

- Universal Capability Forge.
- Agent handoff packets.
- Context Firewall.
- Agent Magnifier Radar.
- K7 state, next action and self-test commands.
- K7 control/context/operating layer modules.
- Capability provider registry.
- Local capability manifest layer.

## Keep As Optional Providers

These are not the center of KAIZEN7, but they are valid capability providers behind the forge:

- Flowmatik audio/render providers.
- Remotion templates.
- Omni media engine.
- Anything tool registry.
- Pinokio/local command capability manifests.

They remain optional and evidence-gated. They must not redefine the product direction.

## Ignore As Runtime Output

Generated media, audio, context evidence, temporary dependency caches and project session outputs are local runtime artifacts. They stay out of git unless a specific artifact is promoted intentionally.

Ignored classes:

- `content_library/audio/`
- `content_library/context_firewall/evidence/`
- `content_library/exports/`
- `content_library/omni/`
- `content_library/projects/`
- `.npm-cache/`
- `.tmp-cli-anything-hub/`
- `.tmp-video-deps/`
- generated public audio WAV files

## Current Direction

KAIZEN7 should stay focused on:

```text
Need -> Capability -> Provider/Pattern -> Adapter/Build -> Agent Handoff -> Evidence -> Memory
```

If a module does not help discover, build, execute, verify or remember a capability, it should not be promoted into the core.
