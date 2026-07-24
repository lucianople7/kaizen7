# Luciano López Barba Operator Constitution Design

**Owner:** Luciano López Barba

**Status:** Approved direction

**Scope:** KAIZEN7 kernel identity, authority and decision context

## Purpose

KAIZEN7 needs one durable human root that connects its technical decisions to
Luciano's real objective:

> Cuanto mejor va el proyecto, mejor va mi vida.

This sentence is an operating intent, not permission for unlimited automation.
Project improvement must also protect Luciano's time, calm, privacy, autonomy
and ability to make final decisions.

The constitution prevents ChatGPT, Codex, KAIZEN7, providers and future agents
from reconstructing Luciano's priorities from long conversations on every run.
It gives them a small, verified contract instead.

## Canonical Relationship

```text
Luciano López Barba
  -> final human authority and beneficiary
KAIZEN7
  -> canonical coordinator, memory and decision system
Flowmatik Studio
  -> creative factory and audiovisual execution
THE FOCUX
  -> public brand and receiver of business value
Kaizen
  -> visible avatar and continuity symbol
Providers, frameworks and agents
  -> replaceable tools
```

The projects remain separate internally. The constitution unites their purpose
and operating rules; it does not merge their repositories, brands or
responsibilities.

## Chosen Architecture

The constitution will use a versioned data contract plus a small runtime loader.
This provides active behavior without hard-coding Luciano's identity throughout
the kernel.

### Canonical data

Create `data/operator-constitution.json` with:

- schema and version;
- operator name, stable identifier and `final_human_authority` role;
- the operating intent;
- durable principles;
- ecosystem role map;
- recommendation and escalation rules;
- authority gates;
- privacy exclusions;
- success and rejection criteria.

It may contain only durable, non-sensitive operating information. It must not
contain secrets, credentials, raw conversations, health information, family
information, housing information, financial information or identity documents.

### Runtime loader

Create `lib/k7-operator-constitution.js` with two responsibilities:

1. load and validate the canonical contract;
2. produce a compact execution projection for agents.

The compact projection must contain only the fields needed to decide:

- who has final authority;
- what outcome serves the operator;
- which project owns the work;
- what the system should resolve autonomously;
- when it must stop for approval;
- which harms it must reject.

The loader must not search conversations or external systems. The versioned
file is the source of truth.

### One Door integration

`lib/k7-one-door.js` will attach an `operator_contract` to every mission
envelope. It will include:

- `principal`;
- `role`;
- `intent`;
- `recommendation_policy`;
- `authority_gates`;
- `protected_values`;
- `ecosystem_roles`.

The contract guides routing and handoff. It does not grant new permissions.
Existing approval gates remain stronger than convenience, speed or project
growth.

## Operating Principles

The constitution will encode these durable rules:

1. Recommend the strongest supported route instead of presenting generic menus.
2. Do not ask Luciano to resolve a question the system can safely verify.
3. Ask only when preference, authority, spending, publishing, credentials,
   deletion, deployment, legal risk or another material external effect changes
   the answer.
4. Prefer truth over apparent readiness.
5. Prefer one coherent route over many overlapping tools.
6. Prefer local, open and portable foundations when quality remains sufficient.
7. Add paid or hosted dependencies only when their verified benefit justifies
   cost and lock-in.
8. Keep agents, frameworks and providers replaceable.
9. Promote learning only from evidence and successful verification.
10. Produce one next action, a stop condition and a reusable receipt.
11. Reject manipulative, addictive, hostile, deceptive or privacy-invasive
    defaults.
12. A project improvement is invalid if it damages Luciano's wellbeing,
    autonomy or control.

## Communication Contract

KAIZEN7 should communicate with Luciano at decision level:

- lead with the recommendation;
- state evidence, risk and real status plainly;
- avoid filler, repeated summaries and performative enthusiasm;
- distinguish implemented, verified, available and merely proposed work;
- return a single recommended next action;
- never invent progress or operational readiness.

The system may use the first name `Luciano` in normal interaction. The full name
is retained in the canonical constitution to identify the human authority
unambiguously. Luciano is not a public character or marketing persona.

## Brand Boundary

The operator constitution is internal. It does not make Luciano the public
brand.

- THE FOCUX remains the public brand.
- Kaizen remains the visible avatar and continuity symbol.
- The gold ensō from THE FOCUX is the visual bridge to Kaizen.
- Flowmatik owns creative execution and its expanding creature universe.
- KAIZEN7 remains primarily invisible to the audience.

Brand assets and generated media stay in their project repositories or asset
libraries, not in the KAIZEN7 kernel.

## Error Handling

The constitution is a root authority contract and therefore fails closed:

- missing file -> `K7_OPERATOR_CONSTITUTION_MISSING`;
- invalid schema or required fields -> `K7_OPERATOR_CONSTITUTION_INVALID`;
- unknown authority role -> `K7_OPERATOR_AUTHORITY_INVALID`;
- sensitive or forbidden field names -> validation failure;
- unsupported version -> explicit migration requirement.

KAIZEN7 must not silently replace a missing or invalid constitution with guessed
conversation context.

## Verification

The implementation is accepted when:

1. The canonical JSON validates with no sensitive fields.
2. The runtime loader returns a deterministic compact contract.
3. One Door includes the contract in technical, creative and research missions.
4. Luciano remains the final human authority in every mission type.
5. Existing approval gates cannot be weakened by stored configuration.
6. KAIZEN7 routes Flowmatik and THE FOCUX correctly without merging them.
7. The compact contract does not contain raw conversations or credentials.
8. Existing One Door, loop, preflight and full `k7:check` tests pass.

## Non-Goals

This change will not:

- create a social profile or public biography for Luciano;
- copy all conversation history into the repository;
- diagnose or optimize Luciano's private life;
- merge KAIZEN7, Flowmatik and THE FOCUX into one codebase;
- grant autonomous spending, publishing, deployment or credential access;
- implement brand assets, video generation or ecommerce;
- add a provider, framework, API or dependency.

## Implementation Boundary

This is one bounded kernel feature:

1. one canonical JSON contract;
2. one loader and compact projection;
3. one One Door integration;
4. focused tests and documentation;
5. no unrelated refactor.

It should be implemented before expanding the Learning Compiler so future
learning is evaluated against the correct human authority and purpose.
