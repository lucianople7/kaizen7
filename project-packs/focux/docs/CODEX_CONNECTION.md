# Codex connection

Prefer the native installed `focux` command for local execution. `--json` is the
stable application contract; never parse rendered human tables. The MCP option
uses the same service and is documented in CHATGPT_CONNECTION.md.

Example Codex TOML configuration (substitute absolute paths):

```toml
[mcp_servers.focux]
command = "/ABS/focux/.venv/bin/focux"
args = ["--root", "/ABS/focux-data", "mcp", "serve"]

[mcp_servers.focux.env]
FOCUX_FFMPEG = "/usr/bin/ffmpeg"
FOCUX_FFPROBE = "/usr/bin/ffprobe"
```

This is an example, not an installation into the user's Codex configuration.
After enabling it in your host, call `focux_status` and compare the `factory_id`
with `focux status --json`, then create a disposable project and read it via CLI.

The `skills/` directory contains 11 original versioned skill packages. Each has
SKILL.md, references, fixtures, and `selftest.py`. Copy selected folders into the
target repository's `.agents/skills/` only when installing them there is intended.
They are not globally installed by package import. Run each `selftest.py` with the
installed FOCUX interpreter before discovery; the test suite runs all eleven.

Skills guide planning and validate contracts; they cannot bypass production asset
gates, obtain credentials, authorize spend or masquerade fixtures as real content.
Public/private account transport decisions belong to the host operator.
