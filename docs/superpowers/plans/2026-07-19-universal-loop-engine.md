# Universal Loop Engine Implementation Plan

> **For agentic workers:** Execute inline with test-driven development; no subagent delegation is required.

**Goal:** Turn the existing KAIZEN7 Loop OS into a bounded closed-feedback engine shared by every One Door mission.

**Architecture:** Extend the executable policy with route profiles, carry the selected profile in TaskContract, and make the canonical action-reaction runner retry failed verification with compact correction context. Keep One Door and existing commands as the universal public surface.

**Tech Stack:** Node.js 20, CommonJS, `node:assert/strict`, JSON policy.

## Global Constraints

- Preserve existing commands and additive schema compatibility.
- Autonomy remains controlled constructor (B).
- Never promote or persist unverified outcomes.
- Stop on authority gates, hard failure, failure cap, attempt cap or token cap.

---

### Task 1: Define universal loop contracts

**Files:**
- Modify: `data/k7-loop-policy.json`
- Modify: `lib/k7-loop-system.js`
- Modify: `lib/k7-work-contracts.js`
- Test: `tests/k7-loop-system.test.js`
- Test: `tests/k7-work-contracts.test.js`

- [x] Add failing assertions for required profiles and TaskContract loop data.
- [x] Run focused tests and confirm they fail because profiles/loop data are absent.
- [x] Add policy validation, system exposure and additive TaskContract loop normalization.
- [x] Run focused tests and confirm they pass.

### Task 2: Execute bounded feedback iterations

**Files:**
- Modify: `lib/k7-action-reaction-loop.js`
- Test: `tests/k7-action-reaction-loop.test.js`

- [x] Add a failing test where attempt one fails and attempt two succeeds using correction feedback.
- [x] Add failing tests for hard failure, failure cap and attempt budget.
- [x] Run the focused test and confirm RED.
- [x] Implement the minimum retry loop and attempt receipts.
- [x] Run the focused test and confirm GREEN.

### Task 3: Surface the universal behavior through One Door

**Files:**
- Modify: `lib/k7-one-door.js`
- Modify: `README.md`
- Test: `tests/k7-one-door.test.js`

- [x] Add failing assertions for loop profile and attempt summary in One Door.
- [x] Run the focused test and confirm RED.
- [x] Expose additive loop metadata and document the closed-feedback behavior.
- [x] Run One Door and CLI focused tests and confirm GREEN.

### Task 4: Verify repository integrity

**Files:**
- Modify: `package.json` only if the new source file requires syntax coverage.

- [x] Run `npm run precheck`.
- [x] Run `npm test` if defined; otherwise run `npm run check`.
- [x] Run `npm run k7:check`.
- [x] Inspect `git diff --check`, `git status --short` and the final diff.
