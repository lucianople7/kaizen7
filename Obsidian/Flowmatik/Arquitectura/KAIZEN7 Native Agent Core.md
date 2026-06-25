# KAIZEN7 Native Agent Core

## Principio

No copiar frameworks completos ni descartarlos. Extraer sus mejores patrones, integrarlos bajo una arquitectura coherente y conservar adaptadores opcionales.

## Flujo

```text
Objetivo
  -> K7 Scope crea ejecucion y permisos
  -> K7 Memory recupera contexto
  -> K7 Operator construye y ejecuta el plan
  -> OpenAI razona y usa herramientas
  -> K7 Judge evalua el resultado
  -> K7 Memory guarda el aprendizaje
  -> Product Genome acumula ventaja
```

## Politica de permisos

- Lectura, analisis y borradores: automaticos.
- Escritura interna: automatica y trazada.
- Publicacion externa: aprobacion humana.
- Gasto: aprobacion humana.
- Eliminacion de datos: aprobacion humana.

## Persistencia MVP

- `data/kaizen-runtime.json`
- `data/kaizen-memory.json`
- `data/kaizen-evaluations.json`
- `data/product-genome.json`

Estos almacenes se migraran a Postgres sin cambiar los contratos de la WebUI.

## Adaptadores futuros

- AgentScope adapter.
- ReMe adapter.
- OpenJudge adapter.
- Hermes adapter.

Los adaptadores amplian KAIZEN7. No sustituyen el CORE ni fuerzan una dependencia.

## Estado operativo

Implementado el primer circuito real del CORE:

```text
solicitud externa
  -> registro de ejecucion
  -> K7 Scope clasifica riesgo y permiso
  -> estado waiting_approval
  -> aprobacion o rechazo humano
  -> ejecutor autorizado
  -> completed, failed o cancelled
  -> traza persistente
```

Estados permitidos: `planned`, `running`, `waiting_approval`, `evaluating`, `completed`, `failed` y `cancelled`.

Shopify, Meta, Instagram, LinkedIn y X ya pasan por la cola de aprobaciones antes de cualquier escritura externa. Cada solicitud conserva herramienta, parametros, riesgo, motivo, decision, resultado y trazas. El servidor nunca confia solo en la interfaz: el bloqueo se aplica en la API.

## Contrato de herramientas

Cada herramienta externa declara:

- Nombre estable.
- Accion visible para la persona.
- Nivel de riesgo.
- Permiso requerido.
- Entrada exacta que se ejecutara.
- Ejecutor del lado servidor.

Las nuevas integraciones deben registrarse en este catalogo. Ningun conector de escritura debe exponer una ruta que evite K7 Scope.

## Entregables operativos

K7 Operator ya puede convertir un objetivo en uno de estos resultados:

- Analisis y plan sin efectos externos.
- Borrador de producto para Shopify.
- Publicacion para Meta.
- Publicacion para LinkedIn.
- Publicacion para X.

El flujo recupera memoria, genera el entregable con OpenAI, lo evalua con el perfil correcto de K7 Judge y solo entonces crea la aprobacion. Los perfiles `default`, `social` y `commerce` aplican criterios diferentes. Un resultado `block` nunca llega al conector.

Para operar contra servicios reales hacen falta las credenciales definidas en `.env.example`. La ausencia de credenciales se muestra como servicio no configurado y nunca se sustituye por una simulacion silenciosa.
