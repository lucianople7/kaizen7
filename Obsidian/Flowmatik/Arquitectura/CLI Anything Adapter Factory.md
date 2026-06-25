# CLI Anything Adapter Factory

## Actualizacion 2026-06-25

### Decision

CLI-Anything es candidato para ser una fabrica de adaptadores CLI para KAIZEN7 cuando una herramienta importante no tenga API, MCP o CLI limpia.

No debe convertirse en el nucleo del sistema. KAIZEN7 sigue usando:

```text
Codex + OpenAI + Obsidian + Product Genome + conectores aprobados
```

CLI-Anything entra solo como capa `K7 Operator Adapter Factory`.

### Por que interesa

- Convierte software existente en CLIs estructuradas para agentes.
- Evita automatizacion visual fragil basada en clicks y capturas.
- Genera SKILL.md junto al CLI, facilitando que KAIZEN7 entienda como usarlo y mantenerlo.
- Tiene ejemplos relevantes para Flowmatik:
  - Blender,
  - GIMP,
  - Inkscape,
  - Audacity,
  - Kdenlive,
  - Shotcut,
  - OBS Studio,
  - LibreOffice,
  - Draw.io,
  - VideoCaptioner,
  - ComfyUI.

### Casos utiles para KAIZEN7

Usarlo si necesitamos controlar:

- edicion de video sin API estable,
- subtitulado y captioning,
- render 3D o mockups de producto,
- conversion de documentos,
- generacion de diagramas,
- software local profesional que no tenga conector propio.

### Regla Ponytail

Antes de usar CLI-Anything, comprobar:

1. ¿Existe ya una API oficial?
2. ¿Existe CLI oficial?
3. ¿Existe MCP estable?
4. ¿Puede resolverse con FFmpeg/Remotion/Playwright/simple script?
5. Solo entonces considerar CLI-Anything.

### Riesgos

- Generar un CLI completo puede ser trabajo grande.
- Puede requerir software real instalado localmente.
- Algunos harnesses necesitan refinamiento antes de ser fiables.
- Hay que validar con tests reales, no asumir que el CLI generado funciona.
- No debe instalarse globalmente sin una necesidad concreta.

### Aplicacion a THE FOCUX

No usarlo para lanzar la web ni la lista de espera.

Posibles usos posteriores:

- automatizar subtitulos de clips NeuroCity,
- crear mockups visuales de productos,
- renderizar assets de marca,
- generar diagramas educativos,
- preparar documentos/pdfs de dossiers.

### Decision operativa

Para el primer ciclo de THE FOCUX:

```text
Landing -> founding list -> NeuroCity clip -> dossier -> newsletter -> metricas
```

No se necesita CLI-Anything.

Para el segundo ciclo, si el cuello de botella es produccion multimedia local, probar primero un harness ya existente como VideoCaptioner, Blender, GIMP, Kdenlive o Shotcut desde CLI-Hub.
