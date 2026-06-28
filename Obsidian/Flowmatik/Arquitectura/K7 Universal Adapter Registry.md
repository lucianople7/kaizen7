# K7 Universal Adapter Registry

Fecha: 2026-06-27

## Decision

KAIZEN7 debe funcionar como mejorador modular de sistemas. Cualquier API, CLI, MCP, SDK, webhook o agente externo debe poder conectarse mediante un contrato de adaptador, sin convertirse en dependencia central.

## Patron adoptado

```text
External system -> adapter plan -> K7 advice/run -> verification -> optional approved action -> memory writeback
```

## Encaje

- `K7 Scope`: permisos, aprobaciones, riesgo y no-secretos.
- `K7 Operator`: ejecucion supervisada por adaptador.
- `K7 Judge`: verificacion antes de declarar resultado.
- `K7 Memory`: solo aprendizajes confirmados, nunca credenciales.
- `K7 Context`: contrato minimo para otros agentes.

## Descartes

- No instalar frameworks de conectores por defecto.
- No ejecutar herramientas externas desde el primer paso.
- No guardar tokens, claves ni cookies en Obsidian.

## Implementacion

- `lib/adapter-registry.js`
- `npm.cmd run k7:adapt`
- `GET /api/k7/adapters`
- `POST /api/k7/adapters/plan`
- `docs/UNIVERSAL_ADAPTERS.md`

## Siguiente accion

Probar primero con adaptadores de alto valor:

- OpenAI Agents SDK
- GitHub
- Hugging Face
- MCP local
- Shopify
- herramientas CLI de codigo

Cada adaptador real debe demostrar una reduccion de pasos, riesgo, repeticion o tiempo de decision antes de entrar en ejecucion.
