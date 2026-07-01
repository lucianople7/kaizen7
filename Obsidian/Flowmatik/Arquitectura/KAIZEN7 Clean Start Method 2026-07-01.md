# KAIZEN7 Clean Start Method 2026-07-01

Fecha: 2026-07-01

## Decision

`adopt_now`: empezar KAIZEN7 desde una base limpia y reconstruir solo las capacidades que pasen evidencia.

## Regla operativa

- Antes de cambios grandes, crear snapshot recuperable.
- El arbol activo debe contener solo el nucleo vigente.
- Los experimentos, caches y entornos temporales viven fuera del estado Git: `.tmp-*`, `.push-*`, `.cli-hub`, `.cache`.
- THE FOCUX queda tratado como proyecto separado; KAIZEN7 conserva solo contratos, adaptadores o memoria estructural cuando sean necesarios.
- Cada nueva capacidad debe entrar con objetivo, test/check, evidencia y nota de decision.

## Cambio aplicado

- Se guardo el estado anterior en `stash@{0}` con mensaje `pre-kaizen7-v2-clean-20260701-140345`.
- Se reseteo el arbol trackeado a `HEAD`.
- Se reintrodujo solo higiene de temporales y `k7:start` con primera accion autocontenida.

## Riesgos

- Dos carpetas temporales quedaron bloqueadas por permisos de Windows/OneDrive: `.tmp-cli-anything-hub` y `.tmp-video-deps`. Estan ignoradas y no forman parte del estado Git.

## Siguiente accion

Crear el primer commit de KAIZEN7 v2 limpio con esta base, despues construir capacidades una a una.
