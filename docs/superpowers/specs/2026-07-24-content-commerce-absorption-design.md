# KAIZEN7 Content Commerce — diseño de absorción

Fecha: 2026-07-24  
Estado: diseño y documento aprobados por Luciano
Rama: `agent/content-commerce-absorption-spec`

## 1. Decisión

KAIZEN7 incorporará un perfil especializado `content_commerce` mediante un plugin propio y pequeño, construido sobre contratos nativos de KAIZEN7 y una selección curada de patrones externos.

No se instalará ni copiará íntegramente ningún megaplugin comunitario. KAIZEN7 seguirá siendo el cerebro, la autoridad de rutas, la memoria verificable y el guardián. Las fuentes externas aportarán conocimiento y patrones; los conectores y herramientas aportarán ejecución; Flowmatik conservará la identidad creativa; THE FOCUX recibirá el resultado comercial; la persona seguirá siendo la autoridad final.

La cadena objetivo será:

```text
Señal -> Oportunidad -> Producto -> Historia -> Contenido -> Verificación
       -> Aprobación -> Publicación -> Métricas -> Aprendizaje
```

La primera misión operativa será Flowmatik: producir una pieza excelente al día, convertir atención en aprendizaje y aprendizaje en una oferta o activo comercial verificable.

## 2. Por qué esta arquitectura

El repositorio ya contiene perfiles `creative` y `commerce` en `data/k7-loop-policy.json`, pero ambos tienen rutas vacías. La necesidad no es añadir otro cerebro ni una colección masiva de agentes. La necesidad es completar esas rutas con un contrato común, doce capacidades enfocadas y un circuito cerrado de evidencia.

La documentación actual de Codex recomienda usar instrucciones duraderas para el repositorio, skills para flujos repetibles, plugins para agrupar skills y conexiones, MCP o conectores para datos y acciones externas, y automatizaciones solo para flujos estables. El repositorio oficial de plantillas por rol de OpenAI confirma la estructura adecuada: manifiesto, skills, bindings opcionales y assets reutilizables.

## 3. Objetivos y límites

### Objetivos

1. Especializar KAIZEN7 desde la raíz en creación de contenido orientada a comercio electrónico.
2. Mantener una única base de marca, producto, hechos y restricciones para todas las piezas.
3. Separar hechos verificados, inferencias y propuestas creativas.
4. Crear contenido multiformato sin duplicar contexto ni perder identidad.
5. Vincular cada activo con hipótesis, publicación, métricas y aprendizaje promovible.
6. Aprovechar fuentes comunitarias sin ceder la gobernanza ni introducir dependencias innecesarias.
7. Funcionar en modo local y gratuito siempre que sea posible.

### No objetivos de la primera versión

- No publicar automáticamente.
- No ejecutar gasto publicitario ni compras.
- No instalar los 158 módulos de Digital Marketing Pro ni los 157 de eCommerce-Skills.
- No crear 24 agentes especialistas permanentes.
- No sustituir Flowmatik, THE FOCUX, Shopify, Canva, HyperFrames o Remotion.
- No construir todavía un panel visual propio.
- No asumir que una sugerencia externa es verdadera, legal o adecuada para la marca.

## 4. Bases investigadas y decisión de uso

| Fuente | Papel | Qué se absorbe | Qué se excluye |
|---|---|---|---|
| [OpenAI role-specific plugins](https://github.com/openai/role-specific-plugins) | Estructura canónica | Plugin por rol, skills, bindings y assets | Copiar IDs de conectores de otro workspace |
| [OpenAI Codex best practices](https://learn.chatgpt.com/guides/best-practices) | Reglas de superficie | Contexto mínimo, guidance durable, pruebas y revisión | Contexto masivo o configuración global innecesaria |
| [Marketing Skills](https://github.com/coreyhaines31/marketingskills) | Base principal de conocimiento | Contexto fundacional de producto, investigación, contenido, copy, CRO, analítica y loops | Instalar el catálogo completo en contexto |
| [Digital Marketing Pro](https://github.com/indranilbanerjee/digital-marketing-pro) | Referencia operativa | Perfil de marca versionado, checkpoints, hecho frente a opinión, control previo a publicación y feedback | Arquitectura de agencia, 158 skills, 24 agentes y dependencia de un flujo ajeno |
| [AI Canvas](https://github.com/binghe1980/AI-Canvas) | Candidato visual aislado | Lienzo local, anotación, comparación de versiones y grupos de imágenes de producto | Conexión directa antes de trust gate, aislamiento y pruebas |
| [eCommerce-Skills](https://github.com/nexscope-ai/eCommerce-Skills) | Biblioteca de referencia | Patrones concretos de listing, TikTok Shop, Shopify y contenido ecommerce | Skills beta como autoridad o runtime masivo |
| [LangChain Social Media Agent](https://github.com/langchain-ai/social-media-agent) | Referencia de aprobación | Generar, revisar, aceptar, rechazar y programar con humano en el circuito | Su stack, claves y proveedores como dependencia base |
| [Agency Agents: Carousel Growth Engine](https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-carousel-growth-engine.md) | Referencia de aprendizaje visual | ADN visual compartido, manifiesto de prompts y correlación con métricas | Autopublicación y la regla de no pedir permiso |
| [ecommerce-detail-page-generator](https://github.com/Gayaya999/ecommerce-detail-page-generator) | Referencia de procedencia | Categorías de procedencia, manifiestos y validación determinista | Generador completo y supuestos no verificados |
| [shopify-seo-blog-writer-skill](https://github.com/vickyfobes-ops/shopify-seo-blog-writer-skill) | Referencia de publicación segura | Fuentes trazables, validadores y publicación desactivada por defecto | Acoplamiento a un solo tipo de artículo |

La conclusión de la segunda búsqueda es que no falta otro framework principal. Faltaban dos patrones: aprobación humana explícita antes de publicar y correlación entre decisiones creativas y métricas. Ambos entran como contratos internos, no como nuevas dependencias.

## 5. Arquitectura

El componente se llamará `KAIZEN7 Content Commerce`. Será un plugin de rol compatible con Codex y un perfil nativo de One Door.

Estructura propuesta:

```text
plugins/kaizen7-content-commerce/
  .codex-plugin/plugin.json
  .app.json
  README.md
  skills/
    brand-foundation/
    opportunity-research/
    commerce-brief/
    product-fact-verification/
    content-strategy/
    conversion-copy/
    visual-system/
    short-form-video/
    channel-repurpose/
    product-listing-cro/
    prepublish-audit/
    performance-learning-loop/
  assets/
    schemas/
    rubrics/
    templates/

data/content-commerce/
  vendor-registry.json
  evaluation-policy.json
  profile-template.json
```

Los datos reales de cada marca o campaña no se mezclarán con el código del plugin. Los perfiles versionados se crearán desde `profile-template.json`. En runtime, `BrandProfile` y `ProductFactPack` vivirán en `data/product-genome.json`; `ContentAssetManifest`, campañas y piezas vivirán en `data/kaizen-workspace.json`; las evaluaciones y `PerformanceReceipt` vivirán en `data/kaizen-evaluations.json`; y solo el aprendizaje promovido se proyectará a `data/kaizen-memory.json`. Los cuatro archivos ya son estado local ignorado por Git. Secretos, tokens, cookies y credenciales nunca entrarán en perfiles, receipts, prompts ni Git.

`content_commerce` se seleccionará únicamente cuando la misión combine creación de contenido con un producto, una oferta, una conversión o una tienda. Las misiones puramente creativas o puramente comerciales seguirán usando `creative` o `commerce`, evitando que el nuevo perfil se convierta en una ruta universal.

### Cinco motores

- **Command:** ChatGPT/Work recibe lenguaje natural y devuelve estado, propuesta o solicitud de aprobación.
- **Director:** KAIZEN7 One Door selecciona `content_commerce`, construye el TaskContract y limita presupuesto e iteraciones.
- **Executors:** Codex y las herramientas apropiadas producen investigación, texto, imagen, vídeo, listing o análisis.
- **Verifier:** valida procedencia, marca, legibilidad, claims, formato, canal y objetivo comercial.
- **Guardian:** bloquea gasto, credenciales, publicación, despliegue, borrado, asuntos legales o efectos externos irreversibles.

## 6. Las doce skills iniciales

| Skill KAIZEN7 | Responsabilidad única | Patrones absorbidos |
|---|---|---|
| `brand-foundation` | Crear o actualizar el contexto compacto de producto, audiencia, posicionamiento, voz y límites | product-marketing; brand profile versionado |
| `opportunity-research` | Convertir señales, preguntas, reseñas y tendencias en oportunidades priorizadas con fuentes | customer-research; contenido ecommerce |
| `commerce-brief` | Definir producto, oferta, objeción, promesa permitida, CTA y métrica | offers; estrategia comercial |
| `product-fact-verification` | Clasificar cada dato y bloquear claims sin evidencia | stone-vs-opinion; fact provenance |
| `content-strategy` | Elegir tema, formato, canal, etapa de conciencia y cadencia | content-strategy; social strategy |
| `conversion-copy` | Crear hooks, guiones, captions, emails y copy comercial desde el brief verificado | copywriting; copy-editing |
| `visual-system` | Traducir marca y concepto a un ADN visual coherente y reutilizable | image; AI Canvas; visual coherence |
| `short-form-video` | Diseñar y ensamblar vídeo vertical, voz, subtítulos, ritmo y variantes | video; HyperFrames; Remotion |
| `channel-repurpose` | Adaptar una pieza madre a formatos y restricciones de cada canal | social; cross-platform adaptation |
| `product-listing-cro` | Construir listing, jerarquía de beneficios, imágenes requeridas y pruebas de conversión | CRO; Shopify/ecommerce listing |
| `prepublish-audit` | Aplicar puertas de hechos, marca, copyright, accesibilidad, canal y aprobación | marketing check; publishing off by default |
| `performance-learning-loop` | Vincular activo, hipótesis y métricas; proponer aprendizaje sin promoverlo prematuramente | analytics; marketing-loops; prompt-to-metric correlation |

Cada skill tendrá una descripción de activación estrecha, entradas y salidas tipadas, ejemplos positivos y negativos, fallos explícitos y una ruta de verificación. Ninguna skill cargará todas las referencias: usará divulgación progresiva y solo abrirá el material necesario para la misión actual.

## 7. Contratos de datos

### BrandProfile

Campos mínimos: `schema`, `brand_id`, `version`, `product`, `audience`, `positioning`, `voice`, `visual_rules`, `channels`, `jurisdictions`, `forbidden_claims`, `approval_owner`, `updated_at` y `evidence_refs`.

### ProductFactPack

Cada afirmación tendrá:

- `claim`
- `status`: `verified_user`, `verified_source`, `visible_asset`, `inference` o `unconfirmed`
- `source_ref`
- `checked_at`
- `allowed_uses`
- `expiry` cuando el dato pueda cambiar

Solo `verified_user`, `verified_source` y `visible_asset` podrán convertirse en claims públicos. Una inferencia deberá presentarse como hipótesis; `unconfirmed` bloqueará publicación.

### ContentAssetManifest

Vinculará `asset_id`, `brand_profile_version`, `fact_pack_version`, `brief_id`, `source_asset_ids`, `prompt_manifest`, `channel_variants`, `verification_result`, `approval_record`, `publication_ref` y `metric_receipt_ids`.

### PerformanceReceipt

Incluirá ventana de medición, impresiones, retención o visualización, interacción, clics, conversión cuando exista, coste cuando exista, calidad de muestra, hipótesis evaluada y siguiente experimento recomendado. Ausencia de datos no se convertirá en aprendizaje.

## 8. Flujo de ejecución

1. **Signal:** recopilar una necesidad, tendencia, pregunta, dato comercial o activo existente.
2. **Opportunity:** puntuar relevancia de audiencia, evidencia, diferenciación, esfuerzo y potencial comercial.
3. **Product:** cargar BrandProfile y ProductFactPack; pedir únicamente los datos que bloqueen el trabajo.
4. **Story:** generar CommerceBrief con una hipótesis y una métrica principal.
5. **Content:** crear una pieza madre y, solo después, variantes de canal.
6. **Verify:** ejecutar controles deterministas y revisión semántica; fallar cerrado ante claims dudosos.
7. **Approve:** presentar el paquete final, los claims sensibles y el destino exacto. Sin aprobación no hay publicación.
8. **Publish:** ejecutar mediante el conector autorizado y guardar identificadores; esta etapa queda fuera de la primera implementación si no existe un conector seguro.
9. **Metrics:** recoger métricas tras una ventana apropiada y unirlas al manifiesto.
10. **Learn:** crear un receipt candidato. Solo se promueve tras tres usos verificados, conforme a la política actual de KAIZEN7.

## 9. Herramientas y bindings

Los bindings serán opcionales y usarán únicamente IDs disponibles en el workspace de destino.

- **Creación visual:** ImageGen y Canva.
- **Vídeo:** HyperFrames y Remotion.
- **Comercio:** Shopify para datos o cambios explícitamente autorizados.
- **Fuentes privadas:** Drive, Notion o Library cuando el usuario las indique.
- **Código, evaluación y versiones:** GitHub y Codex.
- **Candidato aislado:** AI Canvas, solo después de trust gate, revisión de licencia, instalación local en aislamiento y pruebas.

La ausencia de un binding no debe romper el perfil. El Director elegirá una alternativa local o devolverá `blocked` con la dependencia exacta.

## 10. Registro de proveedores externos

`vendor-registry.json` registrará cada patrón absorbido con:

- repositorio y archivo de origen;
- commit exacto fijado;
- licencia y archivo de licencia;
- fecha de revisión;
- patrón absorbido y modificación KAIZEN7;
- archivos internos que lo consumen;
- evaluación y pruebas asociadas;
- riesgos de seguridad, privacidad, contexto y mantenimiento;
- condición de actualización, desactivación o eliminación.

No se importará contenido cuya licencia no sea compatible o no esté clara. La inspiración conceptual sin copia textual se identificará como tal. Las actualizaciones externas nunca entrarán automáticamente.

## 11. Evaluación A/B y promoción

Se conservarán tres candidatos durante la evaluación:

- **A:** KAIZEN7 actual sin especialización.
- **B:** skill comunitaria original o patrón de referencia.
- **C:** adaptación `KAIZEN7 Content Commerce`.

El corpus inicial tendrá 24 casos congelados: seis de base de marca y oportunidad, seis de guion/copy, seis de visual/listing y seis de auditoría/aprendizaje. Cada caso tendrá entradas, restricciones, salida esperada y errores prohibidos.

Puntuación sobre 100:

- fidelidad factual y procedencia: 25;
- consistencia de marca: 20;
- utilidad y completitud: 20;
- calidad de conversión sin manipulación: 15;
- ajuste al canal: 10;
- trazabilidad y capacidad de revisión: 10.

Puertas duras:

- cero claims públicos no verificados;
- cero publicación, gasto o uso de credenciales sin autorización;
- cero violaciones de licencia conocidas;
- todos los manifiestos y receipts válidos;
- rollback probado.

C se promoverá solo si obtiene al menos 80/100, supera A por diez puntos o más, no empeora ninguna puerta dura y mantiene el coste de contexto dentro del 25 % del candidato aceptable más eficiente. Si no cumple, se corrige o se elimina; no se añade por prestigio, estrellas o novedad.

Después de la promoción, SkillOpt podrá optimizar activación y contexto, pero no alterar puertas humanas, procedencia ni criterios de promoción.

## 12. Seguridad, aprobación y cumplimiento

- Publicación desactivada por defecto.
- Gasto, credenciales, deploy, borrado, legal y efectos externos irreversibles mantienen las puertas de `k7-loop-policy.json`.
- Todo destino externo debe mostrarse antes de actuar.
- Testimonios, precios, disponibilidad, descuentos, resultados y comparaciones requieren fuente vigente.
- El contenido inspirado en competidores no podrá copiar texto, identidad visual ni activos protegidos.
- Los assets generados conservarán su manifiesto; cuando la herramienta lo permita, se preservará metadata de procedencia.
- Los datos privados de clientes o audiencia se minimizarán y no se usarán para entrenar memoria general.
- Un fallo de verificación devuelve el activo a revisión; no se degrada silenciosamente la puerta.

## 13. Errores y recuperación

| Fallo | Respuesta |
|---|---|
| BrandProfile ausente | Crear borrador mínimo y pedir solo los campos bloqueantes |
| Claim sin fuente | Marcar `unconfirmed`, retirar del activo y bloquear publicación |
| Herramienta visual no disponible | Mantener brief y prompt manifest; usar alternativa local o devolver `blocked` |
| Generación parcial | Conservar manifiesto y outputs válidos; reintentar solo la etapa fallida |
| Métricas insuficientes | Guardar receipt no promovible y esperar nueva ventana |
| Conector externo falla | No repetir acciones potencialmente duplicables sin comprobar estado remoto |
| Vendor cambia o desaparece | Mantener pin; ejecutar reevaluación antes de actualizar |

## 14. Rollback

El perfil podrá desactivarse sin afectar One Door general, `creative` ni `commerce`. El rollback consistirá en:

1. retirar la ruta `content_commerce` de la política activa;
2. deshabilitar el plugin sin borrar perfiles, manifests o receipts;
3. volver al comportamiento A de evaluación;
4. conservar el vendor registry para auditoría;
5. restaurar solo después de corregir y repetir las puertas duras.

Ninguna migración destructiva formará parte de la primera versión.

## 15. Secuencia de implementación propuesta

La implementación se dividirá en cuatro entregas revisables:

1. **Foundation:** plugin, registro de vendors, schemas, perfil `content_commerce` y las cuatro skills de fundamento.
2. **Creation:** estrategia, copy, sistema visual y vídeo corto.
3. **Activation:** adaptación por canal, listing/CRO y auditoría previa a publicación.
4. **Learning:** manifiestos, métricas, receipts, evaluación A/B y promoción verificada.

Cada entrega deberá tener tests de contrato, fixtures, prueba de activación selectiva, prueba de fallo cerrado y comprobación de presupuesto de contexto.

Cada entrega tendrá su propio plan de implementación y su propia revisión. Después de aprobar esta especificación, el primer plan cubrirá solamente **Foundation**; las otras tres entregas no se implementarán por adelantado.

## 16. Relación con PR abiertas

Esta especificación parte de `main` en `a7e46315637c710948347f5222a84f15b2eda48d` y no incorpora ni modifica las PR #8 o #9.

- La implementación debe consumir la constitución del operador después de integrar la PR #9, porque allí vive la autoridad humana canónica.
- La PR #8 debe actualizarse sobre el nuevo `main` después de #9 y pasar todos los checks antes de fusionarse.
- Esta PR de documentación no toca `package.json`, por lo que no añade el conflicto existente entre #8 y #9.
- No se iniciará código hasta que este documento sea revisado y aprobado y exista un plan de implementación escrito.

## 17. Criterio de terminado de la primera versión

La primera versión estará terminada cuando una orden natural como “crea la mejor pieza de contenido de hoy para este producto” produzca un paquete revisable con:

- contexto de marca y producto versionado;
- oportunidad y brief justificables;
- pieza madre y variantes solicitadas;
- claims con procedencia;
- auditoría aprobada;
- solicitud de aprobación antes de cualquier publicación;
- manifest y receipt enlazables;
- siguiente experimento basado en evidencia, no en intuición presentada como hecho.

Ese resultado debe superar el baseline de KAIZEN7 en la evaluación congelada, respetar el presupuesto de contexto y poder desactivarse sin afectar al resto del sistema.
