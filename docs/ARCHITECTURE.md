# KAIZEN7 Architecture

KAIZEN7 is a local modular agent operating system. Its job is to reduce steps, token use, repeated work, risk and decision time.

## Core Principle

```text
Memory first -> metadata before deep read -> one action -> verify -> write memory
```

## Main Modules

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
  -> semantic memory
  -> skill router
  -> Hunter top candidates
  -> gates
  -> one next action
  -> verification
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

- Memory first.
- Metadata before deep read.
- Hunter top 3 only.
- Judge before external action.
- Write memory before close.
- No publishing, spending, deleting, credential handling or deployment without explicit approval.

## Product Growth OS

KAIZEN7 organizes growth using:

```text
Setup -> Product -> Opportunity -> Risk
```

- Setup: intake, Product Genome, base assets, channels.
- Product: PDPs, dossiers, titles, keywords, images, videos.
- Opportunity: leads, newsletter, partners, suppliers, follow-up.
- Risk: claims, regulation, IP, evidence, disclaimers.
