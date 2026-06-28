# K7 Frontier Watch

Fecha: 2026-06-27

## Decision

KAIZEN7 necesita una entrada diaria modular de lo mas puntero: APIs, MCPs, herramientas de codigo, SDKs, agentes, webhooks y patrones de automatizacion.

La entrada no debe instalar ni adoptar por defecto. Primero debe convertir cada fuente en un paquete compacto, trazable y verificable.

## Patron

```text
frontier source -> signal packet -> Hunter queue -> adapter plan -> verification -> memory
```

## Implementacion

- `data/frontier-watch.json`
- `npm.cmd run k7:frontier`
- `npm.cmd run k7:frontier -- --write-signals`
- `npm.cmd run k7:frontier:brief -- --write-signals`
- `data/signal-inbox.json`
- `lib/frontier-operator.js`
- `docs/FRONTIER_WATCH.md`

## Reglas

- Documentacion oficial, changelog o repo primario primero.
- No guardar claims como hechos si no tienen fuente o evidencia local.
- Adaptar patrones antes que instalar dependencias.
- Rechazar lo que aumente pasos, tokens, riesgo o mantenimiento.
- No tocar credenciales, pagos, deploys, publicaciones ni datos sensibles.

## Encaje KAIZEN7

- `K7 Context`: reduce el ruido a paquetes compactos.
- `K7 Judge`: verifica si merece pasar de senal a accion.
- `K7 Operator`: ejecuta solo despues de aprobacion.
- `K7 Memory`: guarda aprendizajes confirmados.
- `Adapter Registry`: convierte la senal elegida en contrato de conexion.

## Siguiente accion

Usar el flujo diario:

```powershell
npm.cmd run k7:frontier:brief -- --write-signals
```

Elegir solo la senal con mayor retorno y convertirla en adaptador.
