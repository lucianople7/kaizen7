# KAIZEN7 Universal Capability Forge

KAIZEN7 converts real needs into executable, verifiable and reusable capability paths.

Core flow:

```text
Need
  -> intent
  -> capability
  -> provider or pattern search
  -> adapter or minimal build
  -> execution packet
  -> evidence gate
  -> memory writeback
```

Default criteria:

- free or open source first
- CPU-first or no-GPU by default
- local-first when practical
- agent-readable interfaces
- minimal setup
- verifiable outputs
- reusable memory

KAIZEN7 does not depend on one tool. Pinokio, Stability Matrix, ComfyUI, FFmpeg, Remotion, Whisper-style tools, Ollama, SearXNG, MCPs and future providers are replaceable paths.

The center is the capability forge: KAIZEN7 thinks, searches, absorbs useful patterns, adapts or builds the minimum useful path, executes with evidence and remembers what reduced friction.

The next layer is the Ephemeral Agent Factory. When KAIZEN7 needs a capability that does not exist yet, it can create a short-lived specialist brief for Codex or another agent. The specialist builds one adapter, capability or mini-skill, returns evidence, and then KAIZEN7 registers the learning or retires the specialist.

Reference:

```text
docs/EPHEMERAL_AGENT_FACTORY.md
docs/superpowers/specs/2026-07-02-kaizen7-ephemeral-agent-factory-design.md
Obsidian/Flowmatik/Arquitectura/KAIZEN7 Ephemeral Agent Factory.md
```

## First Working Surface

```powershell
npm.cmd run k7:anything -- forge "necesito transcribir audio local sin GPU"
npm.cmd run k7:anything -- forge "necesito transcribir audio local sin GPU" --write
```

The command returns a `kaizen7.forge_packet.v1` packet with:

- inferred capability
- provider radar decision
- free/open-source/CPU-first policy
- selected path
- allowed autonomous actions
- approval gates
- evidence requirements
- agent execution direction

This is the first real interface for Codex or any other agent to move from a need to a bounded execution path.

With `--write`, KAIZEN7 creates a reusable agent session:

```text
content_library/forge/sessions/<session-id>/forge-packet.json
content_library/forge/sessions/<session-id>/agent-brief.md
```

Provider Radar can return:

- `use_provider`: a matching provider is available now.
- `adapt_provider`: a matching provider exists but needs install, start or adapter work.
- `absorb_pattern`: no provider is known, so KAIZEN7 should search and absorb a pattern.

When the decision is `adapt_provider`, the packet includes `adapter_manifest`:

- provider id and capability
- manifest action
- commands already known
- verify command
- approval requirements
- expected evidence
- files an agent should create or update
