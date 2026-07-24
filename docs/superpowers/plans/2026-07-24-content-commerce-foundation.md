# KAIZEN7 Content Commerce Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Task 4 also requires `plugin-creator` and `superpowers:writing-skills`.

**Goal:** Add the smallest working `content_commerce` foundation to KAIZEN7: pinned source governance, typed brand/product/opportunity/brief contracts, local runtime persistence, a Codex role plugin with four focused skills, selective One Door routing, and deterministic promotion gates.

**Architecture:** Keep KAIZEN7 as the coordinator and reuse its Loop OS, One Door, operator constitution, runtime files, trust gate and SkillOpt boundary. Add one isolated role plugin and small CommonJS modules; no product implementation, publishing connector, paid API, visual pipeline or commerce mutation enters this delivery.

**Tech Stack:** Node.js 20, CommonJS, `node:assert/strict`, JSON policy and fixtures, Codex role-plugin manifest, Markdown Agent Skills.

## Global Constraints

- Begin execution from a fresh `agent/content-commerce-foundation` branch or worktree created from `main` after PR #9 is merged; `lib/k7-operator-constitution.js` and `data/operator-constitution.json` must exist before Task 1.
- Reconcile PR #8 before implementation if it has already merged; preserve its provider registry and do not replace provider IDs, dependencies or model routing.
- KAIZEN7 owns routing, contracts, verification and memory only. Flowmatik, THE FOCUX, stores, channel content and publishing remain external projects or handoff targets.
- Human authority remains final. Publishing, spending, credentials, deployment, deletion, legal/high-stakes claims and irreversible external effects remain blocked without explicit approval.
- No paid service, new npm dependency, live provider request, external write or connector binding is added.
- Public claims may use only `verified_user`, `verified_source` or `visible_asset` facts.
- Runtime brand and campaign state stays in the existing Git-ignored KAIZEN7 runtime files.
- The plugin loads only the selected skill metadata or body; do not preload the full vendor corpus.
- Every task follows RED -> GREEN -> focused tests -> commit.
- Do not begin Creation, Activation or Learning delivery work from the parent design.

---

## File Structure

### New files

- `data/content-commerce/vendor-registry.json` — pinned source, license, disposition and risk record.
- `data/content-commerce/evaluation-policy.json` — deterministic Foundation promotion thresholds.
- `data/content-commerce/foundation-eval-cases.json` — six frozen Foundation cases; later deliveries add the other eighteen.
- `lib/k7-content-commerce-vendors.js` — fail-closed vendor registry loader.
- `lib/k7-content-commerce-contracts.js` — builders and validation for the four Foundation contracts.
- `lib/k7-content-commerce-store.js` — atomic writes into existing local runtime files.
- `lib/k7-content-commerce-eval.js` — deterministic score, hard-gate and context-cost decision.
- `plugins/kaizen7-content-commerce/.codex-plugin/plugin.json` — role-plugin manifest.
- `plugins/kaizen7-content-commerce/README.md` — plugin scope and safety boundary.
- `plugins/kaizen7-content-commerce/skills/brand-foundation/SKILL.md` — compact brand context workflow.
- `plugins/kaizen7-content-commerce/skills/opportunity-research/SKILL.md` — sourced opportunity workflow.
- `plugins/kaizen7-content-commerce/skills/commerce-brief/SKILL.md` — offer and conversion brief workflow.
- `plugins/kaizen7-content-commerce/skills/product-fact-verification/SKILL.md` — fact provenance and public-claim gate.
- `tests/k7-content-commerce-vendors.test.js` — registry validation.
- `tests/k7-content-commerce-contracts.test.js` — contract and public-claim tests.
- `tests/k7-content-commerce-store.test.js` — runtime placement and atomic persistence.
- `tests/k7-content-commerce-plugin.test.js` — manifest, skill and selective-indexing checks.
- `tests/k7-content-commerce-eval.test.js` — promotion, hold and rejection checks.
- `docs/CONTENT_COMMERCE_FOUNDATION.md` — operator-facing Foundation guide.

### Modified files

- `.agents/plugins/marketplace.json` — local marketplace entry for the new plugin.
- `data/k7-loop-policy.json` — `content_commerce` profile, compound match groups and four skill refs.
- `lib/k7-loop-system.js` — validate the compound profile.
- `lib/k7-action-reaction-loop.js` — select the compound profile and attach minimal skill refs.
- `lib/skill-router.js` — include the plugin skill root without preloading skill bodies.
- `lib/runtime-init.js` — seed the existing runtime collections needed by Foundation.
- `tests/k7-loop-system.test.js` — policy contract coverage.
- `tests/k7-action-reaction-loop.test.js` — compound and non-compound route coverage.
- `tests/k7-one-door.test.js` — One Door envelope coverage after PR #9.
- `tests/skill-router.test.js` — plugin root discovery and deduplication.
- `tests/runtime-init.test.js` — runtime collection coverage.
- `package.json` — one focused Foundation check script included in `k7:check`.
- `README.md` — one short Foundation entry point.

---

### Task 1: Pin and validate the absorbed sources

**Files:**
- Create: `data/content-commerce/vendor-registry.json`
- Create: `lib/k7-content-commerce-vendors.js`
- Create: `tests/k7-content-commerce-vendors.test.js`

**Interfaces:**
- Consumes: UTF-8 JSON at `data/content-commerce/vendor-registry.json`.
- Produces: `loadVendorRegistry(options?) -> frozen registry`; `validateVendorRegistry(registry) -> registry`; `foundationVendors(registry?) -> vendor[]`.

- [ ] **Step 1: Write the failing registry test**

```js
// tests/k7-content-commerce-vendors.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  foundationVendors,
  loadVendorRegistry,
  validateVendorRegistry,
} = require("../lib/k7-content-commerce-vendors");

const registry = loadVendorRegistry();
assert.equal(registry.schema, "kaizen7.content_commerce_vendor_registry.v1");
assert.equal(registry.reviewed_at, "2026-07-24");
assert(registry.vendors.length >= 6);
assert(registry.vendors.every((vendor) => /^[a-f0-9]{40}$/.test(vendor.commit)));
assert(registry.vendors.every((vendor) => vendor.license === "MIT"));
assert(registry.vendors.every((vendor) => vendor.license_path === "LICENSE"));
assert(foundationVendors(registry).every((vendor) => vendor.delivery === "foundation"));
assert(foundationVendors(registry).some((vendor) => vendor.id === "openai-role-specific-plugins"));
assert(foundationVendors(registry).some((vendor) => vendor.id === "marketing-skills"));

assert.throws(
  () => validateVendorRegistry({
    ...registry,
    vendors: [{ ...registry.vendors[0], commit: "main" }],
  }),
  /40-character commit/,
);
assert.throws(
  () => validateVendorRegistry({
    ...registry,
    vendors: [{ ...registry.vendors[0], license: "" }],
  }),
  /license/,
);

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-cc-vendors-"));
const malformed = path.join(root, "vendors.json");
fs.writeFileSync(malformed, "{");
assert.throws(() => loadVendorRegistry({ filePath: malformed }), /valid JSON/);

console.log("k7 content commerce vendor tests passed");
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node tests/k7-content-commerce-vendors.test.js
```

Expected: `MODULE_NOT_FOUND` for `../lib/k7-content-commerce-vendors`.

- [ ] **Step 3: Create the pinned registry**

```json
{
  "schema": "kaizen7.content_commerce_vendor_registry.v1",
  "version": 1,
  "reviewed_at": "2026-07-24",
  "update_policy": "manual_review_and_full_reevaluation",
  "vendors": [
    {
      "id": "openai-role-specific-plugins",
      "repository": "https://github.com/openai/role-specific-plugins",
      "source_paths": ["README.md", "plugins/product-design/.codex-plugin/plugin.json"],
      "commit": "fe5608d2512a7d6a7b9821ce8a88c48464ecd6e4",
      "license": "MIT",
      "license_path": "LICENSE",
      "delivery": "foundation",
      "disposition": "adapt_pattern",
      "absorbed_pattern": "role plugin manifest, focused skills and optional connector bindings",
      "modification": "small KAIZEN7-owned plugin with no connector binding in Foundation",
      "tests": ["tests/k7-content-commerce-plugin.test.js"],
      "risks": ["workspace-specific connector ids must never be copied"],
      "remove_when": "official plugin format becomes incompatible or validation fails"
    },
    {
      "id": "marketing-skills",
      "repository": "https://github.com/coreyhaines31/marketingskills",
      "source_paths": ["skills/product-marketing/SKILL.md", "skills/customer-research/SKILL.md", "skills/offers/SKILL.md"],
      "commit": "c21a984a56da10fb6085e6334f6f60929220a4da",
      "license": "MIT",
      "license_path": "LICENSE",
      "delivery": "foundation",
      "disposition": "adapt_pattern",
      "absorbed_pattern": "one compact product-marketing context used by focused downstream workflows",
      "modification": "split into BrandProfile, OpportunityBrief and CommerceBrief contracts",
      "tests": ["tests/k7-content-commerce-contracts.test.js"],
      "risks": ["catalog size can exceed useful context"],
      "remove_when": "adapted contracts fail the frozen evaluation"
    },
    {
      "id": "digital-marketing-pro",
      "repository": "https://github.com/indranilbanerjee/digital-marketing-pro",
      "source_paths": ["README.md", "docs/architecture.md"],
      "commit": "be8b31bb137e69ef152cc5f141d3adfbbe9fd2a8",
      "license": "MIT",
      "license_path": "LICENSE",
      "delivery": "foundation",
      "disposition": "adapt_pattern",
      "absorbed_pattern": "versioned brand profile, checkpointable work and fact-versus-opinion separation",
      "modification": "reuse KAIZEN7 runtime and receipts instead of importing the agency system",
      "tests": ["tests/k7-content-commerce-contracts.test.js", "tests/k7-content-commerce-store.test.js"],
      "risks": ["agency-scale context and agent count conflict with KAIZEN7 minimalism"],
      "remove_when": "the pattern increases context without measurable quality"
    },
    {
      "id": "ecommerce-skills",
      "repository": "https://github.com/nexscope-ai/eCommerce-Skills",
      "source_paths": ["README.md"],
      "commit": "56f3288dd1ba3ae7cae43d369115a915229e510b",
      "license": "MIT",
      "license_path": "LICENSE",
      "delivery": "foundation",
      "disposition": "reference_only",
      "absorbed_pattern": "ecommerce opportunity and channel vocabulary",
      "modification": "use only reviewed stable patterns in frozen fixtures",
      "tests": ["tests/k7-content-commerce-eval.test.js"],
      "risks": ["many skills are beta and must not become authority"],
      "remove_when": "source loses a clear license or reviewed patterns become stale"
    },
    {
      "id": "detail-page-generator",
      "repository": "https://github.com/Gayaya999/ecommerce-detail-page-generator",
      "source_paths": ["README.md"],
      "commit": "234848792b0579ad77c528057e24049f91ad2a19",
      "license": "MIT",
      "license_path": "LICENSE",
      "delivery": "foundation",
      "disposition": "adapt_pattern",
      "absorbed_pattern": "fact provenance categories and deterministic validation",
      "modification": "use KAIZEN7 ProductFactPack statuses and public-claim gate",
      "tests": ["tests/k7-content-commerce-contracts.test.js"],
      "risks": ["visible product details can still be misinterpreted"],
      "remove_when": "provenance categories allow an unverified public claim"
    },
    {
      "id": "langchain-social-media-agent",
      "repository": "https://github.com/langchain-ai/social-media-agent",
      "source_paths": ["README.md"],
      "commit": "1a858704fba93b2b615de328b31e7c7458a99fb0",
      "license": "MIT",
      "license_path": "LICENSE",
      "delivery": "foundation",
      "disposition": "adapt_pattern",
      "absorbed_pattern": "human review, accept and reject before scheduling or publishing",
      "modification": "map approval to the existing operator constitution and One Door gates",
      "tests": ["tests/k7-one-door.test.js"],
      "risks": ["upstream stack requires external keys and publishing access"],
      "remove_when": "any route can publish without explicit human approval"
    }
  ]
}
```

- [ ] **Step 4: Implement the fail-closed loader**

```js
// lib/k7-content-commerce-vendors.js
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_PATH = path.join(__dirname, "../data/content-commerce/vendor-registry.json");
const EXPECTED_SCHEMA = "kaizen7.content_commerce_vendor_registry.v1";
const COMMIT_PATTERN = /^[a-f0-9]{40}$/;
const DISPOSITIONS = new Set(["adapt_pattern", "reference_only", "rejected"]);

function requiredText(value, field) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`content commerce vendor requires ${field}`);
  return normalized;
}

function validateVendorRegistry(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new Error("content commerce vendor registry must be an object");
  }
  if (registry.schema !== EXPECTED_SCHEMA) throw new Error("invalid content commerce vendor registry schema");
  if (registry.version !== 1) throw new Error("unsupported content commerce vendor registry version");
  requiredText(registry.reviewed_at, "reviewed_at");
  requiredText(registry.update_policy, "update_policy");
  if (!Array.isArray(registry.vendors) || registry.vendors.length === 0) {
    throw new Error("content commerce vendor registry requires vendors");
  }
  const ids = new Set();
  for (const vendor of registry.vendors) {
    const id = requiredText(vendor.id, "vendors[].id");
    if (ids.has(id)) throw new Error(`duplicate content commerce vendor id: ${id}`);
    ids.add(id);
    requiredText(vendor.repository, `${id}.repository`);
    if (!COMMIT_PATTERN.test(String(vendor.commit || ""))) {
      throw new Error(`${id} requires a 40-character commit`);
    }
    requiredText(vendor.license, `${id}.license`);
    requiredText(vendor.license_path, `${id}.license_path`);
    requiredText(vendor.delivery, `${id}.delivery`);
    if (!DISPOSITIONS.has(vendor.disposition)) throw new Error(`${id} has invalid disposition`);
    for (const field of ["source_paths", "tests", "risks"]) {
      if (!Array.isArray(vendor[field]) || vendor[field].length === 0) {
        throw new Error(`${id} requires non-empty ${field}`);
      }
    }
    requiredText(vendor.absorbed_pattern, `${id}.absorbed_pattern`);
    requiredText(vendor.modification, `${id}.modification`);
    requiredText(vendor.remove_when, `${id}.remove_when`);
  }
  return registry;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function loadVendorRegistry(options = {}) {
  const filePath = options.filePath || DEFAULT_PATH;
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (cause) {
    throw new Error(`content commerce vendor registry is not valid JSON: ${filePath}`, { cause });
  }
  return deepFreeze(validateVendorRegistry(registry));
}

function foundationVendors(registry = loadVendorRegistry()) {
  return registry.vendors.filter((vendor) => vendor.delivery === "foundation");
}

module.exports = {
  DEFAULT_PATH,
  foundationVendors,
  loadVendorRegistry,
  validateVendorRegistry,
};
```

- [ ] **Step 5: Run GREEN and commit**

Run:

```bash
node tests/k7-content-commerce-vendors.test.js
git diff --check
```

Expected: `k7 content commerce vendor tests passed`; no whitespace errors.

Commit:

```bash
git add data/content-commerce/vendor-registry.json lib/k7-content-commerce-vendors.js tests/k7-content-commerce-vendors.test.js
git commit -m "Add content commerce vendor registry"
```

---

### Task 2: Define the four Foundation contracts

**Files:**
- Create: `lib/k7-content-commerce-contracts.js`
- Create: `tests/k7-content-commerce-contracts.test.js`

**Interfaces:**
- Consumes: plain objects supplied by One Door or an external project handoff.
- Produces: `buildBrandProfile`, `buildProductFactPack`, `buildOpportunityBrief`, `buildCommerceBrief`, `publicClaims` and `buildFoundationPack`.

- [ ] **Step 1: Write the failing contract test**

```js
// tests/k7-content-commerce-contracts.test.js
const assert = require("node:assert/strict");
const {
  buildBrandProfile,
  buildCommerceBrief,
  buildFoundationPack,
  buildOpportunityBrief,
  buildProductFactPack,
  publicClaims,
} = require("../lib/k7-content-commerce-contracts");

const brand = buildBrandProfile({
  brand_id: "flowmatik",
  version: 1,
  product: "Flowmatik Studio",
  audience: ["urban creators", "ecommerce builders"],
  positioning: "Contemporary urban audiovisual storytelling.",
  voice: ["cinematic", "direct", "aspirational"],
  visual_rules: ["70% real cinematic", "20% manga overlay", "10% FX"],
  channels: ["tiktok", "instagram_reels", "youtube_shorts"],
  jurisdictions: ["ES", "EU"],
  forbidden_claims: ["guaranteed sales"],
  approval_owner: "luciano-lopez-barba",
  updated_at: "2026-07-24T00:00:00.000Z",
  evidence_refs: ["docs/superpowers/specs/2026-07-24-content-commerce-absorption-design.md"],
});
assert.equal(brand.schema, "kaizen7.brand_profile.v1");
assert.equal(brand.brand_id, "flowmatik");
assert(Object.isFrozen(brand));

const factPack = buildProductFactPack({
  brand_id: "flowmatik",
  product_id: "studio",
  version: 1,
  checked_at: "2026-07-24T00:00:00.000Z",
  facts: [
    {
      claim: "Produces vertical content briefs.",
      status: "verified_source",
      source_ref: "README.md",
      checked_at: "2026-07-24T00:00:00.000Z",
      allowed_uses: ["brief", "public_copy"]
    },
    {
      claim: "Doubles every store conversion rate.",
      status: "unconfirmed",
      source_ref: "",
      checked_at: "2026-07-24T00:00:00.000Z",
      allowed_uses: ["internal_hypothesis"]
    }
  ]
});
assert.equal(factPack.schema, "kaizen7.product_fact_pack.v1");
assert.deepEqual(publicClaims(factPack).map((fact) => fact.claim), ["Produces vertical content briefs."]);

const opportunity = buildOpportunityBrief({
  id: "opp_flowmatik_001",
  brand_id: "flowmatik",
  signal: "Audience asks how one product image becomes a complete content pack.",
  audience_need: "A repeatable visual commerce workflow.",
  evidence_refs: ["research:audience-question-001"],
  score: { relevance: 5, evidence: 4, differentiation: 4, effort: 3, commercial_potential: 4 },
  status: "candidate"
});
assert.equal(opportunity.schema, "kaizen7.opportunity_brief.v1");

const brief = buildCommerceBrief({
  id: "brief_flowmatik_001",
  brand_id: "flowmatik",
  product_id: "studio",
  opportunity_id: opportunity.id,
  audience: "urban creators",
  offer: "Turn one verified product asset into a reusable content pack.",
  objection: "AI content loses visual consistency.",
  permitted_promise: "Use one versioned visual system across requested variants.",
  cta: "Review the first content pack.",
  primary_metric: "approved_content_pack",
  fact_refs: [factPack.facts[0].id]
});
assert.equal(brief.schema, "kaizen7.commerce_brief.v1");

const pack = buildFoundationPack({ brand, fact_pack: factPack, opportunity, commerce_brief: brief });
assert.equal(pack.schema, "kaizen7.content_commerce_foundation.v1");
assert.equal(pack.commerce_brief.opportunity_id, pack.opportunity.id);

assert.throws(
  () => buildProductFactPack({
    ...factPack,
    facts: [{
      claim: "Unsupported public claim",
      status: "unconfirmed",
      source_ref: "",
      checked_at: "2026-07-24T00:00:00.000Z",
      allowed_uses: ["public_copy"]
    }]
  }),
  /unconfirmed facts cannot allow public use/,
);
assert.throws(() => buildBrandProfile({ ...brand, version: 0 }), /version/);

console.log("k7 content commerce contract tests passed");
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node tests/k7-content-commerce-contracts.test.js
```

Expected: `MODULE_NOT_FOUND` for `../lib/k7-content-commerce-contracts`.

- [ ] **Step 3: Implement the contract builders**

```js
// lib/k7-content-commerce-contracts.js
const crypto = require("node:crypto");

const PUBLIC_FACT_STATUSES = new Set(["verified_user", "verified_source", "visible_asset"]);
const FACT_STATUSES = new Set([...PUBLIC_FACT_STATUSES, "inference", "unconfirmed"]);
const OPPORTUNITY_STATUSES = new Set(["candidate", "approved", "rejected"]);
const PUBLIC_USES = new Set(["public_copy", "listing", "advertising", "email", "social"]);

function text(value, field) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${field} is required`);
  return normalized;
}

function list(value, field) {
  const normalized = Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (field && normalized.length === 0) throw new Error(`${field} must be non-empty`);
  return [...new Set(normalized)];
}

function version(value) {
  if (!Number.isInteger(value) || value < 1) throw new Error("version must be a positive integer");
  return value;
}

function score(value, field) {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error(`${field} must be an integer from 1 to 5`);
  }
  return value;
}

function stableId(prefix, value) {
  const digest = crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
  return `${prefix}_${digest}`;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function buildBrandProfile(input = {}) {
  return deepFreeze({
    schema: "kaizen7.brand_profile.v1",
    brand_id: text(input.brand_id, "brand_id"),
    version: version(input.version),
    product: text(input.product, "product"),
    audience: list(input.audience, "audience"),
    positioning: text(input.positioning, "positioning"),
    voice: list(input.voice, "voice"),
    visual_rules: list(input.visual_rules, "visual_rules"),
    channels: list(input.channels, "channels"),
    jurisdictions: list(input.jurisdictions, "jurisdictions"),
    forbidden_claims: list(input.forbidden_claims),
    approval_owner: text(input.approval_owner, "approval_owner"),
    updated_at: text(input.updated_at, "updated_at"),
    evidence_refs: list(input.evidence_refs, "evidence_refs"),
  });
}

function buildProductFactPack(input = {}) {
  const brandId = text(input.brand_id, "brand_id");
  const productId = text(input.product_id, "product_id");
  if (!Array.isArray(input.facts) || input.facts.length === 0) throw new Error("facts must be non-empty");
  const facts = input.facts.map((fact) => {
    const status = text(fact.status, "facts[].status");
    if (!FACT_STATUSES.has(status)) throw new Error(`invalid fact status: ${status}`);
    const allowedUses = list(fact.allowed_uses, "facts[].allowed_uses");
    if (!PUBLIC_FACT_STATUSES.has(status) && allowedUses.some((use) => PUBLIC_USES.has(use))) {
      throw new Error("unconfirmed facts cannot allow public use");
    }
    const claim = text(fact.claim, "facts[].claim");
    return {
      id: fact.id || stableId("fact", `${brandId}:${productId}:${claim}`),
      claim,
      status,
      source_ref: String(fact.source_ref || "").trim(),
      checked_at: text(fact.checked_at || input.checked_at, "facts[].checked_at"),
      allowed_uses: allowedUses,
      expiry: String(fact.expiry || "").trim(),
    };
  });
  return deepFreeze({
    schema: "kaizen7.product_fact_pack.v1",
    brand_id: brandId,
    product_id: productId,
    version: version(input.version),
    checked_at: text(input.checked_at, "checked_at"),
    facts,
  });
}

function publicClaims(factPack = {}) {
  return (factPack.facts || []).filter((fact) => (
    PUBLIC_FACT_STATUSES.has(fact.status)
      && fact.allowed_uses.some((use) => PUBLIC_USES.has(use))
  ));
}

function buildOpportunityBrief(input = {}) {
  const status = text(input.status, "status");
  if (!OPPORTUNITY_STATUSES.has(status)) throw new Error(`invalid opportunity status: ${status}`);
  const source = input.score || {};
  return deepFreeze({
    schema: "kaizen7.opportunity_brief.v1",
    id: text(input.id, "id"),
    brand_id: text(input.brand_id, "brand_id"),
    signal: text(input.signal, "signal"),
    audience_need: text(input.audience_need, "audience_need"),
    evidence_refs: list(input.evidence_refs, "evidence_refs"),
    score: {
      relevance: score(source.relevance, "score.relevance"),
      evidence: score(source.evidence, "score.evidence"),
      differentiation: score(source.differentiation, "score.differentiation"),
      effort: score(source.effort, "score.effort"),
      commercial_potential: score(source.commercial_potential, "score.commercial_potential"),
    },
    status,
  });
}

function buildCommerceBrief(input = {}) {
  return deepFreeze({
    schema: "kaizen7.commerce_brief.v1",
    id: text(input.id, "id"),
    brand_id: text(input.brand_id, "brand_id"),
    product_id: text(input.product_id, "product_id"),
    opportunity_id: text(input.opportunity_id, "opportunity_id"),
    audience: text(input.audience, "audience"),
    offer: text(input.offer, "offer"),
    objection: text(input.objection, "objection"),
    permitted_promise: text(input.permitted_promise, "permitted_promise"),
    cta: text(input.cta, "cta"),
    primary_metric: text(input.primary_metric, "primary_metric"),
    fact_refs: list(input.fact_refs, "fact_refs"),
  });
}

function buildFoundationPack(input = {}) {
  const brand = buildBrandProfile(input.brand);
  const factPack = buildProductFactPack(input.fact_pack);
  const opportunity = buildOpportunityBrief(input.opportunity);
  const commerceBrief = buildCommerceBrief(input.commerce_brief);
  if (new Set([factPack.brand_id, opportunity.brand_id, commerceBrief.brand_id]).size !== 1
      || brand.brand_id !== factPack.brand_id) {
    throw new Error("foundation contracts must share brand_id");
  }
  if (commerceBrief.product_id !== factPack.product_id) {
    throw new Error("commerce brief product_id must match fact pack");
  }
  if (commerceBrief.opportunity_id !== opportunity.id) {
    throw new Error("commerce brief opportunity_id must match opportunity");
  }
  const knownFactIds = new Set(factPack.facts.map((fact) => fact.id));
  if (commerceBrief.fact_refs.some((id) => !knownFactIds.has(id))) {
    throw new Error("commerce brief contains unknown fact_refs");
  }
  return deepFreeze({
    schema: "kaizen7.content_commerce_foundation.v1",
    brand,
    fact_pack: factPack,
    opportunity,
    commerce_brief: commerceBrief,
  });
}

module.exports = {
  FACT_STATUSES,
  PUBLIC_FACT_STATUSES,
  buildBrandProfile,
  buildCommerceBrief,
  buildFoundationPack,
  buildOpportunityBrief,
  buildProductFactPack,
  publicClaims,
};
```

- [ ] **Step 4: Run GREEN and commit**

Run:

```bash
node tests/k7-content-commerce-contracts.test.js
node --check lib/k7-content-commerce-contracts.js
git diff --check
```

Expected: contract tests pass and both checks exit `0`.

Commit:

```bash
git add lib/k7-content-commerce-contracts.js tests/k7-content-commerce-contracts.test.js
git commit -m "Add content commerce foundation contracts"
```

---

### Task 3: Persist Foundation state in existing local runtime files

**Files:**
- Create: `lib/k7-content-commerce-store.js`
- Create: `tests/k7-content-commerce-store.test.js`
- Modify: `lib/runtime-init.js`
- Modify: `tests/runtime-init.test.js`

**Interfaces:**
- Consumes: a valid `kaizen7.content_commerce_foundation.v1` pack from Task 2.
- Produces: `saveFoundationPack(pack, { root }) -> placement receipt`; `loadFoundationState({ root }) -> { brands, fact_packs, opportunities, commerce_briefs }`.

- [ ] **Step 1: Write the failing persistence test**

```js
// tests/k7-content-commerce-store.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { initRuntime } = require("../lib/runtime-init");
const { buildFoundationPack } = require("../lib/k7-content-commerce-contracts");
const {
  loadFoundationState,
  saveFoundationPack,
} = require("../lib/k7-content-commerce-store");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-cc-store-"));
initRuntime({ root });

const pack = buildFoundationPack({
  brand: {
    brand_id: "flowmatik",
    version: 1,
    product: "Flowmatik Studio",
    audience: ["urban creators"],
    positioning: "Urban content system.",
    voice: ["cinematic"],
    visual_rules: ["consistent visual DNA"],
    channels: ["tiktok"],
    jurisdictions: ["ES"],
    forbidden_claims: ["guaranteed sales"],
    approval_owner: "luciano-lopez-barba",
    updated_at: "2026-07-24T00:00:00.000Z",
    evidence_refs: ["spec"]
  },
  fact_pack: {
    brand_id: "flowmatik",
    product_id: "studio",
    version: 1,
    checked_at: "2026-07-24T00:00:00.000Z",
    facts: [{
      id: "fact_001",
      claim: "Creates content briefs.",
      status: "verified_source",
      source_ref: "README.md",
      checked_at: "2026-07-24T00:00:00.000Z",
      allowed_uses: ["public_copy"]
    }]
  },
  opportunity: {
    id: "opp_001",
    brand_id: "flowmatik",
    signal: "Need consistent content.",
    audience_need: "Repeatable workflow.",
    evidence_refs: ["signal:001"],
    score: { relevance: 5, evidence: 4, differentiation: 4, effort: 3, commercial_potential: 4 },
    status: "candidate"
  },
  commerce_brief: {
    id: "brief_001",
    brand_id: "flowmatik",
    product_id: "studio",
    opportunity_id: "opp_001",
    audience: "urban creators",
    offer: "One source asset to one reviewed content pack.",
    objection: "AI output loses consistency.",
    permitted_promise: "Use a versioned visual system.",
    cta: "Review the pack.",
    primary_metric: "approved_content_pack",
    fact_refs: ["fact_001"]
  }
});

const receipt = saveFoundationPack(pack, { root });
assert.equal(receipt.schema, "kaizen7.content_commerce_storage_receipt.v1");
assert.deepEqual(receipt.files, [
  "data/product-genome.json",
  "data/kaizen-workspace.json"
]);

const state = loadFoundationState({ root });
assert.equal(state.brands.length, 1);
assert.equal(state.fact_packs.length, 1);
assert.equal(state.opportunities.length, 1);
assert.equal(state.commerce_briefs.length, 1);

saveFoundationPack(pack, { root });
const deduped = loadFoundationState({ root });
assert.equal(deduped.brands.length, 1);
assert.equal(deduped.fact_packs.length, 1);
assert.equal(deduped.opportunities.length, 1);
assert.equal(deduped.commerce_briefs.length, 1);

console.log("k7 content commerce store tests passed");
```

- [ ] **Step 2: Add failing runtime-seed assertions**

Append to `tests/runtime-init.test.js` before the final log:

```js
const productGenome = JSON.parse(fs.readFileSync(path.join(root, "data/product-genome.json"), "utf8"));
assert(Array.isArray(productGenome.brands));
assert(Array.isArray(productGenome.factPacks));

const workspace = JSON.parse(fs.readFileSync(path.join(root, "data/kaizen-workspace.json"), "utf8"));
assert(Array.isArray(workspace.opportunities));
assert(Array.isArray(workspace.commerceBriefs));
```

- [ ] **Step 3: Run both tests and verify RED**

Run:

```bash
node tests/runtime-init.test.js
node tests/k7-content-commerce-store.test.js
```

Expected: runtime seed assertions fail first; store test reports `MODULE_NOT_FOUND`.

- [ ] **Step 4: Extend only the existing runtime seeds**

Replace the two corresponding entries in `lib/runtime-init.js` with:

```js
["data/kaizen-workspace.json", {
  version: 1,
  projects: [],
  campaigns: [],
  tasks: [],
  content: [],
  opportunities: [],
  commerceBriefs: [],
  updatedAt: null,
}],
["data/product-genome.json", {
  version: 1,
  products: [],
  brands: [],
  factPacks: [],
  experiments: [],
  learnings: [],
  suppliers: [],
  creatives: [],
  updatedAt: null,
}],
```

- [ ] **Step 5: Implement atomic, deduplicating persistence**

```js
// lib/k7-content-commerce-store.js
const fs = require("node:fs");
const path = require("node:path");
const { buildFoundationPack } = require("./k7-content-commerce-contracts");

const PRODUCT_GENOME = path.join("data", "product-genome.json");
const WORKSPACE = path.join("data", "kaizen-workspace.json");

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJsonAtomic(root, relativePath, value) {
  const target = path.join(root, relativePath);
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, target);
}

function upsert(items, item, key) {
  const index = items.findIndex((existing) => key(existing) === key(item));
  if (index === -1) items.push(item);
  else items[index] = item;
}

function loadFoundationState(options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const genome = readJson(root, PRODUCT_GENOME);
  const workspace = readJson(root, WORKSPACE);
  return {
    brands: genome.brands || [],
    fact_packs: genome.factPacks || [],
    opportunities: workspace.opportunities || [],
    commerce_briefs: workspace.commerceBriefs || [],
  };
}

function saveFoundationPack(input, options = {}) {
  const root = path.resolve(options.root || process.cwd());
  const pack = buildFoundationPack(input);
  const genome = readJson(root, PRODUCT_GENOME);
  const workspace = readJson(root, WORKSPACE);
  genome.brands ||= [];
  genome.factPacks ||= [];
  workspace.opportunities ||= [];
  workspace.commerceBriefs ||= [];
  upsert(genome.brands, pack.brand, (item) => `${item.brand_id}:${item.version}`);
  upsert(genome.factPacks, pack.fact_pack, (item) => `${item.brand_id}:${item.product_id}:${item.version}`);
  upsert(workspace.opportunities, pack.opportunity, (item) => item.id);
  upsert(workspace.commerceBriefs, pack.commerce_brief, (item) => item.id);
  const now = options.now || new Date().toISOString();
  genome.updatedAt = now;
  workspace.updatedAt = now;
  writeJsonAtomic(root, PRODUCT_GENOME, genome);
  writeJsonAtomic(root, WORKSPACE, workspace);
  return {
    schema: "kaizen7.content_commerce_storage_receipt.v1",
    brand_id: pack.brand.brand_id,
    product_id: pack.fact_pack.product_id,
    files: [PRODUCT_GENOME, WORKSPACE],
    stored_at: now,
  };
}

module.exports = {
  PRODUCT_GENOME,
  WORKSPACE,
  loadFoundationState,
  saveFoundationPack,
};
```

- [ ] **Step 6: Run GREEN and commit**

Run:

```bash
node tests/runtime-init.test.js
node tests/k7-content-commerce-contracts.test.js
node tests/k7-content-commerce-store.test.js
git diff --check
```

Expected: all four commands exit `0`.

Commit:

```bash
git add lib/runtime-init.js lib/k7-content-commerce-store.js tests/runtime-init.test.js tests/k7-content-commerce-store.test.js
git commit -m "Persist content commerce foundation state"
```

---

### Task 4: Scaffold the role plugin and four focused skills

**Required skills during execution:** `plugin-creator` and `superpowers:writing-skills`.

**Files:**
- Create: `.agents/plugins/marketplace.json`
- Create: `plugins/kaizen7-content-commerce/.codex-plugin/plugin.json`
- Create: `plugins/kaizen7-content-commerce/README.md`
- Create: four `plugins/kaizen7-content-commerce/skills/*/SKILL.md` files named in File Structure.
- Create: `tests/k7-content-commerce-plugin.test.js`
- Modify: `lib/skill-router.js`
- Modify: `tests/skill-router.test.js`

**Interfaces:**
- Consumes: Codex plugin discovery and KAIZEN7 `indexSkills`.
- Produces: installable local plugin `kaizen7-content-commerce`; four metadata-only recommendations from the existing router.

- [ ] **Step 1: Write the failing plugin contract test**

```js
// tests/k7-content-commerce-plugin.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { indexSkills, parseFrontmatter, recommendSkills } = require("../lib/skill-router");

const pluginRoot = path.join(process.cwd(), "plugins", "kaizen7-content-commerce");
const manifest = JSON.parse(fs.readFileSync(path.join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"));
assert.equal(manifest.name, "kaizen7-content-commerce");
assert.equal(manifest.version, "0.1.0");
assert.equal(manifest.license, "MIT");
assert.equal(manifest.skills, "./skills/");
assert.equal(Object.prototype.hasOwnProperty.call(manifest, "apps"), false);

const expected = [
  "brand-foundation",
  "opportunity-research",
  "commerce-brief",
  "product-fact-verification",
];
for (const name of expected) {
  const filePath = path.join(pluginRoot, "skills", name, "SKILL.md");
  const body = fs.readFileSync(filePath, "utf8");
  const metadata = parseFrontmatter(body);
  assert.equal(metadata.name, name);
  assert(metadata.description.length >= 40);
  assert(body.includes("## Inputs"));
  assert(body.includes("## Output"));
  assert(body.includes("## Stop Conditions"));
  assert(!body.includes("publish automatically"));
}

const skills = indexSkills();
for (const name of expected) assert(skills.some((skill) => skill.name === name));
const recommendation = recommendSkills(
  "verificar hechos del producto antes de escribir contenido ecommerce",
  skills,
  { limit: 3 },
);
assert.equal(recommendation[0].name, "product-fact-verification");

console.log("k7 content commerce plugin tests passed");
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node tests/k7-content-commerce-plugin.test.js
```

Expected: `ENOENT` for the plugin manifest.

- [ ] **Step 3: Create the local marketplace and manifest**

```json
{
  "name": "kaizen7-plugins",
  "interface": {
    "displayName": "KAIZEN7 Plugins"
  },
  "plugins": [
    {
      "name": "kaizen7-content-commerce",
      "source": {
        "source": "local",
        "path": "./plugins/kaizen7-content-commerce"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_USE"
      },
      "category": "Business & Operations"
    }
  ]
}
```

```json
{
  "name": "kaizen7-content-commerce",
  "version": "0.1.0",
  "description": "KAIZEN7-governed content and ecommerce foundations with versioned brand context, sourced opportunities, verified product facts and approval-safe commerce briefs.",
  "author": {
    "name": "KAIZEN7"
  },
  "homepage": "https://github.com/lucianople7/kaizen7",
  "repository": "https://github.com/lucianople7/kaizen7/tree/main/plugins/kaizen7-content-commerce",
  "license": "MIT",
  "keywords": [
    "content",
    "ecommerce",
    "brand",
    "product facts",
    "commerce brief",
    "human approval",
    "kaizen7"
  ],
  "skills": "./skills/",
  "interface": {
    "displayName": "KAIZEN7 Content Commerce",
    "shortDescription": "Build verified content-commerce foundations",
    "longDescription": "Turn a product or brand objective into compact, sourced and reviewable foundations before creative production. KAIZEN7 keeps the route bounded, separates facts from hypotheses and preserves human approval before external effects.",
    "developerName": "KAIZEN7",
    "category": "Business & Operations",
    "capabilities": ["Interactive", "Read", "Write"],
    "websiteURL": "https://github.com/lucianople7/kaizen7",
    "defaultPrompt": [
      "Build the verified foundation for this product",
      "Find the strongest sourced content-commerce opportunity",
      "Separate product facts from unconfirmed claims"
    ],
    "brandColor": "#B8943E",
    "screenshots": []
  }
}
```

- [ ] **Step 4: Create the exact four skill bodies**

```markdown
---
name: brand-foundation
description: Use when a content or ecommerce mission needs a compact, versioned source of truth for product, audience, positioning, voice, visual rules, channels, jurisdictions, forbidden claims and approval owner.
---

# Brand Foundation

Create or update one `kaizen7.brand_profile.v1` contract before downstream content-commerce work.

## Inputs

- Product or service identity.
- Audience and positioning evidence.
- Voice and visual rules.
- Channels and jurisdictions.
- Forbidden claims and approval owner.
- Evidence references for every durable decision.

## Workflow

1. Reuse the newest valid BrandProfile for the same `brand_id`.
2. Ask only for a field that blocks a valid contract.
3. Separate durable brand decisions from campaign ideas.
4. Increment `version` when a durable field changes.
5. Validate with `buildBrandProfile`.

## Output

Return one valid BrandProfile plus a short list of missing evidence that does not block internal drafting.

## Stop Conditions

- Stop if the approval owner is unknown.
- Stop if positioning or audience is presented as fact without evidence.
- Never store credentials, private customer data or raw conversation history.
```

```markdown
---
name: opportunity-research
description: Use when a brand or product needs sourced content-commerce opportunities from audience questions, reviews, trends or current market signals, ranked without inventing demand.
---

# Opportunity Research

Convert a real signal into one `kaizen7.opportunity_brief.v1` candidate.

## Inputs

- Valid BrandProfile.
- Audience question, review, trend or market signal.
- Fresh source references when the signal can change.

## Workflow

1. Restate the signal without strengthening it.
2. Identify the audience need.
3. Score relevance, evidence, differentiation, effort and commercial potential from 1 to 5.
4. Keep opinion and inference labeled.
5. Validate with `buildOpportunityBrief`.

## Output

Return one ranked OpportunityBrief and the evidence references used.

## Stop Conditions

- Stop if there is no source or user-provided signal.
- Stop if a trend is stale and cannot be refreshed.
- Do not convert popularity into proof of purchase intent.
```

```markdown
---
name: commerce-brief
description: Use when a verified product and approved opportunity need one compact offer, objection, permitted promise, CTA, primary metric and traceable fact references before copy or creative production.
---

# Commerce Brief

Create one `kaizen7.commerce_brief.v1` from approved Foundation inputs.

## Inputs

- Valid BrandProfile.
- Valid ProductFactPack.
- Candidate or approved OpportunityBrief.
- One audience, offer, objection, CTA and primary metric.

## Workflow

1. Choose one audience and one conversion objective.
2. Build the offer from allowed product facts.
3. Write a permitted promise that does not exceed those facts.
4. Link every factual element through `fact_refs`.
5. Validate with `buildCommerceBrief` and `buildFoundationPack`.

## Output

Return one CommerceBrief and list any hypothesis separately from public copy.

## Stop Conditions

- Stop if the brief references an unknown fact.
- Stop if the promise is stronger than the verified evidence.
- Never authorize publishing, spending or a store mutation.
```

```markdown
---
name: product-fact-verification
description: Use before public content, listings, ads or emails when product statements must be classified as verified user input, verified source, visible asset, inference or unconfirmed and unsafe claims must be blocked.
---

# Product Fact Verification

Create or refresh one `kaizen7.product_fact_pack.v1`.

## Inputs

- Product identifier and brand identifier.
- Candidate claims.
- Source reference, checked date, allowed uses and expiry where applicable.

## Workflow

1. Classify each claim with one allowed status.
2. Require a source for `verified_source`.
3. Use `visible_asset` only for directly observable details.
4. Restrict `inference` and `unconfirmed` to internal hypothesis use.
5. Run `publicClaims` before any public handoff.

## Output

Return the ProductFactPack, safe public claims and blocked claims with reasons.

## Stop Conditions

- Stop if an unconfirmed or inferred fact requests a public use.
- Stop if a price, availability, testimonial, comparison or result lacks current evidence.
- Publication remains disabled until explicit human approval.
```

- [ ] **Step 5: Create the plugin README**

````markdown
# KAIZEN7 Content Commerce

Foundation plugin for verified content-commerce work.

This delivery provides four contracts and four skills: brand foundation, opportunity research, commerce brief and product fact verification. It does not publish, spend, connect credentials, mutate a store or generate production creative.

KAIZEN7 coordinates. Flowmatik executes creative work. THE FOCUX or another external project receives business value. The operator remains the final authority.

Validation:

```bash
npm run k7:content-commerce:check
```
````

- [ ] **Step 6: Add the plugin root to metadata-only skill discovery**

Replace the default `roots` array in `lib/skill-router.js` with:

```js
const roots = options.roots || [
  path.join(process.cwd(), ".agents", "skills"),
  path.join(process.cwd(), ".codex", "skills"),
  path.join(process.cwd(), "plugins", "kaizen7-content-commerce", "skills"),
];
```

Append to `tests/skill-router.test.js` before the final log:

```js
const pluginSkillsRoot = path.join(root, "plugins", "kaizen7-content-commerce", "skills");
fs.mkdirSync(path.join(pluginSkillsRoot, "product-fact-verification"), { recursive: true });
fs.writeFileSync(path.join(pluginSkillsRoot, "product-fact-verification", "SKILL.md"), [
  "---",
  "name: product-fact-verification",
  "description: Verify product facts and block unsupported public claims.",
  "---",
  "# Product Fact Verification",
].join("\n"));

const withPlugin = indexSkills({ roots: [skillsRoot, codexSkillsRoot, pluginSkillsRoot] });
assert(withPlugin.some((skill) => skill.name === "product-fact-verification"));
```

- [ ] **Step 7: Run plugin validation and commit**

Run:

```bash
node tests/skill-router.test.js
node tests/k7-content-commerce-plugin.test.js
git diff --check
```

Expected: both test logs report passed; no whitespace errors.

Commit:

```bash
git add .agents/plugins/marketplace.json plugins/kaizen7-content-commerce lib/skill-router.js tests/skill-router.test.js tests/k7-content-commerce-plugin.test.js
git commit -m "Add content commerce foundation plugin"
```

---

### Task 5: Route compound content-commerce missions through One Door

**Files:**
- Modify: `data/k7-loop-policy.json`
- Modify: `lib/k7-loop-system.js`
- Modify: `lib/k7-action-reaction-loop.js`
- Modify: `tests/k7-loop-system.test.js`
- Modify: `tests/k7-action-reaction-loop.test.js`
- Modify: `tests/k7-one-door.test.js`

**Interfaces:**
- Consumes: objective text and the Loop OS policy.
- Produces: `profileFor(preflight, policy) -> "content_commerce"` only when one content term and one commerce term both match; TaskContract `context_refs` with exactly the four Foundation skill paths.

- [ ] **Step 1: Add failing policy assertions**

Update the expected sorted profile list in `tests/k7-loop-system.test.js`:

```js
assert.deepEqual(Object.keys(policy.profiles).sort(), [
  "commerce",
  "content_commerce",
  "creative",
  "general",
  "memory",
  "research",
  "technical",
  "tool",
]);
assert(policy.profiles.content_commerce.stages.includes("approve"));
assert.equal(policy.profiles.content_commerce.skill_refs.length, 4);
assert(policy.profiles.content_commerce.pattern_groups.content.includes("contenido"));
assert(policy.profiles.content_commerce.pattern_groups.commerce.includes("producto"));
```

- [ ] **Step 2: Add failing compound-routing assertions**

Append to `tests/k7-action-reaction-loop.test.js`:

```js
const compound = buildLoopTask({
  objective: "crear contenido para vender este producto en Shopify",
  route: "answer_from_context",
  recommendation: "Create a verified Foundation pack.",
  approval_needed: false,
  verification: "Foundation contracts validate.",
}, loadLoopPolicy());
assert.equal(compound.loop.profile, "content_commerce");
assert.equal(compound.owner, "flowmatik");
assert.equal(compound.context_refs.length, 4);
assert(compound.context_refs.every((ref) => ref.includes("plugins/kaizen7-content-commerce/skills/")));

const creativeOnly = buildLoopTask({
  objective: "crear un vídeo vertical cinematográfico",
  route: "answer_from_context",
  recommendation: "Create a video brief.",
  approval_needed: false,
  verification: "Creative brief exists.",
}, loadLoopPolicy());
assert.equal(creativeOnly.loop.profile, "creative");

const commerceOnly = buildLoopTask({
  objective: "analizar el margen de la tienda",
  route: "answer_from_context",
  recommendation: "Analyze store economics.",
  approval_needed: false,
  verification: "Economics are sourced.",
}, loadLoopPolicy());
assert.equal(commerceOnly.loop.profile, "commerce");
```

Ensure the test imports `buildLoopTask` from `../lib/k7-action-reaction-loop` and `loadLoopPolicy` from `../lib/k7-loop-system`.

- [ ] **Step 3: Add failing One Door assertions**

Append to `tests/k7-one-door.test.js`:

```js
const contentCommerce = runOneDoor("crear contenido para vender este producto en Shopify", {
  root,
  now: "2026-07-24T00:00:00.000Z",
});
assert.equal(contentCommerce.task_contract.loop.profile, "content_commerce");
assert.equal(contentCommerce.executor, "flowmatik");
assert.equal(contentCommerce.task_contract.context_refs.length, 4);
assert.equal(contentCommerce.operator_contract.principal.role, "final_human_authority");

const publishGate = runOneDoor("crear y publicar contenido para vender este producto", {
  root,
  now: "2026-07-24T00:00:00.000Z",
});
assert.equal(publishGate.status, "approval_required");
assert.equal(publishGate.executor, "human");
assert.equal(publishGate.task_contract, null);
```

- [ ] **Step 4: Run focused tests and verify RED**

Run:

```bash
node tests/k7-loop-system.test.js
node tests/k7-action-reaction-loop.test.js
node tests/k7-one-door.test.js
```

Expected: failures mention missing `content_commerce` profile or wrong `creative`/`commerce` profile.

- [ ] **Step 5: Add the compound profile to the policy**

Insert this profile between `commerce` and `creative` in `data/k7-loop-policy.json`:

```json
"content_commerce": {
  "routes": [],
  "patterns": [],
  "pattern_groups": {
    "content": ["contenido", "content", "video", "guion", "copy", "creativ", "reel", "tiktok", "short"],
    "commerce": ["ecommerce", "commerce", "shopify", "producto", "oferta", "venta", "listing", "tienda", "conversion"]
  },
  "skill_refs": [
    "plugins/kaizen7-content-commerce/skills/brand-foundation/SKILL.md",
    "plugins/kaizen7-content-commerce/skills/opportunity-research/SKILL.md",
    "plugins/kaizen7-content-commerce/skills/commerce-brief/SKILL.md",
    "plugins/kaizen7-content-commerce/skills/product-fact-verification/SKILL.md"
  ],
  "stages": ["signal", "opportunity", "product", "story", "content", "verify", "approve", "publish", "metrics", "learn"]
},
```

- [ ] **Step 6: Validate the new profile**

Add `"content_commerce"` to the required profile array in `validateLoopPolicy` and add:

```js
const compound = policy.profiles.content_commerce;
for (const group of ["content", "commerce"]) {
  if (!Array.isArray(compound.pattern_groups?.[group]) || compound.pattern_groups[group].length === 0) {
    throw new Error(`loop policy profiles.content_commerce.pattern_groups.${group} is required`);
  }
}
if (!Array.isArray(compound.skill_refs) || compound.skill_refs.length !== 4) {
  throw new Error("loop policy profiles.content_commerce.skill_refs must contain four Foundation skills");
}
```

- [ ] **Step 7: Implement compound selection and minimal context refs**

Add above `profileFor` in `lib/k7-action-reaction-loop.js`:

```js
function matchesAllPatternGroups(objective, profile = {}) {
  const groups = Object.values(profile.pattern_groups || {});
  return groups.length > 0 && groups.every((patterns) => (
    Array.isArray(patterns)
      && patterns.some((pattern) => objective.includes(normalize(pattern)))
  ));
}
```

Add immediately after `objective` in `profileFor`:

```js
if (matchesAllPatternGroups(objective, policy.profiles?.content_commerce)) {
  return "content_commerce";
}
```

Add immediately after `objective` in `ownerFor`:

```js
if (matchesAllPatternGroups(objective, policy.profiles?.content_commerce)) {
  return policy.roles.creative_executor;
}
```

Add this field to the `buildTaskContract` input in `buildLoopTask`:

```js
context_refs: policy.profiles[profile].skill_refs || [],
```

Export `matchesAllPatternGroups` from the module.

- [ ] **Step 8: Run GREEN and commit**

Run:

```bash
node tests/k7-loop-system.test.js
node tests/k7-action-reaction-loop.test.js
node tests/k7-one-door.test.js
node tests/k7-work-contracts.test.js
git diff --check
```

Expected: all focused tests pass; creative-only and commerce-only regressions remain correctly routed.

Commit:

```bash
git add data/k7-loop-policy.json lib/k7-loop-system.js lib/k7-action-reaction-loop.js tests/k7-loop-system.test.js tests/k7-action-reaction-loop.test.js tests/k7-one-door.test.js
git commit -m "Route content commerce foundation missions"
```

---

### Task 6: Add deterministic Foundation evaluation gates

**Files:**
- Create: `data/content-commerce/evaluation-policy.json`
- Create: `data/content-commerce/foundation-eval-cases.json`
- Create: `lib/k7-content-commerce-eval.js`
- Create: `tests/k7-content-commerce-eval.test.js`

**Interfaces:**
- Consumes: candidate score lanes, hard-gate booleans and context token counts.
- Produces: `evaluateContentCommerceCandidate(input, options?) -> { verdict, promotable, reasons }`.

- [ ] **Step 1: Write the failing evaluator test**

```js
// tests/k7-content-commerce-eval.test.js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  evaluateContentCommerceCandidate,
  loadEvaluationPolicy,
} = require("../lib/k7-content-commerce-eval");

const policy = loadEvaluationPolicy();
assert.equal(policy.schema, "kaizen7.content_commerce_evaluation_policy.v1");
assert.equal(policy.minimum_score, 80);
assert.equal(policy.minimum_baseline_gain, 10);
assert.equal(policy.require_source_non_regression, true);
assert.equal(policy.max_context_over_best_acceptable_pct, 25);
assert.equal(Object.values(policy.score_weights).reduce((sum, value) => sum + value, 0), 100);

const cases = JSON.parse(fs.readFileSync(
  path.join(process.cwd(), "data/content-commerce/foundation-eval-cases.json"),
  "utf8",
));
assert.equal(cases.schema, "kaizen7.content_commerce_eval_cases.v1");
assert.equal(cases.cases.length, 6);
assert.equal(new Set(cases.cases.map((item) => item.id)).size, 6);
assert(cases.cases.every((item) => item.delivery === "foundation"));

const promotable = evaluateContentCommerceCandidate({
  baseline_score: 70,
  source_score: 82,
  candidate_score: 84,
  best_acceptable_context_tokens: 1000,
  candidate_context_tokens: 1200,
  gates: {
    no_unverified_public_claims: true,
    no_unapproved_external_effects: true,
    license_traceable: true,
    contracts_valid: true,
    rollback_verified: true
  }
});
assert.equal(promotable.verdict, "promotable");
assert.equal(promotable.promotable, true);

const hold = evaluateContentCommerceCandidate({
  ...promotable.input,
  baseline_score: 78,
  source_score: 82,
  candidate_score: 84,
  best_acceptable_context_tokens: 1000,
  candidate_context_tokens: 1200,
  gates: promotable.input.gates
});
assert.equal(hold.verdict, "hold");
assert(hold.reasons.includes("baseline_gain_below_10"));

const rejectedClaim = evaluateContentCommerceCandidate({
  ...promotable.input,
  gates: { ...promotable.input.gates, no_unverified_public_claims: false }
});
assert.equal(rejectedClaim.verdict, "reject");
assert(rejectedClaim.reasons.includes("hard_gate_failed:no_unverified_public_claims"));

const rejectedContext = evaluateContentCommerceCandidate({
  ...promotable.input,
  candidate_context_tokens: 1300
});
assert.equal(rejectedContext.verdict, "reject");
assert(rejectedContext.reasons.includes("context_budget_exceeded"));

const rejectedSourceRegression = evaluateContentCommerceCandidate({
  ...promotable.input,
  source_score: 85,
  candidate_score: 84
});
assert.equal(rejectedSourceRegression.verdict, "reject");
assert(rejectedSourceRegression.reasons.includes("source_quality_regression"));

console.log("k7 content commerce eval tests passed");
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node tests/k7-content-commerce-eval.test.js
```

Expected: `MODULE_NOT_FOUND` for `../lib/k7-content-commerce-eval`.

- [ ] **Step 3: Create the evaluation policy**

```json
{
  "schema": "kaizen7.content_commerce_evaluation_policy.v1",
  "version": 1,
  "minimum_score": 80,
  "minimum_baseline_gain": 10,
  "require_source_non_regression": true,
  "max_context_over_best_acceptable_pct": 25,
  "score_weights": {
    "factual_fidelity_and_provenance": 25,
    "brand_consistency": 20,
    "utility_and_completeness": 20,
    "conversion_quality_without_manipulation": 15,
    "channel_fit": 10,
    "traceability_and_reviewability": 10
  },
  "hard_gates": [
    "no_unverified_public_claims",
    "no_unapproved_external_effects",
    "license_traceable",
    "contracts_valid",
    "rollback_verified"
  ]
}
```

- [ ] **Step 4: Create six frozen Foundation cases**

```json
{
  "schema": "kaizen7.content_commerce_eval_cases.v1",
  "version": 1,
  "cases": [
    {
      "id": "foundation-brand-01",
      "delivery": "foundation",
      "skill": "brand-foundation",
      "input": "Build a compact Flowmatik brand profile from supplied identity evidence.",
      "expected": ["versioned brand profile", "evidence refs", "approval owner"],
      "forbidden": ["credentials", "raw conversation", "invented audience fact"]
    },
    {
      "id": "foundation-brand-02",
      "delivery": "foundation",
      "skill": "brand-foundation",
      "input": "Update one durable visual rule without changing unrelated positioning.",
      "expected": ["version increment", "unchanged unrelated fields"],
      "forbidden": ["silent overwrite", "campaign idea stored as doctrine"]
    },
    {
      "id": "foundation-opportunity-01",
      "delivery": "foundation",
      "skill": "opportunity-research",
      "input": "Turn one sourced audience question into a scored opportunity.",
      "expected": ["source ref", "five scores", "audience need"],
      "forbidden": ["purchase intent claimed from popularity"]
    },
    {
      "id": "foundation-opportunity-02",
      "delivery": "foundation",
      "skill": "opportunity-research",
      "input": "Handle a trend claim whose evidence cannot be refreshed.",
      "expected": ["blocked or rejected status", "staleness reason"],
      "forbidden": ["trend presented as current"]
    },
    {
      "id": "foundation-facts-01",
      "delivery": "foundation",
      "skill": "product-fact-verification",
      "input": "Separate one sourced capability from one unsupported result claim.",
      "expected": ["verified_source", "unconfirmed", "safe public claims"],
      "forbidden": ["unsupported result in public use"]
    },
    {
      "id": "foundation-brief-01",
      "delivery": "foundation",
      "skill": "commerce-brief",
      "input": "Create one offer brief from a valid opportunity and fact pack.",
      "expected": ["one audience", "one CTA", "one metric", "fact refs"],
      "forbidden": ["unknown fact ref", "publishing authorization"]
    }
  ]
}
```

- [ ] **Step 5: Implement the evaluator**

```js
// lib/k7-content-commerce-eval.js
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_PATH = path.join(__dirname, "../data/content-commerce/evaluation-policy.json");

function loadEvaluationPolicy(options = {}) {
  const policy = JSON.parse(fs.readFileSync(options.filePath || DEFAULT_PATH, "utf8"));
  if (policy.schema !== "kaizen7.content_commerce_evaluation_policy.v1") {
    throw new Error("invalid content commerce evaluation policy schema");
  }
  if (!Number.isFinite(policy.minimum_score) || !Number.isFinite(policy.minimum_baseline_gain)) {
    throw new Error("content commerce evaluation thresholds are required");
  }
  if (!Array.isArray(policy.hard_gates) || policy.hard_gates.length === 0) {
    throw new Error("content commerce evaluation hard_gates are required");
  }
  if (Object.values(policy.score_weights || {}).reduce((sum, value) => sum + value, 0) !== 100) {
    throw new Error("content commerce evaluation score_weights must total 100");
  }
  return policy;
}

function finiteNumber(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
  return value;
}

function evaluateContentCommerceCandidate(input = {}, options = {}) {
  const policy = options.policy || loadEvaluationPolicy();
  const normalized = {
    baseline_score: finiteNumber(input.baseline_score, "baseline_score"),
    source_score: finiteNumber(input.source_score, "source_score"),
    candidate_score: finiteNumber(input.candidate_score, "candidate_score"),
    best_acceptable_context_tokens: finiteNumber(
      input.best_acceptable_context_tokens,
      "best_acceptable_context_tokens",
    ),
    candidate_context_tokens: finiteNumber(input.candidate_context_tokens, "candidate_context_tokens"),
    gates: { ...(input.gates || {}) },
  };
  const reasons = [];
  for (const gate of policy.hard_gates) {
    if (normalized.gates[gate] !== true) reasons.push(`hard_gate_failed:${gate}`);
  }
  const maxContext = normalized.best_acceptable_context_tokens
    * (1 + policy.max_context_over_best_acceptable_pct / 100);
  if (normalized.candidate_context_tokens > maxContext) reasons.push("context_budget_exceeded");
  if (policy.require_source_non_regression === true
      && normalized.candidate_score < normalized.source_score) {
    reasons.push("source_quality_regression");
  }
  if (reasons.length) {
    return { schema: "kaizen7.content_commerce_evaluation.v1", input: normalized, verdict: "reject", promotable: false, reasons };
  }
  if (normalized.candidate_score < policy.minimum_score) {
    reasons.push(`candidate_score_below_${policy.minimum_score}`);
  }
  const gain = normalized.candidate_score - normalized.baseline_score;
  if (gain < policy.minimum_baseline_gain) {
    reasons.push(`baseline_gain_below_${policy.minimum_baseline_gain}`);
  }
  const promotable = reasons.length === 0;
  return {
    schema: "kaizen7.content_commerce_evaluation.v1",
    input: normalized,
    verdict: promotable ? "promotable" : "hold",
    promotable,
    reasons: promotable ? ["quality_gain", "hard_gates_passed", "context_budget_passed"] : reasons,
  };
}

module.exports = {
  DEFAULT_PATH,
  evaluateContentCommerceCandidate,
  loadEvaluationPolicy,
};
```

- [ ] **Step 6: Run GREEN and commit**

Run:

```bash
node tests/k7-content-commerce-eval.test.js
node --check lib/k7-content-commerce-eval.js
git diff --check
```

Expected: evaluation tests pass and no syntax or whitespace errors are reported.

Commit:

```bash
git add data/content-commerce/evaluation-policy.json data/content-commerce/foundation-eval-cases.json lib/k7-content-commerce-eval.js tests/k7-content-commerce-eval.test.js
git commit -m "Add content commerce foundation evaluation"
```

---

### Task 7: Document, wire checks and verify Foundation end to end

**Files:**
- Create: `docs/CONTENT_COMMERCE_FOUNDATION.md`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: all artifacts from Tasks 1–6.
- Produces: one documented check command and a full repository verification receipt in the PR.

- [ ] **Step 1: Add the focused package script**

Add:

```json
"k7:content-commerce:check": "node --check lib/k7-content-commerce-vendors.js && node --check lib/k7-content-commerce-contracts.js && node --check lib/k7-content-commerce-store.js && node --check lib/k7-content-commerce-eval.js && node tests/k7-content-commerce-vendors.test.js && node tests/k7-content-commerce-contracts.test.js && node tests/k7-content-commerce-store.test.js && node tests/k7-content-commerce-plugin.test.js && node tests/k7-content-commerce-eval.test.js"
```

Change `k7:check` to:

```json
"k7:check": "npm run check && npm run k7:content-commerce:check && npm run k7:smoke && npm run k7:ready"
```

- [ ] **Step 2: Create the operator guide**

````markdown
# KAIZEN7 Content Commerce Foundation

Foundation turns a mixed content-and-commerce objective into four reviewable contracts:

```text
BrandProfile -> ProductFactPack -> OpportunityBrief -> CommerceBrief
```

Use One Door:

```bash
npm run k7 -- do "crear contenido para vender este producto en Shopify" --json
```

Expected route:

- loop profile: `content_commerce`
- executor: `flowmatik`
- context: four Foundation skills only
- authority: operator contract from `data/operator-constitution.json`

Foundation stores live state only in Git-ignored runtime files:

- BrandProfile and ProductFactPack: `data/product-genome.json`
- OpportunityBrief and CommerceBrief: `data/kaizen-workspace.json`

Foundation does not generate production creative, bind connectors, publish, spend, use credentials or mutate a store.

Validate:

```bash
npm run k7:content-commerce:check
npm run k7:check
```

Rollback:

1. Remove `content_commerce` from `data/k7-loop-policy.json`.
2. Remove the plugin marketplace entry.
3. Keep local runtime records for audit.
4. Confirm creative-only and commerce-only tests still pass.
````

- [ ] **Step 3: Add a concise README entry**

Add under the One Door section:

```markdown
### Content Commerce Foundation

Mixed content-and-product objectives can use the bounded `content_commerce` profile. It loads four focused Foundation skills, separates public facts from hypotheses and stops before publishing or any other external effect. See `docs/CONTENT_COMMERCE_FOUNDATION.md`.
```

- [ ] **Step 4: Run focused and integration checks**

Run:

```bash
npm run k7:content-commerce:check
node tests/k7-loop-system.test.js
node tests/k7-action-reaction-loop.test.js
node tests/k7-one-door.test.js
node tests/skill-router.test.js
node tests/runtime-init.test.js
```

Expected: every command exits `0` and each test prints its passed message.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm run k7:check
git diff --check
git status --short
```

Expected:

- `npm run k7:check` exits `0`.
- KAIZEN7 smoke status is `pass`.
- Production readiness is `ready`.
- `git diff --check` emits no output.
- `git status --short` lists only Foundation files from this plan.

- [ ] **Step 6: Verify rollback behavior without changing the branch**

Run a temporary-policy Node probe:

```bash
node - <<'NODE'
const fs = require("node:fs");
const { profileFor } = require("./lib/k7-action-reaction-loop");
const policy = JSON.parse(fs.readFileSync("data/k7-loop-policy.json", "utf8"));
delete policy.profiles.content_commerce;
const result = profileFor({
  objective: "crear contenido para vender este producto en Shopify",
  route: "answer_from_context",
}, policy);
if (!["creative", "commerce"].includes(result)) {
  throw new Error(`rollback fallback failed: ${result}`);
}
console.log(`rollback fallback: ${result}`);
NODE
```

Expected: `rollback fallback: commerce` or `rollback fallback: creative`.

- [ ] **Step 7: Commit the completed Foundation delivery**

```bash
git add package.json README.md docs/CONTENT_COMMERCE_FOUNDATION.md
git commit -m "Document content commerce foundation"
```

- [ ] **Step 8: Prepare the PR evidence**

The PR body must contain:

```markdown
## Mission

Implement KAIZEN7 Content Commerce Foundation from the approved design and plan.

## Scope

Vendor governance, four Foundation contracts, local runtime persistence, role plugin, four skills, compound One Door routing and deterministic promotion gates.

## Explicit exclusions

No creative production, connector binding, publishing, spending, credentials, store mutation, paid API or external project implementation.

## Verification

- `npm run k7:content-commerce:check`
- `npm run k7:check`
- `git diff --check`
- rollback probe

## Risks

- Compound keyword routing is deterministic and covered by creative-only and commerce-only regressions.
- Vendor pins become stale by design and require manual reevaluation.
- Runtime writes are local and atomic but are not a multi-process database.

## Memory recommendation

After human review and merge, record that `content_commerce` is the canonical mixed content-and-product route and that its four Foundation contracts precede creative production.
```

---

## Plan Completion Gate

Foundation is complete only when:

- all seven tasks are committed independently;
- the operator constitution is present and One Door exposes final human authority;
- the compound objective routes to `content_commerce`;
- creative-only and commerce-only objectives retain their original profiles;
- exactly four Foundation skill refs enter the TaskContract;
- unsupported public claims fail closed;
- runtime writes touch only existing Git-ignored state files;
- the evaluator rejects a hard-gate failure and excessive context;
- focused checks and `npm run k7:check` pass;
- the rollback probe returns a safe legacy profile;
- the implementation PR remains unmerged until human review.
