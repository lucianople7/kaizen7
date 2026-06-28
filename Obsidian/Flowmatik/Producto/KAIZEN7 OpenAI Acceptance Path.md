# KAIZEN7 OpenAI Acceptance Path

Fecha: 2026-06-27

## Objetivo

Buscar la forma realista de que OpenAI acepte KAIZEN7 como producto compatible con su ecosistema.

Conclusion:

```text
KAIZEN7 debe presentarse como una ChatGPT App / MCP connector para activar proyectos con memoria, criterio, acciones verificables y menos contexto.
```

No debe presentarse como:

- una IA que sustituye a OpenAI,
- un "superagente" sin limites,
- una herramienta que pide todo el historial "por si acaso",
- un sistema que ejecuta acciones destructivas sin confirmacion,
- una app demo incompleta.

## Ruta real

OpenAI documenta una ruta de Apps SDK:

```text
Plan -> Build MCP server -> Build UI -> Deploy HTTPS -> Test in developer mode -> Submit app
```

KAIZEN7 debe seguir esta ruta.

## Posicionamiento aceptable

Nombre:

```text
KAIZEN7 Project Activation
```

Descripcion:

```text
Turn a project goal into a compact action brief with relevant memory, risks, next action, and verification.
```

Promesa:

```text
Less context. Fewer steps. Better verified action.
```

No usar:

- "official",
- "best",
- "OpenAI endorsed",
- "guaranteed",
- "autonomous everything",
- claims medicos, legales o financieros.

## Herramientas MCP recomendadas

Las herramientas deben ser pequenas, especificas y faciles de revisar.

### Read-only

```text
get_project_brief
```

Devuelve:

- objetivo,
- memoria minima,
- decisiones relevantes,
- riesgos,
- siguiente accion sugerida,
- verificacion recomendada.

Anotacion:

```text
readOnlyHint: true
openWorldHint: false
destructiveHint: false
```

### Read-only

```text
get_activation_checklist
```

Devuelve el protocolo:

```text
Anchor -> Memory -> Action -> Verify -> Learn
```

Anotacion:

```text
readOnlyHint: true
openWorldHint: false
destructiveHint: false
```

### Write, requiere confirmacion

```text
save_project_learning
```

Guarda una decision o aprendizaje en la memoria del proyecto.

Anotacion:

```text
readOnlyHint: false
openWorldHint: false
destructiveHint: false
```

Requiere:

- confirmacion del usuario,
- texto corto,
- proyecto destino,
- no guardar secretos.

### Write/public, fase posterior

```text
create_project_task
```

Solo despues de auth y permisos.

Anotacion:

```text
readOnlyHint: false
openWorldHint: true
destructiveHint: false
```

## Datos que NO debe pedir

Para maximizar aceptacion:

- no pedir historial completo de conversaciones,
- no pedir API keys,
- no pedir contrasenas,
- no pedir ubicacion precisa,
- no pedir datos medicos, legales o financieros sensibles,
- no pedir documentos completos si basta un resumen,
- no devolver IDs internos, trazas, sesiones o logs salvo que sean necesarios.

## Privacidad

Debe existir una privacy policy publica que explique:

- categorias de datos recogidos,
- para que se usan,
- con quien se comparten,
- cuanto tiempo se retienen,
- como borrar datos,
- que KAIZEN7 no debe guardar secretos ni credenciales.

## Seguridad

Reglas obligatorias:

- least privilege,
- consentimiento explicito,
- validacion server-side,
- audit logs sin PII cruda,
- redaccion de datos sensibles,
- confirmacion humana para acciones irreversibles,
- herramientas write separadas de herramientas read.

## Infraestructura necesaria

Antes de submission:

- MCP server en dominio publico HTTPS,
- endpoint real `/mcp`,
- no usar localhost,
- no usar URL placeholder,
- CSP definida con dominios exactos,
- baja latencia,
- TLS estable,
- logs y metricas,
- screenshots reales,
- prompts de prueba,
- respuestas de prueba,
- privacy policy publicada,
- organizacion o identidad verificada en OpenAI Platform.

## Testing requerido

Antes de enviar:

- unit tests de tool handlers,
- validacion de schemas,
- errores y edge cases,
- auth flows si existen,
- MCP Inspector,
- ChatGPT Developer Mode,
- golden prompt set:
  - prompt directo,
  - prompt indirecto,
  - prompt negativo,
  - prompt de inyeccion,
  - prompt que intenta extraer secretos,
  - prompt que intenta accion destructiva.

## Riesgos de rechazo

OpenAI podria rechazar KAIZEN7 si:

- tool names o descriptions son promocionales o ambiguos,
- las herramientas piden contexto amplio sin necesidad,
- no hay privacy policy,
- endpoint MCP no es real o estable,
- la app esta incompleta o parece demo,
- se usan claims de superioridad,
- se presenta como endorsada por OpenAI,
- no hay anotaciones correctas de read/write/destructive/open-world,
- intenta tomar decisiones de alto impacto sin humano,
- guarda secretos o datos restringidos.

## MVP para aceptacion

No enviar todo KAIZEN7.

Enviar una version estrecha:

```text
KAIZEN7 Project Activation for ChatGPT
```

Funciones:

1. Leer objetivo de proyecto.
2. Generar brief compacto.
3. Mostrar memoria relevante.
4. Mostrar riesgos.
5. Proponer siguiente accion.
6. Proponer verificacion.
7. Guardar aprendizaje solo con confirmacion.

## Secuencia real

```text
1. Local MCP
2. Inspector
3. HTTPS dev endpoint
4. ChatGPT Developer Mode
5. Privacy Policy
6. Tool annotations
7. Test prompts
8. Review package
9. Submit
```

## Decision

La forma mas real de que OpenAI acepte KAIZEN7 es reducirlo a un producto pequeno, claro y verificable:

```text
KAIZEN7 no entra como "todo el cerebro".
Entra como Project Activation: menos contexto, siguiente accion, verificacion y memoria con permiso.
```

Una vez aceptado ese nucleo, KAIZEN7 puede crecer por modulos.

## Fuentes oficiales

- OpenAI Apps SDK: `https://developers.openai.com/apps-sdk/`
- App submission guidelines: `https://developers.openai.com/apps-sdk/app-submission-guidelines`
- Submit and maintain app: `https://developers.openai.com/apps-sdk/deploy/submission`
- Test integration: `https://developers.openai.com/apps-sdk/deploy/testing`
- Deploy app: `https://developers.openai.com/apps-sdk/deploy`
- Security and privacy: `https://developers.openai.com/apps-sdk/guides/security-privacy`
- Usage policies: `https://openai.com/policies/usage-policies/`
