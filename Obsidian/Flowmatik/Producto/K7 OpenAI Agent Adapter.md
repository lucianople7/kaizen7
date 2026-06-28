# K7 OpenAI Agent Adapter

Fecha: 2026-06-27

## Decision

Se construye el companero perfecto de KAIZEN7 como adapter opcional:

```text
KAIZEN7 core independiente
+
OpenAI Agents SDK como runtime/adaptador
```

Regla:

```text
OpenAI SDK != KAIZEN7 core
OpenAI SDK = companero de ejecucion
```

## Que hace

El adapter convierte la salida local de KAIZEN7 en una forma compatible con OpenAI Agents SDK:

- context pack,
- decision guard,
- herramientas preparadas,
- siguiente accion,
- verification gate,
- writeback.

## Modos

### local-compatible

Funciona aunque no este instalado `@openai/agents` o falte `OPENAI_API_KEY`.

Esto evita que KAIZEN7 se rompa por depender de un runtime externo.

### openai-agents-sdk

Cuando existe `@openai/agents` y `OPENAI_API_KEY`, el adapter crea un agente:

```text
KAIZEN7 Project Activation
```

Y lo usa para generar un brief operativo compacto.

## Comandos

```powershell
npm.cmd run k7:openai -- "objetivo"
npm.cmd run k7:openai -- --no-sdk "objetivo"
```

## API

```http
POST /api/k7/openai/activate
POST /api/k7/openai/advise
POST /api/k7/openai/verify
```

## AI Cockpit

Se anade boton:

```text
OpenAI Adapter
```

Asi la interfaz permite comparar:

- `Run K7`: core local,
- `Boost Agent`: asesor local,
- `OpenAI Adapter`: runtime compatible con Agents SDK.

## Herramientas preparadas

- `get_project_brief`
- `get_activation_checklist`
- `save_project_learning`

La herramienta de escritura requiere confirmacion y no debe guardar secretos.

## Criterio

Este paso prepara KAIZEN7 para OpenAI Apps SDK / MCP sin perder independencia.
