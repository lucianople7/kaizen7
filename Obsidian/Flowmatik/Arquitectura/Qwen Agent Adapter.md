# Qwen Agent Adapter

Fecha: 2026-06-26

## Veredicto

`test_later`

Qwen-Agent interesa para KAIZEN7 como adapter experimental de agentes, MCP, RAG y code interpreter.

No debe sustituir el nucleo actual:

```text
Codex + OpenAI + Obsidian + Product Genome + smart-crons + conectores aprobados
```

Qwen-Agent entra solo como capa opcional:

```text
K7 Qwen Agent Adapter
```

## Por que interesa

- Framework de agentes con tool calling.
- Soporte MCP.
- RAG y lectura de documentos largos.
- Code Interpreter basado en Docker.
- GUI rapida con Gradio.
- Puede usar DashScope o modelos OpenAI-compatible via vLLM/Ollama.
- Apache-2.0.
- Buen candidato para comparar agentes secundarios sin tocar el core.

## Rol correcto

Qwen-Agent debe usarse para probar:

- agentes secundarios,
- RAG sobre archivos largos,
- MCP externo,
- lectura y razonamiento sobre PDFs,
- prototipos con GUI,
- benchmarks de planificacion/tool calling,
- agentes locales con modelos Qwen.

No debe usarse para:

- reemplazar Codex,
- reemplazar Obsidian,
- reemplazar smart-crons,
- mover THE FOCUX directamente,
- ejecutar codigo sin sandbox revisado,
- introducir DashScope como dependencia obligatoria.

## Arquitectura propuesta

```text
KAIZEN7
  -> decide tarea
  -> K7 Judge valida necesidad
  -> Qwen Agent Adapter si procede
      -> MCP / RAG / Code Interpreter / GUI
      -> output estructurado
  -> KAIZEN7 evalua
  -> Obsidian registra
```

## Encaje con KAIZEN7

Buen encaje si el trabajo requiere:

- muchas herramientas externas,
- documentos largos,
- agente experimental separado,
- comparativa de modelos,
- prototipo rapido de assistant,
- flujo Python.

Mal encaje si el trabajo es:

- editar web THE FOCUX,
- escribir notas simples,
- tomar decisiones de marca,
- ejecutar tareas ya cubiertas por Codex,
- publicar cambios,
- manejar secretos.

## Encaje con THE FOCUX

No usarlo todavia en produccion de THE FOCUX.

Posibles pruebas futuras:

- leer PDFs de proveedores,
- comparar formulas,
- generar briefing desde estudios,
- responder preguntas sobre Signal Bowl,
- prototipar asistente interno de research,
- analizar largos documentos regulatorios.

## Riesgos

- Dependencia Python adicional.
- Puede traer demasiada arquitectura antes de necesitarla.
- DashScope requiere clave propia.
- Code Interpreter con Docker debe aislarse y revisarse.
- MCP puede ensuciar contexto si se activa todo a la vez.
- RAG no debe convertir claims sin fuente en afirmaciones comerciales.

## Regla Ponytail

Antes de activar Qwen-Agent, comprobar:

1. Puede hacerlo Codex directamente?
2. Puede hacerlo un script simple?
3. Puede hacerlo smart-cron?
4. Puede hacerlo un MCP existente?
5. Hay documentos largos o agentes secundarios que justifiquen Qwen-Agent?

Solo si la respuesta 5 es si, probar.

## Prueba minima

Objetivo:

Evaluar si Qwen-Agent mejora una tarea real de KAIZEN7 sin aumentar demasiado pasos ni tokens.

Prueba:

```text
Input:
  - carpeta pequeña con 3 notas Obsidian
  - 1 archivo largo de research
  - pregunta: "extrae 3 datos utiles, 1 riesgo y 1 accion minima para THE FOCUX"

Output esperado:
  - 3 datos con fuente
  - 1 riesgo
  - 1 accion minima
  - limite de confianza
  - JSON o Markdown estructurado
```

Metricas:

- pasos usados,
- tiempo,
- calidad de fuentes,
- claridad de output,
- si respeta guardrails THE FOCUX,
- si reduce trabajo frente a Codex directo.

Veredicto posible:

```text
keep_adapter
test_later
discard
```

## Decision operativa

No instalar todavia en el flujo principal.

Primero cerrar:

1. repos separados KAIZEN7 / THE FOCUX,
2. Signal Bowl,
3. Signal Radar,
4. publicacion inicial THE FOCUX,
5. biblioteca de fuentes reales.

Despues, probar Qwen-Agent como adapter de research/RAG, no como core.
