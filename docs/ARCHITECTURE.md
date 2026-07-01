# KAIZEN7 Architecture

KAIZEN7 is a local goal-to-execution layer for projects, coding assistants and agents.

Its job is to reduce steps, token use, repeated work, risk and decision time while preserving verification and reusable learning.

## Core Principle

```text
Objective first -> minimal context -> smallest toolchain -> one action -> verify -> write memory
```

## Main Modules

- `lib/capabilities/` - file-based Capability Kernel: registry, resolver, execution packets and evidence verification.
- `lib/activation-cockpit.js` - shortest entrypoint: asks the objective and only missing context.
- `lib/toolchain-router.js` - selects the smallest useful toolchain and applies the eval firewall.
- `lib/openhands-adapter.js` - creates bounded worker packets for OpenHands-style execution.
- `lib/agent-runner.js` - production entry point for humans and agents.
- `lib/agent-advisor.js` - tells external agents what to read, avoid and do first.
- `lib/agent-loop.js` - composes compact context from memory, skills and Hunter.
- `lib/semantic-memory.js` - builds the local Markdown memory index.
- `lib/skill-router.js` - recommends only relevant skills.
- `lib/hunter.js` - ranks implementation candidates and external signals.
- `lib/github-adapter.js` - converts GitHub repos into signal packets.
- `lib/huggingface-adapter.js` - converts HF assets into signal packets.
- `lib/signal-ingestion.js` - normalizes source material into compact signals.
- `lib/smart-crons.js` - safe propose-only recurring checks.
- `lib/cron-doctor.js` - audits cron quality.
- `lib/production-readiness.js` - checks whether the agent core is usable.

## Data Flow

```text
objective
  -> activation cockpit
  -> capability kernel
  -> execution packet
  -> minimal context
  -> semantic memory
  -> connector kernel
  -> toolchain router
  -> worker/tool packet
  -> eval firewall
  -> one verified action
  -> Obsidian memory
```

External discoveries enter as signals:

```text
GitHub / Hugging Face / web / supplier / text
  -> signal-ingestion
  -> data/signal-inbox.json
  -> Hunter queue
  -> decision or discard
```

## Safety Gates

- Ask before broad context.
- Memory first.
- Metadata before deep read.
- Select the smallest useful toolchain.
- Hunter top 3 only.
- Eval Firewall before accepting worker claims.
- Judge before external action.
- Write memory before close.
- No publishing, spending, deleting, credential handling or deployment without explicit approval.

## Anti-Megatool Boundary

KAIZEN7 does not load every module by default.

It activates only what the objective needs:

```text
No objective -> no tools
No missing context -> no questions
No external effect -> no approval flow
No evidence -> no completion
No reusable learning -> no memory write
```

## Product Growth OS

Product Growth remains one domain KAIZEN7 can activate, not the whole product.

When the objective is growth, KAIZEN7 organizes work using:

```text
Setup -> Product -> Opportunity -> Risk
```

- Setup: intake, Product Genome, base assets, channels.
- Product: PDPs, dossiers, titles, keywords, images, videos.
- Opportunity: leads, newsletter, partners, suppliers, follow-up.
- Risk: claims, regulation, IP, evidence, disclaimers.

