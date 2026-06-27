# K7 Codex Bridge

Fecha: 2026-06-27

## Decision

Codex debe poder conectarse a KAIZEN7 como agente de codigo supervisado. KAIZEN7 no sustituye a Codex: le da contexto minimo, skills, riesgos, primera accion y verificacion antes de editar.

## Implementacion

- `lib/codex-bridge.js`
- `npm.cmd run k7:codex -- "objective"`
- `npm.cmd run k7:codex -- --frontier --write-signals "objective"`
- `npm.cmd run k7:real -- "objective"`
- `GET /api/k7/codex`
- `POST /api/k7/codex`
- `POST /api/k7/realize`
- `docs/CODEX_BRIDGE.md`

## Contrato

```text
objective -> K7 Codex Bridge -> read list + skills + avoid list + first action + verification
```

## Reglas

- Ejecutar antes de editar archivos cuando el objetivo no sea trivial.
- Mantener `metadata first`; leer profundo solo memoria y skills seleccionadas.
- No publicar, pushear, desplegar, borrar, gastar ni tocar credenciales sin aprobacion.
- Verificar con comando real antes de declarar completado.
- Escribir memoria solo si el aprendizaje es reutilizable y no contiene secretos.

## Siguiente accion

Usar `k7:codex -- --frontier --write-signals` como arranque diario de Codex para escoger una mejora puntera y convertirla en adaptador o test minimo.

Usar `k7:real` antes de cerrar cambios grandes. Solo devuelve `real` si pasan bridge, readiness, frontier operator y suite completa.
