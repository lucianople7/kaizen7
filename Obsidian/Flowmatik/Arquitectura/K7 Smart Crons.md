# K7 Smart Crons

## Decision 2026-06-25

KAIZEN7 incorpora un motor local de crons inteligentes para mejora y mantenimiento.

## Principio

```text
Cron inteligente = senal -> propuesta -> accion minima -> memoria
```

Por defecto los crons proponen. No publican, no gastan, no borran, no tocan credenciales y no programan tareas del sistema sin aprobacion humana.

## Implementacion

```text
data/smart-crons.json
lib/smart-crons.js
tests/smart-crons.test.js
```

## Crons iniciales

- `daily`: revisa semaforo y nota diaria para detectar bloqueos o falta de siguiente accion.
- `skill-health`: propone validar skills locales.
- `thefocux`: propone un unico movimiento de crecimiento para THE FOCUX.
- `repo-hunter`: activa Repo Hunter solo si hay una capacidad faltante repetida.
- `maintenance`: propone `npm.cmd run check`.

## Uso

```powershell
node lib/smart-crons.js k7
node lib/smart-crons.js brief
node lib/smart-crons.js daily
node lib/smart-crons.js maintenance
node lib/smart-crons.js thefocux
node lib/smart-crons.js skill-health
node lib/smart-crons.js repo-hunter
```

Para escribir memoria interna:

```powershell
node lib/smart-crons.js brief --write-memory
node lib/smart-crons.js maintenance --write-memory
```

## Daily Operator Brief

`brief` agrega los smart crons seguros, elige una prioridad principal y produce memoria compacta:

```text
Prioridad de hoy
Razon
Bloqueos
Accion minima
Riesgo
```

## K7 Compact Mode

`k7` es el modo recomendado para uso diario:

```text
Un comando.
Una prioridad.
Una accion minima.
Una memoria util.
```

`k7` ejecuta `brief`, escribe memoria automaticamente y devuelve solo:

```text
priority
action
command
risk
```

## Apply Safe

`k7 --apply-safe` intenta ejecutar solo acciones internas permitidas por allowlist.

```powershell
node lib/smart-crons.js k7 --apply-safe
```

Allowlist inicial:

- `npm.cmd run check`

Comportamiento:

- Si la prioridad es revisar una nota, marca `skipped`.
- Si la prioridad es un comando seguro, lo ejecuta y registra resultado.
- Si la prioridad requiere publicar, borrar, gastar, credenciales, red externa o comandos no permitidos, bloquea.

## Guardrails

- Escritura interna en Obsidian permitida y trazada.
- Publicacion externa requiere aprobacion humana.
- Gasto requiere aprobacion humana.
- Eliminacion de datos requiere aprobacion humana.
- Acciones con secretos o credenciales requieren aprobacion humana.

## Siguiente accion

Usar manualmente los smart crons durante varios ciclos antes de conectarlos a Windows Task Scheduler, GitHub Actions o Cloudflare Cron.
