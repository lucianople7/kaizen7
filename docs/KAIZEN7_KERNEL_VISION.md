# KAIZEN7 Kernel Vision

## Canonical Definition

KAIZEN7 is the coordination layer between humans, AI agents and digital projects.

It is not another agent, assistant or workflow framework. KAIZEN7 is the kernel that gives agents the minimum useful context, the correct capability, the right constraints and a clear way to verify their work.

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects evolve.
```

## Why This Exists

AI models are already intelligent. The missing layer is coordination.

KAIZEN7 exists so Codex, ChatGPT, Claude, Qwen, OpenHands and future agents can work with less context, fewer mistakes and lower friction.

The agent can change. KAIZEN7 should remain stable.

## Five Responsibilities

### 1. Memory

KAIZEN7 should not load a huge memory by default.

It should provide only the memory needed for the current mission:

- decisions,
- constraints,
- project boundaries,
- relevant previous outcomes,
- risks that affect execution.

Goal: reduce context, not accumulate it.

### 2. Capabilities

Capabilities replace the loose idea of skills.

Each capability should define:

- purpose,
- when to use it,
- when not to use it,
- compatible tools,
- restrictions,
- verification,
- context cost.

Agents should not load capabilities that are not needed for the mission.

### 3. Mission Router

Every task enters KAIZEN7 as a K7 Mission.

The Mission Router decides:

- capability,
- context files,
- priority,
- risk,
- next action.

The agent should execute the routed mission, not rediscover the whole project from scratch.

### 4. Knowledge

The source of truth should not be the chat conversation.

Initial knowledge sources:

- GitHub,
- Obsidian,
- structured documentation,
- capability registry.

Later, this can evolve into KAIZEN7 Mission Control.

### 5. Guardrails

KAIZEN7 protects the user, the project and the agent.

Guardrails should prevent:

- unnecessary context loading,
- changes outside mission scope,
- duplicated functionality,
- architecture drift,
- critical actions without approval,
- health, commerce or publishing decisions without review.

## Design Rule

Before adding any feature to the Kernel, answer:

- Does it reduce complexity?
- Does it reduce context?
- Does it reduce tokens?
- Does it reduce decision time?
- Does it improve execution quality?

If the answer is no, the feature probably does not belong in the Kernel.

## Project Boundaries

```text
KAIZEN7 = coordination kernel
Flowmatik = creative production system
THE FOCUX = premium performance brand
Kaizen = trust-building persona
THE FOCUX OS = educational IP
Agents = replaceable executors
Tools = replaceable providers
```

KAIZEN7 should not absorb the responsibilities of the projects it coordinates.

## Success Definition

KAIZEN7 succeeds when an agent working with KAIZEN7:

- needs less context,
- makes better decisions,
- stays inside scope,
- verifies its output,
- preserves memory,
- improves the project more reliably than working alone.
