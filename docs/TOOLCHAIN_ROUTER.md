# KAIZEN7 Toolchain Router

The Toolchain Router turns an objective into the smallest useful chain of KAIZEN7 tools, workers and verification gates.

```text
goal -> memory -> selected tools/workers -> eval firewall -> approval/writeback
```

## Command

```powershell
npm.cmd run k7:toolchain -- "use OpenHands to improve KAIZEN7 with tests"
npm.cmd run k7:toolchain -- --json --capability run_tests "evaluate MCP tools safely"
```

## API

```http
POST /api/k7/toolchain
POST /api/k7/toolchain/evaluate
```

## Output

The router returns:

- selected toolchain,
- commands,
- blocked tools,
- approval requirement,
- eval firewall,
- output contract.

## Eval Firewall

The firewall blocks worker output unless claims have matching evidence:

- scoped change -> diff evidence,
- tests passed -> test evidence,
- risks reported -> risk evidence.

This is inspired by MCP-Atlas, OmniCode and SWE-bench style evaluation, but remains local and lightweight.

## Rule

```text
KAIZEN7 does not load every tool.
KAIZEN7 chooses the smallest safe toolchain and verifies evidence before accepting output.
```

