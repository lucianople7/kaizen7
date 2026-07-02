# KAIZEN7 Context Firewall

KAIZEN7 Context Firewall keeps heavy tool output out of the agent prompt.

Inspired by Context Mode, the local v1 does three things:

```text
raw tool output -> saved evidence file -> compact prompt capsule
```

The agent sees only:

- evidence id,
- source,
- byte size,
- compact summary,
- retrieval hint.

The full raw output stays in:

```text
content_library/context_firewall/evidence/
```

## Commands

```powershell
node lib/context-firewall.js save "whisper probe output" "large raw output here"
node lib/context-firewall.js search "whisper transcript"
```

## Why

Agents should not spend context reading raw logs, browser snapshots, issue dumps or long command output. KAIZEN7 should preserve the evidence and feed the agent only the smallest useful capsule.

This improves Codex, Claude Code, OpenHands and generic agents by reducing context waste while keeping evidence recoverable.

## Guardrail

Do not store secrets, credentials, private customer data or sensitive logs in context evidence.
