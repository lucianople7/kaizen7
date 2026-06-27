# K7 Connector Kernel

Fecha: 2026-06-27

## Decision

KAIZEN7 necesita una puerta universal para que Codex, Flowmatik, DeFocus, MCPs, APIs, CLIs, herramientas de codigo y agentes externos se conecten una vez y reciban el contexto correcto.

El Connector Kernel es esa puerta.

## Contrato

```text
project -> profile -> route -> context pack + metaskills + connectors + discovery + action + verification + writeback policy
```

## Implementacion

- `lib/connector-kernel.js`
- `lib/onboarding.js`
- `npm.cmd run k7:connect -- "objective"`
- `npm.cmd run k7:onboard -- --preset codex "objective"`
- `POST /api/k7/connect`
- `POST /api/k7/onboard`
- `docs/CONNECTOR_KERNEL.md`

## Rutas

- `code`: Codex, tests, refactors, implementacion.
- `agent`: agentes externos, MCP, SDK, API, tools.
- `research`: GitHub, Hugging Face, frontier, repos.
- `social`: contenido y redes con gates de publicacion.
- `commerce`: Shopify, ecommerce, proveedores y producto.
- `memory`: Obsidian, segundo cerebro y writeback draft.
- `orchestrate`: ruta mixta por defecto.

## Regla

No es fine-tuning real automatico.

Es auto-adaptacion operativa:

```text
memoria + metaskills + repos/senales + herramientas + verificacion + aprobaciones
```

## Gates

- No publicar sin aprobacion.
- No desplegar sin aprobacion.
- No gastar sin aprobacion.
- No borrar sin aprobacion.
- No tocar credenciales.
- No instalar dependencias automaticamente.
- No guardar secretos en memoria.

## Conectividad

`k7:connect` debe pedir lo que falta para ahorrar pasos:

- GitHub para repos y patrones.
- Hugging Face para modelos, datasets, Spaces y papers.
- MCP para herramientas externas.
- OpenAI Agents SDK para workflows de agentes.
- Gradio/HF Spaces para UIs rapidas de operador.

Tambien activa de entrada:

- `ponytail`
- `repo-hunter-github`
- `kaizen7-evolution-engine`
- `k7-hive-memory`
- `verification-before-completion`

## Uso

```powershell
npm.cmd run k7:connect -- --project "Codex" --kind agent --capability run_tests "mejorar codigo con tests"
```

## Siguiente accion

Usar `k7:connect` como handshake por defecto para cualquier herramienta externa que quiera beneficiarse de KAIZEN7 sin cargar todo el sistema.
