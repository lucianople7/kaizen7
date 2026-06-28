# Agent Browser Reference

Use `agent-browser` as the preferred fast backend when installed.

Core commands:

```bash
agent-browser read <url> --outline
agent-browser read <url> --json
agent-browser open <url>
agent-browser snapshot -i --json
agent-browser click @e1
agent-browser fill @e2 "text"
agent-browser screenshot page.png
agent-browser close
```

KAIZEN7 preference:

1. `read` for research and extraction.
2. `snapshot -i --json` for interactive work.
3. Reuse refs only until the page changes.
4. Save repeatable successful flows as scripts.
