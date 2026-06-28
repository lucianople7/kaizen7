# NotebookLM Content Intelligence Adapter

Fecha: 2026-06-25

## Veredicto

`test_later`

NotebookLM CLI/MCP encaja muy bien como capa de inteligencia de contenido para KAIZEN7, especialmente junto a Remotion. No debe ser el core de memoria ni sustituir Obsidian/Product Genome.

## Rol correcto

NotebookLM sirve para convertir fuentes en:

- resumen profundo
- briefing
- guion base
- audio/podcast
- infografia
- slides
- mind map
- preguntas y respuestas sobre fuentes

Remotion sirve para convertir guiones y assets en:

- reels
- shorts
- clips 9:16
- intros
- visual explainers
- piezas de NeuroCity

## Arquitectura

```text
Fuentes reales
  -> NotebookLM
  -> briefing / podcast / guion
  -> K7 Judge
  -> Remotion / OpenCut
  -> pieza final
  -> Product Genome
```

## Encaje THE FOCUX

Usos buenos:

- dossier de nootropicos premium
- episodios de NeuroCity basados en fuentes
- podcast educativo de salud cognitiva
- briefing de proveedor o ingrediente
- serie corta: "Tu cerebro no falla por edad, falla por descuido"

## Riesgos

- Usa APIs internas no oficiales.
- Requiere cookies de Google.
- Puede romperse si Google cambia NotebookLM.
- Tiene muchas herramientas MCP; puede ensuciar contexto si se deja siempre activo.
- No debe guardar secretos ni cookies en Obsidian.

## Regla KAIZEN7

Activar NotebookLM solo para trabajos de contenido con fuentes:

```text
Hay fuentes largas o muchas fuentes -> NotebookLM
Hay que renderizar video -> Remotion
Hay que publicar -> API oficial + aprobacion humana
Hay que recordar decisiones -> Obsidian/Product Genome
```

## Siguiente accion recomendada

No instalar todavia en automatico.

Primero crear en KAIZEN7 el flujo:

```text
source-pack -> briefing -> script -> remotion-plan -> genome-record
```

Cuando ese flujo exista, probar NotebookLM como backend opcional para la fase `briefing`.
