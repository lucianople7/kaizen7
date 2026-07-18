# KAIZEN7 + Flowmatik + THE FOCUX: diseño del engranaje unificado

**Fecha:** 18 de julio de 2026  
**Estado:** diseño aprobado por Luciano; pendiente de revisión final del documento  
**Ámbito:** coordinación entre ChatGPT Work, KAIZEN7, Codex, Flowmatik Studio y THE FOCUX

## 1. Resultado buscado

El ecosistema debe sentirse como una sola herramienta desde una conversación, aunque cada responsabilidad permanezca aislada y reemplazable.

La experiencia objetivo es:

```text
Luciano expresa un objetivo en ChatGPT Work
-> KAIZEN7 recuerda, investiga y crea la ruta mínima
-> Codex ejecuta el trabajo técnico
-> Flowmatik produce el contenido
-> ChatGPT Work presenta resultado y aprobación
-> THE FOCUX recibe el activo o resultado de negocio
-> KAIZEN7 conserva un receipt reutilizable
```

El sistema debe mejorar con el uso: al principio consulta e investiga más; después reutiliza decisiones verificadas y reduce contexto, preguntas, búsquedas y tokens.

## 2. Límites y responsabilidades

### ChatGPT Work: frontend, ojos y manos

- Conversación principal con Luciano.
- Investigación, lectura de documentos y uso de conectores autorizados.
- Presentación de resultados, evidencias, alternativas y aprobaciones.
- No será la fuente canónica del código ni dependerá de recordar conversaciones completas.

### KAIZEN7: cerebro coordinador

- Convierte objetivos en contratos de tarea pequeños.
- Recupera memoria y receipts relevantes antes de cargar contexto amplio.
- Decide ruta, herramienta, ejecutor, límites, verificación y próxima acción.
- Mantiene el índice entre código, conocimiento y activos.
- No absorbe la implementación de Flowmatik ni de THE FOCUX.

### Codex: ejecutor backend

- Lee el contrato de tarea y el contexto mínimo seleccionado por KAIZEN7.
- Modifica código, crea adaptadores, ejecuta pruebas y devuelve evidencia verificable.
- No decide por sí solo publicar, comprar, borrar, desplegar o usar credenciales.

### Flowmatik Studio: fábrica creativa

- Ejecuta el flujo señal -> brief -> guion -> activos -> montaje -> QA -> aprobación -> publicación -> métricas.
- Conserva su motor audiovisual, plantillas, activos y adaptadores en un proyecto separado.
- Entrega receipts operativos a KAIZEN7 sin trasladar toda su implementación al kernel.

### THE FOCUX: primer negocio conectado

- Posee marca, productos, evidencia, reglas editoriales, audiencia y objetivos comerciales.
- Consume producción de Flowmatik y coordinación de KAIZEN7.
- Mantiene separados los contenidos médicos, regulatorios y comerciales que requieran revisión especializada.

## 3. Fuente de verdad y memoria

Cada tipo de información tendrá un único hogar canónico:

| Capa | Contenido canónico | Regla |
| --- | --- | --- |
| GitHub | Código, contratos, configuración, pruebas y estado técnico | La verdad ejecutable siempre está versionada. |
| ChatGPT Library | Masterbook, arquitectura aprobada, decisiones e investigación consolidada | Solo entra conocimiento revisado y útil a largo plazo. |
| Google Drive | Vídeo, imagen, audio, originales y archivos pesados | No se usa como repositorio de código ni duplica el Masterbook. |
| KAIZEN7 | Índices, rutas, receipts, vigencia y próxima acción | Enlaza las fuentes sin copiar su contenido completo. |

KAIZEN7 mantendrá cuatro vistas vivas y pequeñas:

- `CONTEXT`: identidad, límites y objetivos vigentes.
- `DECISIONS`: decisiones aprobadas, motivo, evidencia y caducidad.
- `STATE`: estado verificable de cada proyecto y ejecución.
- `NEXT`: una acción prioritaria, responsable y criterio de salida.

La memoria se separa en tres niveles:

1. **Memoria esencial:** identidad, políticas y decisiones activas; siempre disponible y muy breve.
2. **Memoria recuperable:** receipts, investigaciones y resultados buscados bajo demanda.
3. **Histórico:** conversaciones, logs y activos que no entran en contexto salvo necesidad explícita.

## 4. Preflight KAIZEN7 obligatorio

Antes de formular a Luciano una pregunta técnica o estratégica, ChatGPT Work ejecutará un preflight compacto:

1. **Clasificar:** expresar objetivo, impacto y condición de parada en una tarjeta.
2. **Recordar:** buscar una decisión, receipt, ruta descartada o skill ya validada.
3. **Consultar KAIZEN7:** devolver una recomendación limitada inicialmente a 300 tokens.
4. **Investigar:** buscar información actual solo cuando la decisión sea nueva, cambiante, costosa, arriesgada o de gran impacto.
5. **Preguntar:** consultar a Luciano únicamente si su elección cambia materialmente el resultado o amplía la autoridad disponible.
6. **Verificar:** exigir evidencia proporcional al riesgo.
7. **Aprender:** guardar un receipt pequeño con reutilización, descarte y fecha de revisión.

### Resultado mínimo del preflight

```yaml
objective:
route:
memory_reused:
research_needed:
recommendation:
reason:
approval_needed:
verification:
expires_at:
```

### Presupuesto y escalado

- Primera pasada: máximo 5 recuerdos y 7 archivos.
- Respuesta de coordinación: objetivo de 300 tokens o menos.
- Investigación externa: solo fuentes primarias para decisiones técnicas.
- Si la respuesta ya está verificada y vigente, se reutiliza sin volver a preguntar.
- Una ruta se promociona a patrón estable después de 3 usos satisfactorios y repetibles.
- Se revisa si cambian documentación, precios, permisos, autenticación, formato de salida o tasa de fallos.
- Se retira si no puede verificarse o su mantenimiento supera el valor de reutilización.

## 5. Contrato de tarea y ciclo operativo

Cada objetivo produce un contrato pequeño:

```yaml
id:
goal:
expected_output:
owner:
route:
context_refs:
constraints:
approval_gates:
acceptance_checks:
status:
next_action:
```

Estados y transiciones permitidos:

```text
proposed -> approved -> running -> verifying -> completed
                         |             |
                         v             v
                       blocked ------> running
```

`blocked` conserva el punto de reanudación; al resolver el bloqueo, el trabajo vuelve a `running` y pasa de nuevo por verificación.

El cierre siempre devuelve:

- resultado o bloqueo real;
- evidencia y pruebas realizadas;
- archivos o activos afectados;
- riesgos que permanecen;
- receipt y regla de reutilización;
- siguiente acción recomendada.

## 6. Seguridad, fallos y recuperación

- Todas las operaciones externas comienzan en modo lectura, simulación o propuesta cuando sea posible.
- Publicar, gastar, desplegar, borrar, usar credenciales o ejecutar cambios destructivos requiere una compuerta explícita.
- Los trabajos poseen identificador y punto de reanudación para evitar reinicios completos.
- Reintentar no puede duplicar publicaciones, cobros, archivos o eventos.
- Los cambios de código son versionados y reversibles.
- El contenido de memoria se considera referencia no confiable hasta verificar instrucciones y vigencia.
- Salud, suplementos, claims, legalidad y comercio activan revisión especializada antes de uso público.
- KAIZEN7 puede proponer mejoras, pero no promocionarlas sin pruebas y política de aprobación.

## 7. Verificación y métricas

### Pruebas de contrato

- Work puede producir un contrato de tarea válido desde un objetivo breve.
- KAIZEN7 selecciona memoria relevante sin cargar el repositorio completo.
- Codex recibe referencias resolubles y criterios de aceptación concretos.
- Flowmatik puede devolver estado y receipt sin exponer su implementación interna.
- Una tarea bloqueada puede reanudarse sin duplicar efectos.

### Pruebas del preflight

Se mantendrá un conjunto inicial de decisiones conocidas:

- una pregunta ya resuelta debe reutilizar memoria;
- una pregunta sobre tecnología cambiante debe pedir investigación;
- una elección de preferencia debe dirigirse a Luciano;
- una acción externa sensible debe requerir aprobación;
- una recomendación irrelevante, como un modelo de embeddings para una decisión de proceso, debe ser rechazada por el evaluador de ajuste.

### Métricas guía

- porcentaje de preguntas evitadas mediante memoria vigente;
- tokens de coordinación antes de la primera acción;
- proporción de recomendaciones aceptadas;
- rutas reutilizadas con éxito;
- tiempo desde objetivo hasta primer resultado verificable;
- fallos reanudados sin repetición;
- decisiones caducadas detectadas antes de actuar.

El objetivo no es minimizar tokens a cualquier precio, sino obtener el mismo o mejor resultado con menos repetición y mayor evidencia.

## 8. Primera entrega implementable

La primera entrega se limita a la coordinación; no construirá aún el frontend completo ni la fábrica audiovisual:

1. Definir esquemas `PreflightCard`, `TaskContract` y `OutcomeReceipt`.
2. Crear un comando compacto de KAIZEN7 para Work/Codex con presupuesto explícito.
3. Añadir un evaluador de ajuste que descarte recomendaciones irrelevantes.
4. Conectar receipts vigentes y registrar caducidad.
5. Preparar pruebas con decisiones conocidas y medir contexto/tokens aproximados.
6. Documentar el handoff Work -> KAIZEN7 -> Codex y dejar Flowmatik/THE FOCUX como proyectos conectados por contrato.

No entran en esta entrega:

- un framework multiagente nuevo;
- migración total de Drive o Library;
- publicación automática en redes;
- ecommerce;
- generación de vídeo;
- una nueva interfaz compleja;
- adopción completa de Letta, LangGraph u otro sistema de memoria.

## 9. Criterio de aceptación del diseño

El engranaje queda correctamente diseñado cuando:

- se percibe como una sola herramienta desde Work;
- KAIZEN7 coordina sin convertirse en un megasistema;
- Codex ejecuta con contexto y autoridad mínimos;
- Flowmatik y THE FOCUX permanecen separados pero conectados;
- cada dato tiene una fuente canónica;
- las preguntas al usuario disminuyen conforme aumentan los receipts verificados;
- toda mejora puede medirse, revertirse y explicarse.
