# KAIZEN7 Work GPT Action Bridge

Status: local implementation ready, deployment requires Luciano approval.

This is the private Work Chat walkie-talkie surface:

```text
Work GPT -> GPT Action -> Cloudflare Worker/DO -> mini-PC poller -> WSL Codex app-server -> receipt -> Work GPT
```

## Public GPT Action Surface

Import this schema in the private KAIZEN7 Work GPT after the Worker is approved and deployed:

```text
GET https://<approved-worker-host>/openapi.json
```

Authentication:

```text
Bearer <ACTION_BRIDGE_TOKEN>
```

Keep the mini-PC token separate:

```text
ACTION_AGENT_TOKEN
```

The GPT must never receive or store `ACTION_AGENT_TOKEN`.

## Primary Action

Use:

```text
request_repo_status
```

Body:

```json
{
  "idempotencyKey": "<stable-work-chat-turn-id>",
  "repository": "kaizen7",
  "requestedBy": "luciano",
  "correlationId": "<work-chat-thread-or-message-id>"
}
```

The gateway generates the technical mission envelope:

- operation: `repo_status`
- authority: `L0`
- target device: gateway default or `targetDeviceId`
- constraints: read-only Git inspection only
- expiry: 15 minutes

Then the GPT polls:

```text
GET /v1/missions/{missionId}
```

until `state` is `completed` and `hasReceipt` is `true`, then reads:

```text
GET /v1/receipts/{missionId}
```

This lets Work Chat report whether the mission is still `queued`, already
`claimed` by the mini-PC, or completed with a receipt.

## GPT Instruction Snippet

```text
When Luciano asks for KAIZEN7/Codex status, call request_repo_status with a stable idempotencyKey for this chat turn. Report the returned missionId, poll missionPath for queued/claimed/completed, and read receiptPath once hasReceipt is true. If the receipt is not ready, say whether the mission is queued or claimed and ask Luciano to retry status shortly. Never ask for or expose ACTION_AGENT_TOKEN. Never request writes, installs, deployments, network changes or shell execution through this action.
```

## Safety Boundaries

- Public Action endpoints: `GET /v1/status`, `POST /v1/repo-status`, `POST /v1/missions`, `GET /v1/missions/{id}`, `GET /v1/receipts/{id}`.
- Private mini-PC endpoints: `/v1/agent/*`, documented only in code, not OpenAPI.
- First Work Chat route uses only `POST /v1/repo-status`.
- No deploy, Cloudflare resource creation, tokens or secrets are included in this commit.
