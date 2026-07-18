# Work–Codex–KAIZEN7 Coordination Bridge

**Date:** 2026-07-18  
**Status:** Approved design; implementation pending  
**Owner:** Luciano  
**Repository:** `lucianople7/kaizen7`

## 1. Outcome

KAIZEN7 becomes the coordination control plane shared by Luciano, ChatGPT Work and Codex.

```text
Luciano decides -> Work translates -> KAIZEN7 coordinates -> Codex executes
                  -> evidence returns -> Work explains
```

The bridge does not pretend that chat sessions share private memory. Shared truth exists only in GitHub issues, pull requests, versioned coordination files and approved KAIZEN7 memory.

## 2. Boundaries

KAIZEN7 owns:

- portfolio focus and project registry;
- mission, handoff and receipt contracts;
- routing, minimal-context selection and safety gates;
- durable cross-agent decisions and verification rules.

Flowmatik, THE FOCUX, Mr. Kaizen and future products remain separate repositories or exported project packs. Their implementation, content and product-specific state do not move into the KAIZEN7 kernel.

## 3. Sources of Truth

The design separates operational truth from knowledge truth:

- **GitHub is the operational source of truth:** active missions, state transitions, code changes, tests, receipts and approvals.
- **KAIZEN7 memory is the approved reusable memory:** stable decisions and lessons promoted from completed work.
- **Obsidian is the long-form knowledge base:** architecture notes, research and narrative context. It is not authoritative for live mission status.
- **Chat is the human interface:** it may propose or explain state, but unrecorded chat context is not shared state.

This distinction resolves the current conflict between the repository's GitHub mission route and older documentation that calls Obsidian the universal source of truth. The implementation must update that older wording without discarding Obsidian.

## 4. Repository Contract

### 4.1 KAIZEN7 control plane

```text
coordination/
  registry.json
  focus.json
  inbox/
  receipts/
```

- `registry.json` maps project identifiers to repository URLs, project-pack locations and status.
- `focus.json` records the single portfolio priority and its version.
- `inbox/<mission-id>.json` is the durable machine-readable snapshot of a proposed or approved mission.
- `receipts/<mission-id>.json` indexes the verified outcome and links to the owning repository, issue and pull request.

### 4.2 Project-owned contract

Each connected project owns:

```text
.kaizen7/
  project.json
  mission.json
  decisions.md
  status.md
  receipts/
```

- `project.json` defines identity, purpose, repository boundary and KAIZEN7 connection.
- `mission.json` contains at most one active mission.
- `decisions.md` contains current project decisions, with superseded decisions clearly marked.
- `status.md` is a concise human-readable current-state view.
- `receipts/<mission-id>.json` contains project-local evidence.

KAIZEN7 stores pointers and portfolio priority. The project repository stores technical truth. The same fact must not be maintained independently in both places.

## 5. Live GitHub Transport

Repository files are the durable ledger; GitHub issues and pull requests are the live handoff:

```text
Work -> K7 Mission issue -> Codex claim -> implementation branch
     -> pull request + receipt -> Work review -> Luciano approval when required
     -> merge -> approved memory promotion
```

- Work creates or updates a **K7 Mission** issue.
- The issue contains the human-readable mission and links to its JSON snapshot.
- Codex claims work using assignment and the `k7:in-progress` label.
- Codex returns a small pull request linked to the mission.
- The pull request carries tests, risks, receipt and memory recommendation.
- Merge closes the execution cycle; important memory is promoted only under the existing approval rule.

Issues are not a second source of truth: their mission identifier and version must match the durable snapshot.

## 6. Mission Contract

Every mission has:

```json
{
  "schemaVersion": "1.0",
  "id": "K7-YYYYMMDD-NNN",
  "version": 1,
  "projectId": "kaizen7",
  "repository": "owner/repository",
  "title": "Short outcome",
  "goal": "Observable result",
  "why": "Business or operational value",
  "route": "project-connectivity",
  "priority": "P1",
  "status": "approved",
  "contextFiles": [],
  "constraints": [],
  "acceptanceTests": [],
  "approvalGates": [],
  "expectedOutput": [],
  "risks": [],
  "createdBy": "work",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp",
  "claimedBy": null,
  "claimVersion": null,
  "issueUrl": null,
  "pullRequestUrl": null
}
```

Allowed states:

```text
proposed -> approved -> in_progress -> completed
                         |               |
                         v               v
                       blocked        verified
```

`cancelled` may be reached from `proposed`, `approved`, `in_progress` or `blocked` only with a recorded reason.

A project may have only one `in_progress` mission. New ideas remain `proposed` and cannot silently replace active work.

## 7. Receipt Contract

A receipt records:

```json
{
  "schemaVersion": "1.0",
  "missionId": "K7-YYYYMMDD-NNN",
  "missionVersion": 1,
  "status": "completed",
  "agent": "codex",
  "startedAt": "ISO-8601 timestamp",
  "finishedAt": "ISO-8601 timestamp",
  "summary": "Observable result",
  "changedResources": [],
  "verification": [
    {
      "command": "npm test",
      "result": "passed",
      "evidence": "Concise output or artifact link"
    }
  ],
  "decisions": [],
  "risks": [],
  "blockers": [],
  "nextAction": "Single recommended action",
  "issueUrl": "https://github.com/...",
  "pullRequestUrl": "https://github.com/...",
  "memoryRecommendation": {
    "required": false,
    "target": null,
    "summary": null
  }
}
```

A mission cannot become `verified` without at least one acceptance-test result or an explicit statement that verification is impossible, in which case it remains `blocked`.

## 8. Daily Flow

1. Luciano states an objective naturally in Work.
2. Work reads `coordination/focus.json`, the project status and relevant open mission before answering.
3. Work converts the objective into one proposed mission with acceptance tests.
4. Luciano approves material scope or gates.
5. Work records the mission in GitHub and exposes only the minimum context.
6. Codex validates the mission identifier and version, then claims it.
7. Codex implements within the owning repository, runs verification and opens a pull request.
8. Codex writes a project receipt and proposes the central receipt index update.
9. Work reads repository evidence and explains the real status to Luciano.
10. After review or merge, KAIZEN7 promotes only reusable, approved learning to memory.

When Luciano asks "¿cómo vamos?", Work must distinguish:

- **verified:** read from current GitHub state;
- **stale:** last known state is older than the active mission or pull request;
- **unverified:** GitHub cannot be read;
- **no active mission:** nothing is currently approved or in progress.

## 9. Concurrency and Conflict Control

- Every mutation must supply `id` and `version`.
- Claiming increments or records `claimVersion`.
- Codex must stop if the repository snapshot differs from the claimed version.
- A second claimant cannot overwrite an active claim.
- A superseding mission links to the prior mission and records why it replaces it.
- Pull requests update state through reviewable diffs; direct destructive reconciliation is forbidden.
- Chat recollection never overrides newer repository evidence.

## 10. Failure Handling

- If Work cannot access GitHub, it reports `unverified` and does not invent progress.
- If Codex receives stale context, it stops before editing and requests refresh.
- Failed execution produces a blocked receipt containing attempts, evidence and resume point.
- Partial work remains on its branch or pull request and is not described as complete.
- Schema validation errors prevent claim or closure.
- Publishing, deployment, spending, deletion, production mutation and credential access always require explicit approval.
- Human decisions override automation and are recorded with actor, date and reason.

## 11. Security and Privacy

The bridge stores operational context, not private chat history. Mission context must be minimal and must not include secrets, credentials, payment data or unnecessary personal information.

Public repositories must never receive private business or personal context. Sensitive projects require a private repository or a sanitized project pack before connection.

## 12. Verification Strategy

The first implementation must prove these end-to-end cases:

1. Work creates a valid proposed mission.
2. An approved mission can be claimed exactly once.
3. Codex rejects a stale mission version.
4. Codex closes a mission with a schema-valid receipt and test evidence.
5. Work can answer "¿cómo vamos?" from repository evidence.
6. A failed run preserves blocker, attempts and resume point.
7. An approval-gated action cannot execute without explicit approval.
8. KAIZEN7 points to project state without duplicating project technical truth.

Testing layers:

- JSON Schema tests for mission, project, focus and receipt contracts;
- state-machine unit tests;
- conflict and stale-version tests;
- fixture-based Work and Codex handoff tests;
- one end-to-end dry run confined to KAIZEN7;
- repository-boundary test preventing product implementation from entering the kernel.

## 13. Implementation Sequence

This design is implemented as separate, reviewable missions:

1. **Contracts:** schemas, example fixtures and state transition tests.
2. **KAIZEN7 control plane:** registry, focus, inbox and receipt index.
3. **GitHub mission transport:** issue/label/PR conventions and adapters.
4. **Codex integration:** claim, pre-flight validation and receipt production.
5. **Work integration:** create, inspect and summarize mission state.
6. **Pilot project:** connect one external project after the KAIZEN7 dry run passes.
7. **Documentation migration:** update `KAIZEN7_INDEX.md`, `AGENTS.md` if needed and Codex bridge docs to reflect operational versus knowledge truth.

Each mission must satisfy the existing K7 Mission format and pull request requirements.

## 14. Non-Goals

The first version does not:

- synchronize complete chat histories;
- introduce a new workflow platform or paid API;
- merge product repositories into KAIZEN7;
- execute autonomous publishing or deployment;
- replace GitHub, Obsidian, Codex or Work;
- run a background service merely to copy state;
- support multiple simultaneous active missions per project.

## 15. Success Criteria

The bridge is successful when:

- a new Work or Codex session can resume without private prior-session context;
- status answers cite current repository evidence;
- one project has one unambiguous active mission;
- stale or conflicting work is stopped safely;
- completed work includes tests, receipt and next action;
- KAIZEN7 remains a small coordination kernel rather than absorbing product implementation.
