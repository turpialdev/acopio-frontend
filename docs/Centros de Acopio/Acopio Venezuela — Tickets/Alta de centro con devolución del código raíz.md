# Alta de centro con devolución del código raíz

Alcance: Mínimo
Código: 2
Depende de: Esqueleto + lista pública del Directorio (Esqueleto%20+%20lista%20p%C3%BAblica%20del%20Directorio.md)
Estado: Listo para tomar
Historias: R1

## Qué construir

Formulario corto de alta (imitando `apoyo-venezuela.com/centros/nuevo`) sin paso de login. Captura datos de ubicación/centro (estado [selector], municipio [depende del estado], nombre, dirección, link de Maps opcional, contacto público opcional, vialidad opcional) y datos internos del responsable, **todos obligatorios** (nombre, teléfono —también de recuperación—, **cargo**: Propietario/Socio/Director/Gerente; lista de valores fija por ahora). Al enviar, crea el centro `sin_verificar` pero visible, genera el código raíz (guardando su **hash**) y lo muestra **una sola vez** con aviso de guardarlo.

## Criterios de aceptación

- [ ]  El formulario captura todos los campos de ubicación/centro y los internos del responsable.
- [ ]  Todos los datos del responsable (nombre, teléfono, cargo) son obligatorios; el cargo es un selector de valores fijos.
- [ ]  Los datos del responsable no aparecen en el Directorio.
- [ ]  El centro nace `sin_verificar` y aparece de inmediato en el Directorio (ADR 0004).
- [ ]  El código raíz se muestra una sola vez con aviso de guardarlo; se almacena solo su hash (ADR 0002, 0003).
- [ ]  No hay paso de inicio de sesión.

## Bloqueada por

- Esqueleto + lista pública del Directorio