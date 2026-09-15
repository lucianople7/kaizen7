# Executed verification — 2026-09-15

Windows native execution against KAIZEN7 base
`761659f16670ea914feff93f3ab056d8cfd738d5`. Existing tracked files unchanged.

| Check | Actual result |
| --- | --- |
| Source: `python -m unittest discover -s tests -v` | 55 tests, 45.720 seconds, OK |
| Built wheel, installed in a separate environment without a source path; same test command | 55 tests, 46.123 seconds, OK |
| Installed wheel golden skill regressions | 11 skills, 22 cases, passed |
| Official skill packaging validator | All 11 SKILL.md packages valid |
| Installed executable `focux mcp doctor --json` | Live stdio initialize/list/call, 13 tools, same SQLite factory identity |
| `assets validate SIGNAL-003` | Passed, nine independent fixture masters |
| `render SIGNAL-003` and fresh ffprobe | 24.000 seconds, 1080×1920, 30 fps, 720 frames, H264/AAC |
| `critique`, `learn`, `learning report` | Executed successfully; production remains false, no claimed improvement |
| Existing KAIZEN7 baseline | 149 commands: 146 pass, 3 pre-existing Windows EPERM failures |

The final fixture render took 5.922 seconds on this host using two encoder
threads and no paid service. This is one synthetic workload, not a benchmark
of cinematic media or a comparison with another renderer. FFmpeg/ffprobe build:
`n8.1.2-34-g9b6c8969e0`. Video SHA256:
`a9cf369f6d6905fd84ae1abcd463d32bc22edf310123ab1dd258866d5d30bcc1`.

Coverage includes contact-sheet/duplicate rejection, changed original files,
actual audio decode and loop rejection, real FFmpeg parallax/local-clip rendering,
CLI/MCP integration, ledger immutability, exact-version feedback, full policy and
effect matching, project lock contention, promotion and rollback.
Positive learning decision tests explicitly replace technical verification with
a controlled gateway. A separate forged-MP4 test uses real ffprobe and fails.
No five-pair real cinematic experiment has been completed.

The three unchanged baseline failures are `server.integration.test.js` (spawn
EPERM), `skillopt-adapter.test.js` and `skillopt-cli.test.js` (symlink EPERM).
Linux/WSL and a real ChatGPT Work connection remain unverified.
Full local logs and the QA-only contact sheet are delivered alongside the source;
private brand/media files are not included in the repository patch.
