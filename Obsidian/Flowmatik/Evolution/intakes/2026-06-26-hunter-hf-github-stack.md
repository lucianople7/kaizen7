# Hunter HF + GitHub Stack Intake

## Necesidad

Convertir Hunter en el motor diario de evolucion para KAIZEN7 y THE FOCUX: buscar, evaluar, absorber y reemplazar modulos segun evidencia real.

## Decision

Incorporar un registry operativo en `data/hunter-registry.json` con candidatos aprobados por modulo. Esto no instala dependencias; fija el mapa de adopcion y evita incorporar herramientas por entusiasmo.

## Incorporados como `adopt_now`

- `BAAI/bge-m3`: embeddings multilingues para memoria semantica.
- `unclecode/crawl4ai`: web-to-Markdown para Signal Radar y Hunter.
- `lancedb/lancedb`: vector store local embebido.
- `Qwen/AgentWorldBench`: dataset/benchmark para evaluar agentes.
- `Gradio Spaces`: runtime de prototipos para herramientas internas y demos.

## Incorporados como `adapt_pattern`

- `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`: fallback pequeno de embeddings.
- `remotion-dev/remotion`: patron de video programatico para NEUROCITY.
- `ggml-org/whisper.cpp`: transcripcion offline/subtitulos.
- `PaddlePaddle/PP-OCRv5_server_det`: OCR packaging/documentos.
- `abidlabs/OpenAPI2MCP`: patron para convertir APIs en herramientas MCP.

## En prueba posterior

- `browser-use/browser-use`: automatizacion web interactiva.
- `qdrant/qdrant`: vector DB de escala cuando LanceDB no baste.
- `rednote-hilab/dots.mocr`: OCR/layout avanzado.

## Solo referencia

- `firecrawl/firecrawl`: gran referencia de producto, pero AGPL.
- `gitroomhq/postiz-app`: referencia de scheduler social, pero AGPL y riesgo OAuth/plataformas.
- `OpenCut-app/OpenCut`: referencia UX de editor, no core.
- `Glint-Research/Fable-5-traces`: trazas utiles, pero AGPL.

## Regla de adopcion

No se instala nada hasta que exista tarea con:

- modulo,
- beneficio esperado,
- riesgo,
- prueba minima,
- criterio de salida,
- donde queda la memoria.

## Siguiente accion

Construir `Hunter Daily Radar v0` con tres fuentes:

1. GitHub repos/releases.
2. Hugging Face models/datasets/Spaces/papers.
3. Signal Bowl de THE FOCUX.

