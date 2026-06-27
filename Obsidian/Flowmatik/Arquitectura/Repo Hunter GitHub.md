# Repo Hunter GitHub

## Decision 2026-06-25

KAIZEN7 incorpora `repo-hunter-github` como meta-skill operativa para buscar repositorios de GitHub cuando falte una capacidad concreta y absorber solo los patrones utiles.

## Rol

Repo Hunter es una subcapa practica de `KAIZEN7 Evolution Engine`.

```text
Necesidad real -> busqueda GitHub -> shortlist -> patron util -> Evolution Gate -> integracion minima -> memoria Obsidian
```

## Reglas

- Obsidian sigue siendo la fuente canonica.
- GitHub es fuente externa de aprendizaje, no autoridad.
- No se instala nada por defecto.
- No se copia codigo sin licencia compatible y decision explicita.
- No se sustituye el core de KAIZEN7.
- Todo intake relevante se registra en `Obsidian/Flowmatik/Evolution/intakes/`.
- Todo cambio real se verifica y se registra en la nota diaria.

## Skill

Ruta:

```text
.agents/skills/repo-hunter-github/SKILL.md
```

Referencia de scoring:

```text
.agents/skills/repo-hunter-github/references/scoring.md
```

## Uso esperado

Activar antes de inventar desde cero cuando el problema toque:

- skills,
- MCP,
- agentes,
- memoria,
- ecommerce,
- video,
- frontend,
- testing,
- automatizaciones,
- conectores,
- THE FOCUX,
- Flowmatik.

## Siguiente accion

Usar Repo Hunter en la proxima mejora que requiera una capacidad externa clara, creando un intake con repos revisados y patron absorbido.
