# Separacion KAIZEN7 / THE FOCUX

## Decision 2026-06-26

KAIZEN7 y THE FOCUX deben separarse como dos repos y dos responsabilidades distintas.

## Modelo correcto

### KAIZEN7

KAIZEN7 es el agente.

Contiene:

- Obsidian operativo.
- Metaskills.
- Memoria.
- Smart-crons.
- Signal Radar.
- Repo Hunter.
- Adaptadores.
- Criterio de decision.
- Plantillas reutilizables.
- Product Growth OS.

KAIZEN7 no es THE FOCUX. THE FOCUX es un proyecto gestionado por KAIZEN7.

### THE FOCUX

THE FOCUX es el proyecto.

Contiene:

- Web publica.
- Assets de marca.
- NEUROCITY.
- El Arquitecto.
- AI Layer publico.
- MCP publico.
- Cloudflare Pages.
- Ecommerce futuro.
- Newsletter.
- Contenido, partners y seleccion comercial.

THE FOCUX no debe arrastrar Obsidian interno, metaskills ni memoria privada de KAIZEN7.

## Estructura recomendada

En OneDrive local:

```text
Documentos/
  kaizen7/
    Obsidian/
    .agents/
    .codex/
    lib/
    data/
    tests/

  thefocux/
    public/
    functions/
    migrations/
    tests/
    package.json
    wrangler.toml
```

## Regla de trabajo

1. Toda decision empieza en Obsidian dentro de KAIZEN7.
2. Si afecta a la web publica, el cambio se ejecuta en THE FOCUX.
3. KAIZEN7 registra:
   - decision,
   - por que,
   - riesgo,
   - verificacion,
   - siguiente accion.
4. THE FOCUX registra solo codigo, assets publicos y documentacion publica.

## Por que

Separar agente y proyecto evita:

- mezclar memoria privada con marca publica,
- subir Obsidian interno al repo web,
- convertir THE FOCUX en el limite de KAIZEN7,
- perder claridad sobre que es sistema y que es producto.

Mejora:

- Cloudflare conecta limpio al repo `thefocux`,
- KAIZEN7 puede gestionar mas proyectos en el futuro,
- THE FOCUX queda mas profesional,
- Codex puede trabajar con contexto sin contaminar el deploy.

## Estado actual

Conceptualmente separado:

- `kaizen7`: repo agente.
- `thefocux`: repo proyecto.

GitHub KAIZEN7:

- `https://github.com/lucianople7/kaizen7`
- repo privado.
- rama `main` creada.
- README inicial creado por Codex.
- `.gitignore` inicial creado por Codex.
- estado: ancla remota creada, pendiente subir cuerpo completo limpio del agente.

Fisicamente creado:

- `C:\Users\lucia\OneDrive\Documentos\thefocux`
- conserva historial Git.
- conserva remoto `https://github.com/Lucianople7/thefocux.git`.
- `npm run check` pasa.

Pendiente:

- mantener `site/thefocux` solo como fuente temporal hasta completar migracion.
- cuando KAIZEN7 pueda commitear, retirar `site/thefocux` del repo madre o convertirlo en referencia/submodulo si se decide.
- crear o exponer el repo GitHub `Lucianople7/thefocux`.

## Siguiente accion

Trabajar THE FOCUX desde `C:\Users\lucia\OneDrive\Documentos\thefocux` como repo proyecto principal.

Para KAIZEN7, preparar subida limpia excluyendo `site/thefocux/` porque THE FOCUX ya tiene proyecto propio.
