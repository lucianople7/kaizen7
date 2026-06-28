# KAIZEN7 OPERATING MANUAL

Fecha: 2026-06-26

## Proposito

Este manual documenta el estado canonico de KAIZEN7 y THE FOCUX.

Debe leerse al empezar una sesion importante.

## Definicion de producto

```text
KAIZEN7 es el cerebro operativo que ayuda a que cada proyecto llegue a su objetivo con menos pasos, menos tokens y mas criterio.
```

Categoria:

```text
Agentic Product Growth OS
```

Documento canonico:

```text
Obsidian/Flowmatik/Producto/KAIZEN7 Product.md
```

## Separacion principal

KAIZEN7 y THE FOCUX son distintos.

```text
KAIZEN7 -> agente / sistema operativo
THE FOCUX -> proyecto / marca / producto
```

KAIZEN7 gestiona THE FOCUX. THE FOCUX no define el limite de KAIZEN7.

## Repos y carpetas

### KAIZEN7

Ruta local:

```text
C:\Users\lucia\OneDrive\Documentos\kaizen7
```

Repo GitHub:

```text
https://github.com/lucianople7/kaizen7
```

Rol:

- agente,
- memoria,
- Obsidian,
- metaskills,
- smart-crons,
- Signal Radar,
- Signal Bowl,
- Product Growth OS,
- adapters,
- patrones de decision.

Estado GitHub:

- repo privado creado,
- rama `main` creada,
- README remoto creado,
- `.gitignore` remoto creado,
- pendiente subir cuerpo completo limpio del agente.

### THE FOCUX

Ruta local principal:

```text
C:\Users\lucia\OneDrive\Documentos\thefocux
```

Repo GitHub previsto:

```text
https://github.com/Lucianople7/thefocux.git
```

Rol:

- proyecto publico,
- web,
- marca,
- Cloudflare Pages,
- assets,
- AI Layer,
- MCP publico,
- NEUROCITY,
- ecommerce futuro.

Estado local:

- Git propio activo.
- Commits:
  - `9452b82 Initial THE FOCUX site`
  - `9dd6362 Refine THE FOCUX web and AI layer`
- `npm run check` pasa.

Pendiente GitHub:

- crear o exponer repo `Lucianople7/thefocux`.
- hacer push desde una sesion autenticada.

## Regla de arranque

Al empezar trabajo de KAIZEN7 o THE FOCUX:

1. Leer este manual.
2. Leer `Obsidian/Flowmatik/Arquitectura/Separacion KAIZEN7 THE FOCUX.md`.
3. Si afecta a THE FOCUX, leer `Obsidian/TheFocux/THE FOCUX Bible.md`.
4. Antes de tocar codigo, definir:
   - decision,
   - riesgo,
   - cambio minimo,
   - verificacion,
   - donde queda escrito.

## Regla Obsidian

Toda decision importante empieza o termina en Obsidian.

No guardar archivos pesados en Obsidian.

Obsidian guarda:

- decisiones,
- contexto,
- criterios,
- riesgos,
- enlaces,
- resumen de fuentes,
- siguiente accion.

Archivos pesados van a:

```text
THE_FOCUX_SIGNAL_LIBRARY/
```

## Product Growth OS

KAIZEN7 organiza crecimiento con cuatro capas:

```text
Setup -> Product -> Opportunity -> Risk
```

### Setup

Arranque, Product Genome, web/base, identidad, canales, configuracion.

### Product

PDPs, dossiers, titulos, keywords, imagenes, videos, comparativas, calendario.

### Opportunity

Leads, newsletter, afiliados, proveedores, partners, follow-up.

### Risk

Claims, regulacion, IP, evidencia, seguridad, disclaimers, guardrails.

## 30 Second Activation

Decision:

```text
No vender el OS primero.
Demostrar la siguiente accion primero.
```

Promesa:

```text
Objetivo dentro -> antes/despues -> contexto minimo -> siguiente accion -> verificacion -> memoria
```

Interfaces:

```powershell
npm.cmd run k7:activate -- "objetivo"
```

```http
POST /api/k7/activate
```

Archivo canon:

```text
Obsidian/Flowmatik/Producto/KAIZEN7 30 Second Activation.md
```

## THE FOCUX

THE FOCUX es una marca premium de rendimiento mental y fisico para personas con responsabilidades reales.

Frase guia:

```text
Premium sin humo. Ciencia sin soberbia. Comercio sin trampa.
```

No es:

- suplemento generico,
- promesa milagrosa,
- biohacking infantil,
- venta disfrazada de ciencia.

Estado web:

- home visual,
- NEUROCITY,
- El Arquitecto estilo comic serio editorial,
- AI Layer,
- `/llms.txt`,
- `/ai-index.json`,
- MCP publico,
- waitlist,
- Cloudflare Pages/Workers/D1 base.

## NEUROCITY

NEUROCITY es IP educativa de THE FOCUX.

Jerarquia:

```text
THE FOCUX
  -> El Arquitecto
  -> NEUROCITY
  -> Guardianes
  -> Distritos
```

Regla:

```text
La metafora ayuda a entender. Nunca sustituye a la biologia.
```

## El Arquitecto

El Arquitecto es la cara principal de NEUROCITY.

Canon actual:

- mentor senior,
- comic serio editorial,
- gafas,
- barba canosa,
- blazer,
- cuello de tortuga,
- ambiente biblioteca/oficina,
- calido,
- profesional,
- no humano real,
- no cartoon infantil.

Archivo canon:

```text
Obsidian/TheFocux/Content/El Arquitecto - Canon.md
```

Asset principal:

```text
thefocux/public/assets/architect-editorial-comic-v1.png
```

## AI Friendly

THE FOCUX debe ser AI-friendly por fuera y por dentro.

Capas:

- humanos: asistente, buscador, rutas de lectura,
- modelos: `llms.txt`, `ai-index.json`, datos estructurados,
- KAIZEN7: memoria, Signal Bowl, RAG futuro,
- negocio: leads, newsletter, ecommerce, soporte.

Guardrail:

```text
Sin consejo medico. Sin claims inventados. Siempre fuentes y limites.
```

## Signal Bowl

`THE FOCUX Signal Bowl` recopila informacion externa fiable.

Entrada:

- research,
- competidores,
- precios,
- formulas,
- proveedores,
- podcasts,
- videos,
- imagenes,
- claims,
- oportunidades.

Regla:

```text
Fuente primero. Dato despues. Accion minima al final.
```

## Signal Library

Biblioteca local para archivos pesados:

```text
THE_FOCUX_SIGNAL_LIBRARY/
```

Regla:

- Obsidian indexa.
- La biblioteca guarda pesado.
- `.gitignore` evita subir archivos grandes.

## Smart-crons

KAIZEN7 tiene smart-crons para ejecutar misiones compactas.

Comando relevante:

```powershell
node lib/smart-crons.js signal-radar
```

Objetivo:

- maximo 3 paquetes accionables,
- query,
- motivo,
- destino,
- storage,
- accion minima.

## Adaptadores

Regla general:

```text
Adapter != Core
```

### Qwen Agent Adapter

Veredicto:

```text
test_later
```

Uso futuro:

- RAG,
- MCP,
- agentes secundarios,
- lectura de PDFs,
- comparativa de modelos.

No sustituye Codex ni Obsidian.

### NotebookLM Adapter

Veredicto:

```text
test_later
```

Uso futuro:

- briefing desde fuentes,
- guiones,
- podcasts,
- mind maps,
- contenido basado en documentos.

### CLI Anything Adapter Factory

Uso futuro:

- herramientas locales sin API,
- video,
- subtitulos,
- GIMP,
- Blender,
- Kdenlive,
- conversion documental.

No usar si hay API, CLI o MCP simple.

### Model Gateway

Decision:

```text
KAIZEN7 queda abierto a cualquier modelo top del mercado mediante una capa comun.
```

Regla:

```text
Model Gateway != KAIZEN7 core
Model Gateway = capa de ejecucion intercambiable
```

Proveedores preparados:

- OpenAI,
- Anthropic,
- Google,
- Groq,
- Mistral,
- OpenRouter,
- Ollama/local,
- APIs compatibles con OpenAI.

Interfaces:

```powershell
npm.cmd run k7:models -- --list
npm.cmd run k7:models -- --provider openrouter "objetivo"
```

```http
GET /api/k7/models
POST /api/k7/models
```

Archivo canon:

```text
Obsidian/Flowmatik/Producto/KAIZEN7 Model Gateway.md
```

## Patrones externos

Regla:

```text
Pattern != Tool
```

### Alibaba Smart Assistant Pattern

Veredicto:

```text
keep_pattern
```

Uso:

```text
Setup -> Product -> Opportunity -> Risk
```

No copiar Alibaba. Aprender la arquitectura.

## Publicacion

### KAIZEN7

Pendiente:

- subir cuerpo completo limpio al repo GitHub.
- excluir `site/thefocux/` porque THE FOCUX vive separado.
- commitear desde sesion con permiso real sobre `.git`.

Bloqueo actual:

- Codex no puede escribir `.git/index.lock` por ACL Windows.

### THE FOCUX

Pendiente:

- crear/exponer repo `Lucianople7/thefocux`.
- push desde `C:\Users\lucia\OneDrive\Documentos\thefocux`.
- conectar Cloudflare Pages al repo `thefocux`.

## Comandos utiles

KAIZEN7:

```powershell
cd C:\Users\lucia\OneDrive\Documentos\kaizen7
npm run check
```

THE FOCUX:

```powershell
cd C:\Users\lucia\OneDrive\Documentos\thefocux
npm run check
git status
git push -u origin main
```

## Siguiente accion global

1. Subir KAIZEN7 limpio a GitHub.
2. Crear/exponer repo THE FOCUX.
3. Subir THE FOCUX.
4. Conectar Cloudflare Pages.
5. Ejecutar Signal Radar real.
6. Crear primer dossier/clip NEUROCITY con fuentes reales.

## Fix log

### 2026-06-27 - Server integration test

Problema:

`npm run check` fallaba porque `tests/server.integration.test.js` esperaba `200` en `/api/k7/advise` y recibia `404`.

Raiz:

El test usaba puerto fijo `8797`. Si habia un servidor antiguo escuchando ahi, `waitForServer()` conectaba con esa instancia vieja y no con el servidor recien lanzado.

Arreglo:

El test ahora pide un puerto libre con `net.createServer().listen(0)` antes de lanzar `server.js`.

Verificacion:

`npm run check` pasa completo.

### 2026-06-27 - Repository documentation

Objetivo:

Dejar el repo KAIZEN7 entendible desde GitHub sin depender solo de Obsidian.

Archivos publicos:

- `README.md`
- `KAIZEN7_INDEX.md`
- `docs/KAIZEN7_AGENT_LOOP.md`
- `docs/ARCHITECTURE.md`
- `docs/REPOSITORIES.md`
- `docs/OPERATIONS.md`
- `docs/ADAPTERS_AND_PATTERNS.md`
- `docs/THE_FOCUX_PROJECT.md`
- `docs/CHANGELOG.md`

Decision:

KAIZEN7 puede documentar que gestiona THE FOCUX, pero no debe incluir la web THE FOCUX como parte del repo agente.

Accion:

`.gitignore` excluye `site/thefocux/`.

### 2026-06-28 - Push blocker diagnostic

Objetivo:

Publicar el avance de KAIZEN7 en `Lucianople7/kaizen7`, rama `kaizen7-frontier-operator`.

Estado real:

- `npm run check` pasa.
- `npm run k7:ready` queda en `ready`, con 70 checks y 0 blockers.
- El codigo local contiene Model Gateway, K7 Loop, Activation 30s, AI Handoff y documentacion Obsidian/docs.

Bloqueo:

- El `.git` local esta dentro de OneDrive y tiene reglas ACL `DENY`; `git add` falla con `index.lock: Permission denied`.
- HTTPS llega a GitHub, pero el repo privado exige credenciales y Git local no tiene sesion util.
- SSH llega, pero no hay llave autorizada para `git@github.com:Lucianople7/kaizen7.git`.
- `git credential-manager github login --device --no-ui` falla por credenciales Windows (`No credentials are available in the security package`).

Decision:

No repetir intentos ciegos. Para publicar hay tres rutas validas:

1. Autorizar GitHub local con `gh auth login` o Git Credential Manager.
2. Anadir una llave SSH autorizada a GitHub.
3. Publicar con el conector GitHub si se suben los blobs desde API.

Siguiente accion recomendada:

Instalar/autenticar `gh`, ejecutar `gh auth login`, y despues:

```powershell
git add -- .
git commit -m "Add K7 loop and model gateway"
git push origin kaizen7-frontier-operator
```

### 2026-06-28 - GitHub visibility

Decision:

El repo `lucianople7/kaizen7` queda publico.

Verificacion:

GitHub API devuelve `visibility: public`, con permisos admin activos para el conector.

Nota:

Hacer el repo publico no resuelve por si solo el bloqueo local de `.git` en OneDrive, pero simplifica clones, lectura externa, citabilidad y futura integracion con agentes/modelos.

### 2026-06-28 - MetaBrowser como adapter de k7:run

Decision:

MetaBrowser no se trata como herramienta separada. Queda integrado como `browser-adapter.js`, un adapter que alimenta `k7:run` igual que GitHub y Hugging Face.

Pipeline:

```text
Browser URL -> browser-adapter.js -> signal packet -> k7:run
```

Niveles:

1. Snapshot DOM/texto de una URL publica.
2. Objetivo/accion + resultado seguro como signal packet.
3. Script reutilizable guardado en `data/metabrowser-scripts/`.

Comando canon:

```powershell
npm.cmd run k7:run -- --browser "https://developers.tiktok.com" "get access token"
```

Safety:

Acciones con tokens, login, OAuth, credenciales, pagos, publicacion, borrado o deploy se enrutan a `decision` y requieren aprobacion humana antes de ejecutar.

Verificacion:

`npm run check` pasa con `tests/browser-adapter.test.js` y `tests/agent-runner.test.js`.
