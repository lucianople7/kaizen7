---
name: kaizen7-evolution-engine
description: Meta-skill para analizar repositorios, herramientas, frameworks, skills, MCPs, agentes, editores, memorias, automatizadores o tendencias y convertir lo mejor de cada uno en mejoras concretas para KAIZEN7, Flowmatik y THE FOCUX. Usar cuando el usuario comparta o mencione proyectos como Memanto, Ponytail, Headroom, CLI-Anything, OpenCut, Hermes, AgentScope, Composio, Postiz, Remotion, Shopify, ecommerce, redes sociales, MCP, video, memoria, evaluacion, agentes u otras piezas que puedan evolucionar el sistema.
---

# KAIZEN7 Evolution Engine

## Mission

Convertir repos, herramientas e ideas externas en mejoras reales para KAIZEN7 sin copiar dependencias enteras ni aumentar complejidad sin retorno.

La meta-skill no responde con opinion suelta. Debe extraer patrones, descartar ruido, mapear encaje y producir una decision operativa.

## Sources Of Truth

Antes de decidir, revisar cuando aplique:

- `Obsidian/Flowmatik/Arquitectura/`
- `Obsidian/Flowmatik/Agentes/`
- `Obsidian/TheFocux/`
- `Obsidian/Research/`
- `kaizen.connectors.json`
- codigo y tests del proyecto cuando la propuesta afecte implementacion

La fuente de verdad sigue siendo Obsidian, Product Genome y el codigo local. Los repos externos son entradas de aprendizaje, no autoridad automatica.

## Evaluation Workflow

1. **Intake**
   - Identificar promesa, problema, usuario, licencia, madurez, stack, integraciones y superficie de mantenimiento.
   - Separar hecho verificado, claim del repo e inferencia.

2. **Pattern Extraction**
   - Extraer patrones utiles, no copiar productos completos.
   - Buscar capacidades transferibles: memoria, permisos, evaluacion, contexto, video, CLI, conectores, ecommerce, publicacion, workflows, testing o UX.

3. **Anti-Hype Filter**
   - Bloquear dependencias por moda.
   - Rechazar duplicacion de Obsidian, Product Genome, K7 Scope, K7 Memory, K7 Judge o K7 Operator.
   - Marcar riesgo si requiere secretos, cloud, datos sensibles, instalacion pesada, software inmaduro o mantenimiento recurrente.

4. **KAIZEN7 Mapping**
   Mapear cada patron a una capa:
   - `K7 Scope`: permisos, aprobaciones, aislamiento, trazas.
   - `K7 Memory`: memoria, procedencia, conflictos, recuperacion.
   - `K7 Judge`: evaluacion, scoring, claims, calidad.
   - `K7 Operator`: ejecucion supervisada, herramientas, adaptadores.
   - `Product Genome`: aprendizaje estructurado sobre productos, proveedores, creatividades, claims y metricas.
   - `Content Factory`: guiones, clips, newsletters, SEO, Reels, Shorts, TikTok.
   - `NeuroCity Studio`: IP, episodios, prompts visuales, escenas, ciencia narrativa.
   - `Commerce Builder`: Shopify, fichas, seleccion, afiliacion, wholesale, catalogo.
   - `Supplier Scout`: proveedores, COA, MOQ, RFQ, scoring.
   - `K7 Context`: compresion, recuperacion, lectura eficiente.

5. **Evolution Decision**
   Emitir un veredicto:
   - `adopt_now`: integrar ya porque resuelve un bloqueo real.
   - `adapt_pattern`: absorber el patron sin depender del repo.
   - `test_later`: probar cuando aparezca el cuello de botella.
   - `reference_only`: conservar como inspiracion o benchmark.
   - `reject`: descartar por riesgo, duplicacion o coste.

6. **Adaptation Output**
   Producir una de estas salidas:
   - regla operativa,
   - skill,
   - SOP,
   - adaptador,
   - backlog item,
   - patch de codigo,
   - nota Obsidian,
   - decision de descarte.

7. **Memory Update**
   Si hay decision relevante, actualizar o crear una nota en `Obsidian/Flowmatik/Arquitectura/` con fecha, decision, patrones adoptados, descartes, riesgos y siguiente accion.

## Required Response Format

Usar este formato salvo que el usuario pida implementacion directa:

```text
Veredicto:
Patrones utiles:
Que se descarta:
Encaje en KAIZEN7:
Riesgos:
Adaptacion recomendada:
Siguiente accion:
Memoria:
```

## Core Adaptation Rules

- No instalar nada por defecto.
- No sustituir el core de KAIZEN7 sin una razon fuerte.
- Preferir adaptar patrones antes que introducir frameworks.
- Preferir APIs oficiales, CLIs oficiales y MCPs estables antes que wrappers complejos.
- Mantener aprobacion humana para publicacion externa, gasto, claims sensibles, eliminacion de datos y credenciales.
- No usar herramientas cloud con datos sensibles sin decision explicita.
- No guardar secretos en Obsidian ni en notas de decision.
- No convertir claims medicos, legales o regulatorios en promesas.

## Pattern Library

- Ponytail: filtro anti-sobredimensionamiento y minimalismo seguro.
- Memanto: memoria tipada, procedencia, recencia y conflictos.
- Headroom: compresion y contexto reversible como `K7 Context`, solo si duele el coste/contexto.
- CLI-Anything: fabrica de adaptadores CLI para software sin API/MCP estable.
- OpenCut: editor visual y futuro MCP/headless para video, no dependencia central mientras este inmaduro.
- AgentScope: permisos, runtime, tool boundaries, trazas y servicios.
- ReMe: memoria persistente y recuperable.
- OpenJudge: evaluadores, quality gates y rewards.
- Hermes: operador autonomo supervisado.
- Composio: conectores externos con OAuth/toolkits.
- Postiz: publicacion social cuando haya contenido y aprobacion.
- Remotion/FFmpeg: render automatizable para video.

## Quality Gate

Una mejora solo pasa si:

- reduce friccion real,
- mejora publicacion, contenido, research, ecommerce, memoria, seguridad o medicion,
- puede probarse,
- no rompe el flujo simple del usuario,
- y deja una decision trazable.

Si no pasa, convertirla en referencia o descartarla.
