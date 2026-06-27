# Pregunta 2026-06-26 - Como publicar anclas KAIZEN7 y THE FOCUX

## Pregunta a KAIZEN7

Tenemos dos anclas:

- `kaizen7`: cerebro, memoria, Obsidian, metaskills, smart-crons, Signal Bowl y direccion operativa.
- `thefocux`: web publica, marca, Cloudflare, assets, AI layer y MCP publico.

El repo local `site/thefocux` esta listo y verificado, pero el remoto `Lucianople7/thefocux` no aparece para GitHub/Codex. El repo madre `kaizen7` esta verificado, pero Codex no puede commitear porque Windows bloquea `.git/index.lock` por ACL.

Como lo haria KAIZEN7?

## Respuesta KAIZEN7

### Marco usado

Super IQ + Ponytail:

- minimo movimiento que desbloquea,
- no crear otra arquitectura,
- no pelear permisos del sistema desde Codex,
- no mezclar cerebro privado con repo publico,
- dejar trazabilidad en Obsidian.

### Decision

Mantener dos repos:

- `kaizen7` como ancla interna.
- `thefocux` como ancla publica.

No fusionarlos. No borrar el repo local interno de `site/thefocux`. No intentar que Codex fuerce permisos de Windows.

### Plan de desbloqueo

1. Crear o exponer en GitHub el repo exacto:

   `Lucianople7/thefocux`

2. Dar acceso a la GitHub App/Codex si el repo es privado.

3. Desde una sesion Windows normal o GitHub Desktop, autenticar GitHub.

4. Subir THE FOCUX:

   ```powershell
   cd C:\Users\lucia\OneDrive\Documentos\kaizen7\site\thefocux
   git push -u origin main
   ```

5. Cerrar KAIZEN7 desde una sesion con permiso real sobre `.git`:

   ```powershell
   cd C:\Users\lucia\OneDrive\Documentos\kaizen7
   git add .
   git commit -m "Anchor KAIZEN7 and THE FOCUX systems"
   git push
   ```

6. Conectar Cloudflare Pages al repo `thefocux`.

### Tradeoff

Separar repos exige dos pushes, pero evita que Obsidian, memoria, metaskills y archivos internos entren en el repo publico de marca.

### Riesgo

El unico riesgo real ahora es pensar que falta codigo. No falta codigo: falta acceso GitHub/Windows.

### Verificacion

- KAIZEN7: `npm run check` paso.
- THE FOCUX: `npm run check` paso.
- THE FOCUX local tiene commits:
  - `9452b82 Initial THE FOCUX site`
  - `9dd6362 Refine THE FOCUX web and AI layer`

### Movimiento Obsidian

Esta pregunta queda como decision operativa canonica hasta que el push este hecho.

### Siguiente accion

Crear/exponer `Lucianople7/thefocux` y hacer push de `site/thefocux`.
