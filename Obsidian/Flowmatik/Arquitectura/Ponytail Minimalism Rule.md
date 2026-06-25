# Ponytail Minimalism Rule

## Actualizacion 2026-06-25

### Decision

KAIZEN7 adopta el principio Ponytail como regla de ingenieria y producto: construir solo lo necesario, reutilizar lo existente y evitar arquitectura especulativa.

No se incorpora como dependencia obligatoria. Se usa como criterio operativo y skill de revision cuando haga falta.

### Regla

Antes de crear codigo, agente, automatizacion, conector o flujo nuevo, comprobar en este orden:

1. ¿Necesita existir ahora?
2. ¿Ya existe en este proyecto?
3. ¿Lo resuelve la plataforma nativa?
4. ¿Lo resuelve una API estandar?
5. ¿Lo resuelve una dependencia ya instalada?
6. ¿Puede resolverse con una pieza minima?
7. Solo entonces crear algo nuevo.

### Aplicacion a KAIZEN7

- No usar n8n, Temporal, Activepieces o Windmill como nucleo antes de necesitar orquestacion externa real.
- No crear un agente por herramienta.
- No migrar a Next.js/Postgres/colas hasta que el flujo local demuestre valor.
- No activar Shopify, TikTok, Meta o automatizaciones de publicacion antes de tener contenido, oferta y aprobacion humana.
- Mantener Codex como kernel y Obsidian/Product Genome como memoria principal.

### Aplicacion a THE FOCUX

- Publicar primero la web y founding list.
- Crear el primer dossier/clip NeuroCity antes de construir ecommerce.
- Contactar pocos proveedores con scoring claro.
- No fabricar producto propio hasta validar audiencia, confianza y demanda.
- No usar claims que requieran revision legal o sanitaria sin fuente y aprobacion.

### Quality Gate

Una propuesta se bloquea si:

- agrega una herramienta nueva sin dolor real,
- duplica memoria existente,
- aumenta mantenimiento sin mejorar el siguiente resultado,
- oculta riesgos regulatorios,
- o convierte una hipotesis en sistema permanente.

### Uso practico

Invocar revision Ponytail cuando:

- un archivo crezca demasiado,
- una feature parezca arquitectura antes que necesidad,
- haya varias herramientas para el mismo trabajo,
- o KAIZEN7 empiece a parecer mas complejo que el problema que resuelve.
