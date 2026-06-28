# KAIZEN7 Market Watch

Fecha: 2026-06-27

## Objetivo

Crear seguimiento diario de proyectos cercanos para que KAIZEN7 evolucione con el mercado sin copiar, sin instalar por impulso y sin gastar tokens de mas.

## Cron

```text
market-watch
```

Cadencia:

```text
daily
```

Modo:

```text
propose-only
```

Comando:

```powershell
npm.cmd run k7:market
```

## Proyectos vigilados

- OpenAI Agents SDK
- LangGraph
- Relevance AI
- Lindy
- Gumloop
- Dust
- GitHub agent repos
- Hugging Face agent assets

## Salida esperada

Cada accion de seguimiento debe producir:

```text
1 cambio detectado
1 adaptacion posible para KAIZEN7
1 decision reject/hold/adapt
1 metrica de verificacion
```

## Regla

```text
Adaptar patrones antes que adoptar herramientas.
```

## Criterio supereficaz

Una senal solo pasa a Hunter si mejora:

- pasos,
- tokens,
- riesgo,
- claridad,
- verificacion,
- reutilizacion.

Si no mejora nada medible, se descarta.

## Archivos

- `data/market-watch.json`
- `data/smart-crons.json`
- `lib/smart-crons.js`
- `tests/smart-crons.test.js`

## Decision

Este cron es el radar de evolucion diaria de KAIZEN7 frente al mercado de agentes.

KAIZEN7 no compite intentando copiar todo.

Compite aprendiendo antes, filtrando mejor y adaptando solo lo que reduce friccion o aumenta criterio verificable.
