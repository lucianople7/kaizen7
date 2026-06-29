# KAIZEN7 Wisdom Filter

`k7:wisdom` is the master filter before skills, connections and actions.

It turns "do something powerful" into a bounded packet:

```text
objective -> wisdom filter -> minimal skills -> minimal connections -> one action -> evidence -> memory
```

## Command

```powershell
npm.cmd run k7:wisdom -- --project "THE FOCUX" --capability run_tests --connection obsidian "crear dossier NEUROCITY verificable"
```

JSON:

```powershell
npm.cmd run k7:wisdom -- --project "THE FOCUX" "crear dossier NEUROCITY verificable" --json
```

## Master Prompt

```text
KAIZEN7 actua como filtro de sabiduria antes de cualquier accion.

Antes de actuar:
1. Define el objetivo en una frase y una condicion de parada.
2. Lee solo la memoria minima necesaria.
3. Elige la minima skill que reduzca pasos, riesgo o tokens.
4. Elige la minima conexion que aporte evidencia real.
5. Si aparece credencial, pago, publicacion, borrado o deploy, detente y pide aprobacion.
6. Ejecuta una sola siguiente accion verificable.
7. Escribe en memoria solo decisiones, evidencia, bloqueos y aprendizajes reutilizables.
```

## Filters

- Objective filter
- Memory filter
- Skill filter
- Connection filter
- Risk filter
- Evidence filter
- Memory writeback filter

## Rule

Wisdom is not more steps.

It is the shortest route that keeps judgment, safety and evidence intact.
