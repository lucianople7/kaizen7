# K7 Commons Gate Design

**Date:** 2026-07-24  
**Status:** Approved architecture; implementation pending plan and tests  
**Repository:** `lucianople7/kaizen7`

## 1. Purpose

KAIZEN7 must reuse mature capabilities from Codex, ChatGPT Work, OpenAI-curated plugins, and selected community projects without becoming a large dependency bundle or loading every skill into context.

The system will add a governed intake layer named **K7 Commons Gate**:

```text
Codex / Work / OpenAI / community sources
  -> compact candidate packet
  -> deterministic admission checks
  -> quarantine
  -> shadow evaluation
  -> verified receipt
  -> human-approved activation
```

The gate exists to reduce steps, tokens, repeated work, maintenance, and risk. It does not create a new agent, marketplace, model router, or autonomous installer.

## 2. Binding Constraints

1. KAIZEN7 remains the private coordination, routing, memory, verification, and project-contract layer.
2. ChatGPT Work remains the operational front end and research surface.
3. Codex remains the implementation and verification executor.
4. GitHub issues and pull requests remain the asynchronous handoff and review channel.
5. Flowmatik, THE FOCUX, Mr. Kaizen, public sites, content, commerce, and video implementation remain in separate repositories.
6. The core must work local-first and without a paid API.
7. Hosted models, SaaS tools, connectors, and MCP servers remain optional adapters.
8. No bulk installation of community skills or plugins is allowed.
9. No install, credential write, deployment, publication, spending, merge, or destructive action occurs without the existing authority gates.
10. Community code is never copied into the kernel merely because it is useful. Prefer a skill, plugin, MCP connection, CLI adapter, or external project handoff.
11. Every promoted capability must reduce at least one operational metric and introduce no critical negative:
    - steps,
    - tokens,
    - risk,
    - repeated work,
    - decision time,
    - clarity,
    - verification,
    - reusable learning.
12. One KAIZEN7 cycle still returns exactly one next action.

## 3. Current Problems To Repair

### 3.1 Pull Request #8: Provider Registry

PR #8 correctly removes duplicated provider configuration, but it must not merge unchanged.

Problems:

- OpenAI is pinned to `gpt-5.5` although current official guidance identifies the GPT-5.6 family.
- Anthropic is pinned to `claude-sonnet-4-6` although current official guidance identifies Sonnet 5 as its successor.
- Provider freshness is represented as permanent source code instead of versioned, source-backed metadata.
- The kernel falls back to a hosted OpenAI model even when no provider was explicitly selected.
- Provider priority does not express the approved local-first policy clearly.

Repair:

- Preserve one canonical registry.
- Separate stable provider transport configuration from changing model recommendations.
- Store source URL and `verified_at` for each changing default.
- Allow environment overrides.
- Mark stale recommendations as `verification_required`; never silently invent a replacement.
- Default to local Ollama when no hosted provider is explicitly selected.
- Never make a live or paid request during readiness checks.
- Add deterministic retirement and staleness tests.

### 3.2 Pull Request #9: Operator Constitution

PR #9 correctly centralizes final human authority, but it must not merge unchanged.

Problems:

- It commits the operator's full name and derived personal identity into a public repository.
- It prints that identity in every One Door envelope.
- It conflates a public authority contract with private operator context.
- The current repository is public while KAIZEN7's operator identity is private.

Repair:

- Commit only a non-identifying public authority contract.
- Use a stable pseudonymous identifier such as `primary-human-operator`.
- Display `Human authority` rather than a legal name.
- Support an optional private overlay through `K7_OPERATOR_CONSTITUTION_PATH`.
- Keep the private overlay outside the repository and outside receipts.
- Reject secrets and sensitive categories recursively.
- Never require the private overlay for normal operation.
- Keep all spending, publishing, credentials, deployment, deletion, legal, and other irreversible gates.

### 3.3 Repository Positioning

The repository currently declares `"private": false` and describes KAIZEN7 as a distributable product, while the approved direction is a private coordination anchor.

Repair:

- Set the npm package to `"private": true` unless a later release mission explicitly reverses it.
- Update public-facing copy to describe the repository as a private/local coordination kernel and reference implementation.
- Keep external projects and commercial surfaces out of this repository.
- Remove contradictory “sellable SaaS” direction from the active roadmap while preserving historical records as history.

## 4. K7 Commons Gate

### 4.1 Candidate Packet

Every candidate enters as a small JSON-compatible packet:

```json
{
  "schema": "kaizen7.commons_candidate.v1",
  "id": "source-owner-project-capability",
  "name": "Capability name",
  "kind": "skill",
  "source": {
    "class": "openai_official",
    "url": "https://github.com/example/project",
    "revision": "commit-or-release",
    "observed_at": "2026-07-24T00:00:00.000Z"
  },
  "license": {
    "spdx": "MIT",
    "verified": true
  },
  "capabilities": ["edit_video"],
  "requirements": {
    "local": ["ffmpeg"],
    "optional_env": [],
    "mandatory_paid_services": []
  },
  "effects": {
    "writes_local": true,
    "writes_external": false,
    "publishes": false,
    "spends": false,
    "touches_credentials": false
  },
  "evidence": []
}
```

Unknown values remain unknown. The evaluator must not convert missing evidence into a positive score.

### 4.2 Source Trust Classes

- `openai_official`: OpenAI documentation and OpenAI repositories.
- `vendor_official`: the upstream project or vendor repository.
- `community_curated`: maintained lists such as Awesome Codex CLI.
- `community_unverified`: individual repositories or skills without independent verification.
- `local`: capabilities already installed or created in the operator's environment.

Trust class changes the evidence requirement, not the final authority boundary.

### 4.3 Lifecycle

```text
discovered
  -> quarantined
  -> evaluated
  -> shadow_tested
  -> promotable
  -> approved
  -> active
```

Terminal alternatives:

- `rejected`
- `blocked`
- `superseded`

Only a verified receipt can move a candidate to `promotable`. Only explicit human approval can move it from `promotable` to `approved` when installation, credentials, external writes, or new persistent dependencies are involved.

### 4.4 Deterministic Gates

Hard rejection or blocking conditions:

- missing or incompatible license;
- mandatory paid API when no local/free path exists;
- secrets requested in repository files;
- automatic publication, spending, deployment, deletion, or credential mutation;
- destructive or overly broad install script;
- unbounded autonomous loop;
- no reproducible verification;
- duplicated capability with no measured improvement;
- untrusted binary or remote code execution without isolation;
- excessive always-loaded skill metadata.

Scored dimensions:

- local-first compatibility;
- license clarity;
- maintenance/activity;
- security and permission scope;
- context/token cost;
- overlap with existing capability;
- reversibility;
- verification quality;
- expected reduction in steps or repeated work;
- portability across Work, Codex, and local tools.

### 4.5 Commands

The new command surface stays small:

```text
k7 commons ingest <candidate.json>
k7 commons evaluate <candidate-id>
k7 commons list [--state <state>]
k7 commons receipt <candidate-id>
```

Convenience npm aliases may mirror these commands, but `k7 commons` is canonical.

The commands are offline and deterministic by default. Work, GitHub, Hugging Face, Repo Hunter, or a future automation performs external research and submits candidate packets. The kernel does not scrape marketplaces during normal command execution.

### 4.6 Storage

Versioned:

- `data/commons-sources.json`: source definitions and trust classes.
- `schemas/commons-candidate.schema.json`: candidate contract.
- `schemas/commons-receipt.schema.json`: evaluation receipt contract.

Local runtime state, ignored by Git:

- candidate inbox;
- evaluation runs;
- shadow-test output;
- private capability inventory.

No credentials, private connector identifiers, raw conversations, or private operator data enter versioned files.

### 4.7 Delegation Architecture

Commons Gate governs evidence; it does not duplicate specialist tools.

| Concern | Delegated capability | KAIZEN7 responsibility |
|---|---|---|
| Skill/plugin structure, token budgets, deterministic checks | OpenAI `plugin-eval` | Ingest its versioned JSON result, apply K7 policy, and record provenance |
| Live skill benchmark | Optional `plugin-eval` benchmark through isolated `codex exec` | Require explicit opt-in, cap attempts, and retain artifacts outside versioned data |
| Executable code, hooks, installers, MCP, or broad permissions | Installed Codex Security workflows | Require a normalized security finding receipt before promotion |
| Repository history, CI, review, and handoff | GitHub plugin and pull requests | Keep authority gates and one-next-action coordination |
| Research and connected data | Work apps, official plugins, Hugging Face, Repo Hunter, and Agent-Reach pilot | Convert discoveries into compact candidate packets; never load catalogs wholesale |
| Design, media, commerce, and deployment work | Existing specialist plugins in the destination project | Select the smallest native capability and keep implementation outside the kernel |

The first implementation is adapter-first. It accepts fixture-backed `plugin-eval` and security results without requiring either external command at runtime. KAIZEN7 must not create a second token estimator, generic plugin linter, vulnerability scanner, media editor, web builder, or SaaS integration framework.

A delegated result is evidence, not authority. It cannot install, approve, activate, publish, spend, deploy, merge, or mutate credentials.

## 5. Codex And Work Integration

KAIZEN7 will use each Codex surface for its intended scope:

- `AGENTS.md`: short durable repository rules and verification commands.
- Project `.codex/config.toml`: trusted-repository configuration only.
- Skills: repeatable task workflows loaded only when selected.
- Plugins: reusable bundles of skills plus optional connectors, MCP, hooks, or assets.
- MCP/apps: live authorized external data and actions.
- Hooks: mechanical enforcement at lifecycle boundaries.
- Automations: recurring discovery and health checks.
- Prompt/thread context: one-off mission instructions.

Work contributes research, connected apps, visual inspection, documents, images, and user-facing review. Codex contributes repository analysis, code changes, tests, browser validation, and pull requests. KAIZEN7 chooses the smallest applicable surface and records the result.

The capability inventory is supplied as a compact snapshot. KAIZEN7 does not assume every Work or Codex installation has the same plugins.

### 5.1 Native Capability Reuse Matrix

The environment-specific inventory is evaluated before any community installation.

| Destination | Reuse now | Pilot later | Do not rebuild in KAIZEN7 |
|---|---|---|---|
| KAIZEN7 kernel | GitHub, Codex Security, `plugin-eval` adapter, Automations, Hugging Face community evals | Agent-Reach evidence adapter | scanners, benchmark harnesses, generic plugin evaluation |
| Flowmatik | official Remotion skill, HyperFrames, Canva, product-design, image generation | `video-use` with local transcription; OpenChatCut as manual local MCP | timeline editor, renderer, caption engine |
| THE FOCUX | Shopify, product-design, Sites, Supabase, Drive/Docs/Sheets, Gmail, Notion | analytics and brand-monitoring adapters when justified | storefront framework, CRM, analytics platform |
| Research and daily intelligence | Work search/connectors, GitHub, Hugging Face papers/datasets, Notion/Drive | Agent-Reach in proposal-only mode | another crawler or permanent research agent |

Selection order:

1. already installed and applicable;
2. OpenAI-curated official capability;
3. vendor-official local/free capability;
4. community candidate with measured advantage;
5. custom implementation only when the first four cannot satisfy the contract.

### 5.2 OpenAI-Native Operating Model

KAIZEN7 treats OpenAI as three distinct execution planes. Capability availability is discovered per environment; the design does not assume that a preview, plan entitlement, region, or desktop-only feature exists.

#### Plane A: ChatGPT Work as operator surface

Use Work for:

- projects that preserve shared files, instructions, sources, and related chats;
- Goal mode and long-running work with measurable completion criteria;
- scheduled discovery, monitoring, health checks, and thread-continuity tasks;
- browser research and rendered web validation;
- connected apps and plugins;
- documents, presentations, spreadsheets, PDFs, annotations, and visualizations;
- GPT Image generation and editing for persistent visual systems;
- Sites for prototypes and approved production deployments;
- notifications and remote connections from the mobile app.

Remote connections are the preferred mobile control path: the operator can start or continue chats on the desktop host, steer work, answer questions, approve actions, and inspect diffs, tests, terminal output, and screenshots. Remote access does not remove KAIZEN7 authority gates.

#### Plane B: Codex as execution surface

Use Codex local mode for repository and filesystem work that depends on the operator's machine. Use a worktree for isolated background branches, cloud only when hosted execution materially helps, and Handoff to move work between them.

Codex-native responsibilities include:

- code analysis, implementation, tests, reviews, and pull requests;
- `AGENTS.md`, project configuration, rules, hooks, and permission profiles;
- skills and plugins loaded only when relevant;
- MCP/apps for structured external access;
- Codex Security scans and remediation;
- non-interactive execution, SDK, App Server, or MCP Server only when KAIZEN7 needs a stable machine interface;
- GitHub Action only as an optional API-backed lane.

Subagents are introduced only when independent contracts justify parallel work. A larger agent count is not an improvement by itself.

#### Plane C: OpenAI Platform as optional acceleration

The core never requires an API key. When spending is explicitly approved, OpenAI Platform may provide:

- Responses API conversation state, streaming, background mode, webhooks, and compaction;
- web search, image search, file search, retrieval, Code Interpreter, shell, computer use, remote MCP/connectors, and image generation;
- tool search to defer tool definitions and reduce context;
- Programmatic Tool Calling to compose parallel calls, loops, and conditions while keeping intermediate results out of the main transcript;
- Agents SDK sessions, guardrails, handoffs, approvals, tracing, and eval workflows;
- Evals, graders, trace grading, prompt optimization, and improvement loops;
- GPT Image, Sora video, speech-to-text, text-to-speech, Realtime voice, and Deep Research;
- Batch, prompt caching, and flex/background processing for approved cost optimization.

These are acceleration adapters, never silent fallbacks. Every API-backed route declares expected cost class, data boundary, approval state, and a local or Work-based alternative when one exists.

### 5.3 OpenAI Surface Decisions For Current Projects

| Need | Preferred OpenAI surface | KAIZEN7 decision |
|---|---|---|
| Start and steer everything from the phone | Work Remote connected to desktop host | adopt when available; retain per-action approvals |
| Maintain project continuity | Work Project plus repository docs and receipts | adopt; memory is recall, not binding policy |
| Daily intelligence | Scheduled task in the same Work thread | adopt proposal-only; no automatic installation |
| Long implementation | Codex Goal mode in local/worktree | adopt with iteration/token/stop limits |
| Parallel isolated change | Codex managed worktree | adopt only for independent branches |
| Visual QA of a local web app | built-in Browser before Computer Use | adopt; site content remains untrusted |
| Cross-application GUI work | Computer Use | gated fallback; prefer structured plugin/MCP |
| Repeatable workflow | focused skill | adopt after plugin-eval and K7 gates |
| Capability bundle | private/workspace plugin | future packaging target for KAIZEN7 |
| External service | installed connector or MCP | explicit authorization and least privilege |
| Brand image system | GPT Image in Work plus versioned style contract | adopt for Flowmatik/THE FOCUX assets |
| Programmatic video assembly | Remotion/HyperFrames in Flowmatik | adopt; Sora is optional generation input |
| Website prototype | Sites | adopt for preview/version; deployment remains irreversible |
| Interactive explanation/dashboard | Visualize | adopt when rendering adds decision value |
| Token reduction | selected skills, tool search, compact receipts, compaction/caching where available | adopt without loading full catalogs |
| Agent quality improvement | SkillOpt + plugin-eval locally; OpenAI Evals/trace grading optionally | adopt layered evidence |
| Voice/podcast | Work voice or approved speech/Realtime adapter | pilot outside kernel |
| Knowledge retrieval | connected Drive/Notion/Library first; hosted file search only when approved | preserve local/private boundary |

### 5.4 Explicit Availability And Privacy Exclusions

- Plugins are not assumed available on mobile; mobile controls the paired desktop host through Remote.
- Record & Replay is currently excluded because its documented availability is macOS-only and initially excludes the EEA.
- Chronicle is excluded from the KAIZEN7 baseline because it is macOS-only, preview software, increases prompt-injection exposure, consumes rate limits, and stores local memories unencrypted.
- Appshots and Codex Micro are convenience surfaces, not architecture dependencies.
- Sites deployment is always treated as production and approval-required.
- Computer Use never replaces a structured connector when the connector can perform the task more safely and repeatably.
- ChatGPT memory and local Codex memories may help recall context, but durable rules remain in versioned project contracts.
- Workspace Agents, Commerce, Ads, and public plugin publication remain future project lanes, not Commons Gate core.

### 5.5 KAIZEN7 Private Plugin Direction

After the Commons Gate CLI and contracts are stable, KAIZEN7 may be packaged as a private or workspace plugin rather than a public marketplace product.

The first package should contain:

- focused skills for resume, preflight, candidate intake, evaluation, receipt, and project handoff;
- compact schemas, templates, and verified examples;
- an optional local MCP wrapper around the existing `k7` CLI;
- no embedded credentials, hosted provider requirement, autonomous installer, or automatic activation;
- hooks only for deterministic authority or verification boundaries;
- scheduled-task templates for daily intelligence and health checks.

The plugin must call the existing KAIZEN7 kernel; it must not fork business logic into a second implementation.

## 6. Community Intake Sources

Initial sources:

1. OpenAI Codex manual and official documentation.
2. `openai/plugins`.
3. `openai/role-specific-plugins`.
4. `RoggeOhta/awesome-codex-cli` as discovery only.
5. Selected upstream repositories referenced by an approved candidate.
6. Existing Repo Hunter and Hugging Face signals.
7. The current Work/Codex capability snapshot.

Community collections are never bulk-installed. A list contributes candidate URLs, not trusted executable content.

### 6.1 Initial Decision Register

| Candidate | Decision | Reason |
|---|---|---|
| OpenAI `plugin-eval` | adopt as evidence adapter | Official, deterministic local checks, explicit token budgets, optional isolated benchmark |
| Codex Security | reuse when executable content is present | Already installed; specialist security workflows replace a home-grown scanner |
| official Remotion plugin | adopt in Flowmatik | Official, MIT, broad programmatic video coverage |
| product-design and build-web-apps | reuse in destination projects | Existing design/build workflows already cover ideation, implementation, QA, Supabase, and Sites |
| `video-use` | pilot with adaptation | Strong transcript-first and FFmpeg workflow; hosted transcription must remain optional |
| OpenChatCut | pilot externally in manual mode | Reversible local editing surface; AGPL boundary and MCP permissions require isolation |
| Agent-Reach | pilot as proposal-only evidence source | Extends reach while leaving decisions and actions inside KAIZEN7 |
| Awesome Codex CLI and large skill catalogs | discovery only | Valuable indexes, not a trust boundary; no bulk installation |
| `codex-autoresearch` | pattern only; reject installation | Useful measure/keep/revert loop, but unsafe full-access defaults and overlap with Loop OS/SkillOpt |
| Composio bulk skill packs | hold | Authentication and SaaS sprawl conflict with local-first minimalism |
| memory MCPs and agent swarms | hold | Duplicate K7 memory/routing and increase context, permissions, and coordination cost |
| `codex-action` | optional hosted lane only | Useful GitHub execution surface but requires an API key; not core |
| unverified “mega” frameworks | reject until isolated evidence exists | Size and popularity do not prove fit, safety, or measurable improvement |

## 7. Flowmatik Handoff

Flowmatik is the first proof that Commons Gate can reuse community work without moving implementation into KAIZEN7.

Initial candidate pack:

### Official Remotion Plugin

- Role: programmatic motion graphics, captions, audio, transitions, and reusable templates.
- License: MIT.
- Integration: Flowmatik project skill/plugin.
- KAIZEN7 role: select, contract, and verify; do not contain video implementation.

### video-use

- Role: transcript-first editing, deterministic FFmpeg cuts, subtitles, grading, and render self-checks.
- License: MIT.
- Constraint: ElevenLabs must be optional.
- Adaptation: add a local transcription provider contract, with Whisper-compatible output, instead of forking the entire workflow into KAIZEN7.
- Token objective: preserve packed transcript and on-demand visual inspection.

### OpenChatCut

- Role: local multi-track editor and reversible MCP editing surface.
- License: AGPL-3.0-or-later.
- Integration: external application through local MCP.
- Approval mode: `manual` only for the pilot.
- Boundary: do not copy AGPL implementation into KAIZEN7 or Flowmatik.
- Security: localhost binding, bearer token when exposed, no public endpoint by default.

The Flowmatik pilot receives a separate specification and implementation plan after Commons Gate can emit a verified adapter handoff.

## 8. Error Handling

- Invalid candidate schema: fail closed with a typed error and field path.
- Missing license: `blocked`, never guessed.
- Stale source metadata: `verification_required`.
- Missing optional tool: capability remains inactive with a clear reason.
- Failed shadow test: remain `evaluated` or become `rejected`; no automatic retry beyond the configured attempt cap.
- Unknown side effect: treat as approval-required.
- Runtime storage corruption: preserve the original file, rebuild from versioned manifests, and return a recovery receipt.
- External source unavailable: keep the prior evidence but mark it stale; do not downgrade silently.

## 9. Testing Strategy

Implementation follows test-first development.

Required test groups:

1. Candidate schema acceptance and rejection.
2. Trust-class normalization.
3. License and paid-dependency hard gates.
4. Sensitive-field and credential rejection.
5. Side-effect approval classification.
6. Deterministic scoring.
7. Duplicate/overlap detection.
8. Lifecycle transition validation.
9. Receipt generation and tamper checks.
10. Provider registry freshness and local-first resolution.
11. Public operator contract privacy.
12. Private overlay isolation.
13. CLI contract tests for `k7 commons`.
14. Existing `npm run k7:check` regression suite.

No test may require network access, a paid API, private credentials, or production writes.

## 10. Rollout

### Phase A: Repair Foundation

- Rebuild the useful parts of PR #8 on a clean branch.
- Rebuild the useful parts of PR #9 with the public/private split.
- Mark both old drafts as superseded only after the replacement passes review.
- Resolve active documentation contradictions.

### Phase B: Commons Gate Core

- Add schemas, evaluator, lifecycle, receipt, CLI, and tests.
- Ingest a fixed offline fixture representing official Remotion.
- Demonstrate reject/block behavior with unsafe fixtures.
- Run the full KAIZEN7 verification suite.

### Phase C: Work/Codex Intake

- Add compact capability snapshot ingestion.
- Add source registry entries for official OpenAI and community discovery.
- Connect the existing daily intelligence loop in proposal-only mode.
- Measure context size and ensure only selected skill metadata is returned.

### Phase D: Flowmatik Pilot Handoff

- Emit a verified handoff for Remotion, video-use, and OpenChatCut.
- Implement and test the actual editor adapters in the Flowmatik repository.
- Keep manual preview and approval before final packaging or publication.

### Phase E: Private OpenAI Packaging

- Route tasks through an environment-specific OpenAI surface profile.
- Validate mobile Remote as the preferred control path when the desktop host supports it.
- Package KAIZEN7 as a private/workspace plugin only after the CLI contracts are stable.
- Keep OpenAI Platform adapters disabled until cost and data approval are explicit.

## 11. Acceptance Criteria

The design is implemented when:

1. PR #8 and PR #9 are not merged unchanged.
2. The replacement branch passes the complete existing suite plus new tests.
3. No legal name or new private operator detail is added to the replacement branch or printed by default.
4. KAIZEN7 runs without hosted-provider credentials.
5. Provider recommendations are source-backed and can become stale safely.
6. A community candidate cannot install or activate itself.
7. Unknown licenses, paid-only requirements, destructive effects, and credential writes are blocked.
8. Skill/plugin quality and token evidence can be imported from versioned `plugin-eval` output without reimplementing its evaluator.
9. Candidates containing executable code, hooks, installers, MCP, or broad permissions cannot become promotable without security evidence.
10. Official and community candidates use the same receipt contract.
11. Work/Codex capability snapshots are compact and environment-specific.
12. Native installed capability is preferred before official, vendor, community, or custom alternatives.
13. Only selected skill metadata is returned to a mission.
14. The Remotion fixture becomes promotable with evidence.
15. Unsafe fixtures are rejected deterministically.
16. The Flowmatik handoff keeps video code outside KAIZEN7.
17. Every cycle still returns one next action.
18. `npm run k7:check` passes with zero blockers.
19. Surface routing prefers Work, Codex local/worktree, and installed plugins before any API-backed route.
20. Mobile control uses Remote without weakening approval gates.
21. API-backed capabilities remain disabled unless cost and data use are explicitly approved.
22. Memory, Chronicle, Record & Replay, Sites deployment, and Computer Use follow the availability/privacy exclusions in this design.
23. A future KAIZEN7 plugin delegates to the existing CLI instead of duplicating kernel logic.

## 12. Explicit Non-Goals

- Building a new public marketplace.
- Making OpenAI Platform or an API key mandatory.
- Treating desktop previews or plan-specific features as universally available.
- Reimplementing OpenAI `plugin-eval` or Codex Security.
- Treating popularity, stars, or catalog inclusion as verification.
- Installing all Codex community skills.
- Copying OpenChatCut into KAIZEN7.
- Making ElevenLabs, Composio, Mastra, OpenHands, or any hosted provider mandatory.
- Creating a swarm of permanent agents.
- Publishing content automatically.
- Moving Flowmatik or THE FOCUX implementation into the KAIZEN7 repository.
- Replacing `k7 do`, Loop OS, or the verified receipt model.
