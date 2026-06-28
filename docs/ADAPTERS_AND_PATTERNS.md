# Adapters And Patterns

KAIZEN7 can learn from external tools without letting them become the core.

## Rules

```text
Adapter != Core
Pattern != Tool
```

## Qwen Agent Adapter

Status:

```text
test_later
```

Use later for:

- RAG over long documents,
- MCP experiments,
- secondary agents,
- PDF analysis,
- model comparison.

Do not use it to replace Codex, Obsidian, smart-crons or KAIZEN7 core.

## Alibaba Smart Assistant Pattern

Status:

```text
keep_pattern
```

Use the product structure:

```text
Setup -> Product -> Opportunity -> Risk
```

Do not copy Alibaba as a product. Use the pattern to organize KAIZEN7 modules.

## NotebookLM Content Intelligence Adapter

Status:

```text
test_later
```

Use later for:

- source-based briefings,
- scripts,
- podcast drafts,
- mind maps,
- long-source Q&A.

## CLI Anything Adapter Factory

Use only after checking that no simpler API, CLI, MCP, script, FFmpeg, Remotion or Playwright path exists.

Possible future uses:

- video captioning,
- local creative tools,
- Blender/GIMP/Kdenlive,
- document conversion,
- diagram generation.

## Remote Worker Pattern

Status:

```text
adapt_pattern
```

Sources:

- OpenHands: self-hosted control center for local, remote and cloud coding agent backends.
- SWE-agent: issue-to-patch workflow with explicit environment and verification.
- aider: compact repo context and diff-visible pair programming.
- AutoGen: declarative workflows and evaluation loops, but only `test_later`.

Use the pattern for:

- delegating bounded coding tasks,
- returning diffs or PR links,
- reporting tests and risks,
- running workers outside the core while KAIZEN7 keeps memory, scope and judgment.

KAIZEN7 now has a specific OpenHands planning command:

```powershell
npm.cmd run k7:openhands -- "delegate bounded coding tasks"
```

This command produces the packet for OpenHands Agent Canvas or Agent Server. It favors Docker sandboxing, explicit allowed paths and verification commands.

Do not let a worker:

- become KAIZEN7 core,
- publish, deploy, delete, spend or touch credentials,
- merge directly,
- run outside allowed paths,
- store secrets in memory.

## Hugging Face Intelligence Pattern

Status:

```text
test_later
```

Sources:

- `BAAI/bge-m3` for future multilingual semantic memory.
- `BAAI/bge-reranker-v2-m3` for optional second-stage context ranking.
- `Qwen/Qwen3-Embedding-0.6B` as a lighter embedding reference.
- `princeton-nlp/SWE-bench_Verified` as evaluation-shape inspiration.
- `ScaleAI/SWE-bench_Pro` as future long-horizon stress-test reference.

Use the pattern for:

- recommending model/dataset assets,
- improving semantic memory only after lexical memory becomes a blocker,
- shaping worker evals around issue, patch, tests and pass/fail evidence.

Do not claim model or benchmark performance until KAIZEN7 runs its own local evaluation.

## Adoption Gate

Before adopting any adapter:

1. Does it solve a real repeated pain?
2. Does it reduce steps or tokens?
3. Does it preserve safety and memory?
4. Does it have a small reversible test?
5. Can it be removed without breaking the core?
