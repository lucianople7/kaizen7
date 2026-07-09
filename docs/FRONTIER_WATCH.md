# KAIZEN7 Frontier Watch

KAIZEN7 needs a daily way to absorb what is moving fastest without turning every trend into a dependency.

```text
frontier sources -> compact signal packets -> Hunter queue -> adapter plan -> verified improvement
```

## Command

Proposal only:

```powershell
npm.cmd run k7:frontier
```

Insert daily packets into the signal inbox:

```powershell
npm.cmd run k7:frontier -- --write-signals
```

The write mode deduplicates packets by day and target id.

Daily productive brief:

```powershell
npm.cmd run k7:frontier:brief -- --write-signals
```

This returns:

- inserted signal count,
- top Hunter frontier candidate,
- adapter plan,
- one command to continue,
- approval and verification gates.

## Manifest

Targets live in:

```text
data/frontier-watch.json
```

Each target declares:

- `name`
- `kind`: `api`, `cli`, `mcp`, `agent`, `sdk` or `webhook`
- `priority`
- `source_type`
- optional `source_url`
- `query`
- `watch_for`
- `adapt_to`

## Safety

`frontier-watch` does not browse, install packages, deploy, spend money, scrape behind auth or touch credentials. It creates sourceable packets first.

Only later should KAIZEN7 decide:

- adopt now,
- adapt pattern,
- test later,
- reference only,
- reject.

## Daily Use

Run:

```powershell
npm.cmd run k7:frontier -- --write-signals
node lib/hunter.js signals
npm.cmd run k7:adapt -- --name "selected system" --kind agent "connect safely"
```

Or use the daily operator:

```powershell
npm.cmd run k7:frontier:brief -- --write-signals
```

This keeps KAIZEN7 modular: the frontier changes daily, but the core stays small.
