# KAIZEN7 OpenAI Acceptance Path

This document defines the realistic path for KAIZEN7 to be acceptable in the OpenAI ecosystem.

## Real Path

KAIZEN7 should be packaged as a focused ChatGPT App / MCP connector:

```text
Plan -> Build MCP server -> Build UI -> Deploy HTTPS -> Test in developer mode -> Submit app
```

It should not be submitted as a broad "superagent" that asks for unlimited context or performs open-ended actions.

## Acceptable Positioning

Name:

```text
KAIZEN7 Project Activation
```

Description:

```text
Turn a project goal into a compact action brief with relevant memory, risks, next action, and verification.
```

Promise:

```text
Less context. Fewer steps. Better verified action.
```

Avoid:

- "official",
- "best",
- "OpenAI endorsed",
- "guaranteed",
- "autonomous everything",
- medical, legal or financial claims.

## Recommended MCP Tools

### `get_project_brief`

Read-only.

Returns:

- current objective,
- minimum memory,
- relevant decisions,
- risks,
- suggested next action,
- recommended verification.

Annotations:

```text
readOnlyHint: true
openWorldHint: false
destructiveHint: false
```

### `get_activation_checklist`

Read-only.

Returns:

```text
Anchor -> Memory -> Action -> Verify -> Learn
```

Annotations:

```text
readOnlyHint: true
openWorldHint: false
destructiveHint: false
```

### `save_project_learning`

Write tool. Requires explicit user confirmation.

Writes one short decision or learning item to project memory.

Annotations:

```text
readOnlyHint: false
openWorldHint: false
destructiveHint: false
```

Must not store secrets.

### `create_project_task`

Future phase only, after auth and permissions.

Annotations:

```text
readOnlyHint: false
openWorldHint: true
destructiveHint: false
```

## Data Rules

Do not ask for:

- full conversation history,
- raw chat transcripts,
- API keys,
- passwords,
- precise location,
- payment card data,
- protected health information,
- government identifiers,
- sensitive legal/financial/medical data unless strictly required and properly consented.

Return only data relevant to the user request. Do not expose internal trace IDs, raw logs, session IDs or diagnostics unless strictly necessary.

## Security Rules

- least privilege,
- explicit user consent,
- server-side input validation,
- audit logs without raw PII,
- sensitive data redaction,
- human confirmation for irreversible actions,
- separate read and write tools.

## Infrastructure Before Submission

Required:

- public HTTPS MCP server,
- concrete `/mcp` endpoint,
- no localhost/testing endpoint,
- no placeholder URL,
- CSP with exact allowed domains,
- low-latency streaming responses,
- stable TLS,
- logs and metrics,
- real screenshots,
- test prompts and responses,
- published privacy policy,
- verified OpenAI Platform identity or organization.

## Testing Before Submission

Use:

- unit tests for tool handlers,
- schema validation tests,
- error and edge case tests,
- auth-flow tests if auth exists,
- MCP Inspector,
- ChatGPT Developer Mode,
- golden prompts.

Golden prompt set:

- direct valid request,
- indirect valid request,
- negative request,
- prompt-injection attempt,
- secret-extraction attempt,
- destructive-action attempt.

## Rejection Risks

KAIZEN7 risks rejection if:

- tool names/descriptions are promotional or ambiguous,
- tools request broad context unnecessarily,
- there is no privacy policy,
- the MCP endpoint is unstable or not real,
- the app is incomplete or demo-like,
- it implies OpenAI endorsement,
- read/write/destructive/open-world annotations are wrong,
- it automates high-impact decisions without human review,
- it stores secrets or restricted data.

## MVP For Review

Submit a narrow version:

```text
KAIZEN7 Project Activation for ChatGPT
```

Capabilities:

1. Read a project objective.
2. Generate a compact brief.
3. Show relevant memory.
4. Show risks.
5. Suggest one next action.
6. Suggest verification.
7. Save learning only with confirmation.

## Recommended Sequence

```text
Local MCP -> MCP Inspector -> HTTPS dev endpoint -> ChatGPT Developer Mode -> Privacy Policy -> Tool annotations -> Test prompts -> Review package -> Submit
```

## Decision

KAIZEN7 should enter the OpenAI ecosystem as a small, clear, reviewable product:

```text
Project Activation: less context, one next action, verification, and memory with permission.
```

After that nucleus is accepted, KAIZEN7 can grow by modules.

## Official Sources

- OpenAI Apps SDK: https://developers.openai.com/apps-sdk/
- App submission guidelines: https://developers.openai.com/apps-sdk/app-submission-guidelines
- Submit and maintain app: https://developers.openai.com/apps-sdk/deploy/submission
- Test your integration: https://developers.openai.com/apps-sdk/deploy/testing
- Deploy your app: https://developers.openai.com/apps-sdk/deploy
- Security and privacy: https://developers.openai.com/apps-sdk/guides/security-privacy
- Usage policies: https://openai.com/policies/usage-policies/
