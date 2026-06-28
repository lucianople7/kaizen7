# OpenCut Video Adapter

## Actualizacion 2026-06-25

### Decision

OpenCut es un candidato interesante para el futuro editor visual de Flowmatik/KAIZEN7, pero no debe ser dependencia central todavia.

La version nueva esta en reescritura y promete piezas muy alineadas con KAIZEN7:

- Editor API.
- Plugins de terceros.
- Desktop, mobile y browser desde una base comun.
- Rust core.
- MCP server para agentes.
- Headless mode para automatizacion y batch rendering.
- Scripting dentro del editor.

Hasta que esa arquitectura este estable, la opcion practica es:

1. Usar `opencut-classic` o la web actual solo como editor manual si hace falta.
2. Mantener Remotion/FFmpeg como pipeline automatizable.
3. Revaluar OpenCut cuando el MCP server, headless mode y Editor API esten disponibles.

### Encaje con THE FOCUX

OpenCut puede servir como capa de edicion humana para:

- clips NeuroCity,
- Shorts/Reels/TikTok,
- videos educativos,
- plantillas de marca,
- revision visual antes de publicar.

No debe bloquear el primer objetivo: publicar landing, captar leads y producir los primeros contenidos.

### Encaje con KAIZEN7

```text
KAIZEN7 Content Factory
  -> guion
  -> prompts visuales / assets
  -> Remotion o FFmpeg para render automatizado
  -> OpenCut para ajuste humano opcional
  -> aprobacion
  -> publicacion
  -> metricas
  -> Product Genome
```

### Regla Ponytail

No integrar OpenCut por hype. Integrarlo solo cuando:

- tengamos una necesidad real de edicion visual,
- el pipeline automatizado no baste,
- y OpenCut ofrezca API/headless/MCP estable.

### Siguiente accion

Para los primeros contenidos de THE FOCUX, usar un flujo simple:

1. Guion NeuroCity.
2. Key art o escenas generadas.
3. Edicion vertical simple con FFmpeg/Remotion.
4. Ajuste manual opcional en OpenCut/CapCut.
5. Medicion de retencion, saves, shares y conversion a newsletter.
