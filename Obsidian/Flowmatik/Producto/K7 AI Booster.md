# K7 AI Booster

Fecha: 2026-06-27

## Definicion

K7 AI Booster es la capa de KAIZEN7 que convierte cualquier agente IA en un operador con memoria, criterio y direccion.

No sustituye a Codex, Claude, Qwen, Gemini, Hermes o cualquier otro agente. Los potencia.

```text
KAIZEN7 = cerebro operativo
Codex y otros agentes = manos, ojos y motores de ejecucion
K7 AI Booster = capa que conecta criterio, memoria, permisos y accion
```

## Vision

K7 AI Booster debe ser el copiloto que toda IA desea tener antes de tocar un proyecto.

No es solo un prompt mejor. Es una activacion operativa para cualquier proyecto:

```text
Proyecto sin KAIZEN7:
contexto disperso, decisiones perdidas, agentes empezando desde cero.

Proyecto con KAIZEN7:
memoria, modulos, criterio, verificacion, aprendizaje y evolucion continua.
```

La meta es que cualquier proyecto pueda entrar en KAIZEN7 y recibir una estructura que funciona, crece y se adapta.

## Sensacion objetivo

Como se sentiria Codex con K7 AI Booster:

```text
Antes:
Entro a un proyecto, leo mucho, infiero contexto, intento no romper nada, gasto tokens y avanzo con cuidado.

Con KAIZEN7 Booster:
Arranco con memoria viva, objetivo claro, mapa del repo, decisiones previas, riesgos, herramientas permitidas, siguiente accion y criterio de verificacion.
```

El agente no empieza desde cero. Entra con un briefing inteligente.

## Promesa

```text
Menos exploracion.
Menos contexto repetido.
Menos tokens.
Menos errores por memoria perdida.
Mas criterio.
Mas continuidad.
Mas avance verificable.
```

## Producto en una frase

K7 AI Booster da a cualquier agente IA el contexto minimo, la memoria correcta, las herramientas adecuadas y el criterio de cierre antes de actuar.

## Frase ampliada

K7 AI Booster activa cualquier proyecto con un sistema modular y evolutivo para que humanos y agentes IA avancen con menos friccion, menos tokens y mas criterio.

## Usuarios

### Usuario humano

Quiere que los agentes trabajen mejor, recuerden mas, pregunten menos y no rompan decisiones previas.

### Agente IA

Necesita saber:

- que objetivo manda,
- que memoria leer,
- que decisiones respetar,
- que herramientas puede usar,
- que riesgos evitar,
- que accion hacer primero,
- como verificar,
- que aprendizaje guardar.

### Proyecto

Necesita continuidad. Cada sesion debe mejorar la siguiente.

## Project Activation Protocol

Cuando KAIZEN7 recibe un proyecto, no solo lo abre. Lo estructura operativamente.

Esa activacion significa:

1. **Ancla**: define que es el proyecto, que no es y cual es su objetivo vivo.
2. **Memoria**: crea o localiza la memoria canonica.
3. **Mapa**: identifica repo, web, docs, assets, datos y limites.
4. **Modulos**: conecta solo las capacidades necesarias.
5. **Criterio**: declara decisiones, riesgos y reglas de actuacion.
6. **Accion**: propone el siguiente movimiento minimo.
7. **Verificacion**: exige prueba antes de cerrar.
8. **Evolucion**: guarda el aprendizaje para que la proxima vuelta sea mas inteligente.

Formato mental:

```text
Anchor -> Memory -> Map -> Modules -> Judgment -> Action -> Verification -> Evolution
```

Este protocolo permite que KAIZEN7 sirva para cualquier proyecto sin volverse rigido.

## Modular por diseno

KAIZEN7 no debe cargar todo siempre.

Cada proyecto activa solo los modulos que necesita:

- memoria,
- repo,
- web,
- ecommerce,
- video,
- imagen,
- investigacion,
- redes,
- pagos,
- compliance,
- soporte,
- analytics,
- agentes externos.

Regla:

```text
El modulo entra si reduce pasos, reduce riesgo o aumenta claridad.
```

## Evolutivo por naturaleza

Cada ciclo debe dejar el sistema mejor:

- menos preguntas repetidas,
- menos lectura redundante,
- mejores decisiones,
- mejor mapa del proyecto,
- mejores checks,
- mejores prompts,
- mejores modulos,
- mas autonomia supervisada.

KAIZEN7 no solo ejecuta. Aprende la forma del proyecto.

## Flujo operativo

```text
Agente entra
-> KAIZEN7 lee objetivo
-> recupera memoria minima
-> detecta decisiones y riesgos
-> selecciona skills/herramientas
-> genera brief de accion
-> agente ejecuta
-> KAIZEN7 exige verificacion
-> guarda aprendizaje
```

## Componentes

### 1. Agent Context Pack

Paquete minimo que un agente necesita para trabajar:

- objetivo actual,
- proyecto activo,
- archivos canonicos,
- decisiones recientes,
- riesgos,
- restricciones,
- comandos utiles,
- criterio de verificacion.

### 2. Decision Guard

Lista compacta de decisiones que el agente no debe contradecir.

Ejemplo:

```text
KAIZEN7 = agente
THE FOCUX = proyecto
```

### 3. Token Governor

Reduce lectura innecesaria.

Regla:

```text
Leer lo necesario, no todo lo disponible.
```

### 4. Tool Router

Recomienda herramientas segun objetivo y permisos:

- shell,
- Obsidian,
- GitHub,
- Cloudflare,
- navegador,
- video,
- imagen,
- documentos,
- testing.

### 5. Risk Lens

Antes de actuar, detecta:

- riesgo de mezclar repos,
- riesgo de tocar memoria equivocada,
- riesgo legal/compliance,
- riesgo de claims,
- riesgo de romper tests,
- riesgo de gastar tokens sin retorno.

### 6. Verification Gate

No permite cerrar solo con una sensacion.

Cada accion debe tener al menos una verificacion:

- test,
- lectura de archivo,
- captura visual,
- diff,
- endpoint,
- checklist,
- validacion humana.

### 7. Learning Writeback

Cada mejora importante vuelve a Obsidian:

- decision,
- razon,
- resultado,
- siguiente accion,
- aprendizaje reutilizable.

## Interfaces

### CLI

```powershell
npm.cmd run k7:advise -- --agent codex --budget 1200 "objetivo"
```

### API

```http
POST /api/k7/advise
```

### WebUI futura

Panel visual con:

- agente activo,
- objetivo,
- contexto cargado,
- tokens estimados,
- memoria usada,
- riesgos,
- tools sugeridas,
- primera accion,
- verificacion pendiente,
- aprendizaje guardado.

## Formato ideal de respuesta para agentes

```json
{
  "agent": "codex",
  "objective": "crear producto KAIZEN7",
  "context_pack": {
    "read_first": [],
    "decisions": [],
    "risks": [],
    "constraints": []
  },
  "recommended_tools": [],
  "first_action": "",
  "verification": "",
  "writeback": ""
}
```

## Relacion con KAIZEN7 Product

KAIZEN7 Product define el sistema completo.

K7 AI Booster es una capa concreta del sistema:

```text
KAIZEN7 Product
  -> K7 AI Booster
      -> Agent Advisor
      -> Agent Runner
      -> Obsidian Memory
      -> Semantic Memory
      -> Skill Router
      -> Verification Gate
```

## Frase comercial

```text
K7 AI Booster hace que tus agentes IA no empiecen desde cero.
```

```text
El copiloto que toda IA desea tener antes de actuar.
```

```text
Activa cualquier proyecto con memoria, modulos y evolucion.
```

## Frase para builders

```text
Give every agent memory, judgment and a next best action before it spends tokens.
```

## MVP

El MVP debe demostrar:

1. Codex recibe un brief mejor que leer todo el repo.
2. El brief reduce pasos y contexto.
3. El agente sabe que no debe tocar.
4. La accion termina con verificacion.
5. El aprendizaje vuelve a Obsidian.

## Siguientes movimientos

1. Documentar `docs/AI_BOOSTER.md`.
2. Enlazar desde README.
3. Crear ejemplo de payload para `/api/k7/advise`.
4. Mostrarlo en WebUI como panel "AI Booster".
5. Medir ahorro estimado de contexto/tokens por sesion.
