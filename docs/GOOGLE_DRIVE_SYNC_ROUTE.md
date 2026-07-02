# KAIZEN7 Google Drive Sync Route

KAIZEN7 uses this local memory route:

```text
C:\KAIZEN7_MEMORY
```

The Google Drive connector available in this session can read/list files, but it cannot create folders or upload files because Google returned `ACCESS_TOKEN_SCOPE_INSUFFICIENT`.

The operational fix is `rclone`.

## Installed Tool

```text
C:\KAIZEN7_MEMORY\tools\rclone.exe
```

Current verified version:

```text
rclone v1.74.3
```

## Current Status

```text
installed_pending_oauth
```

Status file:

```text
C:\KAIZEN7_MEMORY\google-drive-sync-status.json
```

The remote name has been created:

```text
kaizen7drive
```

The remaining blocker is human Google OAuth approval in a browser. This cannot be completed safely by an agent without the signed-in user approving access.

## One-Time Setup

Run:

```powershell
C:\KAIZEN7_MEMORY\tools\connect-google-drive.ps1
```

If the remote already exists but has no token, run:

```powershell
C:\KAIZEN7_MEMORY\tools\reconnect-google-drive.cmd
```

Create a remote called:

```text
kaizen7drive
```

Choose:

- storage: `drive`
- scope: full drive access, or `drive.file` if you want rclone limited to files it creates
- browser auth: yes
- shared drive: no, unless you intentionally use one

## Sync

After auth:

```powershell
C:\KAIZEN7_MEMORY\tools\sync-to-google-drive.ps1
```

This syncs:

```text
C:\KAIZEN7_MEMORY
```

to:

```text
kaizen7drive:KAIZEN7_MEMORY
```

## Verify

```powershell
C:\KAIZEN7_MEMORY\tools\check-google-drive-sync.ps1
```

## Why This Route

- It avoids OneDrive locks.
- It avoids the current connector write-scope limitation.
- It is scriptable for Codex and other agents.
- It keeps the local source of truth stable even if Google Drive auth changes.
