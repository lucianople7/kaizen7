# K7 Cron Doctor

## Decision 2026-06-25

KAIZEN7 incorpora `K7 Cron Doctor` como capa Super IQ para crear, revisar y reparar smart crons internos.

## Loop

```text
crear -> revisar -> reparar -> verificar -> memoria
```

## Alcance

Cron Doctor puede:

- revisar `data/smart-crons.json`,
- detectar politica insegura,
- detectar crons duplicados,
- detectar modo `execute`,
- detectar descripciones ausentes,
- reparar manifiestos internos seguros,
- sugerir nuevos crons desde señales repetidas.

Cron Doctor no puede sin aprobacion humana:

- publicar,
- borrar,
- gastar,
- tocar credenciales,
- activar tareas del sistema,
- ejecutar automatizaciones externas.

## Implementacion

```text
lib/cron-doctor.js
tests/cron-doctor.test.js
data/smart-crons.json -> cron-doctor
```

## Uso

```powershell
node lib/smart-crons.js cron-doctor
node lib/cron-doctor.js data/smart-crons.json
```

Para reparar el manifiesto local explicitamente:

```powershell
node lib/cron-doctor.js data/smart-crons.json --write-repair
```

## Regla Super IQ

```text
No crear automatizacion porque se puede.
Crear automatizacion cuando reduce pasos, errores o tokens de forma repetida.
```

## Siguiente accion

Usar `cron-doctor` antes de anadir nuevos crons o cuando un smart cron falle.
