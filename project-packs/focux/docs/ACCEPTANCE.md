# Acceptance ledger — no production-ready claim

Source order: execution mandate supplied 2026-09-15, issue #15 and its two addenda.
The latest mandate replaces SIGNAL-001 acceptance with SIGNAL-003. No previous
prototype crops are reused. Canonical local logo SHA256:
`4408511c5cad8e40db1c994994d9c7348677faa12ed459e1a11de2356a11d531`.
The other logo already in the repository has a different hash and was not substituted.

## Implemented

- Shared Python application service; installed executable CLI and SDK MCP stdio.
- Real SQLite library, local imports, versioned independent masters/provenance.
- Fixture provider, explicit unavailable GPT provider, future motion interface.
- Asset gate, sequential visual-reference requests, source preservation.
- Actual decoded audio onset/tempo/energy analysis; sections are measured windows,
  not claims of authoritative musical phrase recognition.
- Real headless CPU FFmpeg render, camera motion, cut/fade, separate sparse overlays.
- Fresh ffprobe/checksum validation and G01–G18 evidence, manual gates pending.
- Immutable audit events, exact-context human/agent feedback separation.
- Original versioned skills with positive/negative fixture behavior and selftests.
- Controlled learning implementation and regression tests; no unsupported
  improvement claim from the synthetic acceptance run.

## Remaining acceptance gaps

- SIGNAL-003 still uses abstract synthetic test masters and labelled test audio.
  It is not the requested cinematic, visually coherent Tokyo film.
- No live GPT transport/budget authority has been connected. The provider refuses
  requests instead of treating caller-supplied approval booleans as authority.
- No actual ChatGPT/Work account connection or external tool call has been made.
- Parallax requires actual background/transparent foreground layers; local MOTION
  requires a verified independent clip. Automatic depth extraction and generative
  video are not supplied. Unsupported/missing inputs fail.
- Visual continuity and aesthetics do not have a calibrated automated critic;
  corresponding gates remain pending. Canonical PNG integrity is not visual OCR.
- Cross-project library retrieval searches candidates but does not autonomously
  select reused imagery based on proven continuity/quality. Explicit sources work.
- No claims of retention, income, audience improvement or publishing readiness.

## Backend decision

FFmpeg was selected for the working native CLI, existing local installation,
bounded CPU threads and actual measured output. Its E2E was executed on Windows.
MLT/Shotcut binaries were found, but not benchmarked as equivalent implementations;
Remotion/OpenCut/OpenChatCut have not been benchmarked here. No comparative speed
claim is made. CLI-Anything is unnecessary for FFmpeg's mature native interface.
WSL inspection returned `REGDB_E_CLASSNOTREG`; Linux/WSL runtime execution was not
verified on this host. Windows native Python/FFmpeg was used for the evidence.

## Preserving KAIZEN7

Base commit `761659f16670ea914feff93f3ab056d8cfd738d5`. No existing kernel files are
changed. Before implementation, 149 precheck/check commands ran: 146 passed and
three failed from Windows restrictions: server.integration (spawn EPERM),
skillopt-adapter and skillopt-cli (symlink EPERM). These are recorded baseline
limitations, not relabelled as passing or fixed by this feature.

## Dependencies and provenance

New original code retains this repository's MIT license. Python dependencies:
Pillow (HPND), NumPy (BSD-3-Clause), MCP SDK (MIT). FFmpeg is invoked as an external
binary, not redistributed; its build/license depends on enabled components
(the libx264 build has GPL implications for distribution). No CLI-Anything,
Remotion, ReelBench or community source is vendored. Pattern references and
license observations are in SKILL_PROVENANCE.md. No system/global installation.

## Memory recommendation

After review, record that FOCUX is a separate exportable factory, masters are
independent from storyboards, and a technical fixture render is not production
acceptance. No automatic edits to KAIZEN7 operator constitution or memory.
