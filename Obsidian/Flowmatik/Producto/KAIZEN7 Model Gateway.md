# KAIZEN7 Model Gateway

Fecha: 2026-06-28

## Decision

KAIZEN7 queda abierto a cualquier modelo top del mercado mediante una capa comun:

```text
KAIZEN7 core
+
Model Gateway
+
proveedores intercambiables
```

Regla:

```text
Model Gateway != KAIZEN7 core
Model Gateway = capa de ejecucion intercambiable
```

## Proveedores preparados

- OpenAI Responses API.
- Anthropic Messages API.
- Google Gemini API.
- Groq.
- Mistral.
- OpenRouter.
- Ollama/local compatible.
- Cualquier API compatible con OpenAI chat completions.

## Que cambia

KAIZEN7 deja de estar mentalmente centrado en OpenAI como unica salida.

OpenAI sigue siendo un companero fuerte, especialmente para Agents SDK y posible Apps/MCP, pero el core no depende de el.

## Interfaces

CLI:

```powershell
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openai "objetivo"
npm.cmd run k7:models -- --provider anthropic "objetivo"
npm.cmd run k7:models -- --provider google "objetivo"
npm.cmd run k7:models -- --provider openrouter "objetivo"
npm.cmd run k7:models -- --provider ollama "objetivo"
```

API:

```http
GET /api/k7/models
POST /api/k7/models
POST /api/chat
```

`POST /api/chat` acepta:

- `provider`
- `model`
- `messages`

## Criterio de uso

- Razonamiento fuerte: mejor modelo disponible.
- Tareas rapidas: modelo barato y veloz.
- Privacidad: local/Ollama.
- Comparativa de mercado: OpenRouter u otro agregador.
- Apps/OpenAI/MCP: OpenAI Agents SDK cuando aporte trazas, guardrails o handoffs.

## Guardrail

Si falta una clave, el proveedor responde como `unavailable` y KAIZEN7 sigue funcionando en local.

Ningun proveedor puede:

- tocar credenciales,
- publicar,
- gastar,
- borrar,
- desplegar,
- escribir memoria permanente

sin confirmacion humana explicita.

## Archivos

- `lib/model-gateway.js`
- `tests/model-gateway.test.js`
- `docs/MODEL_GATEWAY.md`
- `.env.example`
- `kaizen.connectors.json`
- `server.js`
- `package.json`

## Siguiente accion

Crear un router inteligente que elija proveedor por tipo de tarea, coste, privacidad y latencia.
