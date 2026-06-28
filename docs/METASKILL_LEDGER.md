# KAIZEN7 Metaskill Outcome Ledger

The Metaskill Outcome Ledger stores evidence about which metaskills worked for each objective type.

```text
activate -> execute -> measure -> store -> rank -> improve next activation
```

## Command

```powershell
npm.cmd run k7:metaskills
npm.cmd run k7:metaskills -- --json
```

## Data

Default file:

```text
data/metaskill-ledger.json
```

Each outcome records:

- `date`
- `goal`
- `objectiveType`
- `activated`
- `fitnessScore`
- `signals`

## Use

`metaskillActivation` can receive ledger history and reorder selected metaskills by historical fitness for the current objective type.

`connector-kernel` and `agent-runner` expose `metaskillLedger` summaries so connected agents can see whether a recommendation comes from default rules or accumulated evidence.

## Rule

Metaskills are not just recommendations. They are operating disciplines. The ledger lets KAIZEN7 learn which discipline reduces steps, risk and rework in practice.
