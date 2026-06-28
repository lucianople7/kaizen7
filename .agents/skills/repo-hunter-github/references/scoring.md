# Repo Hunter Scoring

Usar esta tabla cuando haya varios repos candidatos.

## Score

Puntuar 0-3 cada campo:

| Campo | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Fit | no resuelve | tangencial | encaja parcialmente | resuelve la necesidad exacta |
| Mantenimiento | abandonado | actividad dudosa | actividad reciente | releases/issues activos |
| Licencia | ausente/incompatible | incierta | permisiva con dudas | clara y compatible |
| Complejidad | framework pesado | mucha superficie | moderada | patron pequeno |
| Transferencia | no adaptable | requiere reescritura grande | adaptable | se absorbe como patron simple |
| Riesgo | secretos/datos/gasto | riesgo alto | riesgo gestionable | bajo riesgo |

## Decision

- `15-18`: `adopt_now` o `adapt_pattern`.
- `10-14`: `adapt_pattern` o `test_later`.
- `6-9`: `reference_only`.
- `0-5`: `reject`.

El score no manda solo. Si hay riesgo de claims, secretos, gasto, licencia incompatible o sustitucion del core, bloquear aunque puntue alto.

