# Universal Loop Engine Design

## Goal

Make the existing KAIZEN7 Loop OS a real closed-feedback engine for every
mission routed through One Door: observe, act, verify, correct, retry, learn and
stop at a bounded terminal state.

## Existing foundation

PR #3 already added the canonical policy, One Door envelope, TaskContract,
human authority gates, verification receipts and learning promotion. The
remaining gap is behavioral: `runActionReactionLoop` performs only one
execution and blocks on its first failed verification.

## Design

The existing Loop OS remains the only public coordination layer. It gains:

1. A policy-owned set of loop profiles for research, technical, creative,
   commerce, tools and memory missions.
2. A `loop` field in every TaskContract describing the selected profile,
   stages, iteration/failure/token limits, stop conditions and autonomy mode.
3. Bounded micro-iterations in `runActionReactionLoop`. Every retry receives
   the previous result, verification and correction. Only the final verified
   attempt can create a receipt or promote learning.
4. Attempt summaries in One Door so every caller sees what was tried without
   replaying broad context.

## Autonomy B

The engine may research, analyze, test and prepare reversible changes. Existing
preflight gates continue to stop spending, publishing, deployment, credentials,
deletion, legal/high-stakes authority and other irreversible external effects
before an executor is called.

## Terminal states

- `completed`: evidence exists and verification passes.
- `approval_required`: human preference or authority is required.
- `blocked`: a hard failure occurs or the allowed failures are consumed.
- `budget_exhausted`: execution attempts or token budget are consumed.
- `ready`: no executor was supplied; return the enriched TaskContract.

## Compatibility

Existing commands and schemas remain valid. New fields are additive. The
`--max-iterations` option now expresses what its name promises: maximum
execution attempts, not maximum state-array length.

## Acceptance

- A failed verification with a correction triggers another execution.
- The retry receives compact feedback from the previous attempt.
- A later verified attempt completes and persists only one verified receipt.
- Hard failures, failure caps, token caps and authority gates stop the loop.
- Research, technical, creative, commerce, tool and memory objectives receive
  explicit profiles through the same TaskContract interface.
- Focused tests and the complete repository suite pass.

