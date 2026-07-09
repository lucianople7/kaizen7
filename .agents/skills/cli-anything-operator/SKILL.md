---
name: cli-anything-operator
description: Use when KAIZEN7 needs Anything CLI, CLI-Anything or cli-hub to discover, launch, wrap or adapt external software, desktop tools, renderers, editors or apps without a stable API, MCP or CLI, while keeping the kernel small.
---

# CLI-Anything Operator

## Mission

Turn missing executors into small, repeatable, agent-native tool routes without
building a mega-system.

CLI-Anything is not the KAIZEN7 kernel. It is the operator adapter factory.

```text
KAIZEN7 decides the route.
CLI-Anything finds or forges the executor.
The receipt teaches the next run.
```

## Core Rule

If a task needs a tool KAIZEN7 does not own, use the smallest proven executor
first. Use Anything CLI / CLI-Anything only when there is no clean existing API,
CLI, MCP, script, FFmpeg, Remotion or Playwright path.

## Use When

- A task needs desktop or professional software controlled by an agent.
- A render, editor, design, office, automation or local app has no clean route.
- The best path is likely a repeatable CLI harness or `cli-hub` adapter.
- KAIZEN7 must turn a one-off tool discovery into reusable skill memory.
- OpenClaw, Codex, another agent or a project needs one clear command instead of
  broad instructions.

## Do Not Use When

- An existing KAIZEN7 script, skill, receipt or route already solves the task.
- The tool has a stable official API, CLI or MCP that is simpler.
- The task requires installing software, spending money, credentials, publishing
  externally or destructive actions without explicit approval.
- The work belongs inside a project repo rather than the KAIZEN7 kernel.

## Operator Route

1. Name the exact output needed.
2. Check existing receipts, skills and local scripts.
3. Prefer official API, CLI or MCP.
4. Prefer simple scripts, FFmpeg, Remotion or Playwright when they are enough.
5. If the executor is still missing, use Anything CLI / CLI-Anything / cli-hub
   discovery to find or forge the smallest adapter.
6. Verify the adapter with one command and one expected output.
7. Record the receipt: command, arguments, output path, failure mode, reuse rule
   and discard rule.
8. Promote to a skill only after the route repeats or clearly saves future work.

## Next-Generation Pattern

The stronger version is not "more CLI commands." It is a tool mesh:

| Layer | Job |
|---|---|
| Intent Router | Convert the human objective into output type, constraints and stop conditions. |
| Tool Graph | Rank receipts, scripts, APIs, CLIs, MCPs, local apps, cli-hub adapters and repo patterns. |
| Adapter Forge | Create the smallest wrapper only when no clean route exists. |
| Execution Contract | Normalize command, inputs, outputs, logs, metrics, errors and JSON receipt. |
| Sandbox Guard | Block credentials, installs, publishing, billing, destructive actions and broad writes. |
| Evidence Recorder | Capture proof, timing, artifacts and failure modes. |
| Memory Promoter | Promote repeated receipts into skills and discard weak tools with reasons. |

Command:

```powershell
npm.cmd run k7:anything-next
```

Use the command when an agent needs the architecture or JSON contract for a
next-generation Anything CLI route.

## Decision Table

| Situation | Route |
|---|---|
| Existing K7 script works | Use script and receipt. |
| Official API/CLI/MCP exists | Use official route. |
| Browser or file automation is enough | Use Playwright or simple script. |
| Video/render pipeline has known CLI | Use FFmpeg, Remotion or existing renderer. |
| External app has no clean route | Use CLI-Anything operator route. |
| Tool route repeats | Convert receipt into a skill/metaskill as appropriate. |

## Receipt Template

```yaml
tool_goal:
tool_chosen:
why_this_tool:
command:
inputs:
outputs:
verification:
failure_mode:
discard_if:
reuse_next_time:
memory_update_recommendation:
```

## Principle

Anything CLI gives KAIZEN7 hands without making KAIZEN7 heavy.

The win is not more tools. The win is one clean command the next agent can reuse.
