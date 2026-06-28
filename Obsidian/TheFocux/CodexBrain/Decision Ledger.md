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

## 2026-06-25 - Repos separados KAIZEN7 y THE FOCUX

### Decision

Decision final: mantener dos anclas separadas.

- `kaizen7`: cerebro, memoria, metaskills, Obsidian, arquitectura y direccion operativa.
- `thefocux`: web publica, assets, Cloudflare Pages, AI layer, MCP publico y evolucion de marca.

THE FOCUX puede seguir viviendo fisicamente dentro del workspace de KAIZEN7 como `site/thefocux`, pero esa carpeta tiene repo Git propio para publicar y desplegar sin arrastrar todo Obsidian.

### Por que

Lucia definio que KAIZEN7 y THE FOCUX son distintos y necesitan anclas distintas. Separarlos evita mezclar cerebro interno con marca publica, pero mantiene a KAIZEN7 al cargo de THE FOCUX desde el workspace.

### Que se hizo

- `kaizen7` mantiene su `origin`: `https://github.com/Lucianople7/kaizen7.git`.
- `site/thefocux` mantiene repo Git propio.
- `site/thefocux` apunta a `https://github.com/Lucianople7/thefocux.git`.
- Se creo el commit inicial local `9452b82 Initial THE FOCUX site`.
- Se anadio `.npm-cache/` al `.gitignore` del sitio.

### Pendiente

Subir `site/thefocux` a GitHub cuando el repositorio `Lucianople7/thefocux` sea visible para GitHub/Codex.

Intento 2026-06-25:

- Git local no puede empujar por HTTPS por credenciales Windows: `SEC_E_NO_CREDENTIALS`.
- Conector GitHub autenticado correctamente.
- El conector ve `Lucianople7/kaizen7`.
- El conector no encuentra `Lucianople7/thefocux`.

### Siguiente accion

Crear el repo `thefocux` exactamente como `Lucianople7/thefocux` o conceder acceso de la app GitHub a ese repo. Despues, publicar el commit local `9452b82`.

## 2026-06-26 - Estado de anclas KAIZEN7 / THE FOCUX

### Decision

Avanzar con dos anclas:

- KAIZEN7 como cerebro y memoria.
- THE FOCUX como repo web/marca separado.

### Estado tecnico

THE FOCUX:

- Repo local: `site/thefocux`.
- Remoto configurado: `https://github.com/Lucianople7/thefocux.git`.
- Commits locales:
  - `9452b82 Initial THE FOCUX site`
  - `9dd6362 Refine THE FOCUX web and AI layer`
- Verificacion pasada: `npm run check`.

KAIZEN7:

- Verificacion pasada: `npm run check`.
- Cambios listos en memoria, Signal Bowl, Signal Radar, smart-crons, skills y web.
- Commit local pendiente porque Windows bloquea escritura en `.git/index.lock` con ACL `DENY`.

GitHub:

- Git local no puede empujar por HTTPS por `SEC_E_NO_CREDENTIALS`.
- Conector GitHub autenticado, pero `Lucianople7/thefocux` sigue respondiendo `Repository not found`.

### Siguiente accion

Crear o exponer el repo `Lucianople7/thefocux` y ejecutar el push desde una sesion Git autenticada. Si se quiere commitear KAIZEN7 localmente, hacerlo desde la cuenta Windows normal de Lucia o quitar el bloqueo ACL sobre `.git`.

## 2026-06-26 - Pregunta resuelta por KAIZEN7 sobre publicacion

### Decision

KAIZEN7 decide no crear mas arquitectura para resolver el bloqueo actual.

La ruta correcta es:

1. Mantener dos repos:
   - `kaizen7` como cerebro interno.
   - `thefocux` como web publica.
2. Crear o exponer `Lucianople7/thefocux`.
3. Hacer push de `site/thefocux` desde una sesion Git autenticada.
4. Commiter `kaizen7` desde una sesion con permiso real sobre `.git`.

### Por que

El codigo ya esta verificado. El problema no es tecnico de la web, sino acceso: GitHub no ve `Lucianople7/thefocux` y Windows bloquea escritura en `.git` del repo madre.

### Nota

Respuesta completa guardada en:

`Obsidian/Flowmatik/Kaizen7/Preguntas/Pregunta 2026-06-26 - Como publicar anclas KAIZEN7 THE FOCUX.md`

## 2026-06-26 - Separar KAIZEN7 agente y THE FOCUX proyecto

### Decision

Separar definitivamente el modelo mental:

- KAIZEN7 es agente/sistema operativo.
- THE FOCUX es proyecto/marca/producto.

### Por que

Lucia aclaro que le interesa mas KAIZEN7 como agente y THE FOCUX como proyecto. Esto permite que KAIZEN7 no quede limitado a una sola marca y que THE FOCUX tenga repo, deploy y ciclo de producto propios.

### Que implica

- KAIZEN7 conserva Obsidian, metaskills, memoria, smart-crons y radar.
- THE FOCUX conserva web, assets, Cloudflare, MCP publico, IA friendly, contenido y ecommerce futuro.
- La carpeta ideal de THE FOCUX debe ser hermana de `kaizen7`, no subcarpeta permanente.

### Nota

Arquitectura creada:

`Obsidian/Flowmatik/Arquitectura/Separacion KAIZEN7 THE FOCUX.md`

### Ejecucion

Se creo carpeta hermana:

`C:\Users\lucia\OneDrive\Documentos\thefocux`

Estado:

- conserva Git local,
- conserva remoto `https://github.com/Lucianople7/thefocux.git`,
- conserva commits `9452b82` y `9dd6362`,
- `npm run check` pasa.

THE FOCUX debe trabajarse desde esa carpeta como proyecto. La copia en `kaizen7/site/thefocux` queda temporal hasta limpieza/submodulo.

## 2026-06-26 - KAIZEN7 GitHub ancla inicializada

### Decision

Inicializar el repo GitHub `lucianople7/kaizen7` como ancla del agente, no como repo de THE FOCUX.

### Que se hizo

- Creado `README.md` remoto.
- Creado `.gitignore` remoto.
- Confirmada rama `main`.

### Por que

El repo estaba vacio. Antes de subir todo, KAIZEN7 debe dejar claro que es agente/sistema operativo y que THE FOCUX es proyecto separado.

### Pendiente

Subir cuerpo completo limpio de KAIZEN7 excluyendo `site/thefocux/` y caches. La copia local de THE FOCUX dentro de `kaizen7` queda temporal hasta limpieza controlada.

## 2026-06-25 - THE FOCUX Signal Bowl

### Decision

Crear `Obsidian/TheFocux/THE FOCUX Signal Bowl.md` como entrada unica para recopilar informacion externa fiable centrada en THE FOCUX.

### Por que

Lucia definio que desde ahora todo fine-tuning, busqueda y mejora debe centrarse en THE FOCUX: informacion real, fuentes verificables, competencia, formulas, precios, podcasts, videos, imagenes, proveedores y claims.

### Que evita

- Seguir creando capas internas sin alimentar la marca.
- Hacer videos o contenidos sin base real.
- Guardar ideas sin fuente.
- Mezclar claims comerciales con evidencia.
- Masificar pasos o tokens.

### Que mejora

- THE FOCUX empieza a construir biblioteca propia.
- KAIZEN7 busca con objetivo claro.
- Obsidian recopila datos utiles.
- Cada sesion puede terminar con pocos datos, accion minima y descartes claros.

### Siguiente accion

Hacer la primera ronda pequena de Signal Bowl: 3 datos fiables, 1 accion minima y 1 descarte si aplica.

## 2026-06-25 - Biblioteca storage de fuentes reales

### Decision

Usar OneDrive local dentro del workspace como almacen pesado de evidencia y Obsidian como indice inteligente.

Estructura minima prevista:

- `THE_FOCUX_SIGNAL_LIBRARY/00_Inbox`
- `THE_FOCUX_SIGNAL_LIBRARY/01_Fuentes_Reales`
- `THE_FOCUX_SIGNAL_LIBRARY/02_Competencia_Formulas_Precios`
- `THE_FOCUX_SIGNAL_LIBRARY/03_Media_Fotos_Videos_Podcasts`
- `THE_FOCUX_SIGNAL_LIBRARY/04_Proveedores_Docs`
- `THE_FOCUX_SIGNAL_LIBRARY/99_Descartes_Claims_Riesgo`

### Por que

THE FOCUX necesita una biblioteca propia con informacion veridica: fuentes, fotografias, videos, podcasts, precios, formulas, proveedores, certificados y descartes.

### Que evita

- Saturar Obsidian con archivos pesados.
- Guardar imagenes, videos o PDFs sin criterio.
- Mezclar ideas con datos verificados.
- Crear demasiadas carpetas antes de tener flujo real.

### Que mejora

- KAIZEN7 tiene un destino claro para cada tipo de senal.
- Obsidian conserva el contexto ligero y accionable.
- Drive guarda materia prima para web, contenido, ecommerce, asistente IA y NEUROCITY.

### Estado

Decision actualizada tras feedback de Lucia: no hace falta Google Drive. La mejor opcion para KAIZEN7 es OneDrive local porque ya esta disponible, no depende de conectores y permite guardar pesado fuera de Obsidian.

Creado:

- `THE_FOCUX_SIGNAL_LIBRARY/`
- `.gitignore` protege el contenido pesado.
- `THE_FOCUX_SIGNAL_LIBRARY/README.md` conserva la regla de uso.

### Siguiente accion

Empezar con una ronda de 3 fuentes fiables y guardar cualquier archivo pesado en `THE_FOCUX_SIGNAL_LIBRARY/00_Inbox` o su carpeta especifica.
