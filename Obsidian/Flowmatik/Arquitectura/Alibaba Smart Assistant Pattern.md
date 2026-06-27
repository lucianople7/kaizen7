# Alibaba Smart Assistant Pattern

Fecha: 2026-06-26

## Veredicto

`keep_pattern`

Alibaba Smart Assistant no interesa tanto como herramienta a instalar, sino como patron de producto para KAIZEN7.

Es una referencia fuerte porque organiza la IA comercial en modulos simples:

```text
Onboarding -> Producto -> Oportunidades -> Riesgo
```

Esto encaja directamente con KAIZEN7 como Product Growth OS.

## Patron observado

### 1. Registro Simplificado

Objetivo: reducir friccion inicial.

Funciones:

- verificacion,
- importacion/migracion,
- generacion de tienda,
- configuracion rapida.

Traduccion KAIZEN7:

```text
Project Intake -> Product Genome -> setup inicial -> primer canal
```

### 2. Agente de Productos

Objetivo: convertir catalogo/producto en activos optimizados.

Funciones:

- titulos,
- keywords,
- imagenes,
- videos,
- detalles,
- analisis por producto,
- optimizacion masiva.

Traduccion KAIZEN7:

```text
Product Builder -> PDP -> SEO -> Creative -> Content Pack -> Metric Loop
```

### 3. Agente de Oportunidades

Objetivo: no perder demanda.

Funciones:

- recepcion de visitantes,
- seguimiento,
- RFQ,
- filtrado,
- respuestas,
- base de conocimiento.

Traduccion KAIZEN7:

```text
Lead Radar -> CRM lightweight -> reply assistant -> offer builder -> follow-up
```

### 4. Agente de Riesgos

Objetivo: proteger margen, cuenta y cumplimiento.

Funciones:

- riesgos de PI,
- infracciones repetidas,
- TRO,
- alertas,
- GPSR,
- cartas de autodeclaracion.

Traduccion KAIZEN7:

```text
K7 Judge -> Compliance Guardrails -> Claim Risk -> IP Risk -> Regulatory Pack
```

## Encaje con KAIZEN7

Muy alto.

KAIZEN7 ya tiene piezas compatibles:

- Product Genome,
- Signal Radar,
- Signal Bowl,
- smart-crons,
- K7 Judge,
- Repo Hunter,
- THE FOCUX como primer proyecto real.

Lo que aporta el patron Alibaba es una estructura comercial facil de explicar:

```text
Setup
Product
Opportunity
Risk
```

## Encaje con THE FOCUX

THE FOCUX puede mapearse asi:

```text
Setup:
  marca, web, AI layer, newsletter, fuentes

Product:
  dossiers, nootropicos premium, PDPs futuros, videos NeuroCity

Opportunity:
  founding list, leads, partners, afiliados, proveedores

Risk:
  claims, compliance, regulacion, evidencia, IP, salud
```

## Riesgos

- Las metricas del texto no estan verificadas por KAIZEN7.
- No copiar promesas de incremento sin fuente primaria.
- No convertir THE FOCUX en marketplace B2B tipo Alibaba.
- No construir demasiados modulos antes de tener flujo real.
- No automatizar respuestas comerciales de salud sin guardrails.

## Regla KAIZEN7

Usar este patron como mapa, no como dependencia.

```text
Pattern != Tool
```

Antes de construir un modulo nuevo, comprobar:

1. Hay flujo real?
2. Hay datos reales?
3. Reduce pasos?
4. Mejora conversion o confianza?
5. Tiene guardrails?

## Decision operativa

Actualizar Product Growth OS con cuatro capas:

```text
1. Setup Agent
2. Product Agent
3. Opportunity Agent
4. Risk Agent
```

Para THE FOCUX, empezar solo por:

```text
Setup + Risk + Opportunity basica
```

No construir Product Agent completo hasta tener productos, partners o dossiers publicados.

## Prueba minima

Crear un comando o smart-cron futuro:

```powershell
node lib/smart-crons.js growth-map --project thefocux
```

Output:

- estado Setup,
- estado Product,
- estado Opportunity,
- estado Risk,
- 1 accion minima por capa,
- 1 bloqueo principal.

Veredicto:

```text
keep_pattern
expand_later
discard
```
