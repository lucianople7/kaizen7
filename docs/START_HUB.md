# KAIZEN7 Start Hub

`k7:start` is the default entrypoint for KAIZEN7.

It answers:

```text
En que vas a trabajar?
```

Then it builds one start packet from the existing modules:

- Activation Cockpit,
- Metaskill Boot,
- Toolchain Router,
- Eval Harness when a project is provided,
- evidence and memory writeback rules.

## Command

```powershell
npm.cmd run k7:start
npm.cmd run k7:start -- --project "THE FOCUX" --context "repo separado" --capability run_tests "crear dossier NEUROCITY verificable"
```

JSON:

```powershell
npm.cmd run k7:start -- --project "THE FOCUX" --context "repo separado" "crear dossier NEUROCITY verificable" --json
```

## API

```http
POST /api/k7/start
```

## Rule

Users and editors should start here unless they already know the exact lower-level module they need.

`k7:start` is not a new engine. It is a small launcher that composes proven modules and keeps the first move tight.
