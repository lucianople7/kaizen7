# OmniAgentEngine Capabilities

OmniAgentEngine registra capacidades locales mediante manifiestos JSON. El nucleo no conoce apps concretas; solo valida manifiestos, elige un adapter y ejecuta comandos defensivos con `shell=False`.

## Comandos

```bash
python core.py init
python core.py capability install examples/comfyui.pinokio.json
python core.py capability verify comfyui
python core.py capability start comfyui
python core.py capability stop comfyui
python core.py capability list
```

Si `pinokio` no esta instalado, la capacidad queda registrada y el historial guarda un error estructurado recuperable.

## MCP

Herramientas expuestas:

- `instalar_capacidad(nombre_capacidad, manifest_json)`
- `verificar_capacidad(nombre_capacidad)`
- `arrancar_capacidad(nombre_capacidad)`
- `detener_capacidad(nombre_capacidad)`
- `listar_capacidades_instalables()`

## ComfyUI via Pinokio

Ver `examples/comfyui.pinokio.json`.

## Graphify

```json
{
  "id": "graphify",
  "nombre": "Graphify",
  "descripcion": "Knowledge graph local para memoria y relaciones",
  "tipo": "tool_local",
  "backend_instalacion": "local_command",
  "comandos": {
    "verify": ["graphify", "--version"]
  },
  "puertos": [],
  "tags": ["knowledge", "graph", "memory"],
  "offline": true,
  "requires_gpu": false
}
```

## Memanto

```json
{
  "id": "memanto",
  "nombre": "Memanto",
  "descripcion": "Memoria persistente estructurada para agentes",
  "tipo": "tool_local",
  "backend_instalacion": "local_command",
  "comandos": {
    "verify": ["memanto", "--version"]
  },
  "puertos": [],
  "tags": ["memory", "agents", "context"],
  "offline": true,
  "requires_gpu": false
}
```

## Headroom

```json
{
  "id": "headroom",
  "nombre": "Headroom",
  "descripcion": "Compresion y gestion de contexto para agentes",
  "tipo": "tool_local",
  "backend_instalacion": "local_command",
  "comandos": {
    "verify": ["headroom", "--version"]
  },
  "puertos": [],
  "tags": ["context", "tokens", "agents"],
  "offline": true,
  "requires_gpu": false
}
```
