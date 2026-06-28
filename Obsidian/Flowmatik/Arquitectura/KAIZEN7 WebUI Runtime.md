# KAIZEN7 WebUI Runtime

## Estado implementado

KAIZEN7 dispone de un servidor local Node y una WebUI funcional.

## Capacidades reales

- Chat con OpenAI Responses API.
- Cuatro modos: Commander, Research, Builder y Memory.
- K7 Scope: ejecuciones, permisos y trazas.
- K7 Memory: memoria persistente y busqueda contextual.
- K7 Judge: evaluacion automatica y veredictos.
- K7 Operator: ejecucion autonoma supervisada.
- Entrada multimodal con imagen.
- Product Genome persistente en JSON.
- Registro de productos, experimentos, aprendizajes, creatividades y proveedores.
- Shopify Admin GraphQL: creacion de producto borrador.
- Meta/Facebook, Instagram, LinkedIn y X.
- MCP stdio mediante JSON-RPC.
- Variables cargadas desde `.env`.

## Kernel

- Codex construye, prueba y mantiene el sistema.
- OpenAI ejecuta la inteligencia del producto.
- Product Genome conserva conocimiento empresarial evaluado.
- Los conectores son herramientas, no agentes.
- AgentScope, ReMe, OpenJudge y Hermes se conservan como referencias y futuros adaptadores.

## Arranque

```powershell
Copy-Item .env.example .env
npm.cmd start
```

Abrir `http://localhost:8787`.

## Pendiente

- OAuth en lugar de tokens manuales.
- TikTok Content Posting API y YouTube upload.
- Webhooks, refresh tokens y cifrado de secretos.
- Usuarios, workspaces y permisos.
- Postgres para sustituir el JSON local.
- Cola de trabajos y scheduler.
- Migracion progresiva a Next.js y TypeScript.
## Mission Control

La WebUI incluye un workspace operativo persistente en `data/kaizen-workspace.json`.

Capacidades activas:

- Proyectos universales creados desde cualquier brief.
- Selector de proyecto activo conservado entre sesiones.
- Tareas con responsable, prioridad, estado y ejecucion asociada.
- Campañas con objetivo, canal y presupuesto.
- Biblioteca de contenido con canal, campaña, estado y programación.
- Calendario alimentado por piezas programadas.
- Actividad auditable de cambios y decisiones.
- Búsqueda transversal sobre proyectos, campañas, tareas, contenido y memoria.
- Exportación completa del workspace en JSON.
- Métricas operativas por proyecto.

K7 Operator puede escribir en este workspace. Una ejecución crea su tarea, conserva el contenido generado, aplica K7 Judge y sincroniza el estado después de la aprobación o rechazo humano.

## Actualizacion 2026-06-17

### Decision

La experiencia principal adopta un modo foco: producto, objetivo, resultado y aprobación. Commander, Research, Builder, Memory, K7 Scope y K7 Judge siguen operando internamente, pero dejan de ser decisiones que el usuario debe comprender antes de obtener valor.

### Contexto

La WebUI exponía demasiados módulos, paneles y conceptos técnicos en el primer recorrido. Las capacidades anteriores se conservan en código, pero quedan fuera de la navegación principal hasta que un flujo real justifique recuperarlas.

### Siguiente accion

Medir tiempo hasta el primer resultado, porcentaje de ejecuciones completadas y abandono antes de añadir nuevas superficies.
