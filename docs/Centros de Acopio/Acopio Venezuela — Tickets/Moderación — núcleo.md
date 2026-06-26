# Moderación — núcleo

Alcance: Mínimo
Código: 9
Depende de: Esqueleto + lista pública del Directorio (Esqueleto%20+%20lista%20p%C3%BAblica%20del%20Directorio.md), Reportar un centro (público) → cola (Reportar%20un%20centro%20(p%C3%BAblico)%20%E2%86%92%20cola.md)
Estado: Listo para tomar
Historias: M1, M2, M6, M7

## Qué construir

Panel de moderación detrás de **cuenta real** de moderador (no código). Cola de centros `sin_verificar` y de reportes, priorizable por urgencia/tráfico. Verificar u ocultar un centro. **Crear centros (nacen `verificado`, sin pasar por la cola) y editar cualquier campo de cualquier centro.** Gestionar cuentas de moderador.

## Criterios de aceptación

- [ ]  El moderador inicia sesión con cuenta real.
- [ ]  Hay una cola de centros `sin_verificar` y de reportes, priorizable.
- [ ]  El moderador verifica u oculta un centro (ADR 0004).
- [ ]  El moderador crea centros que nacen `verificado` y edita cualquier campo de cualquier centro.
- [ ]  El moderador gestiona cuentas de moderador.

## Bloqueada por

- Esqueleto + lista pública del Directorio
- Reportar un centro (público) → cola