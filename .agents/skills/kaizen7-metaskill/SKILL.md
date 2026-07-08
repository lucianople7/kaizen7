---
name: kaizen7-metaskill
description: Use when an agent must reduce steps, tokens, context, tool confusion, repeated work, or route a KAIZEN7, THE FOCUX, Flowmatik, OpenClaw, Anything CLI, repo hunter, forge, video, research, dossier, memory, or skill-building task.
---

# KAIZEN7 Metaskill

## Mission

KAIZEN7 is not a mega-system. KAIZEN7 is the metaskill that gives any agent:

- purpose,
- minimal memory,
- the right route,
- the right skill or metaskill,
- a receipt that teaches the next run.

Core rule:

```text
Less steps. Less tokens. Better route. Real memory.
```

## Vocabulary

Use `skills` and `metaskills`.

Do not introduce new "capabilities" language unless working with legacy files that already use it.

- `skill`: reusable task method or tool wrapper.
- `metaskill`: routing, selection, evaluation, learning, or improvement logic that coordinates skills.
- `tool`: replaceable executor such as Anything CLI, OpenClaw, ECC, Codex, Remotion, FFmpeg, or a repo-derived script.
- `receipt`: compact outcome that says what worked, what failed, what to reuse, and what to discard.

## Core Flow

```text
Human objective
-> KAIZEN7 metaskill
-> minimal memory
-> route
-> Anything CLI / repo hunter / forge
-> OpenClaw, ECC, Codex, or local tool executes
-> receipt
-> memory
-> next run starts smarter
```

## Routing Pattern

1. Name the real output.
   - video rendered,
   - dossier created,
   - source brief produced,
   - claim checked,
   - repo pattern absorbed,
   - public bundle applied,
   - skill improved.

2. Load only minimal memory.
   - current project,
   - previous receipts,
   - known discarded tools,
   - existing skill/metaskill,
   - safety rules.

3. Check existing skill first.
   - If a skill exists and worked before, start there.
   - If it failed before, read the failure receipt before retrying.
   - If it is obsolete, improve or replace it.

4. If no good skill exists, use repo hunter.
   - Search for mature repos, patterns, scripts, or APIs.
   - Prefer patterns over full frameworks.
   - Verify license, maintenance, and fit.

5. Use forge only for the smallest useful tool.
   - Create or adapt a skill, script, adapter, prompt, or checklist.
   - Avoid building platforms.
   - Avoid adding dependencies unless the task needs them.

6. Execute with the best available executor.
   - OpenClaw/ECC for agentic workflow.
   - Codex for repo changes.
   - Anything CLI for tool launch/discovery.
   - Local scripts for repeatable work.

7. Write a receipt.
   - what was requested,
   - route chosen,
   - tool/skill used,
   - output,
   - verification,
   - what to reuse next time,
   - what to discard,
   - next better route if known.

8. Update memory.
   - Save only reusable learning.
   - Do not store noise.
   - Teach the next agent how to do it with fewer steps.

## Example: Render Video

```text
Need: render a video
Memory: previous video receipts + Flowmatik rules
Route: video task
Existing skill? kaizen-video-iteration-agent / flowmatik-master
Missing tool? use repo hunter
Forge: create smallest render wrapper or checklist
Executor: OpenClaw, Codex, Remotion, FFmpeg, or Anything CLI
Receipt: command, output path, errors, reusable route, discarded tools
Memory: next run starts from the working route
```

## Decision Table

| Situation | Route |
|---|---|
| Known repeated task | Reuse existing skill and receipt |
| Known task but old tool failed | Read receipt, improve skill or replace tool |
| New technical need | Repo hunter before building from scratch |
| Useful repo found | Forge smallest local skill/tool from pattern |
| Many possible tools | Anything CLI discovers, KAIZEN7 chooses |
| Agent confused by scope | Metaskill narrows output and memory |
| Health, claims, commerce, legal risk | Route to claims/compliance skill before output |
| Publishing, deploy, billing, credentials | Stop for human approval |

## Receipt Shape

```yaml
objective:
project:
route:
skill_used:
metaskill_used: kaizen7-metaskill
executor:
output:
verification:
reuse_next_time:
discard:
memory_update:
next_action:
```

## Common Mistakes

- Building a new KAIZEN7 subsystem instead of a small skill.
- Searching the whole repo when a receipt already names the route.
- Installing a framework when a script or checklist is enough.
- Reusing a tool that a previous receipt already discarded.
- Keeping "capabilities" language when the agent needs skills/metaskills.
- Writing memory as a diary instead of a reusable instruction.

## Stop Conditions

Stop and ask before:

- external publishing,
- credentials,
- billing,
- destructive deletes,
- ecommerce launch,
- medical or supplement claims without evidence,
- installing ECC/OpenClaw/plugin layers globally,
- broad architecture changes not required by the task.

## Close Every Run

End with:

```text
Route used:
Skill/metaskill used:
Tool/executor:
Output:
Verification:
Reuse next time:
Discard:
Memory target:
```
