# KAIZEN7 Live Bridge Secure MCP Tunnel Profile

This is a non-secret command contract for the OpenAI Secure MCP Tunnel handshake.
Do not commit real API keys, tunnel IDs or account identifiers.

## Verified Local Toolchain

- `tunnel-client` release: `v0.0.10`
- Source: `openai/tunnel-client` GitHub release
- Windows AMD64 ZIP SHA-256: `5E64A056F1D96786DA0A6F8DB1DA5F5F4A03FD19A90D951A25CF2CA8D9093D00`
- Local binary path used during this checkpoint:
  `C:\tmp\kaizen7-toolchains\tunnel-client-v0.0.10\extract\tunnel-client.exe`

## Required Gates

- OpenAI Platform organization with Tunnels Read, Use and, if creating tunnels, Manage.
- A tunnel ID scoped to the intended ChatGPT workspace.
- Runtime API key supplied through an environment variable or secret file reference.
- ChatGPT developer-mode/custom MCP app surface with tunnel selection available.

## Template

```powershell
$env:CONTROL_PLANE_API_KEY = "<runtime-api-key-from-secure-flow>"

.\tunnel-client.exe init `
  --sample sample_mcp_stdio_local `
  --profile kaizen7-local-stdio `
  --tunnel-id "<tunnel-id>" `
  --mcp-command "node C:\path\to\kaizen7\apps\local-bridge\dist\index.js"

.\tunnel-client.exe doctor --profile kaizen7-local-stdio --explain
.\tunnel-client.exe run --profile kaizen7-local-stdio
```

For this checkpoint, the real credential and tunnel creation steps remain blocked until
Luciano approves the exact OpenAI Platform action.
