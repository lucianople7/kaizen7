# KAIZEN7 30 Second Activation

This is the product-facing proof layer.

KAIZEN7 should not first explain itself as an operating system. It should prove itself by turning a messy objective into one verified next action.

```text
Goal in -> before/after -> minimum context -> next best action -> verification -> memory
```

## Why It Exists

The biggest product risk is abstraction.

If a new user sees too many modules, adapters and crons before seeing value, KAIZEN7 feels like a framework. The 30 Second Activation makes the first experience concrete.

## Command

```powershell
npm.cmd run k7:activate -- "objective"
npm.cmd run k7:activate -- --compact "objective"
```

## API

```http
POST /api/k7/activate
```

Example:

```json
{
  "goal": "evolve KAIZEN7 so a new user understands it in 30 seconds",
  "agent": "codex",
  "budget": 800
}
```

## Output

- before friction,
- after friction,
- context pack,
- next best action,
- decision guard,
- verification gate,
- proof commands,
- memory writeback rule.
- launch card:
  - three start-now steps,
  - done definition,
  - recommended model route,
  - max context before action,
  - copy-paste brief,
  - memory draft.

## Product Rule

```text
Do not sell the OS first.
Prove the next action first.
```

Once the user sees the transformation, KAIZEN7 earns the right to explain the deeper system.

## Launch Card Rule

```text
If the user still asks "where do I start?", the activation failed.
```

The Launch Card is the handoff object for humans and agents. It must be small enough to execute and explicit enough to verify.

## Activation Pack

The Launch Card now expands into an Activation Pack:

- `intent`: build, research, content, memory or activation.
- `confidence`: 0-100 readiness score.
- `readiness`: execute, execute-with-care or clarify-first.
- `executeNow`: the three immediate steps.
- `delegatePrompt`: a copyable prompt for another AI.
- `timeline`: seven-minute execution lane.
- `stopRules`: when to pause for approval or clarification.
- `evidenceRequired`: accepted proof types.
- `memoryWriteback`: draft for Obsidian or project memory.

Rule:

```text
If another AI cannot act from the pack without asking for more context, the pack is not finished.

## AI Handoff

For AI-to-AI execution, KAIZEN7 emits a versioned handoff contract:

```text
k7-ai-handoff@1.0
```

It includes:

- `objective`
- `constraints`
- `inputPacket`
- `executionContract`
- `responseContract`
- `failureContract`
- `compactPrompt`

The receiving AI must return only JSON with:

```json
{
  "result": "string",
  "proof": "string",
  "risk": "none|low|medium|high",
  "reusableLearning": "string",
  "memoryWriteback": "string",
  "status": "done|blocked|needs_approval"
}
```

Rule:

```text
AI-to-AI handoff must be versioned, compact and parseable.
```

## Return Judge

KAIZEN7 can now validate the response from another AI:

```http
POST /api/k7/handoff/validate
```

Loop:

```text
AI Handoff -> AI Response -> K7 Judge -> done | retry | blocked | needs_approval -> memory
```

The judge checks:

- valid JSON,
- required fields,
- allowed status,
- allowed risk,
- proof strength,
- approval need before memory writeback.

Rule:

```text
No AI result enters memory before K7 Judge accepts it.
```

## Run K7 Loop

The main product routine is:

```text
Intent -> Handoff -> Return -> Judge -> Memory -> Next Action
```

API:

```http
POST /api/k7/loop
```

Human-facing output:

- traffic light,
- decision,
- score,
- next action,
- proof,
- memory draft.

AI-facing output remains available inside the activation and handoff contracts.
```
