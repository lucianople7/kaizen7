# Deep Agent Repo Hunt - KAIZEN7

## Need

Find open-source or source-available repositories that can materially magnify KAIZEN7 as a Universal Capability Forge for Codex, Claude Code, OpenHands and generic agents.

## Filters

- Free/open-source preferred.
- CPU/local-first preferred.
- MCP-compatible or agent-readable interface preferred.
- Must reduce repeated setup, repeated research, context waste, unsafe execution or missing capability paths.
- Do not adopt whole frameworks by default.
- Absorb patterns first; install only after an evidence gate.

## Strongest Candidates

### projectmem

- URL: https://github.com/riponcm/projectmem
- Fit: K7 Memory, K7 Judge, K7 Context.
- Pattern: append-only local event log, compact MCP summaries, pre-action/pre-commit warnings, stale-memory detection, cross-project gotchas.
- Verdict: `adopt_now_pattern`
- KAIZEN7 adaptation: add `K7 Memory Governance` so agents are warned before repeating failed fixes or touching fragile files.

### Code2MCP

- URL: https://github.com/DEFENSE-SEU/Code2MCP
- Fit: Universal Capability Forge, Provider Radar, Ephemeral Agent Factory.
- Pattern: repo -> analysis -> generated MCP service -> run/review/fix -> report.
- Verdict: `adapt_pattern`
- KAIZEN7 adaptation: add `Capability MCP Builder` that generates a small adapter/MCP wrapper for selected repos without deploying to cloud by default.

### Archon

- URL: https://github.com/coleam00/Archon
- Fit: K7 Harness, K7 Operator, Ephemeral Agent Factory.
- Pattern: deterministic DAG workflows for coding agents, Plan-Implement-Validate loop, worktree isolation, multi-agent review and self-fix.
- Verdict: `adapt_pattern`
- KAIZEN7 adaptation: add `K7 Harness DAG` for repeatable agent missions.

### agent-sandbox

- URL: https://github.com/agent-sandbox/agent-sandbox
- Fit: K7 Scope, K7 Operator.
- Pattern: E2B-compatible sandbox for untrusted generated code, browser use, computer use and shell execution.
- Verdict: `test_later`
- KAIZEN7 adaptation: absorb sandbox manifest and policy model first; avoid Kubernetes dependency until needed.

### OpenHands

- URL: https://github.com/OpenHands/OpenHands
- Fit: External worker backend.
- Pattern: agent platform with sandboxed execution, web UI and software-development workflows.
- Verdict: `reference_or_connect`
- KAIZEN7 adaptation: keep as provider path, not core dependency.

### Context Mode

- URL: https://github.com/mksglu/context-mode
- Fit: K7 Context.
- Pattern: tool-output sandboxing, context compression, cross-agent routing.
- Verdict: `already_adapted_pattern`
- KAIZEN7 adaptation: `lib/context-firewall.js` v1 already exists.

### MCP Registry and reference servers

- URLs:
  - https://github.com/modelcontextprotocol/registry
  - https://github.com/modelcontextprotocol/servers
- Fit: Provider Radar, Capability Forge.
- Pattern: MCP server discovery, official examples for filesystem, git, memory, fetch, sequential thinking and time.
- Verdict: `adopt_as_signal_source`
- KAIZEN7 adaptation: Provider Radar should query or ingest MCP Registry metadata before inventing adapters.

### Codebase-Memory

- Source: https://arxiv.org/abs/2603.27277
- Fit: K7 Context, K7 Code Intelligence.
- Pattern: Tree-Sitter knowledge graph via MCP, impact analysis and structural code queries.
- Verdict: `test_later`
- KAIZEN7 adaptation: build a small local code-map first; do not pull a full graph stack yet.

## Rejected For Core Adoption

- OpenClaw: useful Gateway/skills pattern, but too broad and high-risk as a direct dependency.
- AutoGPT-style autonomous agents: historically prone to loops and expensive autonomy; use bounded subagents instead.
- Heavy cloud sandboxes by default: useful later, but against KAIZEN7 local-first/no-surprise-spend policy.

## Recommended Build Order

1. `K7 Memory Governance` inspired by projectmem.
2. `Capability MCP Builder` inspired by Code2MCP.
3. `K7 Harness DAG` inspired by Archon.
4. `Sandbox Manifest` inspired by agent-sandbox/OpenHands.
5. `MCP Registry Radar` for provider discovery.

## Decision

The best next production step is `K7 Memory Governance`: append-only typed events plus a pre-action warning gate. It directly magnifies every agent and compounds with Context Firewall and the Universal Capability Forge.
