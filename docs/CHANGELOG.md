# Changelog

## 2026-06-28

- Added provider-agnostic `lib/model-gateway.js`.
- Added `npm.cmd run k7:models` and `/api/k7/models`.
- Opened `/api/chat` to `provider` and `model` instead of hardwiring one model vendor.
- Added config and env slots for OpenAI, Anthropic, Google, Groq, Mistral, OpenRouter and Ollama/local.
- Documented the rule: `Model Gateway != KAIZEN7 core`.
- Added 30 Second Activation with `k7:activate`, `/api/k7/activate` and AI Cockpit `Activate 30s`.
- Evolved 30 Second Activation into Activation Pack with intent, confidence, readiness, delegate prompt, timeline, stop rules, evidence and memory writeback.
- Added AI-to-AI `k7-ai-handoff@1.0` contract with parseable input, execution, response and failure contracts.
- Added `POST /api/k7/handoff/validate` K7 Judge for AI return validation: done, retry, blocked or needs_approval.
- Added `POST /api/k7/loop` and WebUI `Run K7 Loop` as the single primary routine: Intent -> Handoff -> Return -> Judge -> Memory -> Next Action.
- Added `lib/browser-adapter.js` so MetaBrowser feeds `k7:run` through the same signal-packet pipeline as GitHub and Hugging Face.
- Added `npm.cmd run k7:browser` and `npm.cmd run k7:run -- --browser <url> <objective>`.
- Documented Browser Adapter levels 1/2/3 in `docs/BROWSER_ADAPTER.md`.
- Added Metaskill Activation core with portable activation contracts and telemetry/fitness scoring.
- Exposed `metaskillActivation` and `metaskillTelemetry` from Connector Kernel and Agent Runner.
- Added Metaskill Outcome Ledger with persistent outcome history, summary/ranking and `k7:metaskills`.
- `metaskillActivation` now uses ledger fitness history when available to prioritize operating disciplines.

## 2026-06-27

- Fixed `tests/server.integration.test.js` to use a free port per run.
- Restored full `npm run check`.
- Added documentation map and public repo docs:
  - `docs/ARCHITECTURE.md`
  - `docs/REPOSITORIES.md`
  - `docs/OPERATIONS.md`
  - `docs/ADAPTERS_AND_PATTERNS.md`
  - `docs/THE_FOCUX_PROJECT.md`
- Updated `.gitignore` to exclude temporary `site/thefocux/`.

## 2026-06-26

- Separated KAIZEN7 as agent and THE FOCUX as project.
- Created THE FOCUX sibling project folder.
- Created KAIZEN7 operating manual in Obsidian.
- Initialized KAIZEN7 GitHub anchor with README and `.gitignore`.
- Added Qwen Agent Adapter note.
- Added Alibaba Smart Assistant Pattern note.

## 2026-06-25

- Built THE FOCUX WebUI foundation.
- Added AI layer, `llms.txt`, `ai-index.json` and public MCP.
- Added NEUROCITY and El Arquitecto canon.
- Added Signal Bowl and Signal Library structure.
