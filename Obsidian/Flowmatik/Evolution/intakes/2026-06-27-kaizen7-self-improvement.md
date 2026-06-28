# KAIZEN7 Self Improvement Loop

Fecha: 2026-06-27

## Necesidad

KAIZEN7 debe poder preguntarse como mejorar KAIZEN7 sin convertirse en un agente autonomo que instala, navega, despliega o publica sin control.

## Senales externas verificadas

- OpenAI Agents SDK ya documenta MCP, guardrails, tracing, context management y human-in-the-loop.
- MCP formaliza herramientas como contrato entre agentes y sistemas externos.
- GitHub empuja agentes de codigo que trabajan sobre tareas, branches y cambios revisables.
- Hugging Face Spaces/Gradio sirve para demos rapidas y herramientas de operador.

## Patron absorbido

Self-improvement supervisado:

```text
Connector Kernel + Frontier + Codex Realizer + market patterns -> one supervised improvement action
```

## Que se descarta

- No navegador autonomo permanente.
- No OAuth automatico.
- No instalaciones por defecto.
- No fine-tuning real.
- No escritura externa sin aprobacion.

## Cambio aplicado

- `lib/self-improvement-loop.js`
- `npm.cmd run k7:improve`
- `POST /api/k7/improve`
- tests de loop, API y readiness
- fix de `k7:super` cuando el CLI activa frontier

## Veredicto

`adapt_pattern`

## Siguiente accion

Usar `k7:improve` antes de crear nuevas capas de conectividad. Si propone GitHub/HF/MCP, ingerir una fuente concreta y adaptar solo el patron minimo.
