# kernel.mission_outcome_receipt

## Purpose

Certify the outcome of a KAIZEN7 mission with a compact structured receipt.

## Use When

- An agent has finished work from a Mission Brief.
- A PR needs a stable closeout object.
- KAIZEN7 needs to detect unexpected changes.
- Memory should be recommended but not written automatically.

## Do Not Use When

- The mission has not been attempted.
- The result has no evidence.
- Human approval is still required before judging the outcome.

## Outputs

- mission
- status
- goal completed
- files changed
- tests
- constraints respected
- unexpected changes
- recommended memory
- next capability
- follow up

## Verification

- Receipt is present.
- Status is present.
- Tests are reported.
- Scope is checked against the Mission Brief.
- Memory is recommended only as a draft.
