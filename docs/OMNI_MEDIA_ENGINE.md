# KAIZEN7 Omni-Media Engine

El Omni-Media Engine convierte Flowmatik en una fabrica de piezas audiovisuales, no solo en un generador de reels.

## Objetivo

Crear una capa local, reproducible y agent-native para planificar piezas en diferentes formatos:

- Vertical: TikTok, Reels, Shorts.
- Horizontal: YouTube, podcast, documental, web.
- Square: Instagram feed, LinkedIn, anuncios.

## Principios

- Primero capacidades, despues herramientas.
- Sin APIs externas por defecto.
- Cada ejecucion genera una sesion con estado.
- Los errores son JSON estructurado para que otro agente pueda recuperarse.
- Remotion, FFmpeg, audio local o cualquier herramienta futura son proveedores reemplazables.

## Comandos

```bash
npm run omni:plan -- --format vertical --topic "Mr Kaizen Bangkok energy"
npm run omni:write -- --format horizontal --topic "THE FOCUX documentary"
npm run k7:anything -- --capability media.pipeline
```

## Sesion

Al usar `--write`, se crea:

```text
content_library/omni/sessions/<session-id>/session.json
```

La sesion guarda:

- plan
- formato
- proveedores
- pasos
- evidencias
- outputs
- errores

## Siguiente Evolucion

La siguiente capa debe ejecutar el plan:

1. Tomar guion manual.
2. Generar voz y musica local.
3. Seleccionar clips o composicion.
4. Renderizar.
5. Verificar con probe.
6. Guardar memoria y handoff.
