# KAIZEN7 Real Examples

These are practical local workflows for the production beta.

Use them to prove KAIZEN7 with real projects instead of adding more theory.

## Example 1: Improve A Repository

Goal:

```text
Improve this repo with less context, fewer repeated decisions and better tests.
```

Command:

```powershell
npm.cmd run k7 -- run "improve this repo with less context, fewer repeated decisions and better tests"
```

Expected use:

1. Read the compressed brief.
2. Follow the minimal context list.
3. Use the route and verification commands.
4. Store the receipt only after the change is verified.

Receipt:

```powershell
npm.cmd run k7 -- remember "{\"objective\":\"improve repo\",\"route\":\"code.change\",\"tool\":\"codex\",\"verification\":\"npm.cmd run k7:check\",\"reuse_next_time\":\"Start with k7 run and the listed files only.\",\"discard\":[\"Do not open broad repo context before route selection.\"]}"
```

## Example 2: Find A Free Tool Before Paying For An API

Goal:

```text
Find a free route to automate a task before choosing a hosted provider.
```

Command:

```powershell
npm.cmd run k7 -- commons "automate browser task without paid API"
```

Then:

```powershell
npm.cmd run k7 -- trust "browser automation route"
npm.cmd run k7 -- eval "browser automation route"
```

Expected result:

- local or BYO candidates first,
- paid services blocked until explicit approval,
- dry-run and verification named before execution.

## Example 3: Forge A Video Tool Route

Goal:

```text
Find and learn a reusable free video tool pattern for agents.
```

Command:

```powershell
npm.cmd run k7 -- forge "video tool that renders short clips from local assets"
```

Expected result:

- selected lane: `video-tool`,
- search zones: local receipts, Hugging Face, GitHub and existing CLIs,
- adapter contract with inputs, outputs, command, dry-run and verification,
- promotion only after repeated verified receipts.

## Example 4: Connect To An App Without A Clean API

Goal:

```text
Control an external app without building a permanent integration.
```

Command:

```powershell
npm.cmd run k7 -- anything "connect to an app without a clean API and save the working route"
```

Then:

```powershell
npm.cmd run k7 -- forge "app without API controlled through CLI or browser"
npm.cmd run k7 -- trust "app adapter"
```

Expected result:

- one reusable command or adapter contract,
- approval gates for credentials and external effects,
- receipt that teaches the next agent what to reuse and what to discard.

## Example 5: Resume Work Without Replaying Context

Goal:

```text
Resume a previous agent run without rereading the whole project.
```

Command:

```powershell
npm.cmd run k7 -- recall "connect app without API"
npm.cmd run k7 -- resume "connect app without API"
```

Expected result:

- compact local context,
- relevant receipts only,
- trust boundary,
- next action.

## Acceptance Rule

A KAIZEN7 run is useful only if it produces at least one of these:

- time saved,
- fewer files read,
- fewer tool attempts,
- safer connector decision,
- clearer verification,
- reusable receipt,
- a real project artifact or blocker.

If none of those happen, do not add more system. Improve the route or discard it.
