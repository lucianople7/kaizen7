# K7 MetaBrowser

Fecha: 2026-06-25

## Veredicto

`adapt_pattern`

Agent Browser, Playwright MCP, Browser Use, BrowserCode y Browser Harness no deben entrar como cinco herramientas sueltas. KAIZEN7 necesita una sola interfaz: **K7 MetaBrowser**.

## Decision

K7 MetaBrowser sera la capa que decide como navegar, leer, inspeccionar, automatizar y convertir flujos web en aprendizaje reutilizable.

## Backend preferente

Agent Browser pasa a ser el primer backend recomendado por tres razones:

- CLI rapida y local.
- Lectura `read` util para research sin abrir navegador.
- Snapshots con referencias estables para actuar sin depender solo de vision.

## Router de backends

| Necesidad | Backend |
|---|---|
| Leer rapido una pagina, markdown, outline o docs | Agent Browser |
| Inspeccionar UI, clicar, rellenar, screenshot | Agent Browser |
| QA repetible y formularios estables | Playwright MCP |
| Navegacion ambigua con razonamiento | Browser Use |
| Convertir flujo validado en script reutilizable | BrowserCode pattern |
| Rescate avanzado por CDP o Chrome existente | Browser Harness |
| Convertir software sin CLI/API buena en herramienta de agente | CLI-Anything harness |

## Reglas KAIZEN7

1. Leer antes de actuar.
2. Snapshot antes de click/fill.
3. Re-snapshot despues de cada cambio de pagina.
4. Guardar señales utiles en Product Genome.
5. Publicacion externa, gasto, credenciales y cambios de cuenta requieren aprobacion humana.
6. APIs oficiales primero para Shopify y redes. Browser automation solo para research, QA, borradores y fallback.

## CLI-Anything dentro de MetaBrowser

CLI-Anything no sustituye a Agent Browser ni a Playwright MCP.

Su lugar correcto es otro: **fabricar adaptadores CLI para software que KAIZEN7 quiera controlar de forma repetible**.

Ejemplos:

- OpenCut / Shotcut / Kdenlive para video.
- OBS para grabacion.
- Blender/GIMP/Inkscape para assets.
- LibreOffice para documentos.
- Herramientas internas con codigo fuente.

Regla:

```text
Navegar web -> Agent Browser / Playwright MCP
Controlar software repetible -> CLI-Anything harness
Publicar o modificar cuentas -> API oficial + aprobacion humana
```

Patrones que se adoptan:

- comandos autodescriptivos con `--help`
- salida JSON para agentes
- REPL opcional para sesiones largas
- `SKILL.md` generado junto al harness
- tests unitarios y E2E contra software real

Patron descartado:

- generar un CLI para cada cosa antes de tener un flujo repetido.

## Primer flujo real

`trend-search`

Entrada:

- query
- plataforma
- texto fuente o pagina

Salida:

- señales detectadas
- oportunidades creativas
- riesgos
- registro en Creative DNA del Product Genome

## Lo que se descarta ahora

- Instalar todos los backends a la vez.
- Automatizar subida/publicacion en TikTok antes de tener research y aprobaciones.
- Scraping masivo sin reglas, permisos ni control de fuente.

## Siguiente accion

Implementar el primer flujo en la WebUI:

```text
K7 MetaBrowser -> trend-search -> Product Genome / Creative DNA
```
