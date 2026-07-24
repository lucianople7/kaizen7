# K7 Commons Gate Implementation Plan

> Execution requirement: use test-driven development, run each narrow test red then green, and run the full verification gate before opening the replacement pull request.

Goal: repair the stale provider and public-identity drafts, then add a local-first Commons Gate that consumes OpenAI plugin-eval, Codex Security, and the full environment-available Work/Codex capability set as evidence without duplicating it or requiring an API.

Architecture: extend k7-open-commons, k7-trust-gate, the receipt ledger, and the existing CLI. External specialist tools may produce evidence packets; KAIZEN7 owns deterministic policy, lifecycle, approval, and compact receipts. Runtime state stays under ignored .k7/commons/.

Tech stack: Node.js 20 CommonJS, built-in assert/fs/path/crypto, JSON contracts and fixtures. No new runtime dependency and no network in tests.

---

## Task 1: Clean replacement baseline

Files:
- Create branch feat/k7-commons-gate from current main.
- Copy docs/superpowers/specs/2026-07-24-k7-commons-gate-design.md.
- Copy this plan.

Steps:
1. Run npm run k7:check. Expect all existing checks and zero readiness blockers.
2. Create the branch from main, not from PR #8 or #9.
3. Cherry-pick only the approved documents.
4. Commit: docs: add approved commons gate design and plan.

## Task 2: Privacy-safe operator authority

Files:
- Create data/operator-authority.json.
- Create lib/k7-operator-constitution.js.
- Modify lib/k7-one-door.js.
- Create tests/k7-operator-constitution.test.js.
- Modify tests/k7-one-door.test.js.
- Modify package.json.

Red test:
    const publicContract = buildOperatorContract({ env: {} });
    assert.equal(publicContract.principal.id, "primary-human-operator");
    assert.equal(publicContract.principal.label, "Human authority");
    assert(!JSON.stringify(publicContract).includes("name"));

    const privateContract = buildOperatorContract({
      env: { K7_OPERATOR_CONSTITUTION_PATH: privatePath },
    });
    assert.equal(privateContract.private_overlay_loaded, true);
    assert(!JSON.stringify(privateContract).includes("Private Alias"));

Also test recursive rejection of credential, token, financial, health, family, housing, identity-document, and raw-conversation keys. A missing optional overlay must not block normal operation.

Run node tests/k7-operator-constitution.test.js. Expect failure because main lacks the module.

Green implementation:
- Port the useful validation structure from PR #9.
- Public data uses id primary-human-operator, label Human authority, and role final_human_authority.
- Read a private overlay only from an explicit option or K7_OPERATOR_CONSTITUTION_PATH.
- Validate it, but never merge private values into public contracts, One Door output, or receipts.
- Return only private_overlay_loaded true/false and deep-freeze the contract.
- In approval-required One Door work, executor is operator.principal.label.
- Add syntax/tests to the existing check script; do not introduce a competing postcheck chain.

Verify:
    node tests/k7-operator-constitution.test.js
    node tests/k7-one-door.test.js
    npm run check

Commit: feat: add privacy-safe human authority contract.

## Task 3: Local-first provider registry and freshness

Files:
- Create data/provider-recommendations.json.
- Create lib/provider-registry.js.
- Modify lib/model-gateway.js.
- Modify lib/openai-agent-adapter.js.
- Modify lib/mastra-kernel.mjs.
- Modify server.js.
- Create tests/provider-registry.test.js.
- Modify tests/model-gateway.test.js.
- Modify tests/programmatic-tool-calling-benchmark.test.js.
- Modify package.json.

Red test:
    assert.equal(resolveKernelModelId({}), "openai/llama3.1");
    assert.equal(resolveKernelModelId({ K7_PROVIDER: "openai" }), null);
    assert.equal(
      resolveKernelModelId({ K7_PROVIDER: "openai", OPENAI_API_KEY: "configured" }),
      "openai/gpt-5.6-sol",
    );
    assert.equal(
      recommendationStatus("openai", { now: "2026-08-24T00:00:00.000Z" }),
      "verification_required",
    );

Required behavior:
- no implicit hosted provider;
- Ollama credential-free fallback;
- explicit provider/environment selection for hosted transport;
- source, verified_at, and max_age_days for changing recommendations;
- stale recommendation means verification_required, never a guessed replacement;
- no live/paid request during readiness.

Green implementation:
- Keep stable transport/auth/path data in lib/provider-registry.js.
- Keep changing source-backed model defaults in data/provider-recommendations.json.
- Start with the research-verified OpenAI GPT-5.6, Anthropic Sonnet 5, DeepSeek V4 Flash, Google, and local Ollama records.
- Preserve environment overrides and retirement checks.
- Replace runtime literals in the four consumers.
- Add a source-scan test that rejects model literals outside the registry/recommendations.

Verify:
    node tests/provider-registry.test.js
    node tests/model-gateway.test.js
    node tests/programmatic-tool-calling-benchmark.test.js
    npm run check

Commit: feat: centralize local-first provider resolution.

## Task 4: Candidate, source, and receipt contracts

Files:
- Create schemas/commons-candidate.schema.json.
- Create schemas/commons-receipt.schema.json.
- Create data/commons-sources.json.
- Create lib/k7-commons-contracts.js.
- Create tests/k7-commons-contracts.test.js.
- Create tests/fixtures/commons/remotion-candidate.json.
- Create tests/fixtures/commons/unknown-license.json.
- Create tests/fixtures/commons/paid-only.json.
- Create tests/fixtures/commons/unsafe-effects.json.

Red test:
    const candidate = parseCandidate(readFixture("remotion-candidate.json"));
    assert.equal(candidate.schema, "kaizen7.commons_candidate.v1");
    assert.equal(candidate.source.class, "openai_official");
    assert.throws(
      () => parseCandidate({ ...candidate, license: undefined }),
      error => error.code === "K7_COMMONS_INVALID" && error.path === "license",
    );

Test required fields/enums, provenance revision, ISO dates, booleans, arrays, unknown-value preservation, stable IDs, and recursive sensitive-field rejection.

Green implementation:
- Use small explicit CommonJS validators; add no Ajv dependency.
- Export parseCandidate, parseCommonsReceipt, findSensitiveField, and stableCandidateId.
- Freeze normalized packets.
- Never infer license, effects, requirements, or trust from stars/name/popularity.
- Registry marks OpenAI/vendor sources, local inventory, Repo Hunter/Hugging Face, and Awesome Codex CLI as discovery_only where appropriate.

Verify node tests/k7-commons-contracts.test.js.
Commit: feat: define commons candidate and receipt contracts.

## Task 5: Specialist evidence adapters

Files:
- Create lib/k7-commons-evidence.js.
- Create tests/k7-commons-evidence.test.js.
- Create plugin-eval pass/over-budget and Codex Security clean/high fixtures under tests/fixtures/commons/.

Red test:
    const quality = normalizePluginEval(readFixture("plugin-eval-pass.json"));
    assert.equal(quality.kind, "plugin_eval");
    assert.equal(quality.provenance.tool, "openai/plugin-eval");
    assert.equal(quality.token_budget.invoke.status, "pass");

    const security = normalizeSecurityEvidence(readFixture("codex-security-high.json"));
    assert.equal(security.promotable, false);
    assert(security.blockers.some(item => item.severity === "high"));

Reject evidence without tool version, evaluated revision, timestamp, and check/metric result. Never execute commands embedded in evidence.

Green implementation exports:
- normalizePluginEval(result)
- normalizeSecurityEvidence(result)
- requiresSecurityEvidence(candidate)
- buildEvidenceSummary(candidate, evidence)

Rules:
- plugin-eval owns skill/plugin structure, trigger/invoke budget, and optional benchmark quality;
- live benchmarking is optional and excluded from offline tests;
- code, hooks, installers, MCP, binaries, or broad permissions require security evidence;
- high/critical findings block promotion;
- KAIZEN7 creates neither a competing plugin score nor a vulnerability scanner.

Verify node tests/k7-commons-evidence.test.js.
Commit: feat: normalize plugin and security evaluation evidence.

## Task 6: Deterministic gate, lifecycle, and local store

Files:
- Create lib/k7-commons-gate.js.
- Create tests/k7-commons-gate.test.js.
- Modify .gitignore.

Red tests cover:
- discovered to quarantined to evaluated to shadow_tested to promotable;
- only a human can move promotable to approved;
- no self-activation;
- missing license, paid-only, credentials, publication, spending, deployment, deletion, broad destructive scripts;
- duplicate with no measured improvement;
- executable candidate without security evidence;
- Remotion becomes promotable with clean evidence;
- over-budget evidence does not promote;
- every result has exactly one next_action.

Example:
    const result = evaluateCandidate(remotion, {
      pluginEval: pluginEvalPass,
      security: codexSecurityClean,
      inventory: installedSnapshot,
    });
    assert.equal(result.state, "promotable");
    assert.equal(typeof result.next_action, "string");
    assert(!result.activation);

Green implementation:
- Run structured hard gates before scored dimensions.
- Reuse trust-gate patterns, but do not parse prose when structured effects exist.
- Explain deterministic component scores: local-first, license, maintenance evidence, permissions, context cost, overlap, reversibility, verification, benefit, portability.
- Hash canonical candidate + evidence summary + decision + policy version with SHA-256.
- Store no raw private evidence in receipts.
- Runtime paths are .k7/commons/inbox, runs, receipts, and inventory.json.
- Validate resolved paths stay inside project root.
- Preserve corrupt files with timestamped .corrupt suffix.
- Add .k7/commons/ to .gitignore.

Verify node tests/k7-commons-gate.test.js.
Commit: feat: add deterministic commons admission gate.

## Task 7: Extend the existing Commons CLI

Files:
- Modify lib/k7-open-commons.js.
- Modify lib/k7-cli.js.
- Modify tests/k7-open-commons.test.js.
- Modify tests/k7-cli.test.js.
- Modify package.json.

Preserve k7 commons "<goal>" summary behavior. Add only:
- k7 commons ingest <candidate.json>
- k7 commons evaluate <candidate-id>
- k7 commons list --state <state>
- k7 commons receipt <candidate-id>

Red test:
    const result = runK7ToolCommand(
      ["commons", "ingest", fixturePath, "--json"],
      temporaryRoot,
    );
    assert.equal(result.exitCode, 0);
    assert.equal(JSON.parse(result.output).state, "quarantined");

Also test path escape, invalid state, unknown candidate, approval boundary, JSON/text output, and one next action.

Green implementation:
- k7-cli parses/renders.
- k7-open-commons keeps summary/ranking.
- k7-commons-gate owns state/evaluation.
- Add k7:commons:test script for the four focused test files.
- Add syntax/tests to the existing check script.

Verify:
    npm run k7:commons:test
    node tests/k7-cli.test.js

Commit: feat: expose governed commons lifecycle through k7.

## Task 8: Compact native capability snapshots and Flowmatik handoff

Files:
- Create lib/k7-capability-snapshot.js.
- Create tests/k7-capability-snapshot.test.js.
- Create data/commons-candidate-packs/flowmatik.json.
- Modify lib/k7-open-commons.js.
- Modify tests/k7-open-commons.test.js.

Red test:
    const route = selectCapability("programmatic_video", snapshot, candidates);
    assert.equal(route.source, "installed");
    assert.equal(route.capability, "remotion");
    assert.deepEqual(route.loaded_metadata, ["remotion"]);

Required selection order:
1. installed applicable;
2. OpenAI-curated;
3. vendor-official local/free;
4. verified community;
5. custom implementation.

Only selected metadata is returned. Reject connector IDs, secrets, raw conversations, and private operator values.

Green implementation:
- Snapshot stores compact IDs, kind, status, provenance class, and token metadata only.
- Flowmatik pack proposes Remotion now, video-use with local transcription as pilot, and OpenChatCut as external manual MCP.
- It emits a handoff only; it installs/copies no video code.

Verify focused tests.
Commit: feat: prefer native capabilities and emit Flowmatik handoff.

## Task 9: Add an OpenAI-native surface router

Files:
- Create data/openai-capability-profile.json.
- Create lib/k7-openai-surface-router.js.
- Create tests/k7-openai-surface-router.test.js.
- Modify lib/k7-open-commons.js.
- Modify tests/k7-open-commons.test.js.

Red tests:
    const mobile = routeOpenAICapability("steer implementation from phone", profile);
    assert.equal(mobile.surface, "work_remote");
    assert.equal(mobile.requires_desktop_host, true);

    const code = routeOpenAICapability("implement isolated repository change", profile);
    assert.equal(code.surface, "codex_worktree");
    assert.equal(code.cost_class, "included_or_local");

    const image = routeOpenAICapability("create Flowmatik style frame", profile);
    assert.equal(image.surface, "work_image_generation");

    const api = routeOpenAICapability("use hosted trace grading", profile);
    assert.equal(api.surface, "openai_platform_optional");
    assert.equal(api.approval_required, true);

Test availability, region/plan unknowns, privacy exclusions, structured-connector preference over Computer Use, Sites deployment approval, memory as non-binding recall, one next action, and no implicit API fallback.

Green implementation:
- Normalize an environment-specific profile for Work, Codex, installed plugins, and optional Platform capabilities.
- Route to the smallest surface: Work project/goal/scheduled/remote/browser/files/images/Sites/Visualize; Codex local/worktree/cloud; skill/plugin/MCP; optional Platform.
- Prefer built-in Browser for local web QA and structured connectors before Computer Use.
- Mark Remote as the preferred phone control path but require a paired running desktop host.
- Mark Record & Replay unavailable in the EEA baseline, Chronicle excluded for privacy, and Appshots/Codex Micro nonessential.
- Mark every Sites deployment, external write, Computer Use mutation, and API-spend route approval-required.
- Model optional API capabilities without configuring a key: Responses tools, tool search, Programmatic Tool Calling, Agents SDK, Evals/traces, GPT Image/Sora/audio/Realtime/Deep Research, Batch/caching/background.
- Emit a private-plugin packaging handoff only; do not create the plugin or duplicate CLI logic in this task.

Verify:
    node tests/k7-openai-surface-router.test.js
    node tests/k7-open-commons.test.js

Commit: feat: route missions through native OpenAI surfaces.

## Task 10: Repository positioning and documentation

Files:
- Modify package.json.
- Modify README.md.
- Modify KAIZEN7_CONTEXT.md.
- Modify AGENTS.md only if concise authority/verification rules are missing.
- Create docs/verification/2026-07-24-k7-commons-gate-receipt.md.

Red static assertion:
    const packageJson = require("../package.json");
    assert.equal(packageJson.private, true);
    assert(!packageJson.description.toLowerCase().includes("saas"));

Green changes:
- Position KAIZEN7 as a private/local coordination kernel and reference implementation.
- Keep Flowmatik, THE FOCUX, public sites, commerce, and media code in their repositories.
- Preserve historical records as history.
- Populate verification receipt only from actual command results: commit SHA, commands, counts, freshness, privacy scan, fixture outcomes, remaining approvals.
- Never claim plugin installation unless actually installed and harmlessly verified.

Commit: docs: align KAIZEN7 as private coordination kernel.

## Task 11: Full verification and replacement PR

1. Privacy/secret scan:
    rg -n -i "Luciano|López|Barba|api[_ -]?key|password|secret|raw_conversation" data lib tests README.md KAIZEN7_CONTEXT.md AGENTS.md

Expected: no legal name; credential terms only in intentional validators/tests with synthetic values.

2. Focused checks:
    npm run k7:commons:test
    node tests/provider-registry.test.js
    node tests/k7-operator-constitution.test.js
    node tests/k7-one-door.test.js
    node tests/k7-cli.test.js

3. Use installed Codex Security diff-scan workflow because file ingestion, local state, evidence adapters, and CLI paths changed. Resolve validated high/critical findings and record only the normalized summary.

4. Full gate:
    npm run k7:check

Expected: exit 0 and readiness zero blockers.

5. Diff review confirms:
- no new runtime dependency or test network;
- no community implementation copied;
- no self-install/activation;
- no legal name/private overlay output;
- no implicit hosted model;
- one next action;
- plugin-eval and Codex Security are evidence providers, not reimplemented.\n- Work Remote is the preferred phone-control route when available.\n- Work/Codex native surfaces precede optional OpenAI Platform routes.\n- unavailable previews and plan/region-specific features fail closed.\n- no API key or paid route is configured implicitly.

6. Open PR titled: feat: add local-first K7 Commons Gate.
The body links design/plan, tests/security evidence, human-only activation, and explains that PR #8/#9 are superseded.

7. Only after the replacement PR passes, close PR #8 and #9 with a link to it. Do not merge old drafts and do not delete their branches.

8. If the receipt changes, commit: test: record verified commons gate receipt.
