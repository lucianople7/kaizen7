# Work–KAIZEN7 Preflight

ChatGPT Work is the frontend. KAIZEN7 coordinates. Codex executes. Flowmatik and THE FOCUX remain external projects connected by task contracts and outcome receipts.

## Before asking Luciano

Run:

```powershell
npm.cmd run k7 -- preflight --budget 300 "the technical or strategic question" --json
```

Follow the returned route:

- `reuse_receipt`: reuse the fresh decision and verify fit.
- `research_primary_sources`: research current primary sources, then recommend one route.
- `ask_user`: ask one short preference question.
- `approval_gate`: stop before external effects and request exact authority.
- `codex_execute`: create a bounded task contract with focused tests.

Do not ask Luciano merely because context is missing. Ask only when his preference or authority changes the result.

## Candidate check

When another router proposes a tool or model, test its fit:

```powershell
npm.cmd run k7 -- preflight --candidate "candidate name and purpose" "objective" --json
```

Rejected candidates do not enter the task contract.

## Closeout

After verification, store an outcome receipt with evidence, reuse rule, discard rule, verification date and expiry date. The next preflight may reuse only fresh matching receipts.

## Action–Reaction loop

Run a bounded loop plan with:

```powershell
npm.cmd run k7 -- loop --max-iterations 8 --token-budget 1200 "the objective" --json
```

The loop converts the preflight into one TaskContract, selects Work, Codex or Flowmatik, requires evidence, blocks learning after failed verification, and returns exactly one next action. Spending, publishing, credentials, deletion, legal/high-stakes authority and human preference remain explicit approval gates. A reuse rule is promoted only after three fresh, matching and verified outcomes.
