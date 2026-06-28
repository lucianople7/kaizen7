# KAIZEN7 Agent Project Improvement Decision 2026-06-28

## Decision

KAIZEN7 ya esta operativo como core local: `npm.cmd run k7:ready` pasa con 70 checks, 0 blockers, y `npm.cmd run check` pasa la suite completa.

La siguiente mejora potente no es anadir mas agentes, sino convertir el core existente en un flujo visible, repetible y conectable para activar proyectos.

## Patrones adoptados

- Project Activation Cockpit: una vista/flujo que muestre objetivo activo, memoria usada, modulos activados, riesgos, siguiente accion, verificacion y aprendizaje.
- Contract-first agent API: contratos versionados para `/api/k7/run`, `/api/k7/advise` y futura interfaz MCP local.
- Approval and verification ledger: cada accion relevante debe dejar permiso requerido, evidencia de verificacion y writeback sugerido.
- Signal ingestion pipeline: convertir web, repos, Hugging Face, ecommerce y proveedores en paquetes compactos antes de meterlos al sistema.

## Descarta por ahora

- Crear multiples agentes autonomos antes de cerrar el core modular.
- Saltar a SaaS/multiusuario antes del producto local.
- Automatizar publicacion, compra, despliegue o credenciales sin aprobacion humana.
- Instalar frameworks nuevos si el patron puede adaptarse con el stack actual.

## Encaje

- K7 Scope: permisos, aprobaciones y acciones peligrosas bloqueadas.
- K7 Memory: Obsidian como canon, aprendizaje y decisiones trazables.
- K7 Judge: readiness, checks, verificacion y quality gates.
- K7 Operator: `k7:run`, `k7:advise`, `k7:connect`, `k7:improve`.
- K7 Context: respuestas compactas para agentes externos.
- Product Genome: activacion de proyectos con memoria, criterio y accion.

## Riesgos

- Confundir cantidad de modulos con potencia real.
- Que la WebUI muestre funciones pero no el ciclo operativo completo.
- Que los conectores pidan demasiados permisos antes de estar bien aislados.
- Que THE FOCUX contamine el paquete KAIZEN7 core si no se mantiene separado.

## Siguiente accion recomendada

Construir primero el `Project Activation Cockpit` local:

1. Consumir `k7:connect`, `k7:run`, `k7:advise` y `k7:ready`.
2. Mostrar un unico ciclo: Anchor -> Memory -> Modules -> Action -> Verify -> Learn.
3. Incluir estado de permisos y warnings.
4. Permitir guardar aprendizaje solo con confirmacion.
5. Mantener todo local antes de MCP remoto o hosted beta.

## Regla de adaptacion remota

KAIZEN7 debe seguir siendo el core de cualquier flujo con agentes remotos.

Herramientas tipo Happy, Claude Code remoto, Codex cloud, GitHub agents u otros workers no sustituyen el criterio operativo de KAIZEN7. Solo deben actuar como ejecutores conectables.

Contrato correcto:

```text
KAIZEN7 decide -> worker remoto ejecuta -> KAIZEN7 verifica -> memoria registra
```

El worker remoto recibe un paquete acotado:

- objetivo,
- contexto minimo,
- archivos o area permitida,
- acciones prohibidas,
- comandos de verificacion,
- puertas de aprobacion,
- formato de retorno,
- resumen para memoria.

No debe recibir autoridad general sobre publicacion, deploy, gasto, borrado, credenciales ni cambios fuera de scope.
