# Briefing para Codex - Que resuelve KAIZEN7

**Fecha:** 2026-06-28  
**Para:** Codex  
**Estado:** actualizado despues de integrar Browser Adapter

---

## El problema que KAIZEN7 resuelve

Cada vez que Lucia abre Claude Code, Codex u otro agente, el agente puede empezar desde cero.

No sabe que se decidio ayer. No sabe que fallo la semana pasada. No sabe que repo ya se evaluo y descarto. No sabe que skill ya existe. Lucia tiene que re-explicar el contexto en cada sesion. Eso es friccion real que acumula horas perdidas.

**KAIZEN7 resuelve la amnesia entre sesiones de IA.**

---

## Las tres capas

**Memoria** - lo que se aprende en una sesion lo recuerda la siguiente. No en la cabeza de Lucia. En el sistema. Obsidian es la memoria operativa compartida.

**Decision** - antes de actuar, el agente consulta que se intento antes, que bloqueo, que aprobo el judge. No repite errores. El agent-loop ya implementa esto.

**Senales** - cuando llega un repo externo, una herramienta nueva, un fabricante, una tendencia o una web, el sistema lo convierte en signal packet, lo rankea, y decide si actuar o ignorar.

---

## Lo que ya funciona

```text
k7:run      -> entry point para objetivo -> devuelve una accion
k7:advise   -> dice a otro agente que leer y que evitar
k7:memory   -> consulta semantica sobre notas Obsidian
k7:hunter   -> rankea candidatos de implementacion
k7:github   -> convierte repo GitHub en signal packet
k7:hf       -> convierte modelo/dataset/space HF en signal packet
k7:browser  -> convierte URL web/browser en signal packet
k7:ready    -> verifica que el core esta operativo
```

---

## Browser Adapter ya esta integrado

El patron queda cerrado:

```text
GitHub URL  -> github-adapter.js      -> signal packet -> k7:run
HF URL      -> huggingface-adapter.js -> signal packet -> k7:run
Browser URL -> browser-adapter.js     -> signal packet -> k7:run
```

Archivo principal:

```text
lib/browser-adapter.js
```

Documentacion:

```text
docs/BROWSER_ADAPTER.md
```

Tests:

```text
tests/browser-adapter.test.js
tests/agent-runner.test.js
```

---

## Interfaz canon

```powershell
npm.cmd run k7:run -- --browser "https://developers.tiktok.com" "get access token"
```

El adapter tiene 3 niveles:

1. Nivel 1: snapshot/texto de una URL publica -> signal packet.
2. Nivel 2: objetivo/accion + resultado seguro -> signal packet.
3. Nivel 3: script reutilizable guardado en `data/metabrowser-scripts/`.

Safety:

Si el objetivo menciona access token, OAuth, login, credenciales, pagos, publicar, borrar o deploy, el packet se enruta a `decision` y requiere aprobacion humana antes de ejecutar.

---

## Pregunta directa para Codex

`k7:run` arranca hoy y devuelve algo util con un objetivo real?

Respuesta actual:

Si. `npm.cmd run check` pasa y `npm.cmd run k7:ready` devuelve `ready`, 70 checks, 0 blockers. El siguiente paso ya no es crear `browser-adapter.js`; el siguiente paso es probarlo con URLs reales y decidir que senales merecen pasar a Hunter.

Verificacion adicional:

```powershell
npm.cmd run k7:run -- --browser "https://developers.tiktok.com" "get access token" --json
```

Resultado observado:

```json
"ingested": [
  {
    "type": "browser",
    "url": "https://developers.tiktok.com",
    "candidate": "developers.tiktok.com"
  }
]
```

---

## Siguiente paso recomendado

Probar:

```powershell
npm.cmd run k7:run -- --browser "https://developers.tiktok.com" "get access token" --compact
```

Despues revisar:

```powershell
node lib/hunter.js signals
node lib/hunter.js queue
```

---

## Regla de coordinacion

Claude Code lee el vault Obsidian y puede escribir skills/notas.

Codex edita el codigo JS en:

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7
```

Ambos escriben aprendizajes en Obsidian antes de cerrar sesion.

Si algo cambia de arquitectura: escribir `DECISION ACTUALIZADA` en este vault antes de tocar codigo.
