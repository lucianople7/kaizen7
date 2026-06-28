# KAIZEN7 Evolution Engine

## Actualizacion 2026-06-25

### Decision

Se crea una meta-skill permanente para que KAIZEN7 analice repos, herramientas y tendencias como entradas de evolucion del sistema.

No debe limitarse a opinar si una herramienta hace falta o no. Su trabajo es:

1. extraer lo mejor,
2. descartar lo peor,
3. adaptar el patron a KAIZEN7,
4. proponer una mejora concreta,
5. guardar la decision.

### Ubicaciones

```text
.codex/skills/kaizen7-evolution-engine/
.agents/skills/kaizen7-evolution-engine/
```

### Flujo

```text
Repo / herramienta / idea
  -> intake
  -> pattern extraction
  -> anti-hype filter
  -> KAIZEN7 mapping
  -> evolution decision
  -> adaptation output
  -> memory update
```

### Veredictos

- `adopt_now`
- `adapt_pattern`
- `test_later`
- `reference_only`
- `reject`

### Regla

Los repos externos no son autoridad automatica. Son material de aprendizaje. KAIZEN7 conserva su core:

```text
Codex + OpenAI + Obsidian + Product Genome + K7 Scope + K7 Memory + K7 Judge + K7 Operator
```

La meta-skill decide si una idea se convierte en regla, skill, SOP, adaptador, backlog, patch, nota o descarte.

Toda decision de evolucion debe quedar escrita en Obsidian antes de cerrar la sesion.

## Actualizacion 2026-06-25 - Graphify

Graphify se clasifica como `adapt_pattern`.

KAIZEN7 absorbe el patron de mapa consultable antes de lectura manual, pero no instala la herramienta por defecto. La adaptacion queda en `K7 Memory Token Engine`.
