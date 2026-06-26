# Inventario: entradas/salidas, listado y totales derivados

Alcance: Mínimo
Código: 6
Depende de: Acceso por código + editar ficha y necesidades + badge derivado (Acceso%20por%20c%C3%B3digo%20+%20editar%20ficha%20y%20necesidades%20+%20b.md)
Estado: Listo para tomar
Historias: R4, R5, V4

## Qué construir

Registrar movimientos (entrada de donante / salida a ente del Estado) **solo sobre categorías marcadas como insumo**: tipo, categoría, cantidad opcional (número + unidad libre), contraparte opcional, nota opcional; estampado con el código que lo registró y timestamp. Listar los movimientos del centro. Mostrar totales derivados por insumo etiquetados **"registrado"** (nunca "en existencia"). El responsable puede corregir/anular cualquier registro. No mantiene saldo de existencias (ADR 0007).

## Criterios de aceptación

- [ ]  Se registran entradas y salidas con cantidad opcional, solo sobre insumos (bienes).
- [ ]  Cada movimiento queda estampado con el código que lo registró y su timestamp.
- [ ]  Se listan los movimientos del centro.
- [ ]  Los totales se muestran como "registrado", no como existencia (ADR 0007).
- [ ]  El responsable puede corregir o anular cualquier registro.

## Bloqueada por

- Acceso por código + editar ficha y necesidades + badge derivado