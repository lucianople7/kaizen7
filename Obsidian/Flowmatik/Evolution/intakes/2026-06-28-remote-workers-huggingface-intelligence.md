# 2026-06-28 - Remote Workers + Hugging Face Intelligence

## Necesidad

Mejorar KAIZEN7 como core de agentes/proyectos incorporando patrones actuales de GitHub y Hugging Face sin sustituir su nucleo.

## Fuentes revisadas

### GitHub

- OpenHands/OpenHands: control center self-hosted para agentes locales, remotos y cloud. Patron util: worker backends reemplazables.
- SWE-agent/SWE-agent: issue-to-patch con entorno, comandos y verificacion. Patron util: paquete acotado de trabajo.
- Aider-AI/aider: pair programming terminal con contexto compacto y diffs visibles. Patron util: retorno diff-first.
- microsoft/autogen: workflows declarativos y evaluacion. Patron util futuro; no se adopta ahora como framework.

### Hugging Face

- `BAAI/bge-m3`: referencia fuerte para futura memoria semantica multilingue.
- `BAAI/bge-reranker-v2-m3`: reranking opcional si el contexto lexical se queda corto.
- `Qwen/Qwen3-Embedding-0.6B`: referencia ligera para embeddings.
- `princeton-nlp/SWE-bench_Verified`: forma de evaluacion issue -> patch -> tests -> pass/fail.
- `ScaleAI/SWE-bench_Pro`: referencia futura para tareas largas.

## Veredicto

`adapt_pattern`

## Patron absorbido

Crear una capa `external-intelligence` y un adaptador `remote_worker`:

```text
KAIZEN7 decide -> remote worker ejecuta -> KAIZEN7 verifica -> humano aprueba -> memoria registra
```

El worker recibe objetivo, contexto minimo, paths permitidos, acciones prohibidas, comandos de verificacion y formato de retorno.

## Que se descarta

- No instalar OpenHands, SWE-agent, aider, AutoGen ni modelos HF por defecto.
- No convertir ningun agente externo en core.
- No afirmar rendimiento en SWE-bench ni calidad de embeddings sin evaluacion local.
- No permitir publish, deploy, delete, spend ni credenciales desde workers.

## Cambios aplicados

- `lib/external-intelligence.js`: registro curado de patrones GitHub/HF y recomendador.
- `lib/adapter-registry.js`: nuevo kind `remote_worker`, paquete acotado y gates.
- `lib/connector-kernel.js`: expone `externalIntelligence`.
- `tests/external-intelligence.test.js`: tests del registro externo.
- `tests/adapter-registry.test.js`: tests del nuevo worker remoto.
- `docs/UNIVERSAL_ADAPTERS.md`: contrato remoto.
- `docs/ADAPTERS_AND_PATTERNS.md`: patrones absorbidos.

## Verificacion

- `node tests/external-intelligence.test.js` pasa.
- `node tests/adapter-registry.test.js` pasa.
- `node tests/connector-kernel.test.js` pasa.
- `npm.cmd run check` pasa.
- `npm.cmd run k7:ready` pasa con 70 checks, 0 blockers.

## Siguiente accion

Conectar esta inteligencia externa al futuro `Project Activation Cockpit`, mostrando:

- recomendaciones GitHub/HF,
- gates de permisos,
- paquete de worker remoto,
- verificacion requerida,
- memory writeback.

## Actualizacion OpenHands

Se implemento una orientacion mas fuerte hacia OpenHands:

- `lib/openhands-adapter.js`: genera un paquete especifico para OpenHands Agent Canvas / Agent Server.
- `npm.cmd run k7:openhands -- "<objective>"`: comando operativo para crear el briefing.
- El Connector Kernel recomienda OpenHands cuando el objetivo menciona OpenHands, Agent Canvas o remote worker.
- El contrato favorece Docker sandbox o `PROJECTS_PATH` dedicado.

Regla:

```text
OpenHands ejecuta. KAIZEN7 decide scope, memoria, gates y verificacion.
```

No se instala ni se ejecuta OpenHands automaticamente. Primero se genera el paquete seguro.
