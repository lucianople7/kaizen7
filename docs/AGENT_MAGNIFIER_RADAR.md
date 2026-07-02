# KAIZEN7 Agent Magnifier Radar

KAIZEN7 Agent Magnifier Radar ranks external repos, papers and tool patterns by how much they can improve KAIZEN7 as a Universal Capability Forge.

It does not install anything. It converts research into a bounded adoption packet:

```text
source -> layer -> fit -> risk -> verdict -> KAIZEN7 adaptation -> next build order
```

## Command

```powershell
node lib/agent-magnifier-radar.js
node lib/agent-magnifier-radar.js write
```

The write command creates:

```text
content_library/evolution/agent-magnifier-radar.json
```

## Current Priority

1. `K7 Memory Governance` inspired by projectmem.
2. `K7 Scope` inspired by deterministic control-plane and agent supply-chain research.
3. `Capability MCP Builder` inspired by Code2MCP.
4. `K7 Harness DAG` inspired by Archon and Harness-Bench.
5. `Provider Radar` connected to MCP Registry and official reference servers.

## Guardrail

Every external repo or tool must pass a trust gate before clone, install or execution:

- license known,
- install scripts reviewed,
- network behavior understood,
- secrets exposure checked,
- no paid/cloud/GPU default,
- human approval for untrusted execution.

## Why

The macro-search showed that the next generation of agents is not only about stronger models. Harness, memory, permissions, context, sandboxing, tool discovery and evaluation change outcomes materially. KAIZEN7 should own those layers instead of outsourcing its core to one external framework.
