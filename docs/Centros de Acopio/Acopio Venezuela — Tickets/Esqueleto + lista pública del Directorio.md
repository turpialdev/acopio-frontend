# Esqueleto + lista pública del Directorio

Alcance: Mínimo
Código: 1
Estado: Listo para tomar
Historias: P1 (base), P2 (base)

## Qué construir

Una sola aplicación desplegable sobre una sola base de datos (ADR 0003). Un endpoint público sin autenticación que lista centros no ocultos y otro que muestra la ficha de un centro. Render ultraligero del Directorio (lista + ficha) que cumple el presupuesto de rendimiento. Sembrar la base con unos pocos centros de ejemplo para poder ver la lista. Es el andamio que monta el pipeline de despliegue y la medición de rendimiento.

## Criterios de aceptación

- [ ]  Existe una app desplegable y una BD con la entidad Centro (incluye `estado_verificacion`).
- [ ]  El endpoint público lista solo centros no ocultos y permite ver una ficha.
- [ ]  El Directorio se ve y se puede leer aunque el JS no cargue o falle (ADR 0003).
- [ ]  Primera carga del Directorio ≤ ~170 KB comprimida; FCP ≤ ~1,8 s y LCP ≤ ~2,5 s en Slow 4G (ajustable tras prueba real).
- [ ]  Hay datos sembrados que demuestran la lista y la ficha.

## Bloqueada por

Ninguna — se puede arrancar de inmediato.