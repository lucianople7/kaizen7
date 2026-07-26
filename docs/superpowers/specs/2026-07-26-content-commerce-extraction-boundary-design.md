# Content Commerce Extraction Boundary Design

**Mission:** [#12](https://github.com/lucianople7/kaizen7/issues/12)

**Parent Control Room:** [#11](https://github.com/lucianople7/kaizen7/issues/11)

**Status:** Proposed for Work and Luciano review. Documentation only.

## Decision

KAIZEN7 remains a coordination kernel. Content Commerce, THE FOCUX Founder
Pass, brand facts, offers, dossiers, creative assets, channel variants and
commerce state live outside this repository.

The approved operating rule is:

```text
Human decides.
KAIZEN7 coordinates.
Agents execute.
Projects grow.
```

This design replaces the direction in PR #10 that proposed a
`plugins/kaizen7-content-commerce/` implementation and product runtime data
inside the KAIZEN7 repository. PR #10 remains useful research, but its ownership
boundary must not be implemented as written.

## Goals

1. Define the smallest interface between KAIZEN7 and external product projects.
2. Preserve all open and legacy work until a verified copy exists elsewhere.
3. Prevent product, brand and creative implementation from re-entering the
   kernel through a plugin, skill bundle or runtime-state shortcut.
4. Provide a staged, reversible migration with explicit human gates.
5. Keep providers replaceable and add no paid dependency.

## Non-goals

- No file is moved or deleted in this mission.
- No external repository is created or modified in this mission.
- No runtime route is changed.
- No PR is merged or closed.
- No publication, deployment, spending or credential access occurs.
- No product identity, offer, public claim or compliance decision is made.

## Current findings

- `AGENTS.md`, `KAIZEN7_CONTEXT.md`,
  `docs/KAIZEN7_KERNEL_VISION.md`, `docs/GROWTH_FOCUS_DIRECTIVE.md` and
  `data/project-connectivity-map.json` already state that projects live outside
  the kernel.
- `docs/CONTENT_COMMERCE_FOUNDATION.md` is not present on current `main`. PR #10
  proposes it as a future output; it is not canonical input.
- PR #8 changes provider/runtime selection only. It has no direct file overlap
  with this documentation mission and must remain untouched.
- PR #10 adds only two documents, but those documents propose more than twenty
  product-specific plugin, data, runtime and test files inside KAIZEN7.

## Ownership boundary

| Owner | Owns | Must not own |
|---|---|---|
| `kaizen7` | Generic routes, minimal project references, authority gates, claims gate selection, handoff-envelope validation, verification requirements and receipts | Brand facts, Founder Pass, offers, dossiers, media, listings, campaigns or product-specific skills |
| `thefocux-platform` | THE FOCUX identity, product facts and evidence, Founder Pass, opportunity and commerce briefs, offers, dossiers, compliance artefacts and commerce-domain skills | KAIZEN7 global policy or Flowmatik rendering internals |
| `flowmatik-studio` | Creative direction, prompt manifests, source assets, generated media, video assembly, channel variants and production receipts | THE FOCUX commercial source of truth or KAIZEN7 authority policy |

Project names are stable routing identifiers. A future repository URL or
deployment target is configuration, not kernel identity.

## Minimal interface back to KAIZEN7

KAIZEN7 exchanges one generic versioned envelope with any project:

```json
{
  "schema": "kaizen7.project_handoff.v1",
  "handoff_id": "immutable-id",
  "mission_id": "github-issue-or-local-mission-id",
  "source_project": "kaizen7",
  "target_project": "thefocux-platform",
  "route": "project_connectivity",
  "objective": "short objective",
  "input_refs": [
    {
      "project": "thefocux-platform",
      "ref": "opaque-project-owned-reference",
      "digest": "sha256"
    }
  ],
  "constraints": [
    "human approval before external effects"
  ],
  "acceptance_tests": [
    "project-owned verification command"
  ],
  "authority": {
    "approval_required": true,
    "for": [
      "publish",
      "spend",
      "credentials",
      "deploy",
      "delete",
      "merge",
      "irreversible_action"
    ]
  },
  "expected_output": {
    "kind": "project-owned-artifact",
    "return": "reference-and-receipt-only"
  }
}
```

The envelope contains references and digests, not raw brand memory, customer
data, generated media or credentials. The target project returns an
`OutcomeReceipt` plus opaque artifact references. KAIZEN7 verifies the envelope,
authority result and receipt; it does not interpret or store the target
project's full runtime state.

## Complete affected-file inventory

### Keep in KAIZEN7

These are kernel-owned and remain generic:

| File | Reason |
|---|---|
| `AGENTS.md` | Canonical agent and repository boundary |
| `docs/KAIZEN7_KERNEL_VISION.md` | Kernel identity and design test |
| `data/operator-constitution.json` | Human authority contract |
| `lib/k7-operator-constitution.js` | Generic authority projection |
| `data/k7-loop-policy.json` | Generic loop, budget and authority gates |
| `lib/k7-action-reaction-loop.js` | Generic bounded execution |
| `lib/k7-loop-system.js` | Generic system definition |
| `lib/skill-router.js` | Generic route selection |
| Generic tests for the files above | Kernel regression protection |

`content_commerce` must not become a product-bearing kernel profile. A generic
`project_connectivity` route may select an external project without loading its
domain skills.

### Extract to `thefocux-platform`

The following PR #10 proposals are product/domain-owned and must not be added to
KAIZEN7:

| Proposed file or concept | External destination |
|---|---|
| `plugins/kaizen7-content-commerce/**` | THE FOCUX domain skill/plugin area |
| `data/content-commerce/vendor-registry.json` | THE FOCUX source-governance area |
| `data/content-commerce/evaluation-policy.json` | THE FOCUX domain evaluation |
| `data/content-commerce/foundation-eval-cases.json` | THE FOCUX domain fixtures |
| `lib/k7-content-commerce-contracts.js` | THE FOCUX contracts |
| `lib/k7-content-commerce-store.js` | THE FOCUX persistence |
| `lib/k7-content-commerce-vendors.js` | THE FOCUX source governance |
| `lib/k7-content-commerce-eval.js` | THE FOCUX evaluation |
| `tests/k7-content-commerce-*.test.js` | THE FOCUX tests |
| `BrandProfile` | THE FOCUX versioned brand source of truth |
| `ProductFactPack` | THE FOCUX facts and evidence |
| `OpportunityBrief` | THE FOCUX opportunity research |
| `CommerceBrief` | THE FOCUX offer and conversion brief |
| Founder Pass | THE FOCUX product surface and records |
| `docs/CONTENT_COMMERCE_FOUNDATION.md` | THE FOCUX architecture documentation |

Any THE FOCUX fields previously stored in `data/product-genome.json` or
`data/kaizen-workspace.json` are migration inputs only. They must be copied to
project-owned storage and verified before a later route flip. They are never
copied into Git if they contain private or runtime material.

### Extract to `flowmatik-studio`

| Concept | External destination |
|---|---|
| `ContentAssetManifest` | Flowmatik asset/production manifest |
| Visual DNA and prompt manifests | Flowmatik creative system |
| Source and generated assets | Flowmatik asset storage |
| Short-form video assembly | Flowmatik production runtime |
| Channel variants | Flowmatik channel adapters |
| Creative performance linkage | Flowmatik production receipt with references back to THE FOCUX hypothesis |

### Compatibility shims in KAIZEN7

These files may keep compact project references while migration is active:

| File | Allowed compatibility content |
|---|---|
| `KAIZEN7_CONTEXT.md` | Project names, ownership boundaries and one external spine |
| `docs/GROWTH_FOCUS_DIRECTIVE.md` | Generic growth gate and external project lanes |
| `data/project-connectivity-map.json` | Repository identifiers, route names, contract versions and verification commands |
| Generic project-handoff validator and tests | Envelope validation only; no product schema |
| Outcome receipts | Status, digest, evidence reference and next action only |

Compatibility shims must fail closed when a project reference is missing or a
contract version is unsupported. They must not silently fall back to legacy
product state inside KAIZEN7.

### Review or supersede

| File or open work | Disposition |
|---|---|
| PR #10 design document | Preserve research; mark superseded by this boundary |
| PR #10 Foundation plan | Do not execute; replace with the extraction plan |
| PR #8 | Preserve independently; rebase/retest only in its own mission |
| Detailed product direction in `KAIZEN7_CONTEXT.md` | Reduce later to compact pointers after external copies are verified |
| Legacy THE FOCUX, Founder Pass, Flowmatik, Mr. Kaizen or NEUROCITY files found during implementation inventory | Classify; copy first; never delete in the first migration PR |

## Data flow

```text
Luciano objective
  -> KAIZEN7 route + authority gate
  -> versioned project handoff
  -> THE FOCUX brief/evidence
  -> Flowmatik production handoff
  -> project-owned artifact
  -> receipt + opaque references
  -> KAIZEN7 verification and next action
```

KAIZEN7 sees enough to route, authorize and verify. Each external project sees
only the domain context it owns.

## Migration stages

1. **Freeze and inventory:** record every product-specific kernel path and open
   PR overlap. Make no runtime change.
2. **Create external foundations:** establish project-owned contracts and tests
   in `thefocux-platform` and `flowmatik-studio`. This requires a separate
   authorization for each repository.
3. **Copy and verify:** copy product/domain artefacts outward, preserve hashes
   and run project-owned tests. Legacy kernel material remains readable.
4. **Introduce generic handoff:** add the smallest versioned envelope validator
   and a compatibility route in KAIZEN7.
5. **Dual-read observation:** compare legacy and external outputs without
   publishing, spending or mutating external systems.
6. **Human route-flip gate:** Luciano approves switching the canonical source
   only after parity, privacy and rollback evidence pass.
7. **Deferred cleanup:** removal is a separate destructive mission after at
   least three verified receipts and a fresh backup/reference check.

## Failure handling

| Failure | Result |
|---|---|
| Missing external project | `blocked`; retain legacy read path |
| Unsupported contract version | `blocked`; no implicit coercion |
| Digest mismatch | reject output and preserve both copies |
| Missing authority record | stop before external effect |
| External project verification fails | do not flip route |
| PR #8 or another branch overlaps a planned kernel file | rebase and rerun full KAIZEN7 checks in that branch |
| Product claim lacks evidence | route to claims review in THE FOCUX; do not store claim as kernel learning |

## Verification

Documentation PR:

```powershell
git diff --check
npm.cmd run k7:check
npm.cmd run k7:ready
```

Migration implementation:

```powershell
npm.cmd run k7:check
npm.cmd run k7:ready
node --test tests/project-handoff.test.js
git diff --check
```

External projects must provide their own exact commands before their migration
missions begin. No live provider call is part of verification.

## Rollback

Every stage is copy-first. Before route flip, rollback is stopping the mission.
After route flip, rollback restores the previous project-connectivity reference
and compatibility read path; it does not delete the external copy. No cleanup
stage begins until the rollback command and evidence are recorded in a receipt.

## Mission Outcome Receipt proposal

```yaml
mission: 12
status: design_ready
result: content-commerce-and-founder-pass-boundary-defined
evidence:
  - keep-extract-shim-review-inventory
  - external-project-ownership-map
  - staged-copy-first-migration
  - rollback-and-verification
external_effects: none
merge_authorized: false
memory_promotable: false
next_action: Work reviews the draft PR and Luciano decides whether to approve the first non-destructive inventory implementation mission
```

## Memory update recommendation

After this design is reviewed and merged, record:

```text
Decision: KAIZEN7 coordinates; products live outside the kernel.
Context: Mission #12 supersedes PR #10's in-kernel Content Commerce implementation direction.
Files changed: extraction design and executable migration plan only.
Tests: k7:check, k7:ready and git diff --check.
Risks: legacy product material remains until separately inventoried, copied and verified.
Next action: one non-destructive inventory mission from current main.
```

Do not update persistent memory before Luciano approves the merge.

