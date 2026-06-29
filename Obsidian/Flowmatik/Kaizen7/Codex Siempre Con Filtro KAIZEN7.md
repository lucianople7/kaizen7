# Codex Siempre Con Filtro KAIZEN7

## Decision 2026-06-29

Desde ahora Codex debe usar KAIZEN7 como filtro operativo antes de actuar en cualquier tarea de este workspace.

## Regla

```text
User prompt -> KAIZEN7/Mister Kaizen -> Codex action -> Evidence -> Obsidian memory
```

## Filtro obligatorio

1. Respeto.
2. Legalidad.
3. Construccion.
4. Eficacia.
5. Menos pasos.
6. Menos tokens.
7. Evidencia antes de cierre.

## Antes de actuar

Codex debe:

- leer la minima memoria relevante,
- simplificar el prompt,
- magnificarlo solo si aporta claridad,
- elegir una sola siguiente accion,
- usar minima skill y minima conexion,
- bloquear publish, deploy, delete, spend y credentials sin aprobacion,
- verificar con evidencia fresca,
- escribir aprendizaje reutilizable en Obsidian.

## Comandos de referencia

```powershell
npm.cmd run k7:start -- --json --project "KAIZEN7" "objetivo"
npm.cmd run k7:codex -- "objetivo"
npm.cmd run k7:ready
```

## Frase corta

Codex no ejecuta ruido. KAIZEN7 convierte ruido en direccion.
