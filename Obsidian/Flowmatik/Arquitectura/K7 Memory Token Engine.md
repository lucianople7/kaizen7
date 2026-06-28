# K7 Memory Token Engine

## Actualizacion 2026-06-25

### Decision

Se crea una metaskill operativa para que KAIZEN7 use memoria y contexto con criterio: arrancar desde Obsidian, consultar mapas o indices antes de leer archivos, evitar dumps largos y registrar cada movimiento relevante al cerrar.

Esta metaskill vive primero en Obsidian como regla canonica. Las carpetas `.codex/skills/` y `.agents/skills/` estan bloqueadas para escritura en esta sesion, asi que la version `SKILL.md` queda pendiente de sincronizar.

### Contexto

Lucia pidio mejorar o crear primero la metaskill de memoria y uso sabio de tokens antes de seguir con la web.

La entrada externa revisada fue Graphify: una herramienta que convierte proyectos en grafos consultables. KAIZEN7 absorbe el patron de "mapa antes de lectura", pero no instala Graphify por defecto.

### Mision

Mantener KAIZEN7 orientado sin quemar contexto.

La regla no es leerlo todo: es encontrar el minimo contexto suficiente, decidir, actuar y dejar memoria trazable.

### Fuentes de verdad

1. Obsidian: memoria humana, decisiones, arquitectura, SOPs y contexto editable.
2. Product Genome: memoria estructurada de negocio.
3. Codigo local: estado operativo real.
4. Indices, grafos o reportes: mapas auxiliares para no releer carpetas completas.

### Escalera de contexto

Subir de nivel solo cuando el nivel anterior no basta:

1. Intencion del usuario.
2. Obsidian canonico.
3. Semaforo y decisiones vigentes.
4. `K7 Super IQ Engine` si la tarea requiere criterio estrategico.
5. `Obsidian/TheFocux/CodexBrain/README.md` si la tarea afecta THE FOCUX.
6. Indices, rutas, tests, README o busquedas con `rg`.
7. Lectura focalizada de archivos concretos.
8. Sintesis operacional.
9. Memoria de cierre.

### Reglas de uso sabio de tokens

- Antes de abrir muchos archivos, buscar nombres, simbolos, rutas o indices.
- Preferir `rg`, tests y manifiestos a dumps largos.
- Evitar listar caches, dependencias, builds, logs enormes o assets binarios.
- Leer secciones concretas cuando baste.
- Separar hechos leidos, inferencias y pendientes.
- No ahorrar tokens si eso elimina evidencia critica.
- No guardar secretos, tokens, datos personales ni credenciales en memoria.

### Presupuesto operativo

#### Verde

Tarea pequena:

- 1-3 notas Obsidian.
- 1-5 archivos.
- Una verificacion.

#### Amarillo

Tarea media:

- Notas canonicas + dominio afectado.
- Busqueda amplia con `rg`.
- Lectura focalizada de 5-12 archivos.
- Tests o preview si aplica.

#### Rojo

Tarea grande o confusa:

- Parar antes de leer mas.
- Crear o consultar un mapa.
- Decomponer el trabajo.
- Pedir decision humana si hay direcciones incompatibles.
- Registrar brief en Obsidian si el alcance crece.

### Patron Graphify absorbido

Graphify es referencia, no dependencia obligatoria.

Patrones adoptados:

- Crear un mapa consultable del proyecto cuando el repo o vault crezca.
- Consultar el mapa antes de grepear o abrir muchos archivos.
- Mantener confianza en relaciones: `EXTRACTED`, `INFERRED`, `AMBIGUOUS`.
- Generar preguntas sugeridas para orientar exploracion.
- Guardar resultados utiles y reflexiones para no repetir busquedas.

No instalar Graphify por defecto. Activarlo solo si:

- se repiten exploraciones grandes,
- hay dudas recurrentes de arquitectura,
- el coste de contexto empieza a doler,
- o KAIZEN7 necesita contestar preguntas de proyecto sin releer el workspace.

Si se prueba:

```text
graphify . --no-viz
graphify query "pregunta concreta"
```

Antes de extraer, crear `.graphifyignore` para excluir secretos, `.env`, caches, datos personales, builds y salidas sensibles.

### Decision gate

Antes de actuar, KAIZEN7 debe responder internamente:

```text
Que se necesita saber?
Donde vive la verdad?
Puedo resolverlo con memoria o indice?
Que archivo cambiaria mi decision?
Que puedo NO leer?
Que debo registrar al cerrar?
```

### Cierre obligatorio

Cuando esta metaskill guie una tarea, cerrar con:

```text
Memoria consultada:
Contexto usado:
Lecturas evitadas:
Decision:
Movimiento Obsidian:
Siguiente accion:
```

### Fallos a evitar

- Leer archivos por ansiedad en vez de por necesidad.
- Usar un grafo viejo como verdad absoluta.
- Guardar resumenes vagos que no sirven para la proxima sesion.
- Mezclar decisiones confirmadas con hipotesis.
- Meter herramientas nuevas antes de demostrar dolor real.
- Ahorrar tokens sacrificando evidencia critica.
