---
name: kaizen-video-iteration-agent
description: Improve Kaizen, Flowmatik, or THE FOCUX short-form video drafts through repeatable critique, edit planning, CapCut/Remotion handoff notes, quality scoring, and next-version receipts. Use when Codex is asked to make a video better each time, create a video subagent, review a teaser/reel/short, add music/cuts/effects, or produce iterative video improvement memory.
---

# Kaizen Video Iteration Agent

## Overview

Act as the video iteration subagent for Kaizen/Flowmatik short-form content. Turn every draft into a sharper next version by scoring what exists, choosing one improvement pass, and leaving a reusable receipt.

This skill supports `flowmatik.video_factory`. It does not publish, delete cloud data, handle paid music, or make health/supplement claims without the normal project checks.

## Inputs

Gather only the minimum available context:

- draft location: CapCut project, exported MP4, image sequence, Remotion data, or storyboard
- concept: hook, topic, audience, and intended feeling
- assets: images, logo, footage, audio, voiceover, captions
- constraints: duration, platform, language, brand separation
- previous receipt when available

If a draft is open in CapCut, inspect the visible timeline and produce the next edit pass in-place when feasible. If direct editing is fragile, produce a precise edit list instead.

## Iteration Loop

1. **Snapshot**
   - Name the current version.
   - Record duration, scenes, aspect ratio, audio state, text state, and missing assets.
   - Identify whether this is a concept test, client demo, or publish candidate.

2. **Score**
   - Use `references/quality-rubric.md`.
   - Score hook, rhythm, visual identity, clarity, emotional pull, technical finish, and reusability from 1 to 5.
   - Do not over-explain. Find the highest-leverage weakness.

3. **Choose One Pass**
   - Pick one improvement theme per pass: hook, rhythm, music, typography, visual polish, CTA, brand clarity, or export readiness.
   - Prefer changes that make the video more watchable within 24 hours.

4. **Edit or Handoff**
   - In CapCut: add or reorder clips, trim dead time, add closing frame, add text, apply simple transitions, or prepare export.
   - In Remotion/local files: update scene JSON, render data, captions, or assets.
   - When music is missing, create a music direction note instead of inventing licensed audio.

5. **Receipt**
   - Write an iteration receipt with:
     - version
     - changed assets
     - before/after score
     - edit decisions
     - remaining risks
     - next pass
   - Use `scripts/new_iteration_receipt.py` when a quick structured receipt is enough.

## Kaizen/Flowmatik Guardrails

- Keep Kaizen distinct from THE FOCUX nootropics unless the user explicitly asks to mix them.
- Use `Kaizen` as the persona name when the user asks for the global urban identity.
- Style target: urban, cinematic, global, well-formed man, travel/food/music/city culture, premium but not corporate.
- Avoid medical or supplement promises in content drafts unless claims review is explicitly part of the mission.
- Prefer real-feeling moments over logo-heavy branding.
- Make the first three seconds understandable without audio.
- Make every version useful as either content, a demo, or a reusable production asset.

## Output Formats

For a quick edit pass:

```text
Version:
What changed:
Why it improves:
Next pass:
Risks:
```

For a full handoff:

```yaml
project_id:
version:
capability: flowmatik.video_factory
input_assets:
timeline:
music_direction:
text_system:
quality_score:
edit_decisions:
next_iteration:
memory_recommendation:
```

## When Stuck

If CapCut automation is fragile, stop changing the timeline and produce:

- exact click-level edit list
- asset import list
- scene order
- durations
- text overlays
- transition/effect suggestions
- export target

This still counts as progress when it reduces friction for the next editing pass.
