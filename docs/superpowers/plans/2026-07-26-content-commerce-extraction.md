# Content Commerce Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract Content Commerce and THE FOCUX Founder Pass ownership from the KAIZEN7 kernel through a copy-first, test-gated and reversible project handoff.

**Architecture:** KAIZEN7 retains a generic project-handoff envelope, authority gates, verification and compact receipts. `thefocux-platform` owns brand, product, Founder Pass and commerce-domain state; `flowmatik-studio` owns creative production and media. Migration uses inventory, external copies, dual-read comparison and an explicit human route-flip gate before any cleanup.

**Tech Stack:** Node.js 20, CommonJS, JSON Schema-compatible documents, `node:test`, GitHub issues/pull requests and existing KAIZEN7 CLI checks.

## Global Constraints

- Start every repository change from that repository's current default branch in a clean dedicated branch.
- Preserve PR #8 and all unrelated open work.
- Do not implement PR #10's `plugins/kaizen7-content-commerce/` or `data/content-commerce/` direction inside KAIZEN7.
- No deletion, move, merge, publication, deployment, spending, paid service, credential access or irreversible action is authorized by this plan.
- Never commit runtime state, raw conversations, customer data, credentials or generated media.
- KAIZEN7 stores references, digests, authority results and compact receipts only.
- Product and public claims remain project-owned and require claims review plus human approval.
- Providers remain replaceable; no new provider dependency is introduced.
- A route flip requires explicit Luciano approval after parity and rollback evidence.
- Cleanup is a later destructive mission, not a task in this plan.

---

### Task 1: Freeze the kernel extraction inventory

**Files:**
- Create: `data/extraction/content-commerce-boundary.json`
- Create: `tests/content-commerce-boundary.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: the ownership table in `docs/superpowers/specs/2026-07-26-content-commerce-extraction-boundary-design.md`
- Produces: a machine-readable inventory with `keep`, `extract_thefocux`, `extract_flowmatik`, `compatibility_shim` and `review` arrays

- [ ] **Step 1: Create a clean branch from current `main`**

```powershell
git fetch origin
git switch main
git pull --ff-only
git switch -c agent/content-commerce-extraction-inventory
```

- [ ] **Step 2: Record the complete repository search before editing**

```powershell
git grep -n -I -E "Content Commerce|content_commerce|Founder Pass|THE FOCUX|Flowmatik|Mr\. Kaizen|NEUROCITY" > content-commerce-inventory.txt
git status --short
```

Expected: `content-commerce-inventory.txt` contains only repository paths and
matching lines; no ignored runtime files, secrets or external data are read.

- [ ] **Step 3: Write the failing inventory contract test**

```javascript
const test = require("node:test");
const assert = require("node:assert/strict");
const inventory = require("../data/extraction/content-commerce-boundary.json");

test("content commerce extraction inventory is explicit and non-destructive", () => {
  assert.equal(inventory.schema, "kaizen7.extraction_boundary.v1");
  assert.deepEqual(
    Object.keys(inventory.files).sort(),
    ["compatibility_shim", "extract_flowmatik", "extract_thefocux", "keep", "review"]
  );
  assert.equal(inventory.policy.copy_first, true);
  assert.equal(inventory.policy.delete_in_this_migration, false);
  assert.equal(inventory.policy.route_flip_requires_human, true);
  assert.ok(inventory.files.extract_thefocux.includes("plugins/kaizen7-content-commerce/**"));
  assert.ok(inventory.files.extract_flowmatik.includes("ContentAssetManifest"));
});
```

- [ ] **Step 4: Run the focused test and confirm RED**

```powershell
node --test tests/content-commerce-boundary.test.js
```

Expected: FAIL because `data/extraction/content-commerce-boundary.json` does
not exist.

- [ ] **Step 5: Create the inventory JSON**

Create `data/extraction/content-commerce-boundary.json` with:

```json
{
  "schema": "kaizen7.extraction_boundary.v1",
  "mission": 12,
  "canonical_rule": "KAIZEN7 coordinates; products live outside the kernel.",
  "targets": {
    "commerce": "thefocux-platform",
    "creative": "flowmatik-studio"
  },
  "files": {
    "keep": [
      "AGENTS.md",
      "docs/KAIZEN7_KERNEL_VISION.md",
      "data/operator-constitution.json",
      "lib/k7-operator-constitution.js",
      "data/k7-loop-policy.json",
      "lib/k7-action-reaction-loop.js",
      "lib/k7-loop-system.js",
      "lib/skill-router.js"
    ],
    "extract_thefocux": [
      "plugins/kaizen7-content-commerce/**",
      "data/content-commerce/**",
      "lib/k7-content-commerce-*.js",
      "tests/k7-content-commerce-*.test.js",
      "BrandProfile",
      "ProductFactPack",
      "OpportunityBrief",
      "CommerceBrief",
      "Founder Pass",
      "docs/CONTENT_COMMERCE_FOUNDATION.md"
    ],
    "extract_flowmatik": [
      "ContentAssetManifest",
      "visual DNA",
      "prompt manifests",
      "source and generated assets",
      "short-form video assembly",
      "channel variants"
    ],
    "compatibility_shim": [
      "KAIZEN7_CONTEXT.md",
      "docs/GROWTH_FOCUS_DIRECTIVE.md",
      "data/project-connectivity-map.json",
      "generic project-handoff validator",
      "compact OutcomeReceipt"
    ],
    "review": [
      "PR #10 design",
      "PR #10 Foundation plan",
      "legacy product-specific repository matches"
    ]
  },
  "policy": {
    "copy_first": true,
    "delete_in_this_migration": false,
    "route_flip_requires_human": true,
    "credentials_allowed": false,
    "external_effects_allowed": false
  }
}
```

- [ ] **Step 6: Add the focused test to the existing check script**

Add `node --test tests/content-commerce-boundary.test.js` using the
repository's existing test-script pattern. Do not reorder or replace existing
checks.

- [ ] **Step 7: Run focused and full kernel verification**

```powershell
node --test tests/content-commerce-boundary.test.js
npm.cmd run k7:check
npm.cmd run k7:ready
git diff --check
```

Expected: all checks pass; readiness remains `ready`; blockers remain `0`.

- [ ] **Step 8: Commit only the inventory task**

```powershell
git add data/extraction/content-commerce-boundary.json tests/content-commerce-boundary.test.js package.json
git commit -m "Add content commerce extraction inventory"
```

### Task 2: Establish `thefocux-platform` ownership

**Files:**
- Create in `thefocux-platform`: `contracts/brand-profile.schema.json`
- Create in `thefocux-platform`: `contracts/product-fact-pack.schema.json`
- Create in `thefocux-platform`: `contracts/opportunity-brief.schema.json`
- Create in `thefocux-platform`: `contracts/commerce-brief.schema.json`
- Create in `thefocux-platform`: `docs/CONTENT_COMMERCE_FOUNDATION.md`
- Create in `thefocux-platform`: `tests/contracts.test.js`

**Interfaces:**
- Consumes: project-owned brand/product evidence and the generic KAIZEN7 handoff envelope
- Produces: versioned THE FOCUX contracts and project-owned verification results

- [ ] **Step 1: Open a separate authorized mission**

Create a child issue of #12 with exact repository, files, verification commands,
privacy constraints and expected receipt. Stop if the repository does not yet
exist or Luciano has not authorized its creation.

- [ ] **Step 2: Create a clean project branch**

```powershell
git fetch origin
git switch main
git pull --ff-only
git switch -c agent/focux-content-commerce-foundation
```

- [ ] **Step 3: Write contract tests that fail closed**

`tests/contracts.test.js` must prove:

```javascript
assert.equal(validateBrandProfile({}).ok, false);
assert.equal(validateProductFactPack({
  facts: [{ claim: "unsupported", status: "unconfirmed" }]
}).public_claims_allowed, false);
assert.equal(validateCommerceBrief({
  authority: { publication_approved: false }
}).publication_allowed, false);
```

- [ ] **Step 4: Run RED**

```powershell
node --test tests/contracts.test.js
```

Expected: FAIL because the validators and schemas do not exist.

- [ ] **Step 5: Implement only the four project-owned contracts**

Required facts statuses:

```text
verified_user
verified_source
visible_asset
inference
unconfirmed
```

Only the first three may be eligible for public claims. `inference` remains a
hypothesis and `unconfirmed` blocks publication.

- [ ] **Step 6: Run project verification**

```powershell
node --test tests/contracts.test.js
npm test
git diff --check
```

- [ ] **Step 7: Commit and open a draft PR**

```powershell
git add contracts docs/CONTENT_COMMERCE_FOUNDATION.md tests/contracts.test.js
git commit -m "Add THE FOCUX content commerce contracts"
git push -u origin agent/focux-content-commerce-foundation
```

The draft PR must return contract versions and file digests to Mission #12. It
must not include a public site, checkout, product claim or publication binding.

### Task 3: Establish `flowmatik-studio` production ownership

**Files:**
- Create in `flowmatik-studio`: `contracts/content-asset-manifest.schema.json`
- Create in `flowmatik-studio`: `contracts/creative-handoff.schema.json`
- Create in `flowmatik-studio`: `tests/contracts.test.js`

**Interfaces:**
- Consumes: an approved THE FOCUX brief reference and generic KAIZEN7 handoff envelope
- Produces: project-owned asset references, manifest digest and production receipt

- [ ] **Step 1: Open a separate authorized mission**

The issue must prohibit publication and require source-asset references,
licensing/provenance fields, brand-profile version and fact-pack version.

- [ ] **Step 2: Create a clean project branch**

```powershell
git fetch origin
git switch main
git pull --ff-only
git switch -c agent/flowmatik-production-contracts
```

- [ ] **Step 3: Write the failing production-contract test**

```javascript
assert.equal(validateManifest({}).ok, false);
assert.equal(validateManifest({
  approval: { publication_approved: false },
  assets: []
}).publication_allowed, false);
assert.equal(validateCreativeHandoff({
  product_fact_pack_ref: null
}).ok, false);
```

- [ ] **Step 4: Run RED**

```powershell
node --test tests/contracts.test.js
```

- [ ] **Step 5: Implement the two schemas and validators**

The manifest must include `asset_id`, `brand_profile_ref`,
`product_fact_pack_ref`, `brief_ref`, `source_asset_refs`, `prompt_manifest_ref`,
`channel_variants`, `verification_result`, `approval_record` and
`production_receipt`.

- [ ] **Step 6: Run project verification and commit**

```powershell
node --test tests/contracts.test.js
npm test
git diff --check
git add contracts tests/contracts.test.js
git commit -m "Add Flowmatik production contracts"
git push -u origin agent/flowmatik-production-contracts
```

### Task 4: Add the generic KAIZEN7 handoff shim

**Files:**
- Create: `schemas/project-handoff.schema.json`
- Create: `lib/project-handoff.js`
- Create: `tests/project-handoff.test.js`
- Modify: `data/project-connectivity-map.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `kaizen7.project_handoff.v1`
- Produces: `{ ok, errors, authority_blocked, normalized }` without loading product-owned state

- [ ] **Step 1: Wait for Tasks 2 and 3 receipts**

Do not implement the shim until both external draft PRs expose stable contract
versions, verification commands and artifact-reference formats.

- [ ] **Step 2: Write the failing handoff tests**

```javascript
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProjectHandoff } = require("../lib/project-handoff");

test("accepts references but rejects embedded product state", () => {
  const valid = validateProjectHandoff({
    schema: "kaizen7.project_handoff.v1",
    handoff_id: "h-1",
    mission_id: "12",
    source_project: "kaizen7",
    target_project: "thefocux-platform",
    route: "project_connectivity",
    objective: "build a verified brief",
    input_refs: [{ project: "thefocux-platform", ref: "brief:1", digest: "sha256:abc" }],
    constraints: ["human approval before external effects"],
    acceptance_tests: ["npm test"],
    authority: { approval_required: true, for: ["publish"] },
    expected_output: { kind: "project-owned-artifact", return: "reference-and-receipt-only" }
  });
  assert.equal(valid.ok, true);

  const embedded = validateProjectHandoff({
    ...valid.normalized,
    brand_profile: { private_notes: "must not enter kernel" }
  });
  assert.equal(embedded.ok, false);
});

test("fails closed for unsupported versions and external effects", () => {
  assert.equal(validateProjectHandoff({ schema: "kaizen7.project_handoff.v2" }).ok, false);
  assert.equal(validateProjectHandoff({
    schema: "kaizen7.project_handoff.v1",
    authority: { publication_approved: false },
    requested_action: "publish"
  }).authority_blocked, true);
});
```

- [ ] **Step 3: Run RED**

```powershell
node --test tests/project-handoff.test.js
```

Expected: FAIL because `lib/project-handoff.js` does not exist.

- [ ] **Step 4: Implement the minimal validator**

Use built-in Node.js only. Reject unknown top-level product fields, unsupported
schema versions, missing digests and external effects without an explicit
authority record. Do not fetch either external project.

- [ ] **Step 5: Add compact project references**

Update `data/project-connectivity-map.json` with:

```json
{
  "project": "thefocux-platform",
  "contract": "kaizen7.project_handoff.v1",
  "owns": ["brand", "product", "founder_pass", "content_commerce"],
  "verification": "project-owned"
}
```

and:

```json
{
  "project": "flowmatik-studio",
  "contract": "kaizen7.project_handoff.v1",
  "owns": ["creative_assets", "production", "channel_variants"],
  "verification": "project-owned"
}
```

Adapt these objects to the map's existing structure without renaming unrelated
keys.

- [ ] **Step 6: Run focused and full verification**

```powershell
node --test tests/project-handoff.test.js
npm.cmd run k7:check
npm.cmd run k7:ready
git diff --check
```

- [ ] **Step 7: Commit the shim separately**

```powershell
git add schemas/project-handoff.schema.json lib/project-handoff.js tests/project-handoff.test.js data/project-connectivity-map.json package.json
git commit -m "Add generic external project handoff"
```

### Task 5: Prove parity with dual-read observation

**Files:**
- Create: `tests/fixtures/project-handoff-parity.json`
- Create: `tests/project-handoff-parity.test.js`
- Create: `docs/CONTENT_COMMERCE_MIGRATION_RECEIPT.md`

**Interfaces:**
- Consumes: legacy local references plus external project receipt fixtures
- Produces: a non-promotable parity report and explicit route-flip recommendation

- [ ] **Step 1: Create credential-free fixtures**

Fixtures contain synthetic identifiers and digests only. Do not copy brand
runtime state, customer data, media or private notes into Git.

- [ ] **Step 2: Write parity tests**

```javascript
assert.deepEqual(external.authority_gates, legacy.authority_gates);
assert.equal(external.publication_without_approval, false);
assert.equal(external.claims_without_evidence, false);
assert.equal(external.receipt_verified, true);
assert.equal(external.embedded_product_state, false);
```

- [ ] **Step 3: Run the focused parity test**

```powershell
node --test tests/project-handoff-parity.test.js
```

Expected: PASS for three independent synthetic missions:

1. THE FOCUX opportunity to CommerceBrief.
2. CommerceBrief reference to Flowmatik manifest.
3. Failed claim verification returning `blocked`.

- [ ] **Step 4: Run full verification**

```powershell
npm.cmd run k7:check
npm.cmd run k7:ready
git diff --check
```

- [ ] **Step 5: Write a non-promotable receipt**

`docs/CONTENT_COMMERCE_MIGRATION_RECEIPT.md` records:

```yaml
status: parity_verified
route_flip_authorized: false
cleanup_authorized: false
external_effects: none
verified_cases: 3
next_action: Luciano reviews evidence and explicitly approves or rejects the canonical-source route flip
```

- [ ] **Step 6: Commit parity evidence**

```powershell
git add tests/fixtures/project-handoff-parity.json tests/project-handoff-parity.test.js docs/CONTENT_COMMERCE_MIGRATION_RECEIPT.md
git commit -m "Verify external project handoff parity"
```

### Task 6: Human route-flip gate

**Files:**
- Modify only after approval: `data/project-connectivity-map.json`
- Modify only after approval: `KAIZEN7_CONTEXT.md`
- Test: `tests/project-handoff.test.js`

**Interfaces:**
- Consumes: approved parity receipt and Luciano's explicit GitHub approval
- Produces: canonical external project references with the legacy read path retained for rollback

- [ ] **Step 1: Stop and request Luciano's decision**

Present the exact commit, checks, three parity cases, rollback path and files to
change. Do not infer approval from earlier design or mission approval.

- [ ] **Step 2: If approved, flip references only**

Change the canonical source references to `thefocux-platform` and
`flowmatik-studio`. Keep the legacy read path disabled but available. Do not
delete or move legacy files.

- [ ] **Step 3: Verify the route and rollback**

```powershell
node --test tests/project-handoff.test.js
npm.cmd run k7:check
npm.cmd run k7:ready
git diff --check
```

Then temporarily restore the previous map in the test fixture and prove the
legacy path can still be selected without an external effect.

- [ ] **Step 4: Commit the authorized route flip**

```powershell
git add data/project-connectivity-map.json KAIZEN7_CONTEXT.md tests/project-handoff.test.js
git commit -m "Route product work to external projects"
```

- [ ] **Step 5: Open a separate cleanup issue**

The cleanup issue remains blocked until at least three fresh verified receipts,
a privacy review, a backup/reference check and a new explicit destructive
approval. It is not executed by this plan.

## Plan self-review

- Spec coverage: ownership, inventory, external boundary, minimal interface,
  open-PR overlap, staged migration, rollback, verification, receipt and memory
  recommendation are covered.
- Scope: each task produces an independently reviewable result in one
  repository.
- Safety: no task authorizes merge, publication, spending, credentials,
  deployment, deletion or irreversible migration.
- Type consistency: all kernel handoffs use `kaizen7.project_handoff.v1`;
  project-specific data remains behind opaque references.
- Placeholder scan: no `TBD`, `TODO`, unspecified validator or generic “write
  tests” step remains.

