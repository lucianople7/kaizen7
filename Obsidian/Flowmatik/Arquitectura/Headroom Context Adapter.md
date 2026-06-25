# Headroom Context Adapter

## Actualizacion 2026-06-25

### Decision

Headroom es candidato para optimizar contexto, reducir tokens y compartir memoria ligera entre agentes, pero no debe entrar en el nucleo de KAIZEN7 en esta fase.

Se conserva como referencia para una futura capa de `K7 Context`.

Desde 2026-06-25, la disciplina base vive en `K7 Memory Token Engine`. Headroom solo se considerara si la regla manual de memoria, indices y lectura focalizada no basta.

### Por que interesa

- Comprime salidas de herramientas, logs, archivos, resultados RAG e historial antes de enviarlos al modelo.
- Puede funcionar como libreria, proxy, wrapper de agentes o servidor MCP.
- Declara compresion reversible mediante cache local.
- Puede optimizar contexto para sesiones largas de KAIZEN7.
- Encaja con proyectos largos donde los agentes leen muchos archivos y repiten contexto.

### Riesgos

- Es otra capa tecnica que puede fallar.
- La compresion puede ocultar detalles importantes si se usa demasiado pronto.
- Puede complicar depuracion cuando una respuesta depende de contexto comprimido.
- El proxy/wrapper puede interferir con configuraciones existentes de Codex, MCP o herramientas locales.
- Requiere validar privacidad, cache local y recuperacion de originales antes de usarlo con datos sensibles.

### Regla Ponytail

No instalar Headroom todavia.

Primero usar tecnicas simples:

1. Leer solo archivos necesarios.
2. Usar `rg` y lecturas focalizadas.
3. Mantener Obsidian como memoria sintetica.
4. Usar Product Genome para datos estructurados.
5. Evitar logs enormes y outputs innecesarios.

Headroom se prueba solo si:

- las sesiones largas empiezan a perder contexto,
- el coste/token se vuelve un problema real,
- o KAIZEN7 necesita una capa comun de compresion y memoria.

### Prueba recomendada

Cuando toque probarlo:

1. Instalarlo fuera del flujo principal.
2. Usarlo primero solo con logs y busquedas grandes.
3. No comprimir decisiones, claims regulatorios ni datos sensibles sin recuperacion verificada.
4. Medir ahorro real y errores antes/despues.
5. Mantener desactivada cualquier modificacion de salida si afecta al tono del usuario.

### Encaje futuro

```text
KAIZEN7 / Codex
  -> K7 Memory Token Engine
  -> Headroom opcional para compresion
  -> Obsidian + Product Genome
  -> KAIZEN7 Operator
```

Headroom puede ser una herramienta de eficiencia. No es el cerebro, no es la memoria oficial y no sustituye a la disciplina de leer menos y mejor.
