# KAIZEN7 Capability Kernel

The Capability Kernel turns an objective into a capability plan, a Codex execution packet, and an evidence gate.

## Rule

KAIZEN7 is a small kernel. Domain projects such as Flowmatik, THE FOCUX, and Mr. Kaizen live as capability packs or consumers, not as core.

## Commands

```powershell
npm.cmd run k7:capabilities -- --list
npm.cmd run k7:capabilities -- --plan "crear reel de Mr Kaizen"
npm.cmd run k7:capabilities -- --packet "implementar cambio con tests"
npm.cmd run k7:capabilities -- --spec "agent.handoff_cycle"
npm.cmd run k7:capabilities -- --forge "crear pipeline de contenido para Mr Kaizen"
npm.cmd run k7:capabilities -- --offer "convertir agentes y proyectos en herramientas utiles"
npm.cmd run k7:capabilities -- --learn "implementar cambio con tests" --evidence "<json>"
npm.cmd run k7:capabilities -- --super "orquestar Codex Mr Kaizen Flowmatic y apps sin friccion"
npm.cmd run k7:capabilities -- --world "usar MCP y clips para preparar publicacion sin publicar"
```

## Flow

```text
Objective -> Capability Plan -> Execution Packet -> Evidence Gate -> Memory Draft
```

## Capability Contract

Every capability has:

- id
- domain
- purpose
- status
- inputs
- outputs
- requires
- tools
- approval
- verification
- writeback

## Capability Spec

Every capability can be exposed as `kaizen7.capability_spec.v1`.

The spec is the portable shape another agent or platform should read before using a capability:

- interface input and output
- required dependencies
- tools needed
- approval gates
- evidence required
- writeback target
- agent route

CLI:

```powershell
npm.cmd run k7:capabilities -- --spec "agent.handoff_cycle"
```

API:

```http
POST /api/k7/capabilities/spec
```

## Transversal Capabilities

The kernel now includes three cross-platform capabilities:

- `agent.handoff_cycle`: pass work between agents through bridge, cycle, receipt and verification.
- `project.context_intake`: turn a project such as Flowmatik, THE FOCUX or Mr. Kaizen into a capability-ready brief.
- `app.integration_plan`: plan safe app or connector interaction before any external effect.

These belong in the kernel because they help every project. Domain-specific volume still belongs outside the core as capability packs.

## Capability Forge

`kernel.capability_forge` turns a new need into a valid experimental capability draft.

It returns:

- `capability_draft`
- `capability_spec`
- `validation_errors`
- registration guidance

CLI:

```powershell
npm.cmd run k7:capabilities -- --forge "crear pipeline de contenido para Mr Kaizen"
```

API:

```http
POST /api/k7/capabilities/forge
```

Forge rule: do not register automatically. A forged capability must be reviewed, validated, and useful beyond one task before it enters `data/capabilities.json`.

## Kernel Offer

`kaizen7.kernel_offer.v1` states what KAIZEN7 is for.

It keeps product direction explicit:

- promise
- consumers
- guarantees
- capability backbone
- non-goals
- next action

CLI:

```powershell
npm.cmd run k7:capabilities -- --offer "convertir agentes y proyectos en herramientas utiles"
```

API:

```http
POST /api/k7/capabilities/offer
```

Offer rule: every new capability should support the offer. If it does not reduce steps, improve evidence, improve handoff, improve project context or make app interaction safer, it probably belongs outside the kernel.

## Learning Loop

`kaizen7.learning_loop.v1` turns verified work into reusable learning for the next agent.

It returns:

- learning draft
- source cycle schema
- evidence verdict
- reusable conditions
- teaching packet
- blockers
- next action

CLI:

```powershell
npm.cmd run k7:capabilities -- --learn "implementar cambio con tests" --evidence "<json>"
```

API:

```http
POST /api/k7/capabilities/learn
```

Learning rule: KAIZEN7 only teaches from passed cycles with a memory draft. No evidence, no learning.

## Super Capabilities

`kaizen7.super_capability_system.v1` exposes six compact orchestration pieces:

- `super.agent_companion`: compact loop for any agent.
- `super.project_navigator`: project map without loading a large project brain.
- `super.content_engine`: verified content package from idea to plan.
- `super.safe_app_operator`: safe app and connector operation plan.
- `super.capability_builder`: forge and teach new repeatable capabilities.
- `super.evidence_guardian`: guard claims, receipts and learning with evidence.

CLI:

```powershell
npm.cmd run k7:capabilities -- --super "orquestar Codex Mr Kaizen Flowmatic y apps sin friccion"
```

API:

```http
POST /api/k7/capabilities/super
```

Super rule: compose small capabilities first. Do not add infrastructure when a super capability can route, verify, learn or forge the missing piece.

## World Interaction

`kaizen7.world_interaction_plan.v1` prepares interaction with external surfaces without executing external effects.

World capabilities:

- `world.mcp_tool_plan`: plan MCP tool calls with parameters, evidence and approval gates.
- `world.app_connector_plan`: plan connector actions with account, permission and receipt boundaries.
- `world.clip_intake`: turn clips, snippets or pasted artifacts into structured context.
- `world.artifact_export_plan`: plan artifact handoff with manifest and verification steps.

CLI:

```powershell
npm.cmd run k7:capabilities -- --world "usar MCP y clips para preparar publicacion sin publicar"
```

API:

```http
POST /api/k7/capabilities/world
```

World rule: plan first, then handoff or request approval. No secrets, external writes or publishing without an explicit approval state.

## Evidence

KAIZEN7 does not accept claims without evidence. A result must include:

- diff
- tests
- risks

Research work also needs sources. Visual work also needs artifacts or screenshots.

## Agent Language

The semantic agent-facing contract is documented in `docs/AGENT_LANGUAGE.md`.
Execution packets may include commands for compatibility, but agents should treat `agent_contract` as the primary working boundary.
