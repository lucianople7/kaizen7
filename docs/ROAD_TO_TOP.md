# KAIZEN7 Road to the Top

## Position

KAIZEN7 should not try to be another agent runtime.

The strongest path is:

```text
Prompt -> Prompt Filter -> Wisdom Filter -> Memory -> Skills -> Connections -> Agent/Runtime -> Evidence -> Memory
```

KAIZEN7 is the judgment layer before execution.

## Why This Path

The market already has strong runtimes and protocols:

- OpenAI Agents SDK: agents, tools, handoffs, guardrails, sessions and tracing.
- LangGraph: durable, stateful, long-running orchestration.
- MCP: standard protocol for connecting AI apps to data, tools and workflows.
- OpenAI Apps SDK: path to ChatGPT-native UI and MCP apps.

KAIZEN7 wins by sitting above them:

```text
not the model
not the runtime
not the connector
the filter that decides what should happen before any of them act
```

## Product Thesis

KAIZEN7 converts any noisy prompt into a clearer, safer, verifiable action.

It reduces:

- repeated context,
- bad tool choice,
- prompt noise,
- unsafe execution,
- missing evidence,
- lost learning.

It increases:

- memory continuity,
- skill precision,
- connection discipline,
- verification,
- reusable learning.

## The Sellable Shape

First product:

```text
KAIZEN7 Prompt-to-Action Filter
```

User flow:

1. Paste a prompt.
2. KAIZEN7 analyzes it.
3. KAIZEN7 simplifies it.
4. KAIZEN7 magnifies it into an execution packet.
5. KAIZEN7 selects minimal memory, skills and connections.
6. KAIZEN7 sends the packet to Codex, Claude, OpenAI Agents SDK, LangGraph, MCP or another executor.
7. KAIZEN7 verifies evidence and writes memory.

## The Moat

The moat is not one feature.

The moat is the loop:

```text
prompt quality + memory + tool choice + evidence + writeback
```

Every run should make the next run shorter.

## Four Milestones

### 1. Local Proof

Goal:

Make KAIZEN7 useful every day from CLI and Codex.

Done when:

- `k7:prompt` improves prompts.
- `k7:wisdom` filters risk and connections.
- `k7:start` returns a usable start packet.
- `k7:ready` passes.
- Obsidian writeback happens after real work.

### 2. Agent Handoff

Goal:

Any agent can consume a KAIZEN7 packet.

Done when:

- `k7:start --json` is stable.
- `k7:advise` and `k7:codex` include Prompt/Wisdom filter output.
- Handoff packets have strict fields: objective, context, skills, connections, risks, evidence, memory.

### 3. UI Product

Goal:

Make the filter visible.

Minimum UI:

- raw prompt input,
- analysis,
- simplified prompt,
- magnified prompt,
- risk gate,
- selected skills,
- selected connections,
- one next action,
- evidence checklist,
- memory writeback preview.

### 4. Standard Integrations

Goal:

Connect KAIZEN7 to the ecosystems without becoming dependent on one.

Priority:

1. MCP server.
2. OpenAI Apps SDK / ChatGPT app.
3. OpenAI Agents SDK adapter.
4. LangGraph adapter.
5. Browser/GitHub/HF signal intake.

## What Not To Do

- Do not become a giant dashboard before the CLI loop is loved.
- Do not chase every model provider.
- Do not automate publishing, payments or credentials before approval gates are battle-tested.
- Do not make KAIZEN7 a generic chatbot.
- Do not hide the evidence layer.

## The One Sentence

KAIZEN7 is the operating filter that turns any prompt into a clearer, safer, verifiable action that future agents can remember.

## Immediate Next Move

Improve `k7:start --json` as the canonical machine packet:

- include `promptFilter`,
- include `wisdom`,
- include `handoffPacket`,
- include `evidenceChecklist`,
- include `memoryWritebackDraft`.

Then build the first simple UI around exactly that packet.
