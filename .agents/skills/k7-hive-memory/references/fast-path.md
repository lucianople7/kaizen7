# K7 Hive Memory Fast Path

Usar esta referencia cuando el contexto empieza a crecer.

## 90-second route

1. Buscar nota canonica:
   ```powershell
   rg -n "tema|sinonimo|proyecto" Obsidian
   ```
2. Leer maximo 1-3 notas.
3. Buscar en codigo solo si cambia la decision:
   ```powershell
   rg -n "simbolo|id|ruta" .
   ```
4. Decidir el cambio minimo.
5. Verificar.
6. Guardar una linea util en daily o decision ledger.

## Escalation

Subir a mapa/grafo solo si:

- hay mas de 12 archivos relevantes,
- aparecen contradicciones,
- la misma busqueda ya se hizo antes,
- o el agente no puede explicar que no leyo y por que.

## Memory Compression

Comprimir asi:

```text
Hecho:
Decision:
Riesgo:
Siguiente accion:
```

Evitar parrafos largos salvo que documenten una decision irreversible.

