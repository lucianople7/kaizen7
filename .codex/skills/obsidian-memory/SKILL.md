---
name: obsidian-memory
description: Memoria operativa para vaults de Obsidian usados con Codex. Usar cuando el usuario pida buscar, resumir, actualizar, crear o consultar notas .md; recuperar decisiones previas; trabajar con Flowmatik, THE FOCUX, SOPs, ideas, diario, research o documentacion acumulada; o mantener memoria de proyecto antes de actuar.
---

# Obsidian Memory

## Overview

Usa el vault como memoria viva antes de proponer cambios importantes. Busca decisiones previas, resume contexto relevante y actualiza notas de forma conservadora.

## Vault Discovery

1. Si el usuario da ruta de vault, usar esa ruta.
2. Si no, buscar primero carpetas llamadas `Obsidian`, `Vault`, `Flowmatik`, `TheFocux`, `The Focux`, `SOPs`, `Research`, `Ideas` o `Diario` dentro del workspace.
3. Si hay varias candidatas, elegir la que contenga mas notas `.md` relevantes o pedir una sola aclaracion.
4. Si no existe vault, proponer o crear estructura base solo cuando el usuario lo haya pedido.

## Search Order

Priorizar:

1. `Flowmatik/`
2. `TheFocux/`
3. `SOPs/`
4. `Research/`
5. `Ideas/`
6. `Diario/`

Usar busqueda por nombres y contenido. Buscar sinonimos: `THE FOCUX`, `TheFocux`, `FOCUX`, `formula`, `proveedores`, `Flowmatik`, `agentes`, `SOP`, `roadmap`.

## Memory Protocol

Antes de responder en tareas de negocio/producto:

1. Buscar notas relacionadas.
2. Leer solo las notas necesarias.
3. Separar:
   - decisiones confirmadas
   - hipotesis
   - ideas descartadas
   - pendientes
4. Usar decisiones previas antes de proponer cambios.
5. Si actualizas notas, preservar el contexto existente y anadir secciones fechadas.

## Note Writing Rules

- Usar Markdown simple.
- Mantener titulos claros y enlaces wikilink cuando ayuden: `[[TheFocux/Branding/Posicionamiento]]`.
- No mezclar diario, research y decisiones finales en una sola nota.
- Marcar incertidumbre: `Pendiente de validar`, `Hipotesis`, `Decision`.
- No convertir claims medicos, financieros o legales en hechos sin fuente.

## Update Format

Cuando actualices una nota, preferir:

```markdown
## Actualizacion YYYY-MM-DD

### Decision

...

### Contexto

...

### Siguiente accion

...
```

## References

- Para estructura recomendada de vault: leer `references/vault-structure.md`.
- Para reglas de memoria de negocio: leer `references/memory-rules.md`.

