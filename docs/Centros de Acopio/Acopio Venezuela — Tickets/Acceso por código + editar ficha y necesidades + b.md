# Acceso por código + editar ficha y necesidades + badge derivado

Alcance: Mínimo
Código: 4
Depende de: Alta de centro con devolución del código raíz (Alta%20de%20centro%20con%20devoluci%C3%B3n%20del%20c%C3%B3digo%20ra%C3%ADz.md)
Estado: Listo para tomar
Historias: R2, R3, P1 (filtro por categoría/urgencia)

## Qué construir

Canjear el código de gestión → sesión del centro con su rol (responsable/voluntario), con el rol resuelto en el servidor (el código es opaco). El responsable edita la ficha (datos + lista de necesidades: categoría del catálogo + urgencia `urgente`/`media`/`leve` + detalle libre). El badge del centro se calcula como el máximo de las urgencias de sus necesidades (`Urgente`/`Atención media`/`Atención baja`/`Sin reporte`), sin almacenarse. Incluye el catálogo de categorías como dato (sembrado) y extiende el Directorio con filtro por categoría y urgencia. Al guardar, `actualizado_en` se refresca.

## Criterios de aceptación

- [ ]  Canjear un código válido abre la sesión del centro con el rol correcto (resuelto en servidor).
- [ ]  El responsable edita la ficha y la lista de necesidades (categoría + urgencia + detalle).
- [ ]  El badge del centro es derivado del máximo de urgencias de sus necesidades (ADR 0005).
- [ ]  El Directorio permite filtrar por categoría y por urgencia.
- [ ]  Guardar refresca `actualizado_en`, visible y prominente en la ficha (P2).

## Bloqueada por

- Alta de centro con devolución del código raíz