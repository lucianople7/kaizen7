# KAIZEN7 30 Second Activation

Fecha: 2026-06-28

## Decision

KAIZEN7 evoluciona su primera experiencia para resolver su mayor debilidad:

```text
demasiada abstraccion antes de demostrar valor
```

Nueva regla de producto:

```text
No vender el OS primero.
Demostrar la siguiente accion primero.
```

## Promesa

```text
Objetivo dentro -> antes/despues -> contexto minimo -> siguiente accion -> verificacion -> memoria
```

## Que se construye

- Comando `k7:activate`.
- API `POST /api/k7/activate`.
- Boton `Activate 30s` en AI Cockpit.
- Salida con:
  - friccion antes,
  - friccion despues,
  - context pack,
  - next best action,
  - guardrails,
  - verification gate,
  - comandos de prueba.

## Criterio

KAIZEN7 debe sentirse util antes de explicarse completo.

La primera demo ideal:

```text
Pego un objetivo confuso.
KAIZEN7 reduce ruido.
Me da una accion exacta.
Me dice como verificar.
Me recuerda que debo guardar aprendizaje.
```

## Archivos

- `lib/activation-demo.js`
- `tests/activation-demo.test.js`
- `docs/30_SECOND_ACTIVATION.md`
- `server.js`
- `index.html`
- `app.js`
- `package.json`

## Siguiente accion

Medir la activacion real con usuarios:

- entienden KAIZEN7 en menos de 30 segundos,
- ejecutan una accion,
- no preguntan "que hago ahora",
- perciben menos pasos y menos ruido.

## Actualizacion 2026-06-28

### Decision

La activacion evoluciona a **Launch Card**.

Ya no basta con dar una accion. KAIZEN7 debe entregar una tarjeta ejecutable:

- que hago ahora,
- cuando esta hecho,
- que modelo conviene usar,
- cuanto contexto puedo gastar antes de actuar,
- que memoria queda preparada.

### Estructura

```text
Launch Card =
objetivo compacto
+ 3 pasos
+ done definition
+ model route
+ max context before action
+ copy-paste brief
+ memory draft
```

### Criterio

Una IA o un humano deberia poder copiar la Launch Card y ejecutar sin volver a preguntar "por donde empiezo".

## Actualizacion 2026-06-28 - Activation Pack

### Decision

KAIZEN7 evoluciona la Launch Card a **Activation Pack**.

La salida debe servir para:

- ejecutar ahora,
- delegar a otra IA,
- verificar,
- parar si aparece riesgo,
- escribir memoria.

### Estructura

```text
Activation Pack =
intent
+ confidence
+ readiness
+ executeNow
+ delegatePrompt
+ 7-minute timeline
+ stopRules
+ evidenceRequired
+ memoryWriteback
```

### Regla

```text
Si otra IA no puede actuar con el pack sin pedir mas contexto, el pack no esta terminado.
```

### Criterio de readiness

- `execute`: actuar.
- `execute-with-care`: actuar manteniendo guardrails.
- `clarify-first`: pedir una aclaracion antes de abrir contexto.

## Actualizacion 2026-06-28 - AI Handoff

### Decision

KAIZEN7 anade una capa IA hacia IA:

```text
AI Handoff = contrato parseable para que otra IA ejecute sin conversacion extra
```

### Estructura

```text
k7-ai-handoff@1.0 =
objective
+ constraints
+ inputPacket
+ executionContract
+ responseContract
+ failureContract
+ compactPrompt
```

### Regla

```text
IA hacia IA no debe depender de prosa.
Debe depender de un contrato versionado, campos requeridos y JSON de retorno.
```

### Salida esperada

La IA receptora debe devolver solo JSON con:

- `result`
- `proof`
- `risk`
- `reusableLearning`
- `memoryWriteback`
- `status`

Estados permitidos:

- `done`
- `blocked`
- `needs_approval`

## Actualizacion 2026-06-28 - Return Judge

### Decision

KAIZEN7 conecta el ciclo completo:

```text
AI Handoff -> AI Response -> K7 Judge -> done | retry | blocked | needs_approval -> memory
```

### Que valida

- JSON valido.
- Campos requeridos.
- `status` permitido.
- `risk` permitido.
- Prueba suficiente para aceptar `done`.
- Riesgo alto antes de memoria.

### API

```http
POST /api/k7/handoff/validate
```

### Regla

```text
Ningun resultado de otra IA entra en memoria sin pasar por K7 Judge.
```

## Actualizacion 2026-06-28 - Run K7 Loop

### Decision

KAIZEN7 empaqueta lo valioso en una sola rutina:

```text
Run K7 Loop
```

Flujo:

```text
Intent -> Handoff -> Return -> Judge -> Memory -> Next Action
```

### Que baja

- Menos botones como experiencia principal.
- Menos explicacion de OS.
- Menos JSON visible para humanos.

### Que sube

- Semaforo.
- Siguiente accion.
- Prueba.
- Memoria lista.
- Contrato IA expandible.

### Regla

```text
El humano ve semaforo y accion.
La IA ve contrato y schema.
```
