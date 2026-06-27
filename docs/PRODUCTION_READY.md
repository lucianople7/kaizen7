# KAIZEN7 Production Ready Plan

KAIZEN7 becomes production ready when it is reliable, repeatable, safe and useful across projects.

It should act as:

```text
an operational copilot that activates any project with memory, modules, judgment, action and verification.
```

## Definition Of Ready

KAIZEN7 is production ready when:

1. The repository is clean and recoverable.
2. A new operator can install and run it from the README.
3. `npm run check` passes.
4. `npm run k7:ready` passes.
5. Obsidian is the canonical memory source.
6. Secrets stay outside the repository.
7. `/api/k7/run` and `/api/k7/advise` have stable contracts.
8. The Project Activation Protocol works for any project.
9. Dangerous actions require explicit approval.
10. Releases are versioned, documented and reversible.

## Two Production Tracks

### Track A: Local Production Ready

This is the first target.

KAIZEN7 runs as a private local operating brain:

- Windows/local workspace,
- Obsidian memory,
- CLI,
- local API,
- project separation,
- Codex/agent advisor,
- checks,
- readiness,
- writeback to memory.

### Track B: Hosted Production Ready

This comes later.

KAIZEN7 becomes a service with:

- WebUI,
- authentication,
- project/user permissions,
- persistent storage,
- backups,
- rate limits,
- logs,
- deployment pipeline,
- remote MCP,
- external integrations.

## Roadmap

### Phase 0: Canon And Separation

Status: advanced.

Goals:

- KAIZEN7 and THE FOCUX are separate.
- KAIZEN7 is the agent/system.
- THE FOCUX is the project/case study.
- Obsidian is canonical memory.

Remaining:

- keep THE FOCUX out of the KAIZEN7 release package,
- publish KAIZEN7 cleanly,
- publish THE FOCUX separately.

### Phase 1: Local Ready

Deliverables:

- clear README,
- `docs/OPERATIONS.md`,
- `docs/PRODUCTION_READY.md`,
- `.env.example`,
- stable scripts,
- local start proof.

### Phase 2: API Contract

Deliverables:

- JSON contract for `/api/k7/run`,
- JSON contract for `/api/k7/advise`,
- request/response examples,
- typed errors,
- API versioning,
- contract tests.

### Phase 3: Project Activation Protocol

Deliverables:

- Project Genome template,
- Obsidian memory template,
- repo/web/docs detector,
- module activation map,
- verification checklist,
- learning writeback.

Protocol:

```text
Anchor -> Memory -> Map -> Modules -> Judgment -> Action -> Verification -> Evolution
```

### Phase 4: Security And Permissions

Deliverables:

- permission matrix,
- blocked-by-default dangerous actions,
- explicit approval for publishing, deleting, spending or deploying,
- secret handling,
- log audit,
- sensitive data redaction.

### Phase 5: WebUI Cockpit

Screens:

- projects,
- active objective,
- next action,
- memory used,
- active modules,
- risks,
- verification,
- learning writeback,
- readiness.

### Phase 6: MCP And Connectors

Deliverables:

- local MCP,
- future remote MCP,
- Codex connector pattern,
- external agent connector pattern,
- tool permission scopes.

### Phase 7: Hosted Beta

Deliverables:

- hosting,
- auth,
- persistence,
- backups,
- observability,
- rate limits,
- CI/CD,
- versioned releases,
- rollback.

## Next Moves

1. Use the short daily commands: `k7`, `k7:boost`, `k7:ready`, `k7:check`.
2. Fix local Git publishing or use the GitHub connector.
3. Keep KAIZEN7 and THE FOCUX release packages separate.
4. Add `.env.example`.
5. Document API request/response contracts.
6. Add contract tests for `run` and `advise`.
7. Expose readiness in the WebUI.
8. Add an `AI Booster` panel.
9. Add the OpenAI Agent Adapter as optional runtime.
10. Add a `Project Activation` template.
11. Build the OpenAI acceptance path as `KAIZEN7 Project Activation`.
12. Prepare `v0.1.0-local`.

## Do Not Do Yet

- Do not sell multi-user SaaS before the local product is stable.
- Do not add payments before auth and permissions.
- Do not connect sensitive secrets without a clear vault.
- Do not merge THE FOCUX into KAIZEN7.
- Do not automate publishing without approval.
- Do not create many agents when one modular core can do the job.

## Recommended Sequence

```text
Local Production Ready -> Agent/API Ready -> WebUI Cockpit -> MCP -> Hosted Beta
```

KAIZEN7 should first become an excellent private tool. Then it can become a service.
