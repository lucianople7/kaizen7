---
name: k7-metabrowser
description: Use when KAIZEN7 needs browser automation, agent-browser, Playwright MCP, Browser Use, BrowserCode, Browser Harness, CLI-Anything browser/software harnesses, web research, trend extraction, screenshots, snapshots, form checks, ecommerce checks, TikTok research, Shopify checks, or reusable browser scripts.
---

# K7 MetaBrowser

## Core Principle

Use one KAIZEN7 browser interface and choose the smallest backend that can complete the job.

Do not expose five browser tools to the user. Route intent through K7 MetaBrowser, then select the backend.

## Backend Selection

| Task | Backend |
|---|---|
| Fast page read, markdown, outline, quick research | `agent-browser read` |
| Interactive page inspection, click/fill by refs, screenshots | `agent-browser snapshot -i`, then refs like `@e1` |
| Repeatable forms, stable QA, deterministic workflows | Playwright MCP or generated script |
| Ambiguous browsing that needs reasoning | Browser Use |
| Flow worked 2+ times and should become reusable | BrowserCode pattern |
| Hard rescue, CDP, existing Chrome session, debugging | Browser Harness / CDP |
| Software has no agent-native CLI/API yet | CLI-Anything harness pattern |

## KAIZEN7 Rules

1. Read first: prefer `read`, `snapshot`, `get text`, `get url`.
2. Act by stable refs after a fresh snapshot.
3. Re-snapshot after navigation or layout changes.
4. Save useful signals to Product Genome when they affect product, creative, supplier, economics, or compliance.
5. Ask for approval before external publishing, checkout, account changes, spending, scraping at scale, or credential use.
6. Prefer official APIs for Shopify/social publishing; use browser automation for research, QA, drafting, and fallback only.

## Agent-Browser Pattern

Use `agent-browser` as the preferred local backend when available:

```bash
agent-browser read https://example.com --outline
agent-browser open https://example.com
agent-browser snapshot -i --json
agent-browser click @e2
agent-browser screenshot page.png
```

For KAIZEN7, the ideal workflow is:

```text
intent -> choose backend -> read/snapshot -> extract signal -> judge -> save memory -> optional supervised action
```

## Commands KAIZEN7 Should Support

```text
focux browser trend-search "nootropics tiktok"
focux browser extract-comments URL
focux browser shopify-check
focux browser capcut-template "premium black gold"
```

`upload-draft` and publishing commands must stay approval-gated.

## CLI-Anything Pattern

Use CLI-Anything as a harness factory, not as the browser backend.

Apply it when KAIZEN7 needs to control real software that is not agent-native yet:

- video editors: OpenCut, Shotcut, Kdenlive, OBS
- creative tools: Blender, GIMP, Inkscape
- document tools: LibreOffice, Calibre
- internal tools with a codebase
- web apps where a stable CLI is better than fragile UI automation

Decision:

```text
Need web browsing/research? -> Agent Browser / Playwright MCP
Need to control non-browser software repeatedly? -> CLI-Anything harness
Need one-off UI fallback? -> Browser/Computer control
Need publishing/account changes? -> official API + human approval
```

KAIZEN7 should absorb these CLI-Anything patterns:

- every harness exposes `--help`
- every important command supports JSON output
- generated harnesses get their own `SKILL.md`
- tests must prove the harness works against real software
- repeatable workflows become commands instead of screenshots/clicks

## Output Contract

Return:

- backend used
- facts extracted
- inferred signals
- risks or missing evidence
- Product Genome write, if any
- next smallest action

## Common Mistakes

- Installing a new browser stack before proving a workflow.
- Using visual screenshots when text/snapshot is enough.
- Publishing through browser automation when an official API exists.
- Treating social trend claims as facts without date, URL, and source text.
