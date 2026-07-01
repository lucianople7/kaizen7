# KAIZEN7 Capability Kernel

The Capability Kernel turns an objective into a capability plan, a Codex execution packet, and an evidence gate.

## Rule

KAIZEN7 is a small kernel. Domain projects such as Flowmatik, THE FOCUX, and Mr. Kaizen live as capability packs or consumers, not as core.

## Commands

```powershell
npm.cmd run k7:capabilities -- --list
npm.cmd run k7:capabilities -- --plan "crear reel de Mr Kaizen"
npm.cmd run k7:capabilities -- --packet "implementar cambio con tests"
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

## Evidence

KAIZEN7 does not accept claims without evidence. A result must include:

- diff
- tests
- risks

Research work also needs sources. Visual work also needs artifacts or screenshots.

## Agent Language

The semantic agent-facing contract is documented in `docs/AGENT_LANGUAGE.md`.
Execution packets may include commands for compatibility, but agents should treat `agent_contract` as the primary working boundary.
