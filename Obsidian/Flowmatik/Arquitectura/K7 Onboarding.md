# K7 Onboarding

Fecha: 2026-06-27

## Decision

KAIZEN7 necesita una entrada plug-and-play para agentes y workflows comunes.

`k7:onboard` convierte un preset en un `Connector Kernel` completo.

## Presets

- `codex`
- `flowmatik`
- `defocus`
- `social`
- `commerce`
- `research`
- `memory`

## Uso

```powershell
npm.cmd run k7:onboard -- --list
npm.cmd run k7:onboard -- --preset codex "mejorar KAIZEN7 con tests"
npm.cmd run k7:onboard -- --preset social "crear contenido para redes"
```

## API

```http
GET /api/k7/onboard
POST /api/k7/onboard
```

## Regla

Onboarding no ejecuta efectos externos. Solo devuelve perfil, ruta, metaskills, conectores, comandos y gates.

El objetivo es ahorrar pasos al conectar cualquier agente o proyecto sin saltarse aprobaciones.
