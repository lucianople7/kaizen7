# KAIZEN7 Universal Capability Forge Design

Date: 2026-07-02

## Product Direction

KAIZEN7 is not a tool catalog, a launcher, or a pile of integrations. KAIZEN7 should convert a real need into an executable, verifiable, reusable capability path.

The forge is the operating layer that lets KAIZEN7 think, search, absorb patterns, build or adapt the minimum useful capability, execute with evidence, and remember what reduced friction.

The user should not need to connect many tools manually or answer repeated setup questions. KAIZEN7 should infer direction, pick the shortest safe path, and give Codex or another agent enough structure to act immediately.

## Core Thesis

```text
Need
  -> intent
  -> capability
  -> provider or pattern search
  -> adapter or minimal build
  -> execution packet
  -> evidence gate
  -> memory writeback
  -> faster next use
```

If a usable free or open-source path exists, KAIZEN7 should find it. If the tool exists but is not agent-native, KAIZEN7 should adapt it. If no good tool exists, KAIZEN7 should absorb the best pattern and create the smallest developable capability for an agent.

## Goals

- Make KAIZEN7 capable of opening paths, not merely calling known tools.
- Prefer free, open-source, local-first, CPU-first providers by default.
- Let Pinokio, Stability Matrix, GitHub, Hugging Face, MCP registries, local CLIs, and browser-accessible tools act as replaceable discovery surfaces.
- Extract useful patterns from tools, repos, papers, workflows and examples without copying unnecessary complexity.
- Convert patterns into capability contracts, provider manifests, adapters, tests, docs and execution packets.
- Reduce questions by giving agents direction, constraints, allowed actions and verification requirements.
- Keep every created path reusable through memory writeback.

## Non-Goals

- Do not build a giant autonomous agent runtime.
- Do not make clips or video the only product surface. Clips are only a demonstration case.
- Do not depend on GPU providers for the main path.
- Do not depend on paid APIs, closed platforms, or cloud services by default.
- Do not install software, download heavy models, publish, spend, delete, or handle credentials without approval.
- Do not copy full external projects into KAIZEN7 unless there is an explicit license and implementation decision.

## Operating Principles

Priority order:

```text
1. Free or open source
2. CPU-first or no-GPU by default
3. Local-first when practical
4. Agent-readable interface: CLI, API, JSON, files, logs or stable browser flow
5. Minimal setup steps
6. Verifiable outputs
7. Reusable manifests and memory
8. GPU, paid or cloud providers only as optional upgrades
```

The forge should use the easiest working path, but it should not mistake novelty for value. A provider only enters the path if it reduces steps, ambiguity, cost, fragility or execution time.

## Core Engines

### 1. Intent To Capability

Turns the user's need into one or more capability IDs.

Examples:

```text
organize PDFs               -> document.ocr, document.classify, file.rename
create a short video        -> content.script, audio.tts, caption.generate, video.compose, media.probe
analyze suppliers           -> research.web, supplier.extract, table.compare, evidence.source_map
build a small app           -> code.scaffold, code.test, ui.preview, docs.handoff
automate an app with no API  -> operator.browser_adapter, adapter.forge, evidence.trace
```

The result is direction, not a question list. Missing inputs should be requested only when execution cannot proceed safely.

### 2. Provider Radar

Searches for existing ways to satisfy a capability.

Initial discovery surfaces:

```text
local registry
Pinokio
Stability Matrix
GitHub
Hugging Face
MCP registry
local PATH
known docs and Obsidian memory
```

Each candidate receives a fit score:

```json
{
  "id": "pinokio.comfyui",
  "capabilities": ["image.generate", "image.workflow"],
  "license": "open_source",
  "cost": "free",
  "hardware": "cpu_possible_gpu_recommended",
  "agent_surface": ["http_api", "workflow_json"],
  "setup_friction": "medium",
  "risk": ["model_download", "extension_security"],
  "verdict": "optional_provider"
}
```

### 3. Pattern Absorber

When a tool or repo is useful but too heavy, too narrow, or not agent-native, KAIZEN7 should absorb the pattern instead of swallowing the whole project.

Extract:

- capability shape,
- input and output contract,
- command or API pattern,
- workflow stages,
- file layout,
- error handling,
- verification method,
- UX shortcut,
- security or hardware constraints,
- what to explicitly avoid.

Output:

```json
{
  "schema": "kaizen7.pattern_absorption.v1",
  "source": "github.com/example/tool",
  "capability": "caption.generate",
  "absorbed_pattern": "audio -> transcript -> srt -> burned captions",
  "do_not_absorb": ["full web app", "account system", "cloud billing"],
  "k7_translation": ["provider_manifest", "adapter_contract", "test_fixture"],
  "verdict": "adapt_pattern"
}
```

### 4. Adapter Forge

Creates the smallest agent-usable bridge when a tool is not already agent-native.

Adapter outputs:

- provider manifest,
- safe command list with `shell=false` style execution,
- input schema,
- output schema,
- evidence contract,
- verify command,
- failure categories,
- install/start/stop hooks when needed,
- approval gates.

Adapters can wrap CLIs, HTTP services, local scripts, browser flows, Pinokio apps, Stability Matrix packages or future providers.

### 5. Execution And Evidence Loop

The forge should not stop at "this might work". It should create an execution packet for Codex or another agent.

```json
{
  "schema": "kaizen7.forge_packet.v1",
  "objective": "create a CPU-first transcript pipeline for local audio",
  "capability": "audio.transcribe",
  "selected_path": ["whisper.cpp", "adapter.forge", "media.probe"],
  "allowed_actions": ["read_docs", "create_manifest", "create_adapter", "run_dry_run", "run_tests"],
  "approval_required": ["install_binary", "download_model"],
  "evidence_required": ["manifest_exists", "adapter_test_passed", "sample_transcript_exists"],
  "memory_writeback": "pattern and provider learning only"
}
```

Evidence closes the loop:

- artifact exists,
- command result,
- test result,
- source map,
- provider status,
- known risks,
- next improvement.

### 6. Memory Loop

KAIZEN7 should remember the reusable learning, not the noise.

Store:

- successful provider choices,
- rejected providers and why,
- absorbed patterns,
- adapters created,
- hardware constraints,
- friction removed,
- verification results,
- next best capability.

Do not store:

- secrets,
- raw private data,
- broad logs,
- unverified claims,
- giant copied docs,
- temporary debug output.

## Autonomy Model

KAIZEN7 should be highly autonomous for thinking and preparation, but bounded for external effects.

Autonomous:

- search local memory and public sources,
- compare tools and patterns,
- create manifests,
- create adapters,
- create execution packets,
- run dry-runs and tests inside the workspace,
- verify artifacts,
- write memory drafts.

Requires approval:

- install software,
- download heavy models,
- start persistent services,
- use GPU-heavy jobs,
- use paid APIs,
- publish externally,
- delete or overwrite user assets,
- change credentials or secrets.

## Relationship To Existing Work

This design extends the existing KAIZEN7 Capability Kernel.

Existing pieces remain valid:

```text
data/capabilities.json
data/anything-tools.json
lib/anything-cli.js
lib/anything-tool-registry.js
core.py
examples/comfyui.pinokio.json
docs/CAPABILITY_KERNEL.md
docs/OMNI_MEDIA_ENGINE.md
```

`k7:anything` becomes a front door for the forge, not the whole product. CLI-Anything is an inspiration for adapter generation, not the architecture.

Pinokio is a provider catalog and local app bridge. It is not the center. Stability Matrix, ComfyUI, FFmpeg, Remotion, Whisper-style transcribers, local TTS engines, Ollama, SearXNG, MCP tools and future providers are replaceable.

## Product Surface

Initial commands:

```text
npm.cmd run k7:anything -- forge "<need>"
npm.cmd run k7:anything -- providers "<capability>"
npm.cmd run k7:anything -- absorb "<source-url-or-local-path>"
npm.cmd run k7:anything -- packet "<need>"
npm.cmd run k7:anything -- doctor
```

Example:

```text
npm.cmd run k7:anything -- forge "I need to transcribe local audio without GPU"
```

Expected behavior:

```text
infer audio.transcribe
search local registry and known CPU-first tools
select best free/open-source path
create or update provider manifest
return required approval if install/model is missing
create execution packet for Codex
define verification evidence
```

## First Useful Product Slice

The first slice should prove universal capability forging without depending on video.

Recommended first demo:

```text
Need: transcribe local audio without GPU
Capabilities: audio.transcribe, caption.generate, evidence.source_map
Provider class: free/open-source CPU-first transcriber
Output: transcript file, optional SRT, manifest, adapter, test fixture, evidence packet
```

Why this first:

- clearly useful beyond clips,
- CPU-first,
- verifiable,
- easy to test with a small fixture,
- later composes into clips, research, meetings, podcasts and content workflows.

Second demo:

```text
Need: create a superclip without GPU
Capabilities: content.script, audio.tts, caption.generate, video.compose, media.probe
Providers: local TTS, Remotion or FFmpeg, caption adapter, static or existing assets
```

## Success Criteria

- A user can state a need and receive a clear capability path without choosing tools manually.
- The forge prefers free/open-source/CPU-first providers by default.
- The forge can distinguish `use_provider`, `adapt_provider`, and `absorb_pattern`.
- The forge creates agent-ready packets that reduce questions for Codex.
- Generated manifests and adapters include verification and approval gates.
- Provider decisions are recorded as reusable memory.
- No install, model download, publication, deletion, spend or credential action happens without approval.

## Risks

- Overbuilding into a universal platform. Mitigation: start with one CPU-first capability and file-based manifests.
- Weak provider scoring. Mitigation: use explicit fields first: license, cost, hardware, agent surface, evidence, risk.
- Unsafe open-source intake. Mitigation: absorb patterns by default; do not copy code unless explicitly reviewed.
- Too many user questions. Mitigation: ask only when execution is blocked or risk requires approval.
- GPU creep. Mitigation: label GPU providers as optional upgrades, never default dependencies.
- Memory bloat. Mitigation: write only decisions, patterns, manifests and evidence summaries.

## Phased Delivery

### Phase 1: Forge Contract

Define forge packet, provider candidate shape, pattern absorption record and approval gates.

### Phase 2: Provider Radar

Extend the current tool registry to score local tools, Pinokio manifests and known provider catalogs.

### Phase 3: Pattern Absorber

Create a research-to-pattern workflow that turns a repo/tool/page into a small KAIZEN7 absorption record.

### Phase 4: Adapter Forge

Generate or update provider manifests and thin adapters with tests.

### Phase 5: First CPU-First Demo

Ship `audio.transcribe` or another low-friction capability end to end.

### Phase 6: Superclip Composition

Compose existing capabilities into a no-GPU superclip flow once the universal forge is proven.

## Open Decisions

- Whether the first provider radar reads Pinokio directly or starts from curated manifests.
- Whether pattern absorption records live in `data/` or Obsidian first.
- Whether `k7:anything` should remain the command name or gain `k7:forge`.
- Which CPU-first transcriber should be the first real provider after local verification.

Default for v1: curated manifests first, pattern records in Obsidian plus data fixtures, keep `k7:anything`, and choose the first provider only after local availability is checked.
