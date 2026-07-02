# KAIZEN7 Universal Capability Forge Reorientation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorient the repository so KAIZEN7 is developed as a Universal Capability Forge that thinks, searches, absorbs patterns, adapts or builds minimal capabilities, executes with evidence, and remembers reusable learning.

**Architecture:** Keep the existing capability kernel as the core. Add a forge layer above the provider registry and anything CLI, then prune or archive surfaces that do not support capability forging, evidence, memory, or agent execution. Treat Pinokio, Stability Matrix, GitHub, Hugging Face, MCPs and local tools as replaceable provider catalogs, not as the product center.

**Tech Stack:** Node.js >=20, file-based JSON registries, local JavaScript modules, existing Python `core.py` capability bridge, Obsidian markdown memory, Git/GitHub remote `origin`.

## Global Constraints

- Prefer free, open-source, local-first, CPU-first providers by default.
- GPU, paid APIs, cloud providers, publication, deletion, credential changes and heavy downloads require approval.
- Do not copy full external projects into KAIZEN7; absorb patterns by default.
- Do not delete existing project material until it has been classified as `keep`, `archive`, or `remove`.
- Keep Flowmatik, THE FOCUX and clip creation as capability packs or demos, not as the KAIZEN7 core.
- Each implementation task must leave evidence: changed files, test command, result, risks.

---

## File Structure

- `docs/superpowers/specs/2026-07-02-kaizen7-universal-capability-forge-design.md`
  Canonical design already written.
- `docs/superpowers/plans/2026-07-02-kaizen7-universal-capability-forge-reorientation.md`
  This implementation plan.
- `docs/UNIVERSAL_CAPABILITY_FORGE.md`
  Product-facing architecture summary to create in Task 1.
- `data/anything-tools.json`
  Existing provider registry to extend in later tasks.
- `data/capabilities.json`
  Existing capability registry to align with forge capabilities.
- `lib/anything-cli.js`
  Existing CLI front door to extend with `forge`, `providers`, `absorb`, `packet`, `doctor`.
- `lib/anything-tool-registry.js`
  Existing provider resolver to evolve into provider scoring.
- `core.py`
  Existing local capability bridge; keep as Python capability manager.
- `Obsidian/Flowmatik/Arquitectura/`
  Canonical memory location for architectural decisions.

## Task 1: Reorientation Docs And Memory

**Files:**
- Create: `docs/UNIVERSAL_CAPABILITY_FORGE.md`
- Create: `Obsidian/Flowmatik/Arquitectura/KAIZEN7 Universal Capability Forge.md`
- Modify: `README.md`
- Modify: `KAIZEN7_INDEX.md`

**Interfaces:**
- Consumes: canonical spec `docs/superpowers/specs/2026-07-02-kaizen7-universal-capability-forge-design.md`.
- Produces: public repo direction and Obsidian memory that later tasks can reference.

- [ ] **Step 1: Create the product architecture doc**

Add `docs/UNIVERSAL_CAPABILITY_FORGE.md` with:

```markdown
# KAIZEN7 Universal Capability Forge

KAIZEN7 converts real needs into executable, verifiable and reusable capability paths.

Core flow:

```text
Need
  -> intent
  -> capability
  -> provider or pattern search
  -> adapter or minimal build
  -> execution packet
  -> evidence gate
  -> memory writeback
```

Default criteria:

- free or open source first
- CPU-first or no-GPU by default
- local-first when practical
- agent-readable interfaces
- minimal setup
- verifiable outputs
- reusable memory

KAIZEN7 does not depend on one tool. Pinokio, Stability Matrix, ComfyUI, FFmpeg, Remotion, Whisper-style tools, Ollama, SearXNG, MCPs and future providers are replaceable paths.
```

- [ ] **Step 2: Create the Obsidian architecture memory**

Add `Obsidian/Flowmatik/Arquitectura/KAIZEN7 Universal Capability Forge.md` with:

```markdown
# KAIZEN7 Universal Capability Forge

## Decision

KAIZEN7 is now focused on becoming a Universal Capability Forge.

## Meaning

KAIZEN7 should think, search, absorb patterns, adapt or build the minimum useful capability, execute with evidence and remember reusable learning.

## Default Criteria

- Free/open source first.
- CPU-first by default.
- GPU and paid services are optional upgrades.
- Agent-native surfaces are preferred.
- Evidence closes every task.

## Product Boundary

Flowmatik, THE FOCUX and clips are capability packs or demos. They are not the core.

## Next

Implement provider radar, pattern absorber, adapter forge and evidence loop in small verified slices.
```

- [ ] **Step 3: Update README**

Replace or add the opening direction in `README.md`:

```markdown
# KAIZEN7

KAIZEN7 is a Universal Capability Forge for agentic work. It converts real needs into executable, verifiable and reusable capability paths.

The core loop is:

```text
need -> capability -> provider or pattern -> adapter or minimal build -> execution packet -> evidence -> memory
```

KAIZEN7 prefers free, open-source, CPU-first and local-first paths. It can use tools such as Pinokio, Stability Matrix, ComfyUI, FFmpeg, Remotion, local transcribers, Ollama, SearXNG, MCPs and future providers, but those tools are replaceable. The center is the capability forge.
```

- [ ] **Step 4: Update index**

Add `docs/UNIVERSAL_CAPABILITY_FORGE.md` and the Obsidian architecture note to `KAIZEN7_INDEX.md`.

- [ ] **Step 5: Verify docs**

Run:

```powershell
Select-String -Path README.md,KAIZEN7_INDEX.md,docs\UNIVERSAL_CAPABILITY_FORGE.md -Pattern "Universal Capability Forge"
```

Expected: matches in all three files.

- [ ] **Step 6: Commit**

```powershell
git add README.md KAIZEN7_INDEX.md docs/UNIVERSAL_CAPABILITY_FORGE.md "Obsidian/Flowmatik/Arquitectura/KAIZEN7 Universal Capability Forge.md"
git commit -m "orient kaizen7 toward universal capability forge"
```

## Task 2: Repository Classification Before Pruning

**Files:**
- Create: `docs/REPO_REORIENTATION_AUDIT.md`

**Interfaces:**
- Consumes: current top-level repo tree.
- Produces: explicit `keep`, `archive`, `remove`, `decide_later` classification.

- [ ] **Step 1: Generate top-level inventory**

Run:

```powershell
Get-ChildItem -Name
```

- [ ] **Step 2: Create classification doc**

Create `docs/REPO_REORIENTATION_AUDIT.md` with sections:

```markdown
# KAIZEN7 Repo Reorientation Audit

## Keep In Core

- `data/`
- `lib/`
- `tests/`
- `docs/`
- `core.py`
- `package.json`
- `README.md`
- `KAIZEN7_INDEX.md`

## Keep As Capability Pack Or Demo

- `Obsidian/Flowmatik/`
- `Obsidian/TheFocux/`
- `content_library/`
- `remotion/`
- `THE_FOCUX_SIGNAL_LIBRARY/`

## Archive Candidate

- `flowmatik_os/`
- `flowmatik_studio/`
- `site/`
- `public/`
- `assets/`
- `artifacts/`

## Remove Candidate After Approval

- `.tmp-cli-anything-hub/`
- `.tmp-video-deps/`
- `__pycache__/`

## Decide Later

- `mcp/`
- `n8n/`
- `pip/`
- `tools/`
- `scripts/`
- `skills/`
```

- [ ] **Step 3: Verify classification has no delete action**

Run:

```powershell
Select-String -Path docs\REPO_REORIENTATION_AUDIT.md -Pattern "Remove Candidate After Approval"
```

Expected: section exists, but no filesystem deletion has happened.

- [ ] **Step 4: Commit**

```powershell
git add docs/REPO_REORIENTATION_AUDIT.md
git commit -m "audit repo for forge reorientation"
```

## Task 3: Safe Cleanup After User Approval

**Files:**
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `docs/REPO_REORIENTATION_AUDIT.md`.
- Produces: deletion or archival only after explicit approval of exact paths.

- [ ] **Step 1: Ask for approval of exact paths**

Ask:

```text
Approve deleting only these generated/cache paths?
- .tmp-cli-anything-hub/
- .tmp-video-deps/
- __pycache__/
```

- [ ] **Step 2: If approved, verify paths stay inside repo**

Run:

```powershell
Resolve-Path .tmp-cli-anything-hub, .tmp-video-deps, __pycache__
```

Expected: every path starts with `C:\Users\lucia\OneDrive\Documentos\kaizen7\`.

- [ ] **Step 3: Delete approved generated/cache paths**

Run only after approval and path verification:

```powershell
Remove-Item -LiteralPath .tmp-cli-anything-hub -Recurse -Force
Remove-Item -LiteralPath .tmp-video-deps -Recurse -Force
Remove-Item -LiteralPath __pycache__ -Recurse -Force
```

- [ ] **Step 4: Ensure generated paths are ignored**

Make sure `.gitignore` includes:

```gitignore
.tmp-cli-anything-hub/
.tmp-video-deps/
__pycache__/
```

- [ ] **Step 5: Commit cleanup**

```powershell
git add .gitignore
git commit -m "clean generated repo clutter"
```

## Task 4: GitHub Publication

**Files:**
- Git state only.

**Interfaces:**
- Consumes: committed local changes.
- Produces: remote branch updated on GitHub.

- [ ] **Step 1: Confirm remote**

Run:

```powershell
git remote -v
```

Expected: `origin` points to `https://github.com/Lucianople7/kaizen7.git`.

- [ ] **Step 2: Confirm branch**

Run:

```powershell
git branch --show-current
```

Expected: `codex/openhands-remote-worker` unless the user requests a new branch.

- [ ] **Step 3: Push**

Run:

```powershell
git push -u origin codex/openhands-remote-worker
```

Expected: remote branch updates successfully.

- [ ] **Step 4: Report result**

Return branch, latest commit, remote URL and any remaining uncommitted files.

## Self-Review

- Spec coverage: plan covers orientation docs, memory, classification, safe cleanup and GitHub push.
- Placeholder scan: no TODO/TBD/FIXME placeholders are used.
- Type consistency: no code interfaces are introduced yet; command names match existing `k7:anything` direction.
- Scope warning: deleting broad product folders is intentionally excluded until after a classification review and explicit path approval.
