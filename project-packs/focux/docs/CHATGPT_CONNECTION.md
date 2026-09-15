# Connect to the real FOCUX factory

## Delivered connection

`focux mcp serve` runs the official Python MCP SDK 2.2.0 over **stdio**.
There is no HTTP listener and no public deployment. It shares `Factory`, filesystem
artifacts and SQLite with the CLI. A client must run with the same `FOCUX_HOME`.

An MCP client supporting local stdio uses this example; replace the three absolute
paths with your actual installation, data root and FFmpeg location:

```json
{"mcpServers":{"focux":{"command":"/ABS/focux/.venv/bin/focux",
"args":["--root","/ABS/focux-data","mcp","serve"],
"env":{"FOCUX_FFMPEG":"/usr/bin/ffmpeg","FOCUX_FFPROBE":"/usr/bin/ffprobe"}}}}
```

On Windows command is the installed `...\\.venv\\Scripts\\focux.exe`.
No API key is required for fixture/local operations. Do not put unrelated credentials
in the server environment. Server stdout is exclusively MCP protocol output.

## Tools/resources

13 tools: `focux_status`, `focux_create`, `focux_project_get`,
`focux_library_search`, `focux_library_inspect`, `focux_assets_generate`,
`focux_assets_validate`, `focux_storyboard`, `focux_render`, `focux_critique`,
`focux_feedback`, `focux_learn`, `focux_learning_report`.
Resources: `focux://status` and `focux://projects/{project_id}`.

## Permission model

The OS identity launching stdio owns the local data root. This is a single-owner
local service, not a multi-tenant remote endpoint. MCP can prepare local artifacts,
render and record agent observations. MCP cannot approve as the human, change
credentials, import arbitrary files, publish, spend, delete or promote policies.
Tool annotations describe behavior; actual denials are in the shared core.

## Test and expected response

```sh
focux --root /ABS/focux-data mcp doctor --json
```

Expected: `ok:true`, `result.pass:true`, `tool_count:13`, `transport:"stdio"`,
and a persistent `factory_id`. This is a live initialize/list-tools/status-call
against a separate official SDK server process, not a mock or static fixture.
The doctor uses ordinary anonymous pipes for Windows hosts that block asyncio's
overlapped named pipes. `chatgpt_connected:false` is intentionally explicit.

To prove a client controls the real factory: call `focux_create` with a distinctive
title, retain the returned project id/context hash, then run `focux project show ID
--json` against the same root. Compare paths, hashes and SQLite factory identity.
A list of tools alone does not prove that client connection.

## ChatGPT / Work

Local MCP-capable hosts can launch stdio. A hosted ChatGPT/Work execution environment
cannot automatically access a Windows executable just because this configuration
file exists. OpenAI documents MCP extension and Secure MCP Tunnel mechanisms:

- https://learn.chatgpt.com/docs/extend/mcp
- https://developers.openai.com/api/docs/guides/secure-mcp-tunnels

Checked 2026-09-15. Use a supported host connection or an authorized tunnel and
the account/workspace permissions required by that mechanism. This delivery has
**not registered a tunnel, connected credentials, deployed an endpoint or proved
a tool call from the user's ChatGPT account**. Those remain a separate live
integration step, not a claim hidden behind an example configuration.

## Troubleshooting

- Wrong projects/identity: CLI and MCP have different roots or users.
- Executable missing: install the wheel/package and use an absolute command path.
- SDK import failure: install dependencies into the same interpreter as `focux`.
- Doctor timeout: inspect stderr, use the same Python environment, avoid banner output.
- Asset gate fails: inspect `assets validate --json`; do not bypass the gate.
- Live generation blocked: intentional; paid provider authorization is not configured.
- Render already exists: preserve it and create a new production version/project.
