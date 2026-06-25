# Product Genome Schema

## MVP Tables

### products

- id
- workspace_id
- name
- category
- audience
- problem
- promise
- mechanism
- offer
- status
- created_at

### experiments

- id
- product_id
- hypothesis
- type
- channel
- status
- started_at
- ended_at

### creatives

- id
- experiment_id
- hook
- angle
- format
- content
- asset_url
- judge_score

### creative_metrics

- creative_id
- impressions
- hold_rate
- ctr
- conversions
- spend
- revenue
- measured_at

### suppliers

- id
- name
- country
- categories
- certifications
- contact
- confidence

### supplier_quotes

- supplier_id
- product_id
- moq
- unit_cost
- lead_time_days
- sample_status
- quality_score
- quoted_at

### memories

- id
- product_id
- type
- content
- source
- confidence
- approved
- created_at

## Derived Scores

### product_score

Combinar:

- claridad del problema,
- intencion de compra,
- margen potencial,
- diferenciacion,
- facilidad de entrega,
- riesgo.

### creative_score

Combinar:

- retencion,
- CTR,
- conversion,
- CAC,
- calidad del lead.

### supplier_score

Combinar:

- coste,
- MOQ,
- lead time,
- certificaciones,
- calidad de muestra,
- fiabilidad.

