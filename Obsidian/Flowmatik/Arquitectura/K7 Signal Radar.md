# K7 Signal Radar

## Decision 2026-06-25

Crear `signal-radar` como smart cron compacto para mover THE FOCUX cada dia sin saturar Obsidian.

## Objetivo

```text
buscar mejor -> guardar menos -> decidir antes -> mover web/contenido/ecommerce
```

No es crawler autonomo. No publica. No compra. No escribe claims. Propone paquetes de busqueda con fuente y salida minima.

## Comando

```powershell
node lib/smart-crons.js signal-radar
```

## Que produce

Maximo 3 paquetes por ejecucion:

- partner premium,
- podcast serio,
- video/formato,
- proveedor/COA,
- compliance,
- visual editorial.

Cada paquete incluye:

- query,
- motivo,
- destino Obsidian,
- storage pesado,
- salida esperada.

## Storage

```text
THE_FOCUX_SIGNAL_LIBRARY/00_Inbox
```

Archivos pesados ahi. Resumen y decision en:

```text
Obsidian/TheFocux/THE FOCUX Signal Bowl.md
```

## Regla de aprendizaje

Si una fuente ya esta en Signal Bowl, el radar evita repetirla cuando el paquete tenga `source_url`.

Si todas las misiones se agotan, propone refrescar:

```text
data/thefocux-signal-radar.json
```

## Guardrails

- Modo `propose`.
- Maximo 3 acciones.
- No usa credenciales.
- No ejecuta acciones externas.
- No guarda archivos pesados en Obsidian.
- No convierte claims comerciales en hechos.

## Siguiente accion

Ejecutar `signal-radar`, investigar una sola mision y cerrar con:

```text
3 datos utiles
1 accion minima
1 descarte si aplica
```
