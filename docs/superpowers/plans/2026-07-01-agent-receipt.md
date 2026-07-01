# Agent Receipt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a semantic receipt that lets agents return verified work in a compact, reusable format.

**Architecture:** Add `lib/capabilities/agent-receipt.js` on top of the existing evidence verifier. The receipt normalizes summary, evidence, risks, accepted claims, missing evidence, next action and memory draft without adding runtime-specific language.

**Tech Stack:** Node.js CommonJS, existing capability tests, existing package check.

## Global Constraints

- No commands in the receipt.
- No operating-system language in the receipt.
- Verdict must come from `verifyCapabilityEvidence()`.
- Existing verifier and packet behavior must remain compatible.

---

### Task 1: Agent Receipt Builder

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/agent-receipt.js`
- Modify: `lib/capabilities/index.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `verifyCapabilityEvidence(packet, result)`
- Produces: `buildAgentReceipt(packet: object, result: object): object`

- [ ] Add failing receipt assertions.
- [ ] Run `node tests\capabilities.test.js` and confirm failure.
- [ ] Implement `lib/capabilities/agent-receipt.js`.
- [ ] Export from `lib/capabilities/index.js`.
- [ ] Add syntax check to `package.json`.
- [ ] Run `node tests\capabilities.test.js` and `npm.cmd run check`.
- [ ] Commit with `git commit -m "add agent receipt builder"`.

### Task 2: Documentation And Final Verification

**Files:**
- Modify: `docs/AGENT_LANGUAGE.md`

- [ ] Document `kaizen7.agent_receipt.v1`.
- [ ] Run `npm.cmd run check`.
- [ ] Run direct Node receipt generation and confirm no runtime language.
- [ ] Commit with `git commit -m "document agent receipt"`.

## Final Verification

- [ ] Run `npm.cmd run check`.
- [ ] Confirm receipt output includes `kaizen7.agent_receipt.v1`.
- [ ] Confirm receipt output does not include `npm.cmd`, `PowerShell`, `bash`, `Windows`, or `Linux`.
- [ ] Confirm `git status --short` is clean.
