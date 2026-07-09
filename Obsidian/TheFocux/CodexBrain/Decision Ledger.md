# Decision Ledger

## 2026-06-25 - Crear CodexBrain

### Decision

Crear `Obsidian/TheFocux/CodexBrain/` como segundo cerebro operativo de Codex para THE FOCUX.

### Por que

Lucia autorizo una carpeta propia para mejorar continuidad, inteligencia operativa, eficiencia de tokens y capacidad de ayuda de Codex.

### Que evita

- Mezclar memoria operativa con Product DNA.
- Repetir contexto en cada sesion.
- Abrir demasiados archivos para recordar lo ya decidido.
- Perder aprendizajes de uso.

### Que mejora

- THE FOCUX tiene una memoria de ejecucion.
- KAIZEN7 puede aprender por ciclos.
- Codex tiene un lugar donde guardar decisiones y lecciones propias sin contaminar compliance o marca.

### Siguiente accion

Usar CodexBrain antes de retomar la mejora de `site/thefocux`.

## 2026-06-25 - THE FOCUX WebUI v1 plataforma modular

### Decision

Transformar `site/thefocux` en una base publica modular para `thefocux.com`: home cinematica, movimiento ligero, idioma ES/EN, zona video, matriz de plataforma, founding list y capa futura para ecommerce/pagos.

### Por que

Lucia pidio una WebUI de ultima generacion abierta a crecer: videos, varios idiomas, integraciones, redes, ecommerce y pagos.

KAIZEN7 filtro el alcance: construir una base preparada sin convertir la web en tienda prematura.

### Que evita

- Meter Remotion pesado dentro de la web antes de tener video final.
- Promesas de rendimiento no verificables.
- Ecommerce antes de confianza, dossier y criterio editorial.
- Rehacer la arquitectura cuando entren idiomas, videos o pagos.

### Que mejora

- La web ya comunica plataforma, no solo landing.
- Hay estructura para traduccion ES/EN con `data-i18n`.
- Hay zona visual para trailers, clips y episodios.
- Hay bloques preparados para redes, integraciones, commerce, pagos y memoria KAIZEN7.
- Cloudflare Pages + Functions + D1 siguen siendo la base operativa.

### Siguiente accion

Revisar visualmente en navegador y despues decidir si el siguiente salto es trailer Remotion, deploy Cloudflare o capa de contenidos multiidioma.

## 2026-06-25 - MCP publico AI-friendly

### Decision

Crear una primera capa MCP publica y de solo lectura para `thefocux.com`.

### Por que

Lucia pidio integrar THE FOCUX con IA en todos los sentidos y despues concreto: conector MCP.

KAIZEN7 filtro el alcance: habilitar agentes para leer contexto, indice, guardrails y mapa publico sin dar acceso a datos privados, pagos, ecommerce o acciones sensibles.

### Que evita

- Exponer waitlist, pagos o acciones comerciales sin OAuth.
- Crear un chatbot antes de tener memoria, fuentes y limites.
- Que agentes interpreten THE FOCUX como consejo medico o tienda activa.
- Repetir contexto basico de marca en cada integracion IA.

### Que mejora

- `llms.txt` declara como deben leer THE FOCUX los modelos.
- `ai-index.json` ofrece mapa publico para agentes.
- `.well-known/mcp.json` ayuda al descubrimiento.
- `/mcp` responde JSON-RPC con herramientas publicas:
  - `get_brand_context`
  - `get_ai_index`
  - `get_compliance_guardrails`
  - `search_public_content`

### Siguiente accion

Cuando se quiera activar acciones privadas, crear MCP OAuth separado para contenidos internos, ecommerce, pagos, CRM o automatizaciones.

## 2026-06-25 - AI Layer visible

### Decision

Anadir una seccion `AI Layer` a la web publica de THE FOCUX.

### Por que

Lucia valido el enfoque: THE FOCUX debe ser AI-friendly por fuera y por dentro, no solo tener un chatbot.

### Que evita

- Reducir IA a una caja de chat desconectada.
- Conectar APIs sensibles antes de tener fuentes, limites y OAuth.
- Que agentes o usuarios interpreten la IA como consejo medico.

### Que mejora

- La web explica la IA para humanos, modelos, KAIZEN7 y negocio.
- `llms.txt`, `ai-index.json`, `.well-known/mcp.json` y `/mcp` quedan conectados a la narrativa publica.
- El asistente aparece como interfaz preparada, no conectada todavia.
- Se refuerza la ruta futura: buscador inteligente, resumenes, recomendaciones, embeddings y RAG.

### Siguiente accion

Crear el blueprint tecnico para el asistente real: fuente de contenidos, embeddings, modelo, memoria, guardrails, OAuth y separacion entre publico/privado.

## 2026-06-25 - AI Dock visible y conectado a MCP

### Decision

Convertir la capa IA en una experiencia visible: CTA en hero, dock flotante `THE FOCUX AI` y busqueda publica contra `/mcp`.

### Por que

Lucia indico que no veia ningun cambio real. El cambio anterior era correcto a nivel infraestructura, pero poco visible para validar producto.

### Que evita

- Confundir AI-friendly con archivos ocultos.
- Depender de scroll hasta una seccion enterrada.
- Prometer asistente sin mostrar una interaccion real.

### Que mejora

- Hay entrada IA visible desde el primer viewport.
- El dock consulta el MCP publico con `search_public_content`.
- Se puede probar con `neurocity`, `evidence` o `selection`.
- Mantiene guardrails: lectura publica, sin datos privados, sin consejo medico.

### Siguiente accion

Hacer que el dock evolucione a RAG real cuando exista corpus publico, embeddings, modelo y permisos definidos.

## 2026-06-25 - Mayor impacto visual de marca

### Decision

Subir la presencia visual de THE FOCUX y NEUROCITY en la home.

### Por que

Lucia pidio mas fotos, logo grande y NEUROCITY con mas presencia.

### Que evita

- Que la web parezca demasiado textual o tecnica.
- Que el logo y la IP NEUROCITY queden pequenos o enterrados.
- Que la primera impresion no transmita marca premium.

### Que mejora

- Logo grande en el hero.
- Galeria visual inmediata con sello THE FOCUX, research desk y NEUROCITY.
- NEUROCITY aparece como palabra gigante dentro de su escena cinematografica.
- Se reutilizan assets existentes sin meter dependencias ni peso innecesario.

### Siguiente accion

Revisar visualmente y decidir si se generan nuevos assets cinematicos especificos para personajes, producto y trailer.

## 2026-06-25 - Imagenes con movimiento

### Decision

Anadir movimiento ligero a las imagenes de THE FOCUX y NEUROCITY usando CSS/JS.

### Por que

Lucia pidio imagenes con movimiento. La web necesitaba sentirse mas viva sin depender todavia de videos pesados.

### Que evita

- Cargar video antes de tener assets finales.
- Aumentar demasiado el peso inicial.
- Romper Cloudflare Pages con dependencias innecesarias.

### Que mejora

- Hero con movimiento cinematografico lento.
- Fotos con efecto Ken Burns suave.
- NEUROCITY con paneo lento.
- Logo con flotacion premium.
- Micro-parallax con cursor.
- Respeta `prefers-reduced-motion`.

### Siguiente accion

Si el movimiento gusta, producir assets de video reales con Remotion para hero trailer y clips sociales.

## 2026-06-25 - El Arquitecto como protagonista

### Decision

Reorganizar NEUROCITY alrededor de un protagonista principal: `El Arquitecto`.

### Por que

Lucia marco que la gente sigue caras antes que ciudades, edificios o conceptos. La arquitectura correcta es:

1. THE FOCUX
2. El Arquitecto
3. NEUROCITY
4. Guardianes
5. Distritos

### Que evita

- Demasiados protagonistas compitiendo.
- Que NEUROCITY sea solo una ciudad abstracta.
- Que los Guardianes carguen solos con la marca.
- Parecer influencer, doctor con bata o vendedor.

### Que mejora

- THE FOCUX tiene cara publica reconocible.
- NEUROCITY conserva riqueza narrativa como universo.
- Los Guardianes quedan como reparto funcional.
- Se creo e integro `architect-neurocity.png` como retrato cinematografico inicial.
- La web ya muestra una seccion `El Arquitecto` y una jerarquia narrativa clara.

### Siguiente accion

Crear ficha canonica del Arquitecto: voz, frases, limites, vestuario, gestos, plano vertical 9:16 y prompt maestro estable para generar nuevas escenas.

## 2026-06-25 - El Arquitecto como avatar-marca

### Decision

Fijar a `El Arquitecto` como avatar cinematografico principal de THE FOCUX / NEUROCITY.

Debe conectar como una cara reconocible, pero no depender de una persona real. La marca gana estabilidad si el mismo avatar aparece en web, historias, videos, miniaturas, podcast, newsletter y futuras piezas sociales.

### Por que

Lucia marco que un avatar unico en todas las historias puede ser mas marca que varios protagonistas y mas facil de mantener, conocer y recordar.

### Que evita

- Multiplicar caras antes de tener un icono fuerte.
- Diluir la atencion entre Dr. Neuro, Memo, Cortex, Cortis y Dopa.
- Parecer una web con imagenes bonitas pero sin protagonista.
- Depender de un humano real, actor o influencer.

### Que mejora

- THE FOCUX gana una presencia reconocible.
- NEUROCITY mantiene universo sin competir con la cara principal.
- Los Guardianes quedan como apoyo narrativo.
- Se creo `architect-neurocity-v2.png` como version mas canónica.
- Se creo `Obsidian/TheFocux/Content/El Arquitecto - Canon.md`.

### Siguiente accion

Crear escenas del mismo avatar para video vertical 9:16: entrada a la Torre del Foco, Archivo de la Memoria y Centro de Decisiones.

## 2026-06-25 - El Arquitecto estilo comic serio

### Decision

Mover el canon visual principal de El Arquitecto hacia una ilustracion editorial adulta: comic serio, premium, calido y profesional.

### Por que

Lucia valido que este estilo conecta mejor con profesionales: mentor senior, gafas, barba canosa, cuello de tortuga, blazer, reloj clasico y ambiente intelectual. La imagen se siente de marca, no de stock, y es mas facil de mantener en historias, podcast y miniaturas.

### Que evita

- Avatar demasiado real o dependiente de una persona.
- Estetica infantil o cartoon de baja credibilidad.
- Influencer fitness, laboratorio generico o gymbro.

### Que mejora

- El personaje gana calidez sin perder autoridad.
- La web tiene una cara mas editorial y menos fria.
- Se integra `architect-editorial-comic-v1.png` como imagen principal.
- El canon se ajusta: comic serio adulto si, caricatura infantil no.

### Siguiente accion

Crear pack de expresiones: explicando, escuchando, pensativo y cierre reflexivo.

## 2026-07-09 - THE FOCUX OS repo separado y shell modular

### Decision

THE FOCUX OS vive como producto separado en `C:\Users\lucia\OneDrive\Documentos\thefocux`. KAIZEN7 queda como filtro/ruta, no como repositorio de implementacion de la web.

### Que se creo

- Primera shell modular publica en Next: hero cinematografico, video rail, dossiers, Selection futura y asistente contextual.
- Assets recuperados del site anterior en `public/assets`.
- Configuracion preparada para export estatico con imagenes sin optimizacion server-side.
- Commit local: `79fcbc5 Build THE FOCUX OS modular shell`.

### Estado

- `npm.cmd run build` pasa.
- `npm.cmd run lint` pasa sin errores, con 4 warnings previos en scripts auxiliares.
- Dev server verificado en `http://localhost:3001` con HTTP 200.
- Push a `https://github.com/Lucianople7/thefocux.git` fallo porque el repo remoto no existe o no es accesible.

### Siguiente accion

Crear o corregir el repo remoto de GitHub para THE FOCUX y subir el commit local. No desplegar Cloudflare hasta revisar dominio, Pages, D1/funciones y limites legales de ecommerce/claims.
