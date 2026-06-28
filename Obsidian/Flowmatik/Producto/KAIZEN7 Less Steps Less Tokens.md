# KAIZEN7 Less Steps Less Tokens

Fecha: 2026-06-27

## Decision

KAIZEN7 debe ser facil, efectivo y economico en contexto.

Regla:

```text
Menos pasos. Menos tokens. Mas criterio.
```

## Supereficaz

Supereficaz significa que KAIZEN7 no hace mas por parecer inteligente.

Hace menos, pero mejor.

Una funcion, modulo, skill, adapter o pantalla solo entra si mejora al menos una de estas metricas:

- reduce pasos,
- reduce tokens,
- reduce riesgo,
- reduce trabajo repetido,
- reduce tiempo de decision,
- aumenta claridad,
- aumenta verificacion,
- aumenta aprendizaje reutilizable.

Filtro:

```text
Si no mejora una metrica operativa, no entra.
```

## Score de eficacia

Antes de crear o mantener una pieza, puntuar:

```text
Pasos: - / 0 / +
Tokens: - / 0 / +
Riesgo: - / 0 / +
Claridad: - / 0 / +
Verificacion: - / 0 / +
Reutilizacion: - / 0 / +
```

Una pieza es supereficaz si tiene al menos tres `+` y ningun `-` critico.

Si no alcanza el minimo:

- se simplifica,
- se fusiona,
- se posterga,
- o se elimina.

## Modo minimo

El uso diario debe reducirse a tres movimientos:

```text
1. Objetivo
2. Accion
3. Verificacion + memoria
```

Nada de abrir diez notas si una basta.
Nada de cargar diez skills si dos resuelven.
Nada de leer todo el repo si un indice y dos archivos alcanzan.

## Comandos simples

### Hacer avanzar un objetivo

```powershell
npm.cmd run k7 -- "objetivo"
```

### Potenciar a Codex u otro agente

```powershell
npm.cmd run k7:boost -- "objetivo"
```

### Ver si KAIZEN7 esta listo

```powershell
npm.cmd run k7:ready
```

### Verificacion completa

```powershell
npm.cmd run k7:check
```

## Regla de contexto

KAIZEN7 debe responder siempre con el minimo paquete util:

- que leer,
- que evitar,
- que hacer primero,
- como verificar,
- donde guardar aprendizaje.

## Politica de tokens

1. Leer indices antes que archivos largos.
2. Leer memoria canonica antes que buscar por todo el repo.
3. Usar metadata antes que contenido completo.
4. Cargar skills solo cuando sean necesarias.
5. Preferir una accion verificable a una lista larga.
6. Guardar aprendizaje para no repetir contexto.

## Project Activation compacto

Version corta:

```text
Anchor -> Memory -> Action -> Verify -> Learn
```

Version completa:

```text
Anchor -> Memory -> Map -> Modules -> Judgment -> Action -> Verification -> Evolution
```

Uso diario:

```text
Si no reduce pasos, riesgo o tokens, no entra.
```

Version supereficaz:

```text
Si no reduce friccion o aumenta criterio verificable, no entra.
```

## Salida ideal

KAIZEN7 debe producir algo asi:

```text
Objetivo:
...

Leer:
1-3 rutas maximas.

Evitar:
...

Accion:
Una accion concreta.

Verificacion:
Comando, captura, diff o checklist.

Memoria:
Donde guardar el aprendizaje.
```

## Criterio

KAIZEN7 no gana por parecer complejo.

Gana cuando hace que avanzar sea mas facil.

Gana cuando el usuario siente:

```text
He dado menos vueltas.
He gastado menos contexto.
He decidido mejor.
He avanzado con prueba.
La siguiente vez sera mas facil.
```
