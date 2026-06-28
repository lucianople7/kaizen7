# KAIZEN7 Production Ready Plan

Fecha: 2026-06-27

## Objetivo

Convertir KAIZEN7 en un producto real, fiable y repetible:

```text
Un copiloto operativo modular y evolutivo que activa cualquier proyecto con memoria, criterio, herramientas, accion y verificacion.
```

Production ready no significa "tener muchas funciones".

Significa:

- se instala de forma repetible,
- arranca sin contexto perdido,
- sabe que proyecto toca,
- protege memoria y datos,
- expone una interfaz estable,
- verifica antes de cerrar,
- registra aprendizaje,
- se puede actualizar sin romper el sistema.

## Definicion de listo

KAIZEN7 estara production ready cuando cumpla estas condiciones:

1. **Repo limpio**: codigo, docs y datos separados; sin duplicar THE FOCUX dentro del core.
2. **Arranque reproducible**: una persona o agente puede clonar, instalar y ejecutar KAIZEN7 siguiendo README.
3. **Checks automáticos**: `npm run check` y `npm run k7:ready` pasan.
4. **Memoria canonica**: Obsidian arranca siempre como fuente de verdad.
5. **Config segura**: secretos fuera del repo; `.env.example` claro.
6. **API estable**: `/api/k7/run` y `/api/k7/advise` documentados con ejemplos.
7. **Project Activation Protocol**: cualquier proyecto recibe ancla, memoria, mapa, modulos, criterio, accion, verificacion y evolucion.
8. **Permisos claros**: nada publica, borra, compra, despliega o toca credenciales sin aprobacion.
9. **Observabilidad minima**: logs, trazas de decision y estado de readiness.
10. **Release controlado**: version, changelog, tags y rollback.

## Dos rutas de produccion

### Ruta A: Local Production Ready

Primera meta.

KAIZEN7 funciona como copiloto privado local:

- corre en Windows local,
- usa Obsidian como memoria,
- expone CLI y API local,
- gestiona proyectos separados,
- aconseja a Codex y otros agentes,
- escribe aprendizaje,
- pasa checks.

Esta ruta es la mas importante ahora porque permite usar KAIZEN7 de verdad sin esperar infraestructura externa.

### Ruta B: Hosted Production Ready

Segunda meta.

KAIZEN7 se convierte en servicio:

- WebUI accesible,
- auth,
- permisos por usuario/proyecto,
- almacenamiento persistente,
- backups,
- rate limits,
- logs,
- despliegue,
- MCP remoto,
- integraciones externas.

Esta ruta llega despues de tener el core local estable.

## Roadmap por fases

### Fase 0: Canon y separacion

Estado: en progreso avanzado.

Objetivo:

- KAIZEN7 y THE FOCUX separados.
- KAIZEN7 = agente/sistema.
- THE FOCUX = proyecto/caso real.
- Obsidian = memoria canonica.

Pendiente:

- limpiar restos de `site/thefocux` si no debe viajar con KAIZEN7,
- publicar KAIZEN7 limpio en su repo,
- publicar THE FOCUX en repo separado.

### Fase 1: Local ready

Objetivo:

- instalar,
- arrancar,
- ejecutar checks,
- usar `k7:run`,
- usar `k7:advise`,
- usar `k7:ready`,
- documentar salida esperada.

Entregables:

- `README.md` claro,
- `docs/OPERATIONS.md`,
- `docs/PRODUCTION_READY.md`,
- `.env.example`,
- scripts estables,
- prueba de arranque local.

### Fase 2: API contract

Objetivo:

Convertir KAIZEN7 en una interfaz estable para agentes.

Entregables:

- contratos JSON de `/api/k7/run`,
- contratos JSON de `/api/k7/advise`,
- ejemplos de request/response,
- errores tipados,
- versionado de API,
- tests de contrato.

### Fase 3: Project Activation Protocol

Objetivo:

Que cualquier proyecto pueda entrar y recibir estructura.

Entregables:

- plantilla `Project Genome`,
- plantilla de memoria Obsidian,
- detector de repo/web/docs,
- mapa de modulos activables,
- checklist de verificacion,
- writeback automatico o semi-automatico.

### Fase 4: Seguridad y permisos

Objetivo:

KAIZEN7 debe ser poderoso pero no peligroso.

Entregables:

- matriz de permisos,
- acciones bloqueadas por defecto,
- aprobacion explicita para publicar, borrar, gastar o desplegar,
- gestion de secretos,
- auditoria de logs,
- redaccion de datos sensibles.

### Fase 5: WebUI cockpit

Objetivo:

Hacer visible el cerebro operativo.

Pantallas:

- proyectos,
- objetivo activo,
- siguiente accion,
- memoria usada,
- modulos activos,
- riesgos,
- verificacion,
- aprendizaje guardado,
- readiness.

### Fase 6: MCP y conectores

Objetivo:

Permitir que otros agentes y apps pidan criterio a KAIZEN7.

Entregables:

- MCP local,
- MCP remoto futuro,
- conector para Codex,
- conector para agentes externos,
- scope de permisos por tool.

### Fase 7: Hosted release

Objetivo:

Llevar KAIZEN7 a produccion como servicio.

Entregables:

- hosting,
- auth,
- persistencia,
- backups,
- observabilidad,
- rate limits,
- CI/CD,
- versionado,
- rollback.

## Orden correcto ahora

1. Usar los comandos cortos: `k7`, `k7:boost`, `k7:ready`, `k7:check`.
2. Resolver repo Git local o publicar con conector GitHub.
3. Limpiar frontera KAIZEN7/THE FOCUX.
4. Crear `.env.example`.
5. Documentar contratos de API.
6. Crear tests de contrato para `run` y `advise`.
7. Exponer readiness en WebUI.
8. Crear pantalla `AI Booster`.
9. Crear plantilla `Project Activation`.
10. Preparar primer release `v0.1.0-local`.

## Lo que no hacemos todavia

- No vender multiusuario antes de estabilizar local.
- No meter pagos antes de auth y permisos.
- No conectar secretos sensibles sin vault claro.
- No convertir KAIZEN7 en THE FOCUX.
- No automatizar publicaciones sin aprobacion.
- No crear diez agentes si un core modular resuelve el flujo.

## Indicadores de production ready

KAIZEN7 esta listo para uso local serio cuando:

- `npm run check` pasa,
- `npm run k7:ready` pasa,
- README permite arrancar desde cero,
- Obsidian tiene manual e indice vivos,
- un objetivo produce accion verificable,
- un agente externo recibe un `advise` util,
- cada sesion importante deja memoria,
- el repo esta publicado y recuperable.

KAIZEN7 esta listo para hosted beta cuando ademas:

- hay auth,
- hay persistencia fuera del filesystem local,
- hay backups,
- hay logs,
- hay limites de uso,
- hay aislamiento entre proyectos,
- hay release/rollback,
- hay politica de datos.

## Decision

La ruta correcta es:

```text
Local Production Ready -> Agent/API Ready -> WebUI Cockpit -> MCP -> Hosted Beta
```

No hay que saltar directo a SaaS. Primero debe ser una herramienta privada excelente.
