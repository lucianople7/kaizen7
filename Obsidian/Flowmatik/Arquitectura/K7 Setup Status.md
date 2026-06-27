# K7 Setup Status

Fecha: 2026-06-27

## Decision

KAIZEN7 necesita una pantalla de primer arranque que diga si el sistema esta listo sin exigir API keys.

## Implementacion

- `lib/setup-status.js`
- `setup-ui.js`
- `npm.cmd run k7:setup`
- `GET /api/k7/setup`

## Estados

- `local-only`: funciona sin API keys.
- `enhanced`: OpenAI configurado.
- `blocked`: readiness tiene bloqueos.

## Servicios visibles

- OpenAI
- GitHub
- Hugging Face
- MCP
- Runtime local
- Readiness

## Regla

Faltan credenciales no debe bloquear el producto. Solo cambia el modo.

El usuario debe poder abrir KAIZEN7, ver el estado y empezar con `k7:onboard` en modo local.
