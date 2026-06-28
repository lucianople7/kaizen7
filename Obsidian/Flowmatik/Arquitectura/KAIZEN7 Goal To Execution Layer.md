# KAIZEN7 Goal To Execution Layer

Fecha: 2026-06-28

## Decision

KAIZEN7 se orienta como una capa modular de activacion desde objetivo hasta ejecucion verificada.

No es una megatool, ni una base gigante de contexto, ni un agente autonomo total.

Es el sistema que pregunta:

```text
Que quieres conseguir?
```

Y desde ahi construye solo lo necesario.

## Loop del 7

```text
1. Objective
2. Minimal Context
3. Memory
4. Toolchain
5. Execution
6. Verification
7. Learning
```

## Para quien

- asistentes de codigo,
- agentes remotos,
- editores,
- MCPs,
- builders de proyectos,
- equipos que pierden contexto y tokens.

## Regla central

```text
Menos contexto. Menos pasos. Accion verificada.
```

## Orquestacion

- Activation Cockpit pregunta y acota.
- Connector Kernel crea el handshake.
- Toolchain Router elige herramientas/workers.
- OpenHands Adapter delega si conviene.
- Eval Firewall bloquea sin evidencia.
- Memory escribe solo aprendizaje reutilizable.

## Antipatrones bloqueados

- cargar todo el vault,
- leer todo el repo,
- exponer cien modulos,
- ejecutar tools sin scope,
- aceptar claims de agentes sin tests/evidencia,
- guardar memoria decorativa.

## Siguiente accion

Hacer que la WebUI muestre este flujo como experiencia principal, no como dashboard de modulos.

