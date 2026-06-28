# Stack Profesional OpenAI-first

## Decision

KAIZEN7 se construye como producto serio sobre una arquitectura concentrada. AgentScope, ReMe, OpenJudge y Hermes se usan como referencias de alto valor y posibles adaptadores, mientras sus mejores capacidades se implementan de forma nativa.

## Stack

### Kernel de ingenieria

- Codex App y CLI.
- Codex SDK para automatizacion.
- Skills, plugins, MCP, hooks y AGENTS.md.

### Inteligencia operativa

- OpenAI Responses API.
- OpenAI Agents SDK.
- Modelos GPT para texto, vision, herramientas y razonamiento.
- Graders, evals y guardrails propios.

### KAIZEN7 Native Agent Core

- K7 Scope: runtime, permisos, aprobaciones y trazas.
- K7 Memory: memoria persistente y recuperacion contextual.
- K7 Judge: evaluacion, scoring y quality gates.
- K7 Operator: autonomia supervisada y planes verificables.

### Ecosistemas compatibles

- AgentScope: adaptador futuro para runtimes distribuidos.
- ReMe: adaptador futuro para memoria vectorial avanzada.
- OpenJudge: adaptador futuro para baterias amplias de evaluadores.
- Hermes: adaptador futuro para perfiles o runtimes autonomos externos.

### App y datos

- Ahora: Node WebUI funcional.
- Evolucion: Next.js, TypeScript y shadcn/ui.
- Postgres/Supabase para auth, datos, storage y workspaces.
- Trigger.dev para jobs largos y programados.
- PostHog para eventos, funnels y experimentacion.

### Conectores

- Shopify.
- Meta e Instagram.
- TikTok y YouTube.
- LinkedIn y X.
- Gmail y Google Drive.
- MCP para integraciones adicionales.

### Ventaja acumulativa

- Product Genome.
- Product DNA.
- Creative DNA.
- Supplier DNA.
- Economic DNA.
- Compliance DNA.

## CORE

- Commander.
- Research.
- Builder.
- Memory.

No son cuatro modelos diferentes. Son cuatro modos especializados sobre el mismo runtime OpenAI.

## Fases

1. Responses API y Product Genome local.
2. Streaming, herramientas y trazas.
3. Postgres, usuarios y workspaces.
4. Research web y sourcing real.
5. Shopify y publicaciones con OAuth.
6. Agents SDK, K7 Scope, K7 Judge y adaptadores opcionales.
7. Automatizaciones, scheduler y webhooks.
8. Scoring del Product Genome con resultados reales.

## Lo que no haremos

- Multiproveedor activo antes de necesitarlo.
- Un agente por cada herramienta.
- Fine-tuning antes de tener datos propios.
- Aprendizaje sin evidencia, contexto y resultado.
- Complejidad distribuida antes de validar el flujo central.
