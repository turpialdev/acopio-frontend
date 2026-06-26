# Señales del inventario que empujan a actualizar la ficha

Alcance: Deseable
Código: 12
Depende de: Inventario: entradas/salidas, listado y totales derivados (Inventario%20entradas%20salidas,%20listado%20y%20totales%20der.md)
Estado: Listo para tomar
Historias: R8

## Qué construir

A partir del libro de movimientos, el sistema **sugiere** al responsable actualizar la ficha (p. ej. "hoy salió más agua de la que entró"). El sistema solo sugiere; el responsable publica (ADR 0005). Nunca cambia la ficha automáticamente.

## Criterios de aceptación

- [ ]  El sistema muestra señales derivadas del libro de movimientos al responsable.
- [ ]  Ninguna señal modifica la ficha pública por sí sola (ADR 0005).

## Bloqueada por

- Inventario: entradas/salidas, listado y totales derivados