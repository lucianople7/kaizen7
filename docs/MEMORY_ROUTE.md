# KAIZEN7 Memory Route

Primary memory path:

```text
C:\KAIZEN7_MEMORY
```

This path is outside OneDrive and is the stable local memory source for KAIZEN7.

Google Drive should mirror this folder when Drive Desktop or write-scoped Drive access is available.

The current operational sync route is `rclone`, installed at:

```text
C:\KAIZEN7_MEMORY\tools\rclone.exe
```

See:

```text
docs/GOOGLE_DRIVE_SYNC_ROUTE.md
```

## Structure

```text
C:\KAIZEN7_MEMORY
  00_CANON
  01_OBSIDIAN_EXPORT
  02_AGENT_PACKETS
  03_REPO_SNAPSHOTS
  04_EVIDENCE
  05_RESEARCH_RADAR
  06_BACKLOG
  07_ARCHIVE
  _inbox
  README.md
  memory-route.json
```

## Rules

- Do not store secrets or credentials.
- Keep decisions in Markdown or JSON.
- Keep generated runtime output out unless promoted intentionally.
- Use `03_REPO_SNAPSHOTS` for clean Git archive snapshots.
- Use `02_AGENT_PACKETS` for files agents can consume directly.
- Use `_inbox` only for temporary intake before classification.

## Current Seed

The route has been seeded with:

- Agent Product Core docs.
- Obsidian architecture exports.
- Agent product JSON packet.
- Agent Magnifier Radar packet.
- Clean Git snapshot for commit `180872bd7decc93c6145f35229ac489bda894acb`.

## Environment Note

WSL is installed but no Linux distribution is currently available. Use this Windows route until Ubuntu or another WSL distro is installed.
