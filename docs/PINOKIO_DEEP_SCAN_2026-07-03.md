# Pinokio Deep Scan - 2026-07-03

## Objective

Find Pinokio apps that would materially benefit KAIZEN7, Flowmatik, Kaizen and THE FOCUX.

## Method

Used `pterm registry search` against the live Pinokio registry with Windows filtering across these capability areas:

- image generation
- video generation
- video editing
- TTS and voice
- transcription/subtitles
- LLM UI
- agents
- audio/music
- automation
- document/RAG
- ecommerce

## Decision

Do not install everything. The best path is a compact capability stack:

1. **ComfyUI** for visual asset generation.
2. **FreeCut** for local visual editing.
3. **AI Video Composer** for agent-driven FFmpeg editing.
4. **Whisper-WebUI** for transcription and subtitles.
5. **Open WebUI** only as local LLM UI, not as KAIZEN7 core.
6. **n8n** only when workflows become recurring.

## Best Finds

### 1. ComfyUI - Pinokio Factory

- App id: `github-com-pinokiofactory-comfy`
- Repo: `https://github.com/pinokiofactory/comfy`
- Why it matters: strongest ComfyUI signal found. High saves/check-ins, Windows support, AMD/NVIDIA/Apple support.
- Use: Kaizen images, THE FOCUX product visuals, Flowmatik scene assets.
- Risk: heavy install.
- Recommendation: highest-value install if disk/time budget is acceptable.

### 2. FreeCut

- App id: `github-com-sup3rmass1ve-freecut`
- Repo: `https://github.com/SUP3RMASS1VE/freecut`
- Why it matters: local browser-based video editor with multi-track editing and exports.
- Use: manual polish and review layer for Flowmatik renders.
- Risk: medium.
- Recommendation: install early.

### 3. AI Video Composer

- App id: `github-com-pinokiofactory-ai-video-composer`
- Repo: `https://github.com/pinokiofactory/ai-video-composer`
- Why it matters: natural-language video editing over FFmpeg.
- Use: provider candidate for `video.edit.natural_language`.
- Risk: medium.
- Recommendation: evaluate after FreeCut.

### 4. Whisper-WebUI

- App id: `github-com-pinokiofactory-whisper-webui`
- Repo: `https://github.com/pinokiofactory/whisper-webui`
- Why it matters: subtitles and transcription.
- Use: captions, content repurposing, library ingestion.
- Risk: medium.
- Recommendation: install before scaling video volume.

### 5. Open WebUI

- App id: `github-com-pinokiofactory-open-webui`
- Repo: `https://github.com/pinokiofactory/open-webui`
- Why it matters: strong local LLM UI for Ollama/OpenAI-compatible endpoints.
- Use: human-facing local LLM testing.
- Risk: medium.
- Recommendation: useful, but not urgent because KAIZEN7 remains the kernel.

### 6. n8n

- App id: `github-com-sup3rmass1ve-n8n-pinokio`
- Repo: `https://github.com/SUP3RMASS1VE/N8N-Pinokio`
- Why it matters: workflow automation.
- Use: scheduled publishing, research refresh, ecommerce ops.
- Risk: medium.
- Recommendation: install when workflows are repeated enough to justify it.

### 7. Stable Audio 3

- App id: `github-com-cocktailpeanut-stable-audio-3-small-pinokio`
- Repo: `https://github.com/cocktailpeanut/stable-audio-3-small.pinokio`
- Why it matters: local music/SFX generation.
- Use: Flowmatik sound identity and SFX.
- Risk: heavy.
- Recommendation: defer until visual/video pipeline is stable.

## Deferred For Now

- **Wan2GP / LTX / FramePack / VideoCrafter**: powerful, but GPU-sensitive and heavy.
- **DramaBox / VoxCPM / MOSS-TTS / ChatterBox**: interesting for Kaizen voice, but many are NVIDIA-oriented.
- **Odysseus / Hermes Agent / Vibe Kanban**: useful as future agent benchmarks, not first installs.
- **Ecommerce**: no strong Pinokio result found for ecommerce. Use Shopify/Medusa/BigBuy/other channels outside Pinokio.

## Recommended Install Order

1. `ComfyUI` or `FreeCut`
2. `Whisper-WebUI`
3. `AI Video Composer`
4. `Open WebUI`
5. `n8n`
6. `Stable Audio 3`
7. Agent experiments

## KAIZEN7 Interpretation

Pinokio is best used as a **local capability installer and app runtime**, not as the main brain.

KAIZEN7 should keep:

- capability registry
- routing
- verification
- memory
- project context

Pinokio should provide:

- install
- start/stop
- local app hosting
- Hugging Face authenticated app runtime
- localhost domains

