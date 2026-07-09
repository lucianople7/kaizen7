# KAIZEN7 One Command

Use this when an agent, human, or external CLI needs the fastest safe entry into
the repository.

```powershell
npm.cmd run k7 -- status
npm.cmd run k7 -- doctor
```

Then:

```powershell
npm.cmd run k7 -- mission "<objective>"
npm.cmd run k7 -- handoff
npm.cmd run k7 -- improve "<friction>"
```

Use this when another agent needs the compact execution card.

```powershell
npm.cmd run k7:handoff
```

```powershell
npm.cmd run k7:handoff:json
```

Use this when another tool or agent needs structured JSON.

```powershell
npm.cmd run k7:smoke
```

Use this when you only need a compact health check. It returns:

- repository branch and dirty state,
- KAIZEN7 readiness,
- THE FOCUX OS phase,
- route sample,
- warnings that matter before execution,
- next command.

For full verification:

```powershell
npm.cmd run k7:check
```

## Default Route

```text
k7:smoke
-> k7 -- mission "<objective>"
-> Mission Brief
-> focused execution
-> k7:check
-> Mission Outcome Receipt
-> memory recommendation
```

## Rule

If `k7:smoke` fails, fix the route or blocker before asking another agent to
execute work. If it passes with warnings, treat the warnings as context, not as
automatic blockers.
