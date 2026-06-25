# Memanto Memory Adapter

## Actualizacion 2026-06-25

### Decision

Memanto queda como referencia tecnica para recuperacion activa de memoria, pero no debe sustituir a Obsidian ni al Product Genome.

La arquitectura recomendada es:

```text
Obsidian = memoria humana y decisiones editables
Product Genome = memoria estructurada del negocio
Memanto = recuperacion activa opcional
KAIZEN7 Memory = capa de criterio, permisos y conflicto
```

### Por que interesa

- Puede conectar herramientas con una memoria persistente.
- Tiene tipos de memoria utiles: decision, goal, preference, context, learning, artifact, error.
- Puede funcionar localmente sin API keys usando Docker.
- Puede responder desde memoria, no solo devolver fragmentos.
- Encaja solo si KAIZEN7 empieza a perder contexto en sesiones largas o repetidas.

### Riesgos

- Anade otra pieza operativa que mantener.
- El proyecto es joven y debe probarse antes de depender de el.
- Puede duplicar memoria si se usa sin reglas claras.
- La nube gratuita no debe recibir informacion sensible del negocio sin decision explicita.

### Regla de uso

No usar Memanto como fuente de verdad. Usarlo como indice/recuperador activo.

La fuente de verdad sigue siendo:

1. `Obsidian/` para estrategia, decisiones y documentacion.
2. Product Genome para sustancias, proveedores, creatividades, metricas y claims.
3. Archivos del proyecto para codigo y estado operativo.

### Prueba recomendada

Probar Memanto solo con:

- decisiones de KAIZEN7,
- posicionamiento de THE FOCUX,
- reglas de claims,
- resumen de proveedores,
- reglas de estilo y preferencias.

No ingerir secretos, tokens, contratos, datos personales ni informacion sensible.

### Siguiente accion

Si se instala, hacerlo primero en modo local/on-prem como experimento interno de KAIZEN7. Medir si reduce repeticiones y errores antes de integrarlo.
