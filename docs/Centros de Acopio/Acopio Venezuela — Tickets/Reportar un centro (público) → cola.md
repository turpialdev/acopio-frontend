# Reportar un centro (público) → cola

Alcance: Mínimo
Código: 8
Depende de: Esqueleto + lista pública del Directorio (Esqueleto%20+%20lista%20p%C3%BAblica%20del%20Directorio.md)
Estado: Listo para tomar
Historias: P4

## Qué construir

Cualquier persona puede reportar un centro (falso/duplicado/peligroso) desde el Directorio, sin autenticación. El reporte entra a una **cola de moderación**; no oculta el centro automáticamente (ADR 0004).

## Criterios de aceptación

- [ ]  Existe un control de reportar en la ficha/tarjeta, abierto sin auth.
- [ ]  El reporte entra a una cola para moderación.
- [ ]  Reportar no cambia la visibilidad del centro por sí solo.

## Bloqueada por

- Esqueleto + lista pública del Directorio