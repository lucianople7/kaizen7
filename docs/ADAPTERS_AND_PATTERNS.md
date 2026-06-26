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

## Adoption Gate

Before adopting any adapter:

1. Does it solve a real repeated pain?
2. Does it reduce steps or tokens?
3. Does it preserve safety and memory?
4. Does it have a small reversible test?
5. Can it be removed without breaking the core?
