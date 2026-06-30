# K7 Action Copilot Deep Research 2026-06-30

## Necesidad

Dar a KAIZEN7 mas potencia como copiloto de accion real para mejorar proyectos, dirigiendo agentes de codigo, ojos de navegador, herramientas, memoria, pruebas y evidencia.

## Decision

KAIZEN7 no debe casarse con un unico agente.

Debe construir un **K7 Harness Router**:

```text
KAIZEN7 decide -> router elige ejecutor -> ejecutor actua -> K7 verifica -> Obsidian recuerda
```

## Repos revisados

- Aider: maduro para edicion de codigo, repo map, git, lint/test. Buen segundo brazo.
- jcode: buen harness candidato para sesiones, memoria, providers, MCP, browser y swarm. No debe ser core.
- Qwen Code: fuerte como referencia de arquitectura abierta: Auto-Memory, Auto-Skills, SubAgents, MCP, daemon, SDK, ACP y multi-protocolo.
- mini-swe-agent: patron mas valioso por simplicidad: bash-first, historial lineal, acciones independientes, sandbox facil.
- Plandex: interesante para tareas grandes, contexto enorme, sandbox de diff acumulativo y revision antes de aplicar.
- Cline/Roo Code: buenos patrones de UX de editor y equipos/agentes dentro del IDE.
- Goose: fuerte para desktop/CLI/API, MCP y agente general multi-proveedor.
- OpenHands: potente para autonomia pesada, pero demasiado grande para V1.
- MCP y ACP: estandares clave para conectar herramientas/agentes sin encerrar KAIZEN7.

## Patron absorbido

1. Mission Packet universal.
2. Router de ejecutores.
3. Control plane con permisos, presupuestos y stop rules.
4. Evidence panel.
5. Memoria estructurada por run.
6. Mini-suite local de evaluacion antes de benchmark externo.

## Que se descarta

- Instalar jcode, aider, Qwen Code o Goose como dependencia central sin smoke test.
- Copiar un runtime completo.
- Crear swarm autonomo sin ownership, diff tracking y aprobacion.
- Depender de benchmarks externos sin pruebas locales.

## Encaje KAIZEN7

V1 debe usar Codex como ejecutor primario local y preparar adaptadores dry-run para:

- `codex`
- `aider`
- `jcode`
- `qwen-code`
- `browser`
- `manual`

Luego se habilitan ejecuciones reales solo con aprobacion explicita.

## Verificacion propuesta

- `npm.cmd run check`
- mission packet unit tests
- router scoring tests
- dry-run adapter tests
- una mini-suite local de 5 tareas reales de KAIZEN7

## Veredicto

`adapt_pattern`.

No adoptar una herramienta como core. Construir el router y absorber patrones de jcode, Qwen Code, Aider, mini-swe-agent y Plandex.
