# KAIZEN7 Capability Kernel Design

Date: 2026-07-01

## Product Direction

KAIZEN7 v2 is a small operating kernel for useful agentic work. It is not a mega-agent, a giant skill collection, or a copy of Flowmatik, THE FOCUX, or Mr. Kaizen. It receives an objective, selects the smallest useful capability path, prepares a bounded execution packet, verifies evidence, and writes back only reusable learning.

The core belief is simple: Codex can do high-quality work when KAIZEN7 gives it a clear capability contract, minimal context, allowed files, forbidden actions, verification commands, and a memory writeback rule.

## Goals

- Make KAIZEN7 useful as a kernel for the ecosystem, not another large app.
- Replace loose skills and ad hoc scripts with explicit capabilities.
- Keep projects separate: Flowmatik, THE FOCUX, and Mr. Kaizen are capability packs or consumers, not the KAIZEN7 core.
- Let Codex, OpenHands-style workers, MCP tools, local CLIs, and future agents execute only through bounded packets.
- Require evidence before accepting claims.
- Make every new capability testable, composable, and recoverable.

## Non-Goals

- Do not build a node framework, graph orchestration system, or all-in-one agent runtime.
- Do not move THE FOCUX content, commerce, or brand source of truth into KAIZEN7.
- Do not auto-publish, deploy, spend, delete, install dependencies, or handle credentials.
- Do not create broad autonomous loops without clear budgets, stop conditions, and approval gates.
- Do not add external services or dependencies without a proven bottleneck.

## Kernel Layers

```text
K7 Scope
  permissions, approvals, allowed paths, forbidden actions, budgets, traces

K7 Context
  minimal context packs, selective reading, compression-ready boundaries

K7 Memory
  reusable learning, provenance, conflicts, recency, writeback drafts

K7 Capability
  registry, contracts, dependency graph, composition, commands, packs

K7 Operator
  Codex/local worker/tool execution packets, no unbounded free-form work

K7 Judge
  evidence gates, claim checks, tests, risks, acceptance or block decision
```

These layers are conceptual boundaries. The implementation should stay small and file-based until real pressure justifies more machinery.

## Core Flow

```text
Objective
  -> K7 Start / Cockpit
  -> Capability Resolver
  -> Capability Contract
  -> Context Pack
  -> Execution Packet
  -> Operator
  -> Evidence Gate
  -> Learning Writeback
  -> Next Capability
```

The user should be able to ask for a real outcome, not for an implementation detail. KAIZEN7 maps that outcome to capabilities and tells the executor exactly what to do next.

## Capability Contract

Every capability is a small contract, not a prompt. A capability describes what it can do, what it needs, what it produces, what risks it carries, and how to verify it.

```json
{
  "id": "content.reel.script",
  "domain": "content",
  "purpose": "Create a short-form script that can be verified before production.",
  "status": "active",
  "inputs": ["objective", "brand", "audience", "constraints"],
  "outputs": ["script", "shot_list", "claims"],
  "requires": ["memory.brand", "judge.claims"],
  "tools": ["codex"],
  "approval": ["medical_claims", "publish"],
  "verification": ["script_has_hook", "claims_checked"],
  "writeback": "content_learning"
}
```

Required fields:

- `id`: stable dotted identifier.
- `domain`: one of `kernel`, `code`, `content`, `commerce`, `research`, `memory`, `video`, `supplier`, `interface`, or `ops`.
- `purpose`: one plain sentence.
- `status`: `active`, `experimental`, `deprecated`, or `blocked`.
- `inputs`: named input signals.
- `outputs`: named output artifacts.
- `requires`: other capability IDs or kernel layers.
- `tools`: permitted execution surfaces.
- `approval`: gates required before external effects.
- `verification`: concrete checks.
- `writeback`: what reusable learning, if any, may be written.

## Capability Packs

KAIZEN7 core only contains kernel capabilities. Domain work lives in packs.

Initial pack model:

```text
codex-core
  code.change
  code.test
  code.review
  code.commit

flowmatik-content
  content.idea
  content.script
  content.storyboard
  video.render_plan

mr-kaizen-content
  persona.voice
  scene.world
  content.reel.script
  content.episode_outline

the-focux-commerce
  product.formula_brief
  claims.check
  commerce.product_page
  supplier.shortlist

research-hunter
  research.repo_scan
  research.model_scan
  research.pattern_intake
```

Packs can be added one by one. A pack is useful only if it contains working capability contracts, tests, and at least one real example.

## Capability Resolution

The resolver takes an objective and returns:

- inferred domain,
- selected capability or chain,
- why it was selected,
- missing inputs,
- required context,
- approval gates,
- execution packet,
- verification packet.

Example:

```text
Objective: crear reel de Mr. Kaizen sobre foco en Bangkok

Capability chain:
  persona.voice
  scene.world
  content.reel.script
  video.render_plan
  judge.claims

Operator:
  codex

Approval:
  publish
  medical_claims
```

The first version should use deterministic scoring and explicit hints, not embeddings or a graph database.

## Codex Execution Packet

Codex should receive work as a packet, not as an open-ended prompt.

```json
{
  "mode": "k7-execution-packet",
  "objective": "Create the first tested capability registry.",
  "capability": "kernel.capability_registry",
  "allowed_files": [
    "lib/capabilities/registry.js",
    "tests/capabilities.test.js",
    "data/capabilities.json"
  ],
  "context": [
    "docs/ARCHITECTURE.md",
    "Obsidian/Flowmatik/Arquitectura/KAIZEN7 Clean Start Method 2026-07-01.md"
  ],
  "forbidden_actions": [
    "publish",
    "deploy",
    "delete",
    "spend",
    "credential_write",
    "install_dependencies_without_approval"
  ],
  "commands": [
    "node tests/capabilities.test.js",
    "npm.cmd run check"
  ],
  "evidence_required": ["diff", "tests", "risks"],
  "writeback": {
    "target": "Obsidian/Flowmatik/Arquitectura/",
    "rule": "write only reusable learning; no secrets"
  }
}
```

This is the main product mechanic. KAIZEN7 wins if Codex can repeatedly execute these packets with low ambiguity and high verification.

## Evidence Gate

KAIZEN7 accepts work only when claims match evidence.

Required evidence types:

- `diff`: changed files or generated artifact list.
- `tests`: exact command and result.
- `risks`: remaining risks or approvals.
- `sources`: URLs, local docs, or memory paths when research is involved.
- `screenshots` or `artifacts`: only when visual output matters.

The first gate can be deterministic:

```text
claim: changed files are scoped -> evidence.diff exists
claim: tests passed -> evidence.tests exists and says pass
claim: risks reported -> evidence.risks exists
```

Later versions can add scoring, historical quality, and capability fitness.

## Memory Writeback

Memory is not a log dump. It stores reusable learning.

Allowed memory:

- decisions,
- capability contracts,
- friction that changed the system,
- reusable patterns,
- rejected approaches and reasons,
- evidence summaries.

Forbidden memory:

- secrets,
- credentials,
- raw private customer data,
- broad transcripts,
- unverified claims,
- temporary debug output.

## Product Surface

Initial surfaces should be boring and useful:

- CLI:
  - `npm.cmd run k7:capabilities -- --list`
  - `npm.cmd run k7:capabilities -- --plan "<objective>"`
  - `npm.cmd run k7:capabilities -- --packet "<objective>"`
  - `npm.cmd run k7:capabilities -- --verify evidence.json`
- API:
  - `POST /api/k7/capabilities/plan`
  - `POST /api/k7/capabilities/packet`
  - `POST /api/k7/capabilities/verify`
- Data:
  - `data/capabilities.json`
  - optional pack files under `data/capability-packs/`

No dashboard is required for the first version.

## Implementation Shape

Target files:

```text
data/capabilities.json
lib/capabilities/registry.js
lib/capabilities/resolver.js
lib/capabilities/packet.js
lib/capabilities/verifier.js
lib/capabilities/cli.js
lib/capabilities/index.js
tests/capabilities.test.js
docs/CAPABILITY_KERNEL.md
```

The module should be pure JavaScript with no new dependencies.

## First Useful Product Slice

The first useful slice is:

```text
Objective -> selected capability chain -> Codex packet -> verification gate
```

It must support at least:

- code/test work for KAIZEN7 itself,
- Mr. Kaizen content planning as a pack contract,
- THE FOCUX commerce/claims as a pack contract,
- Flowmatik content/video planning as a pack contract.

These domain capabilities can start as contracts and packets. They do not need full automation in v1.

## Success Criteria

- `npm.cmd run check` passes.
- A user can run one command with an objective and receive a useful capability packet.
- The packet tells Codex what to read, edit, avoid, run, and report.
- The verifier blocks a claimed success without tests or risks.
- THE FOCUX, Flowmatik, and Mr. Kaizen are represented as packs, not merged into the core.
- Adding a capability requires data + test, not a new bespoke script by default.

## Risks

- Overbuilding into a framework. Mitigation: file-based registry, deterministic resolver, no graph engine.
- Turning packs into hidden project copies. Mitigation: packs hold contracts, not full source-of-truth content.
- Making Codex too constrained. Mitigation: packets set boundaries but preserve enough objective context.
- Weak verification. Mitigation: every capability has explicit evidence requirements from day one.
- Memory bloat. Mitigation: writeback is a draft with allowed categories.

## Phased Delivery

### Phase 1: Capability Kernel

Build registry, resolver, packet builder, verifier, CLI, tests, and docs.

### Phase 2: Codex Operator Integration

Make `k7:start`, `k7:codex`, and `k7:connect` include selected capability packet data.

### Phase 3: First Domain Packs

Add contract-only packs for Mr. Kaizen Content, Flowmatik Content, and THE FOCUX Commerce.

### Phase 4: Capability Composition

Support chains such as `research -> script -> render_plan -> judge`.

### Phase 5: Learning Loop

Record capability outcomes in a small ledger and let the resolver prefer capabilities that reduce rework and pass verification.

## Open Decisions

- Whether capability packs should live in one JSON file or separate files from the start.
- Whether the API endpoints should ship in Phase 1 or wait until the CLI is proven.
- Whether memory writeback should create Obsidian notes immediately or only return drafts in v1.

Default for v1: one registry file, CLI first, writeback drafts only.
