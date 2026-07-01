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

## Evidence

KAIZEN7 does not accept claims without evidence. A result must include:

- diff
- tests
- risks

Research work also needs sources. Visual work also needs artifacts or screenshots.

## Agent Language

The semantic agent-facing contract is documented in `docs/AGENT_LANGUAGE.md`.
Execution packets may include commands for compatibility, but agents should treat `agent_contract` as the primary working boundary.
