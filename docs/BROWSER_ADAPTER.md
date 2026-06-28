# KAIZEN7 Browser Adapter

`browser-adapter.js` connects MetaBrowser to the same signal pipeline used by GitHub and Hugging Face.

```text
Browser URL -> browser-adapter.js -> signal packet -> k7:run
```

## Command

```powershell
npm.cmd run k7:run -- --browser "https://developers.tiktok.com" "get access token"
```

## Levels

- Level 1: read page HTML, extract a compact DOM/text snapshot, and create a signal packet.
- Level 2: attach an objective/action result to the page signal without executing risky external actions.
- Level 3: save a reusable MetaBrowser script spec under `data/metabrowser-scripts/`.

## Safety

The adapter is read-only by default.

Objectives involving tokens, login, OAuth, credentials, publishing, checkout, deletion, deploys or payments are routed to `decision` and require human approval before execution.

## Contract

Output packets include:

- `source.type = browser`
- page title, description and excerpt
- `browser.level`
- `browser.backend = browser-adapter`
- safety gates
- one next action for `k7:run`
