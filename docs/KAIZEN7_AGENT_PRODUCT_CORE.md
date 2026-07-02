# KAIZEN7 Agent Product Core

KAIZEN7 is now oriented as a real agent product: a Universal Capability Forge that makes Codex, Claude Code, OpenHands and generic agents faster, safer and more reusable.

It is not a single automation script. It is the layer that turns a need into a bounded capability path, creates or adapts the missing tool, captures evidence and teaches the next agent.

## Product Shape

```text
Need
  -> capability inference
  -> provider and pattern radar
  -> adapter or minimal build
  -> agent handoff
  -> context firewall
  -> evidence gate
  -> memory governance
  -> reusable learning
```

## What Is Already Real

- Universal Capability Forge CLI through `npm.cmd run k7:anything -- forge "<need>"`.
- Provider Radar with `use_provider`, `adapt_provider` and `absorb_pattern` decisions.
- Adapter manifest planning for providers that exist but are not yet wired.
- Forge session writer with `forge-packet.json`, `agent-brief.md` and `agent-handoff.md`.
- Agent profiles for `codex`, `claude-code`, `openhands` and `generic`.
- Ephemeral Agent Factory contract for one-job specialist builders.
- Context Firewall for saving heavy tool output as evidence and feeding agents compact references.
- Agent Magnifier Radar for ranking external repos, papers and tool patterns that can improve KAIZEN7.
- Obsidian memory trail for decisions, intakes and architecture.

## Current North Star

KAIZEN7 should make agents act with direction:

```text
less asking -> clearer route -> bounded execution -> evidence -> memory -> stronger next run
```

If a tool exists, KAIZEN7 finds and adapts it.

If a tool does not exist, KAIZEN7 creates a capability path for an agent to build it.

If a path works, KAIZEN7 registers the learning.

If a path fails, KAIZEN7 records why and warns the next agent.

## Required Guardrails

- Free/open-source first.
- CPU-first or no-GPU by default.
- Local-first when practical.
- No installs, model downloads, paid APIs, cloud deployment, credentials, publishing or destructive actions without approval.
- Every external repo must pass a trust gate before clone, install or execution.
- Heavy output must go through Context Firewall instead of being pasted raw into agent context.
- Agent work must return evidence, changed files, tests, risks and learning.

## Next Build Order

1. `K7 Memory Governance`
   - Inspired by projectmem.
   - Add typed event logs and pre-action warnings.
   - Prevent repeated failed fixes and fragile-file edits.

2. `K7 Scope Trust Gate`
   - Inspired by deterministic control-plane and agent supply-chain research.
   - Gate clone/install/run with license, scripts, network, secrets and permission checks.

3. `Capability MCP Builder`
   - Inspired by Code2MCP.
   - Generate local minimal MCP/adapters for selected repos.

4. `K7 Harness DAG`
   - Inspired by Archon and Harness-Bench.
   - Turn repeatable missions into Plan-Implement-Validate workflows.

5. `MCP Registry Radar`
   - Use MCP Registry and reference servers as discovery and adapter-contract sources.

6. `Browser Evidence Standard`
   - Use Playwright as the preferred substrate for screenshots, traces and UI validation when browser work is needed.

## Canonical Files

```text
docs/UNIVERSAL_CAPABILITY_FORGE.md
docs/EPHEMERAL_AGENT_FACTORY.md
docs/AGENT_USAGE.md
docs/CONTEXT_FIREWALL.md
docs/AGENT_MAGNIFIER_RADAR.md
docs/KAIZEN7_AGENT_PRODUCT_CORE.md
content_library/evolution/agent-magnifier-radar.json
Obsidian/Flowmatik/Arquitectura/KAIZEN7 Agent Product Core.md
```

## Operating Rule

Every future KAIZEN7 feature must answer:

```text
Does this help an agent discover, build, execute, verify or remember a capability with less friction and more safety?
```

If not, it is outside the current product direction.
