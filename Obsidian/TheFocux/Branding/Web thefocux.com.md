# Web thefocux.com

## Arquitectura

- Sitio publico independiente en `site/thefocux`.
- Cloudflare Pages para HTML, CSS y assets.
- Pages Functions para `/api/waitlist`.
- Cloudflare D1 para almacenar leads y consentimiento.
- KAIZEN7 permanece separado del sitio publico.

## Posicionamiento web

THE FOCUX = research for human performance.

La primera version es una publicacion especializada y una founding list. No gira alrededor de un producto propio. Sus verticales son nootropicos, ciencia de peptidos y sistemas de rendimiento para personas con responsabilidades reales.

La futura linea comercial sera una seleccion pequena de suplementos y herramientas legalmente comercializables, con evidencia, fabricante, limitaciones y conflictos visibles. No vendera peptidos de investigacion, medicamentos ni productos no autorizados.

## Capacidades

- Hero editorial cientifico propio.
- Teaser de NEUROCITY como serie original de educación científica.
- Diseño responsive negro, oro y tonos neutros.
- Lista privada con consentimiento y control anti-spam.
- Prevencion de duplicados por email.
- Politica de privacidad y terminos.
- SEO, Open Graph, sitemap y robots.txt.
- Sin cookies publicitarias ni trackers de terceros.
- Endpoint D1 probado con entradas validas e invalidas.

## Pendiente antes de produccion

1. Completar nombre legal, identificacion fiscal y domicilio del responsable de datos.
2. Autorizar instalacion y login de Wrangler.
3. Crear `thefocux-leads` en Cloudflare D1.
4. Sustituir `REPLACE_WITH_D1_DATABASE_ID` en `wrangler.toml`.
5. Aplicar migracion remota.
6. Desplegar Pages y asociar `thefocux.com`.
7. Verificar formulario, SSL, movil, Open Graph y correo de contacto en produccion.

## Activo visual

`site/thefocux/public/assets/focux-research-hero.png`

Hero editorial de la plataforma de research sobre nootrópicos, ciencia de péptidos y rendimiento.

`site/thefocux/public/assets/neurocity-key-art-v1.png`

Primera validación de tono adulto para NEUROCITY. Es key art conceptual, no character sheet definitivo. Antes de animación se deben fijar siluetas, proporciones, materiales y expresiones de cada personaje.
