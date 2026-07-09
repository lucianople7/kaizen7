# KAIZEN7 Project Focus

Project Focus is the North Star layer for KAIZEN7.

```text
living project -> north star -> phase -> allowed actions -> focus guard -> evidence -> next improvement
```

## Command

```powershell
npm.cmd run k7:focus
npm.cmd run k7:focus -- --json
npm.cmd run k7:focus -- --write --project "Online Watch Store" --phase validation "crear una tienda online de relojes rentable"
```

## Contract

Project Focus stores:

- `project`
- `northStar`
- `phase`
- `currentObjective`
- `successMetrics`
- `allowedActions`
- `blockedDistractions`
- `evidenceRequired`

Every focus packet returns a guard:

```json
{
  "decision": "aligned|clarify|defer",
  "alignmentScore": 0,
  "reasons": []
}
```

## Rule

KAIZEN7 does not optimize tasks in isolation. It optimizes a living project.

Metaskills provide operating discipline. The ledger provides accumulated evidence. Project Focus provides direction.
