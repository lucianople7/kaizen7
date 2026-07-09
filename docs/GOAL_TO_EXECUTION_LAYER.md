# KAIZEN7 Goal-To-Execution Layer

KAIZEN7 is a modular activation layer for projects, coding assistants and agents.

It exists to answer one practical question:

```text
What is the shortest verified path from this objective to useful execution?
```

## Product Thesis

Modern projects do not need another giant tool.

They need a small operating layer that can:

- understand the objective,
- ask the minimum useful question,
- recover only relevant memory,
- connect the right tool or worker,
- block unsafe actions,
- verify evidence,
- preserve reusable learning.

## The Seven-Step Loop

```text
1. Objective
2. Minimal Context
3. Metaskill Boot
4. Toolchain
5. Execution
6. Verification
7. Learning
```

This is the meaning of the `7`.

## Who It Helps

### Coding Assistants

Codex, OpenHands, Claude Code or another editor agent should not start by reading everything.

KAIZEN7 gives them:

- objective,
- relevant files and memory,
- metaskill activation order,
- allowed scope,
- forbidden actions,
- toolchain,
- verification command,
- memory writeback rule.

### External Agents

External agents become workers, not the core.

```text
KAIZEN7 decides -> worker executes -> KAIZEN7 verifies -> memory learns
```

### Project Builders

A project can start from a single request and receive:

- project focus,
- active context,
- next action,
- risks,
- required checks,
- learning path.

## Operating Surface

Use the smallest surface that fits the job:

```powershell
npm.cmd run k7:cockpit
npm.cmd run k7:start -- --project "THE FOCUX" "objective"
npm.cmd run k7:connect -- "objective"
npm.cmd run k7:toolchain -- "objective"
npm.cmd run k7:openhands -- "objective"
npm.cmd run k7:advise -- --agent codex "objective"
```

API:

```http
POST /api/k7/cockpit
POST /api/k7/start
POST /api/k7/eval
POST /api/k7/connect
POST /api/k7/toolchain
POST /api/k7/openhands
POST /api/k7/advise
POST /api/k7/run
```

## Module Roles

- Activation Cockpit: asks the first question and keeps the flow minimal.
- Start Hub: default entrypoint that composes cockpit, metaskills, toolchain and eval into one packet.
- Metaskill Boot: selects the KAIZEN7 metaskills the editor or agent should load before acting.
- Eval Harness: proves whether KAIZEN7 reduces context, steps and tool noise on a real project start.
- Connector Kernel: creates the project/agent handshake.
- Toolchain Router: selects the smallest useful toolchain.
- Eval Firewall: blocks claims without evidence.
- OpenHands Adapter: creates bounded worker packets.
- Adapter Registry: connects external systems without making them core.
- Semantic Memory: avoids rereading the whole project.
- External Intelligence: absorbs GitHub/Hugging Face patterns without installing them.
- Production Readiness: proves the system is usable before trust.

## Anti-Megatool Rules

KAIZEN7 should not:

- load every module,
- read the whole vault,
- ask for broad context,
- expose every setting,
- run tools without scope,
- accept worker claims without evidence,
- save decorative memory.

KAIZEN7 should:

- ask only what changes the decision,
- activate only the needed metaskills,
- read at most the first useful nodes,
- select 1-3 tools,
- produce one next action,
- verify before closing,
- write only reusable learning.

## Product Line

```text
KAIZEN7 turns any project goal into the shortest verified path to execution.
```

Shorter:

```text
Less context. Fewer steps. Verified action.
```
