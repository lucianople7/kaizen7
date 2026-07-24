# Luciano Operator Constitution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every KAIZEN7 One Door mission a small, validated contract that preserves Luciano López Barba's purpose, final authority, project boundaries and non-toxic operating rules.

**Architecture:** Store durable, non-sensitive operator policy in one versioned JSON file. A focused CommonJS loader validates and compresses it, and One Door attaches the compact projection to every mission without weakening existing approval gates.

**Tech Stack:** Node.js 20+, CommonJS, JSON, `node:assert/strict`, existing script-based test suite.

## Global Constraints

- No new runtime dependency, API, provider, credential, deployment or external publication.
- The canonical intent is exactly `Cuanto mejor va el proyecto, mejor va mi vida.`
- Luciano López Barba is `final_human_authority`.
- KAIZEN7 coordinates; Flowmatik Studio creates; THE FOCUX receives public/business value; Kaizen is the visible avatar.
- Projects remain separate repositories and responsibilities.
- The constitution contains no secrets, credentials, raw conversations, health, family, housing, financial or identity-document data.
- Existing spending, publishing, credential, deletion, deployment and legal-risk gates cannot be weakened.
- A missing, malformed or unsupported constitution fails closed with an explicit error code.
- Preserve unrelated working-tree changes in `lib/k7-receipt-ledger.js`, `tests/k7-preflight.test.js` and `tests/k7-receipt-ledger.test.js`.
- Use TDD for every behavior change and commit only files owned by each task.

---

## File Structure

- Create `data/operator-constitution.json`: canonical, non-sensitive human authority and operating policy.
- Create `lib/k7-operator-constitution.js`: validate the canonical file and produce the compact runtime contract.
- Create `tests/k7-operator-constitution.test.js`: verify schema, privacy exclusions, error codes and compact output.
- Modify `lib/k7-one-door.js`: attach the compact operator contract to every mission.
- Modify `tests/k7-one-door.test.js`: prove technical, creative and gated missions preserve Luciano's authority.
- Modify `package.json`: register the new module and test in the main check surface.
- Modify `AGENTS.md`: tell agents where the canonical operator contract lives.
- Modify `KAIZEN7_CONTEXT.md`: document the human-root relationship.
- Modify `README.md`: document the operator contract without presenting Luciano as a public brand.
- Create `docs/verification/2026-07-23-operator-constitution-receipt.md`: record actual verification.

### Task 1: Canonical constitution and validated compact loader

**Files:**
- Create: `data/operator-constitution.json`
- Create: `lib/k7-operator-constitution.js`
- Create: `tests/k7-operator-constitution.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `loadOperatorConstitution(options?) -> Readonly<object>`.
- Produces: `buildOperatorContract(options?) -> object`.
- Accepts: optional `{ filePath: string }` for isolated tests or an approved alternate constitution.
- Throws: `K7_OPERATOR_CONSTITUTION_MISSING`, `K7_OPERATOR_CONSTITUTION_INVALID`, `K7_OPERATOR_AUTHORITY_INVALID` or `K7_OPERATOR_CONSTITUTION_VERSION`.

- [ ] **Step 1: Write the failing loader tests**

Create `tests/k7-operator-constitution.test.js`:

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildOperatorContract,
  loadOperatorConstitution,
} = require("../lib/k7-operator-constitution");

const constitution = loadOperatorConstitution();
assert.equal(constitution.schema, "kaizen7.operator_constitution.v1");
assert.equal(constitution.version, 1);
assert.equal(constitution.operator.name, "Luciano López Barba");
assert.equal(constitution.operator.role, "final_human_authority");
assert.equal(
  constitution.intent,
  "Cuanto mejor va el proyecto, mejor va mi vida.",
);

const contract = buildOperatorContract();
assert.equal(contract.schema, "kaizen7.operator_contract.v1");
assert.deepEqual(contract.principal, {
  id: "luciano-lopez-barba",
  name: "Luciano López Barba",
  role: "final_human_authority",
});
assert.equal(
  contract.recommendation_policy,
  "recommend_best_supported_route_first",
);
assert(contract.protected_values.includes("calm"));
assert(contract.protected_values.includes("privacy"));
assert.equal(
  contract.ecosystem_roles["Flowmatik Studio"],
  "creative_factory_and_audiovisual_execution",
);
assert.equal(
  contract.ecosystem_roles["THE FOCUX"],
  "public_brand_and_business_value_receiver",
);
assert.equal(
  Object.prototype.hasOwnProperty.call(contract, "privacy"),
  false,
);
assert(!JSON.stringify(contract).includes("raw_conversation"));

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-operator-"));
const missingPath = path.join(temporaryRoot, "missing.json");
assert.throws(
  () => loadOperatorConstitution({ filePath: missingPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_MISSING",
);

const malformedPath = path.join(temporaryRoot, "malformed.json");
fs.writeFileSync(malformedPath, "{");
assert.throws(
  () => loadOperatorConstitution({ filePath: malformedPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_INVALID",
);

const invalidRolePath = path.join(temporaryRoot, "invalid-role.json");
fs.writeFileSync(invalidRolePath, JSON.stringify({
  ...constitution,
  operator: { ...constitution.operator, role: "autonomous_agent" },
}));
assert.throws(
  () => loadOperatorConstitution({ filePath: invalidRolePath }),
  (error) => error.code === "K7_OPERATOR_AUTHORITY_INVALID",
);

const forbiddenPath = path.join(temporaryRoot, "forbidden.json");
fs.writeFileSync(forbiddenPath, JSON.stringify({
  ...constitution,
  private_profile: { health: "must never be stored here" },
}));
assert.throws(
  () => loadOperatorConstitution({ filePath: forbiddenPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_INVALID"
    && error.field === "private_profile.health",
);

const versionPath = path.join(temporaryRoot, "version.json");
fs.writeFileSync(versionPath, JSON.stringify({
  ...constitution,
  version: 2,
}));
assert.throws(
  () => loadOperatorConstitution({ filePath: versionPath }),
  (error) => error.code === "K7_OPERATOR_CONSTITUTION_VERSION",
);

console.log("k7 operator constitution tests passed");
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node tests/k7-operator-constitution.test.js
```

Expected: FAIL with `Cannot find module '../lib/k7-operator-constitution'`.

- [ ] **Step 3: Create the canonical non-sensitive constitution**

Create `data/operator-constitution.json`:

```json
{
  "schema": "kaizen7.operator_constitution.v1",
  "version": 1,
  "operator": {
    "id": "luciano-lopez-barba",
    "name": "Luciano López Barba",
    "role": "final_human_authority",
    "public_persona": false
  },
  "intent": "Cuanto mejor va el proyecto, mejor va mi vida.",
  "mission": "Build a healthy, intelligent, elegant and durable ecosystem that converts better decisions into real project progress.",
  "protected_values": [
    "truth",
    "time",
    "calm",
    "privacy",
    "autonomy",
    "quality",
    "continuity"
  ],
  "ecosystem_roles": {
    "KAIZEN7": "canonical_coordinator_memory_and_decision_system",
    "Flowmatik Studio": "creative_factory_and_audiovisual_execution",
    "THE FOCUX": "public_brand_and_business_value_receiver",
    "Kaizen": "visible_avatar_and_continuity_symbol",
    "providers_frameworks_agents": "replaceable_tools"
  },
  "decision_contract": {
    "recommendation_policy": "recommend_best_supported_route_first",
    "resolve_without_human_when": [
      "the answer is safely verifiable",
      "the action is read-only",
      "the action is reversible and inside the approved project scope"
    ],
    "escalate_when": [
      "human preference materially changes the result",
      "scope or authority must expand",
      "spending or paid services are involved",
      "publishing or external messaging is involved",
      "credentials or private data are involved",
      "deployment, deletion or irreversible effects are involved",
      "legal, claims or safety risk is material"
    ],
    "output_contract": [
      "lead with one recommendation",
      "state evidence risk and real status",
      "avoid filler repeated summaries and generic menus",
      "return one executable next action",
      "define a stop condition and verification"
    ]
  },
  "authority_gates": [
    "spend",
    "publish",
    "external_message",
    "credential_use_or_write",
    "deploy",
    "delete",
    "irreversible_external_effect",
    "legal_or_high_stakes_claim"
  ],
  "non_toxic_rules": [
    "reject manipulative addictive hostile deceptive or privacy-invasive defaults",
    "prefer one coherent route over overlapping tools",
    "prefer local open and portable foundations when quality is sufficient",
    "keep providers frameworks and agents replaceable",
    "promote learning only after evidence and verification",
    "reject project improvements that damage operator wellbeing autonomy or control"
  ],
  "privacy": {
    "store_only": "durable non-sensitive operating decisions",
    "excluded_categories": [
      "secrets and credentials",
      "raw conversations",
      "health and medical information",
      "family information",
      "housing information",
      "financial and banking information",
      "identity documents"
    ]
  },
  "success_contract": [
    "same or better outcome with fewer steps",
    "less repeated context and fewer tokens",
    "clear truthful readiness",
    "one coherent route across projects",
    "verified reusable learning",
    "project progress that supports operator life"
  ]
}
```

- [ ] **Step 4: Implement validation and compact projection**

Create `lib/k7-operator-constitution.js`:

```js
const fs = require("node:fs");
const path = require("node:path");

const EXPECTED_SCHEMA = "kaizen7.operator_constitution.v1";
const EXPECTED_VERSION = 1;
const EXPECTED_AUTHORITY = "final_human_authority";
const DEFAULT_PATH = path.join(__dirname, "../data/operator-constitution.json");
const FORBIDDEN_FIELD = /(^|_)(secret|secrets|credential|credentials|token|password|health|medical|family|housing|financial|bank|banking|identity_document|identity_documents|raw_conversation|raw_conversations)(_|$)/i;

function contractError(code, message, details = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function findForbiddenField(value, trail = []) {
  if (!value || typeof value !== "object") return "";
  for (const [key, nested] of Object.entries(value)) {
    const nextTrail = [...trail, key];
    if (FORBIDDEN_FIELD.test(key)) return nextTrail.join(".");
    const found = findForbiddenField(nested, nextTrail);
    if (found) return found;
  }
  return "";
}

function requireString(value, field) {
  if (!String(value || "").trim()) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Operator constitution requires ${field}`,
      { field },
    );
  }
}

function requireNonEmptyArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Operator constitution requires non-empty ${field}`,
      { field },
    );
  }
}

function validateOperatorConstitution(constitution) {
  if (!constitution || typeof constitution !== "object" || Array.isArray(constitution)) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      "Operator constitution must be an object",
    );
  }
  if (constitution.schema !== EXPECTED_SCHEMA) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Unsupported operator constitution schema: ${constitution.schema || "missing"}`,
      { field: "schema" },
    );
  }
  if (constitution.version !== EXPECTED_VERSION) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_VERSION",
      `Unsupported operator constitution version: ${constitution.version}`,
      { expectedVersion: EXPECTED_VERSION },
    );
  }
  requireString(constitution.operator?.id, "operator.id");
  requireString(constitution.operator?.name, "operator.name");
  if (constitution.operator?.role !== EXPECTED_AUTHORITY) {
    throw contractError(
      "K7_OPERATOR_AUTHORITY_INVALID",
      `Operator role must be ${EXPECTED_AUTHORITY}`,
      { field: "operator.role" },
    );
  }
  requireString(constitution.intent, "intent");
  requireString(
    constitution.decision_contract?.recommendation_policy,
    "decision_contract.recommendation_policy",
  );
  requireNonEmptyArray(constitution.protected_values, "protected_values");
  requireNonEmptyArray(constitution.authority_gates, "authority_gates");
  if (
    !constitution.ecosystem_roles
    || typeof constitution.ecosystem_roles !== "object"
    || Array.isArray(constitution.ecosystem_roles)
  ) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      "Operator constitution requires ecosystem_roles",
      { field: "ecosystem_roles" },
    );
  }
  const forbidden = findForbiddenField(constitution);
  if (forbidden) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Forbidden sensitive field in operator constitution: ${forbidden}`,
      { field: forbidden },
    );
  }
  return constitution;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function loadOperatorConstitution(options = {}) {
  const filePath = options.filePath || DEFAULT_PATH;
  if (!fs.existsSync(filePath)) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_MISSING",
      `Operator constitution not found: ${filePath}`,
      { filePath },
    );
  }
  let constitution;
  try {
    constitution = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (cause) {
    throw contractError(
      "K7_OPERATOR_CONSTITUTION_INVALID",
      `Operator constitution is not valid JSON: ${filePath}`,
      { filePath, cause },
    );
  }
  validateOperatorConstitution(constitution);
  return deepFreeze(constitution);
}

function buildOperatorContract(options = {}) {
  const constitution = loadOperatorConstitution(options);
  return deepFreeze({
    schema: "kaizen7.operator_contract.v1",
    principal: {
      id: constitution.operator.id,
      name: constitution.operator.name,
      role: constitution.operator.role,
    },
    intent: constitution.intent,
    recommendation_policy: constitution.decision_contract.recommendation_policy,
    authority_gates: [...constitution.authority_gates],
    protected_values: [...constitution.protected_values],
    ecosystem_roles: { ...constitution.ecosystem_roles },
  });
}

module.exports = {
  DEFAULT_PATH,
  buildOperatorContract,
  findForbiddenField,
  loadOperatorConstitution,
  validateOperatorConstitution,
};
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
node tests/k7-operator-constitution.test.js
```

Expected: `k7 operator constitution tests passed`.

- [ ] **Step 6: Register the module and test in the main check surface**

Add these commands to the existing `check` script in `package.json`:

```text
node --check lib/k7-operator-constitution.js
node tests/k7-operator-constitution.test.js
```

Run:

```bash
npm run check
```

Expected: the existing suite and `k7 operator constitution tests passed`.

- [ ] **Step 7: Commit Task 1**

```bash
git add data/operator-constitution.json lib/k7-operator-constitution.js tests/k7-operator-constitution.test.js package.json
git commit -m "feat: add Luciano operator constitution"
```

### Task 2: Attach the operator contract to One Door

**Files:**
- Modify: `lib/k7-one-door.js`
- Modify: `tests/k7-one-door.test.js`

**Interfaces:**
- Consumes: `buildOperatorContract({ filePath? })` from `lib/k7-operator-constitution.js`.
- Produces: `runOneDoor()` envelopes with `operator_contract`.
- Preserves: current One Door schema, loop selection, executors, approval gates, evidence and receipts.

- [ ] **Step 1: Add failing One Door assertions**

In `tests/k7-one-door.test.js`, add these assertions after the existing
technical mission assertions:

```js
assert.equal(
  technical.operator_contract.principal.name,
  "Luciano López Barba",
);
assert.equal(
  technical.operator_contract.principal.role,
  "final_human_authority",
);
assert.equal(
  technical.operator_contract.intent,
  "Cuanto mejor va el proyecto, mejor va mi vida.",
);
assert.equal(
  technical.operator_contract.recommendation_policy,
  "recommend_best_supported_route_first",
);
assert.equal(
  technical.operator_contract.ecosystem_roles.KAIZEN7,
  "canonical_coordinator_memory_and_decision_system",
);
```

Add after the creative assertions:

```js
assert.equal(
  creative.operator_contract.ecosystem_roles["Flowmatik Studio"],
  "creative_factory_and_audiovisual_execution",
);
assert.equal(
  creative.operator_contract.ecosystem_roles["THE FOCUX"],
  "public_brand_and_business_value_receiver",
);
```

Add after the gated assertions:

```js
assert.equal(
  gated.operator_contract.principal.role,
  "final_human_authority",
);
assert(gated.operator_contract.authority_gates.includes("spend"));
assert(gated.operator_contract.authority_gates.includes("publish"));
assert.equal(gated.executor, "human");
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node tests/k7-one-door.test.js
```

Expected: FAIL because `operator_contract` is undefined.

- [ ] **Step 3: Attach the compact contract without changing authority**

At the top of `lib/k7-one-door.js`, add:

```js
const { buildOperatorContract } = require("./k7-operator-constitution");
```

Inside `runOneDoor()`, after `const request = normalizeOneDoorInput(input);`,
add:

```js
const operatorContract = buildOperatorContract({
  filePath: options.operatorConstitutionPath,
});
```

In the returned One Door envelope, immediately after `request`, add:

```js
operator_contract: operatorContract,
```

In `formatOneDoor()`, after the objective line, add:

```js
`Authority: ${envelope.operator_contract?.principal?.name || ""} (${envelope.operator_contract?.principal?.role || ""})`,
```

Do not use `operator_contract` to bypass or replace `loop.status`,
`policy.roles.authority`, `approval_required` or any existing gate.

- [ ] **Step 4: Run One Door and CLI regression tests**

Run:

```bash
node tests/k7-one-door.test.js
node tests/k7-cli.test.js
```

Expected:

- `k7 one door tests passed`;
- `k7 cli tests passed`.

- [ ] **Step 5: Run a real compact mission**

Run:

```bash
npm run k7 -- do "mejora KAIZEN7 con menos pasos" --json
```

Expected:

- output schema remains `kaizen7.one_door.v1`;
- `operator_contract.principal.role` is `final_human_authority`;
- intent is present;
- no credential or raw conversation appears;
- one `next_action` is present.

- [ ] **Step 6: Commit Task 2**

```bash
git add lib/k7-one-door.js tests/k7-one-door.test.js
git commit -m "feat: connect operator constitution to One Door"
```

### Task 3: Canonical documentation and verification receipt

**Files:**
- Modify: `AGENTS.md`
- Modify: `KAIZEN7_CONTEXT.md`
- Modify: `README.md`
- Create: `docs/verification/2026-07-23-operator-constitution-receipt.md`

**Interfaces:**
- Documents: the canonical source, internal-only identity boundary and runtime path.
- Produces: one evidence receipt with observed test results.

- [ ] **Step 1: Point agents to the canonical human contract**

In `AGENTS.md`, after the Canonical Identity code block, add:

```markdown
The canonical human authority contract is
`data/operator-constitution.json`. Agents consume its compact projection through
One Door; they must not reconstruct Luciano's priorities from raw conversation
history or weaken its authority gates.
```

- [ ] **Step 2: Document the human-root relationship**

In `KAIZEN7_CONTEXT.md`, after the opening identity code block, add:

````markdown
## Human Root

`data/operator-constitution.json` is the canonical, non-sensitive operating
contract for Luciano López Barba:

```text
Cuanto mejor va el proyecto, mejor va mi vida.
```

It makes Luciano the final human authority, keeps providers replaceable and
protects time, calm, privacy and autonomy. One Door exposes only a compact
projection; it does not load raw conversations or private personal data.
````

- [ ] **Step 3: Document the public/internal boundary**

Add this subsection near the One Door documentation in `README.md`:

````markdown
### Operator Constitution

KAIZEN7 One Door includes a compact contract derived from
`data/operator-constitution.json`. It identifies Luciano López Barba as the
final human authority and preserves the ecosystem relationship:

```text
Luciano -> KAIZEN7 -> Flowmatik Studio -> THE FOCUX
                    -> Kaizen as visible avatar
```

The constitution is internal operating policy, not a public persona. It stores
no credentials, raw conversations or sensitive personal data and grants no new
permission to spend, publish, deploy, delete or use credentials.
````

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
node tests/k7-operator-constitution.test.js
node tests/k7-one-door.test.js
node tests/k7-cli.test.js
npm run k7:check
git diff --check
```

Expected:

- all three focused tests pass;
- smoke status is `pass`;
- production readiness is `ready`;
- blockers are `0`;
- `git diff --check` returns no output.

- [ ] **Step 5: Create the verification receipt with actual results**

Create `docs/verification/2026-07-23-operator-constitution-receipt.md`.
Use the actual outputs from Step 4 and this exact structure:

```markdown
# Operator Constitution Verification Receipt

- Mission: Connect Luciano López Barba to KAIZEN7 One Door
- Result: verified | blocked
- Canonical intent exact match: pass | fail
- Final human authority preserved: pass | fail
- Technical mission contract: pass | fail
- Creative mission contract: pass | fail
- Approval-required mission contract: pass | fail
- Sensitive fields rejected: pass | fail
- Raw conversation stored: no
- Paid API calls: none
- Credentials read or written: none
- Full command: `npm run k7:check`
- Full command result: pass | fail
- Blockers: 0 | exact blocker
- Next recommendation: execute the truthful runtime/provider plan
```

If any required check fails, set `Result: blocked`, record the exact failure and
do not claim completion.

- [ ] **Step 6: Verify scope before committing**

Run:

```bash
git status --short
git diff --check
git log -6 --oneline
```

Expected: only files from this plan and the preserved unrelated receipt-ledger
changes are visible. No secret, generated runtime state or private file is
staged.

- [ ] **Step 7: Commit Task 3**

```bash
git add AGENTS.md KAIZEN7_CONTEXT.md README.md docs/verification/2026-07-23-operator-constitution-receipt.md
git commit -m "docs: verify operator constitution"
```

## Final Acceptance

The feature is complete only when:

1. `data/operator-constitution.json` is the single source of truth.
2. Every One Door mission exposes the compact `operator_contract`.
3. Luciano remains final authority in technical, creative and gated missions.
4. The contract contains no sensitive data or raw conversations.
5. Existing approval gates and project separation remain unchanged.
6. Focused tests and `npm run k7:check` pass.
7. The receipt records actual evidence and exactly one next recommendation.
