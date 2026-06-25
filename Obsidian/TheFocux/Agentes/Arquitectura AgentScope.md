# Arquitectura AgentScope

> Estado: evolucionada hacia [[KAIZEN7 Agent]]. AgentScope se conserva como referencia y posible adaptador de K7 Scope.

## Decision actual

THE FOCUX usa KAIZEN7 CORE como preset de producto. No mantiene una jerarquia propia de siete agentes.

## Agentes

- Commander: orquestacion, prioridades, permisos y aprobaciones.
- Research: mercado, competencia, proveedores, costes y regulacion.
- Builder: producto, Shopify, contenido, campanas y automatizaciones.
- Memory: Obsidian, evidencia, resultados y Product Genome.

Formulacion, sourcing, growth y commerce son capacidades y herramientas de estos agentes, no agentes permanentes.

## Aplicacion a THE FOCUX

- Research estudia ingredientes, fabricantes, claims y demanda.
- Builder crea la oferta, ecommerce, contenido y operaciones.
- Memory incorpora decisiones y resultados al Product Genome.
- Commander exige aprobacion humana para claims, gasto y publicacion.

## Stack actual

- Codex: kernel de ingenieria.
- OpenAI Responses API y Agents SDK: runtime.
- Obsidian y Product Genome: conocimiento.
- Shopify, redes, web, Gmail y MCP: herramientas conectadas.

## Regla

No crear un agente nuevo mientras una herramienta, skill o workflow resuelva la responsabilidad. Especializar solo cuando exista volumen, metrica propia y evidencia de mejora.
