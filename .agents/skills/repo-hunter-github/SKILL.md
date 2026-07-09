---
name: repo-hunter-github
description: Meta-skill de KAIZEN7 para buscar repositorios de GitHub cuando falta una capacidad, patron, integracion, UI, agente, MCP, ecommerce, video, memoria, testing o automatizacion; evaluar madurez/licencia/encaje; absorber solo patrones utiles; integrarlos con las skills existentes y registrar la decision en Obsidian. Usar antes de inventar desde cero o instalar dependencias externas para KAIZEN7, Flowmatik o THE FOCUX.
---

# Repo Hunter GitHub

## Mission

Buscar repositorios de GitHub solo cuando KAIZEN7 necesite una capacidad concreta, extraer lo util y convertirlo en una mejora propia sin copiar complejidad ni romper el core.

Repo Hunter no instala modas. Caza patrones, verifica fuentes, adapta lo minimo y deja memoria.

## Activation Rule

Activar cuando:

- falte una capacidad tecnica, creativa, operativa o de producto;
- haya que mejorar una skill, MCP, agente, frontend, ecommerce, video, research, memoria, testing o automatizacion;
- el usuario mencione buscar repos, GitHub, open source, absorber, adaptar, benchmark o "como lo hacen otros";
- antes de crear una pieza desde cero si existe posibilidad razonable de aprender de repos maduros.

No activar para cambios triviales que el repo local ya resuelve claramente.

## Required Order

1. **Obsidian first**
   - Leer memoria minima relevante: arquitectura, semaforo, nota diaria y notas del area afectada.
   - Buscar decisiones previas para no reabrir descartes.

2. **Define the need**
   - Escribir en una frase el problema real.
   - Nombrar la capa afectada: `K7 Memory`, `K7 Judge`, `K7 Operator`, `K7 Context`, `Content Factory`, `NeuroCity Studio`, `Commerce Builder`, `Supplier Scout`, `THE FOCUX Web`, `Testing`.

3. **Search GitHub**
   - Preferir GitHub MCP/API/conector si esta disponible.
   - Si no hay conector, usar busqueda web con dominio `github.com`.
   - Buscar 3-7 repos como maximo, con queries especificas por stack y capacidad.
   - Para informacion actual de stars, actividad, issues, releases o licencia, verificar online.

4. **Shortlist**
   - Elegir maximo 3 repos.
   - Registrar: URL, licencia, lenguaje, ultima actividad, stars como senal, mantenimiento, dependencia principal y fit con KAIZEN7.

5. **Absorb**
   - Extraer patrones, contratos, UX, naming, tests, estructura o prompts.
   - No copiar archivos completos salvo que la licencia lo permita y haya decision explicita.
   - Preferir reescribir el patron en el estilo local.

6. **Evolution Gate**
   - Aplicar `kaizen7-evolution-engine`.
   - Emitir veredicto: `adopt_now`, `adapt_pattern`, `test_later`, `reference_only`, `reject`.
   - Aplicar Ponytail: si no reduce friccion real, no entra.

7. **Integrate**
   - Insertar la mejora en la skill, SOP, codigo, test, Obsidian o backlog que corresponda.
   - Mantener cambios pequenos y verificables.
   - No introducir secretos, servicios cloud, pagos, scraping agresivo ni publicacion externa sin permiso humano.

8. **Memory**
   - Crear o actualizar `Obsidian/Flowmatik/Evolution/intakes/YYYY-MM-DD-<repo-o-tema>.md`.
   - Actualizar nota diaria si se cambio codigo, skill o decision.

## Search Query Patterns

Usar queries concretas:

```text
site:github.com <capability> <stack> open source
site:github.com <capability> mcp server
site:github.com <capability> agent framework
site:github.com <capability> cloudflare workers
site:github.com <capability> shopify stripe ecommerce
site:github.com <capability> remotion ffmpeg video
```

Evitar queries genericas como `best AI repo`.

## Evaluation Fields

Para cada repo candidato:

```text
Repo:
URL:
Problema que resuelve:
Licencia:
Stack:
Actividad:
Madurez:
Patrones utiles:
Que NO absorber:
Riesgo:
Veredicto:
```

Leer `references/scoring.md` si hay que comparar varios repos o justificar una decision.

## Integration Rules

- Obsidian es memoria canonica; GitHub es fuente externa.
- El core de KAIZEN7 no se sustituye por repos externos.
- No instalar dependencias por defecto.
- No usar codigo sin licencia compatible.
- No guardar secretos ni tokens en Obsidian.
- Para salud, suplementos, claims, legal o finanzas: no absorber claims sin fuente primaria y K7 Judge.
- Si el repo es grande, absorber una idea pequena antes que el framework entero.
- Si el repo requiere cloud, login, gasto o datos sensibles, pedir permiso.

## Output Format

Cuando se use como investigacion:

```text
Necesidad:
Repos revisados:
Repo elegido:
Patron absorbido:
Que se descarta:
Encaje KAIZEN7:
Cambio propuesto:
Verificacion:
Memoria:
```

Cuando se use para implementar:

1. Mostrar brevemente el patron elegido.
2. Editar solo los archivos necesarios.
3. Ejecutar verificacion fresca.
4. Registrar el intake/decision en Obsidian.

