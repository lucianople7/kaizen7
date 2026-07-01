# Agent Work Brief Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact agent-facing work brief that turns the semantic contract into a low-friction working companion.

**Architecture:** Add `lib/capabilities/agent-brief.js` as a small projection over `buildAgentContract()`. Existing packets gain `agent_brief`; CLI/API expose `--brief` and `/brief`; docs explain that the brief is the action card while the contract is the protocol.

**Tech Stack:** Node.js CommonJS, current no-framework tests with `node:assert`, existing server and CLI.

## Global Constraints

- No commands in the brief.
- No operating-system language in the brief.
- No tool-specific instructions in the brief.
- Brief is generated from the agent contract.
- Existing contract, packet, CLI and API compatibility remains intact.
- TDD for every behavior change.

---

### Task 1: Agent Brief Builder

**Files:**
- Modify: `tests/capabilities.test.js`
- Create: `lib/capabilities/agent-brief.js`
- Modify: `lib/capabilities/index.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `buildAgentContract(objective, options)`
- Produces: `buildAgentBrief(objective: string, options?: { contract?: object }): object`

- [ ] Add failing assertions for `buildAgentBrief()` in `tests/capabilities.test.js`.
- [ ] Run `node tests\capabilities.test.js`; expect `buildAgentBrief is not a function`.
- [ ] Implement `lib/capabilities/agent-brief.js`.
- [ ] Export from `lib/capabilities/index.js`.
- [ ] Add `node --check lib/capabilities/agent-brief.js` to `package.json`.
- [ ] Run `node tests\capabilities.test.js` and `npm.cmd run check`.
- [ ] Commit with `git commit -m "add agent work brief builder"`.

### Task 2: Packet, CLI And API Surfaces

**Files:**
- Modify: `tests/capabilities.test.js`
- Modify: `tests/server.integration.test.js`
- Modify: `lib/capabilities/packet.js`
- Modify: `lib/capabilities/cli.js`
- Modify: `server.js`

**Interfaces:**
- Produces: `packet.agent_brief`
- Produces CLI: `--brief "<objective>"`
- Produces API: `POST /api/k7/capabilities/brief`

- [ ] Add failing packet and CLI assertions in `tests/capabilities.test.js`.
- [ ] Add failing API assertions in `tests/server.integration.test.js`.
- [ ] Run focused tests and confirm failures.
- [ ] Embed `agent_brief` in packets.
- [ ] Add CLI `--brief`.
- [ ] Add API `/api/k7/capabilities/brief`.
- [ ] Run `node tests\capabilities.test.js`, `node tests\server.integration.test.js`, and `npm.cmd run check`.
- [ ] Commit with `git commit -m "expose agent work briefs"`.

### Task 3: Documentation And Final Verification

**Files:**
- Modify: `docs/AGENT_LANGUAGE.md`

**Interfaces:**
- Documents `kaizen7.agent_brief.v1`.

- [ ] Document the brief in `docs/AGENT_LANGUAGE.md`.
- [ ] Run `npm.cmd run check`.
- [ ] Run `node lib\capabilities\cli.js --brief "implementar cambio con tests"` and confirm output has no runtime language.
- [ ] Commit with `git commit -m "document agent work brief"`.

## Final Verification

- [ ] Run `npm.cmd run check`.
- [ ] Run `node lib\capabilities\cli.js --brief "implementar cambio con tests"`.
- [ ] Confirm the brief includes `kaizen7.agent_brief.v1`.
- [ ] Confirm the brief output does not include `npm.cmd`, `PowerShell`, `bash`, `Windows`, or `Linux`.
- [ ] Confirm `git status --short` is clean.

## Plan Self-Review

- Spec coverage: builder, packet, CLI, API, docs and runtime-language checks are covered.
- Placeholder scan: no placeholders or vague implementation steps remain.
- Scope check: no runtime, workflow engine or domain content is introduced.
