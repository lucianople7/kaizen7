# THE FOCUX Factory

Local audiovisual production through one `focux` CLI and an official SDK MCP server.
Both interfaces call the same `Factory` service. Export this directory as an
independent project; KAIZEN7 code and its production state are not imported or modified.
Implements part of [mission #15](https://github.com/lucianople7/kaizen7/issues/15).

## Honest delivery status

The deterministic pipeline produces a real 24-second 1080×1920 H264/AAC video with
nine independent synthetic test masters. It is **technical evidence, not a finished
Tokyo film**. Live GPT generation is disabled. Local independently sourced images
and audio can be imported. Artistic continuity, final brand appearance and music
licensing require review. A successful render is not publication approval.

## Install

Python 3.12+, FFmpeg/ffprobe with libx264 and AAC. On Linux/WSL:

```sh
python3 -m venv .venv
. .venv/bin/activate
pip install .
export FOCUX_HOME="$PWD/focux-data"
focux doctor --json
```

On Windows use `.venv\Scripts\Activate.ps1`. If FFmpeg is not on PATH, set
`FOCUX_FFMPEG` and `FOCUX_FFPROBE` to their absolute executable paths.
The application does not install system packages, start services or contact APIs.

Place the operator-confirmed original logo at `$FOCUX_HOME/library/brand/logo.png`.
Original logo bytes stay untouched. No canonical brand asset is substituted by
the tests' clearly synthetic test logo.

## Operate

```sh
focux create "Tokyo After Dark" --id SIGNAL-003 --json
focux project show SIGNAL-003 --json
focux assets generate SIGNAL-003 --fixture --json
focux assets validate SIGNAL-003 --json
focux storyboard SIGNAL-003 --json
focux render SIGNAL-003 --json
focux critique SIGNAL-003 --json
focux learn SIGNAL-003 --json
focux learning report --json
focux library search "tokyo night" --json
```

`create` writes planning artifacts. It does not pretend to have produced a video.
The current creative template is explicitly Tokyo/night; other titles do not
magically produce different researched worlds. `assets generate` without
`--fixture` fails with `approval_required`. Existing final videos are preserved;
create a new project for a revised render. Changed masters are version archived.

For actual independent local images, use a source manifest, not a storyboard:

```json
{"assets":[{"shot_id":"001","path":"/absolute/independent-shot.png",
"sha256":"ACTUAL_FILE_SHA256","provenance":{"source_kind":"independent_master",
"root_source_id":"original-capture-001","description":"source and license evidence"}}]}
```

Provide all nine shots with distinct verified original sources. Then:

```sh
focux assets import SIGNAL-003 --manifest sources.json --audio licensed-track.wav --json
```

Importing is an operator action available in the CLI, not an arbitrary-file-read
MCP tool. Rights are never inferred from file access. Source masters and hashes
remain in the library; imported originals remain required for provenance checks.

## Verification and boundaries

```sh
python -m unittest discover -s tests -v
focux mcp doctor --json
```

Asset gates reject missing files, shared sources, contact-sheet/crop provenance,
exact and perceptual duplicates, changed originals, invalid files, missing anchors,
logo provenance and missing music/motion. These checks are not a visual proof
against forged provenance or every possible contact-sheet image.

G01–G18 evidence is appended to `.gates.jsonl`. Aesthetic gates remain pending
instead of receiving fabricated numerical scores. Human feedback is bound to
the exact creative inputs and final media; MCP feedback is labelled agent feedback.
Neither grants financial or publishing authority. Project writes use OS locks;
audit events have immutable SQLite triggers and a hash chain. A machine owner
with direct database access is outside this application's security boundary.
CLI human feedback is an operator assertion under the local OS identity, not
cryptographic proof that a human rather than a shell-capable agent typed it.

Exit codes: 0 command completed; 2 invalid input; 3 missing entity; 4 conflict/busy;
5 approval required/forbidden; 6 failed gate/insufficient evidence; 7 operation or
dependency failure. Every command accepts `--json` and `--root PATH` anywhere.
JSON is `{schema_version:1, ok:boolean, result:...}` or `{...,error:{code,message}}`.
An inspection returning `production_ready:false` is not a release success.

See [connection](docs/CHATGPT_CONNECTION.md), [Codex](docs/CODEX_CONNECTION.md),
[acceptance limits](docs/ACCEPTANCE.md), and [pattern provenance](docs/SKILL_PROVENANCE.md).
