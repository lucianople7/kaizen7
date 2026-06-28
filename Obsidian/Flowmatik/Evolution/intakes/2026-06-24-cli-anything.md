# Intake — CLI-Anything (HKUDS/CLI-Anything)

**Sistema:** KAIZEN7  
**Fecha:** 2026-06-24  
**Veredicto:** `adapt_pattern` (parcial) + `adopt_now` (videocaptioner)

---

## Qué es

Framework para hacer cualquier software agent-native via CLI generado automáticamente.
43.8k stars. 2,461 tests. 45+ herramientas cubiertas (Blender, GIMP, OBS, LibreOffice, ComfyUI...).

Plugin original: `/cli-anything <software>` genera CLI completo en 7 fases.
CLI-Hub: `pip install cli-anything-hub` → gestor de CLIs de la comunidad.

---

## Anti-hype filter

- NO instalar el framework completo — es un generador, no un runtime que necesitamos
- NO usar para reemplazar lo que ya funciona (FFmpeg pipeline, Remotion)
- La mayoría de los 45+ CLIs no son relevantes para thefocux ni FlowmatikOS ahora mismo

---

## Piezas extraídas

### 1. `cli-anything-videocaptioner` → `adopt_now`
**Por qué:** NeuroCity TikTok necesita subtítulos quemados. Este CLI ya existe.
```bash
pip install cli-anything-hub
cli-hub install videocaptioner
cli-anything-videocaptioner transcribe --input video.mp4 --output subs.srt
cli-anything-videocaptioner burn --input video.mp4 --subs subs.srt --output captioned.mp4
```
**Acción:** Integrar en FlowmatikOS pipeline. Paso post-render, pre-publicación.
**Estado:** Pendiente instalación y test

### 2. Patrón SKILL.md con veredictos → `adapt_pattern`
**Por qué:** El Evolution Engine de Kaizen7 ya tiene este patrón (adopt_now, adapt_pattern, test_later, reference_only, reject) — confirma que el enfoque es correcto.
**Acción:** Ninguna adicional — ya está implementado en Kaizen7 Evolution Engine.

### 3. `/cli-anything` plugin → `test_later`
**Por qué:** Podría generar CLIs agent-native para herramientas del stack (n8n, Remotion).
**Condición de activación:** Cuando el pipeline esté publicando regularmente y haya una herramienta que se repita manualmente más de 3 veces.

---

## Descartado

- CLI-Hub meta-skill → ya tenemos Kaizen7 para esto
- cli-anything-blender, gimp, comfyui → no son el stack actual
- cli-anything-obs-studio → no usamos OBS en el pipeline actual
- El resto de los 45+ CLIs → irrelevantes para thefocux/FlowmatikOS ahora

---

## Próximo paso

```
HANDOFF → KAIZEN7 / Codex
Tarea: instalar cli-anything-videocaptioner y testear con E01-The38Percent.mp4
Input: C:\Users\lucia\Desktop\FlowmatikOS\output\flowmatik_tokyo_berlin_20260624_0359.mp4
Output esperado: video con subtítulos quemados en español/inglés
Aprobación requerida: NO (instalación local, sin efectos externos)
```
