# K7 Activation Cockpit

Fecha: 2026-06-28

## Decision

KAIZEN7 debe empezar como sistema conversacional de activacion, no como megatool.

Pregunta inicial:

```text
Que quieres conseguir ahora?
```

Luego pide solo el contexto minimo que cambia la decision.

## Loop

```text
Objective -> Minimal context -> Metaskill boot -> Toolchain -> Action -> Verification -> Memory
```

## Metaskill Boot

El cockpit listo emite `metaskillBoot` para que Codex, OpenHands o un editor de codigo arranque con las metaskills KAIZEN7 adecuadas.

Incluye:

- tipo de objetivo,
- ruta,
- orden de activacion,
- instrucciones por metaskill,
- reglas de parada del editor,
- comandos `k7:metaskills` y `k7:cockpit`.

Regla: no cargar todas las skills; activar solo las que cambian el resultado del objetivo actual.

## Implementacion

- `lib/activation-cockpit.js`
- `npm.cmd run k7:cockpit`
- `POST /api/k7/cockpit`
- `docs/ACTIVATION_COCKPIT.md`

## Regla

KAIZEN7 debe ahorrar horas y tokens evitando:

- leer todo el vault,
- cargar todas las herramientas,
- cargar todas las metaskills,
- proponer diez opciones,
- ejecutar sin verificacion,
- guardar memoria decorativa.

Debe construir solo lo necesario para el objetivo actual.
