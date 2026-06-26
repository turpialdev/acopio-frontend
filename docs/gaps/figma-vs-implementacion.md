# Figma vs Implementación — Análisis visual por pantalla

Archivo Figma: `ZmoaSYrWYT9BYhchRsmEwX` (Centro de acopio)  
Fecha de revisión: 2026-06-26  
Secciones: Público · Responsable de centro · Moderadores

> **Convenciones:** ✅ Correcto · ⚠️ Diferencia menor · ❌ Faltante o incorrecto

---

## Sección 1 — Público (donante / ciudadano)

---

### P1 — Directorio público (home)

**Figma node:** `0:2212`  
**Archivo Vue:** `src/views/DirectorioView.vue`  
**Ruta:** `/`

#### Estructura según Figma

| Zona | Contenido |
|------|-----------|
| Header | Logo LEP + "Acopio Venezuela" |
| Accesos rápidos | 4 botones en grilla 2×2: **Registrar centro**, **Voluntario**, **Responsable**, **Moderador** |
| Contactos de emergencia | Card colapsada: "Información útil — Contactos de Emergencia \[Ver\]" |
| Búsqueda | Campo texto + Select Estado + Select Municipio + botones **Buscar** / **Limpiar** |
| Filtros de categoría | Pills horizontales: Todo · Alimentos · Medicinas · Ropa |
| Card de centro | Nombre + badge verificación, teléfono, **horario de recepción**, dirección, vialidad, link "Como llegar", sección "Insumos requeridos" con fecha/hora, pills de insumos, botón **"Copiar reporte para WhatsApp/SMS"** |

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| 4 botones de acceso rápido | ⚠️ | Figma tiene **Registrar centro** como primer botón. Verificar si está en la implementación o solo hay 3 botones |
| Horario de recepción en card | ❌ | Figma muestra "Horario de recepción: 8:00 AM a 6:00PM" — este campo **no existe** en el modelo de datos (`Centro`) ni en la API |
| Botón copiar reporte | ⚠️ | Figma: **"Copiar reporte para WhatsApp/SMS"** — verificar que el texto del botón coincida exactamente |
| Contactos de emergencia colapsados | ✅ | Implementado con toggle Ver/Ocultar |

---

### P1 expandido — Contactos de emergencia visibles

**Figma node:** `0:2312`  
**Estado:** ✅ Implementado (EmergencyContacts.vue lazy-load al expandir)

Gap: Los contactos en Figma muestran "Cruz Roja Venezuela" con botón **Llamar**. Verificar que el botón de llamar esté implementado con `href="tel:..."`.

---

## Sección 2 — Responsable de centro

---

### R1 — Registrar centro de acopio

**Figma node:** `0:2471`  
**Archivo Vue:** `src/views/registro/RegistrarCentroView.vue`  
**Ruta:** `/registrar`

#### Campos según Figma (en orden)

1. Nombre del centro *
2. Estado *
3. Municipio *
4. Categoría Principal *
5. Dirección *
6. Link google Maps _(opcional)_
7. Nombre del responsable *
8. Teléfono de contacto *
9. Rol * _(dropdown: Propietario)_
10. Botón **Registrar Centro**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Campo "Categoría Principal" | ✅ | Implementado — se usa para crear la primera necesidad automáticamente al registrar |
| Campo "Vialidad" | ❌ | Figma **no lo muestra** en el formulario de registro — el código sí lo incluye |
| Campo "Contacto público" | ❌ | Figma tiene "Teléfono de contacto" (interno del responsable) pero **no** un teléfono público del centro en registro |
| Campo "Cargo" vs "Rol" | ⚠️ | Figma usa la etiqueta **"Rol"** con dropdown (Propietario) — el modelo correcto es `cargo_responsable`. La etiqueta en UI debería decir "Cargo" |
| Orden de campos | ⚠️ | Verificar que el orden en el formulario implementado coincide con Figma |

---

### R1 éxito — Registro exitoso / código mostrado

**Figma node:** `0:2638`  
**Archivo Vue:** `src/views/registro/RegistrarCentroView.vue` (paso 2)

#### Diseño Figma

- Ícono check verde
- Título: **"Registro exitoso"**
- Subtítulo: "Guarda este código para poder administrar tu centro de acopio, es importante que guardes este código."
- Campo de solo lectura con el código: `CAV1241`
- Botón: **"Administrar Centro de acopio"**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Estructura general | ✅ | Implementado |
| Texto del subtítulo | ⚠️ | Verificar que el copy coincide exactamente con Figma |
| Botón para copiar el código | ⚠️ | Figma no muestra botón de copiar explícito — verificar si el campo tiene funcionalidad de copiar al click |

---

### R2 — Login con código (Administrar centro)

**Figma node:** `0:2445`  
**Archivo Vue:** `src/views/auth/AccederView.vue`  
**Ruta:** `/acceder`

#### Diseño Figma

- Título: **"Administrar Centro de acopio"**
- Subtítulo: "Ingresa el código que recibiste al registrar tu centro de acopio."
- Campo: **"Código centro de acopio \*"** (con ícono de candado)
- Botón primario: **"Ingresar"** (con ícono →)
- Botón secundario: **"Recuperar código de centro"** (con ícono ↺)
- Texto link: "¿Aún no tienes centro?" → **"Registrar centro de acopio"**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Botón "Recuperar código de centro" | ❌ | En Figma es un botón secundario visible. Verificar si está implementado y navega a la pantalla R7 |
| Link "Registrar centro de acopio" | ⚠️ | Verificar que existe el link al formulario de registro |
| Ícono de candado en el campo | ⚠️ | Detalle visual — verificar |

---

### R2 logueado — Panel principal del responsable

**Figma node:** `0:2601` (sin alerta) · `0:2619` (con alerta)  
**Archivo Vue:** `src/views/panel/PanelCentroView.vue`  
**Ruta:** `/panel`

#### Diseño Figma — menú de acciones (lista vertical)

1. ✏️ Editar Ficha del centro
2. ☰ Añadir necesidad ← **pantalla separada** en Figma
3. ☰ Administrar insumos
4. 👤+ Crear Voluntario ← **pantalla separada** en Figma
5. 👤⚙ Administrar Voluntarios ← **pantalla separada** en Figma
6. 📋 Ver Reporte de insumos _(destacado en azul claro)_
7. → Cerrar sesión _(borde)_

#### Variante con alerta (sugerencia del inventario)

Banner en la parte superior:  
`AV  Alerta — hoy salió más agua de la que entró  [×]`

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Layout del menú | ❌ | Figma usa **lista vertical** de ítems. Código usa una **grilla 2×2** de botones — layout completamente diferente |
| "Añadir necesidad" como ítem | ❌ | En Figma es una opción del menú que lleva a pantalla separada (`R3-insumos`). En código, las necesidades se editan dentro de `FichaEditView` |
| "Crear Voluntario" como ítem | ❌ | Figma lo muestra como acción directa en el menú. En código es parte de `CodigosView` |
| "Administrar Voluntarios" como ítem separado | ❌ | Figma separa "Crear" de "Administrar". En código es una sola vista |
| Alerta / sugerencia | ⚠️ | Figma muestra un banner dismissible en la parte superior. En código las sugerencias se muestran como una sección dentro del panel — verificar posición y estilo |
| "Ver Reporte de insumos" | ⚠️ | En Figma aparece destacado con fondo azul claro. En código es un botón de la grilla |
| Nombre del centro en el header | ❌ | El panel de Figma no muestra el nombre del centro en la zona de contenido — solo el menú. En código el panel muestra nombre y ubicación |

---

### R3 — Editar información del centro (Ficha)

**Figma node:** `0:2495`  
**Archivo Vue:** `src/views/panel/FichaEditView.vue`  
**Ruta:** `/panel/ficha`

#### Campos en Figma

1. Nombre del centro *
2. Estado *
3. Municipio *
4. Categoría Principal *
5. Dirección *
6. Link google Maps _(opcional)_
7. Nombre del responsable *
8. Teléfono de contacto *
9. Rol * _(dropdown)_
10. Botón **"Guardar cambios"**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Campo "Categoría Principal" | ❌ | Figma muestra este campo en el editor de ficha. La implementación actual **no lo incluye** en `FichaEditView` — las necesidades se manejan por separado en otra sección del mismo form |
| Campo "Vialidad" | ❌ | Figma **no muestra** el campo de vialidad en la edición de ficha. El código sí lo tiene |
| Sección de necesidades inline | ⚠️ | El código tiene necesidades editables dentro de FichaEditView. Figma las separa en pantalla distinta (R3-insumos) |
| Etiqueta "Rol" vs "Cargo" | ⚠️ | Mismo gap que en R1 |

---

### R3-insumos — Añadir necesidad (pantalla separada)

**Figma node:** `0:2518`  
**Archivo Vue:** No existe — las necesidades se editan en `FichaEditView`  
**Ruta:** Sin ruta asignada

#### Diseño Figma

- Título: **"Añadir necesidad"**
- Categoría Principal * _(dropdown)_
- Urgencia * _(dropdown: "Alta")_
- Detalles * _(textarea: "descripción de lo que se necesita")_ — **marcado como obligatorio**
- Botón **"Añadir necesidad"**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Pantalla separada | ❌ | No existe como vista independiente — las necesidades se manejan inline en FichaEditView |
| Detalles obligatorio | ❌ | En Figma `Detalles` lleva `*` (obligatorio). En la implementación es **opcional** — alineado con el modelo de dominio pero distinto al diseño |
| Label "Urgencia: Alta" | ⚠️ | Figma usa "Alta" — el modelo usa `urgente/media/leve`. Verificar que los labels en el dropdown coincidan |

---

### R4 — Inventario (registrar entrada / salida)

**Figma node:** `0:2732`  
**Archivo Vue:** `src/views/panel/InventarioView.vue`  
**Ruta:** `/inventario`

#### Diseño Figma

- Tabs: **"Ingresar insumos"** / **"Entregar insumos"**
- Campos: Insumo* · Descripción* · Cantidad* · Unidad · Donante/Contraparte
- Botón **"Registrar"**
- Link **"Ver inventario de insumos"**
- Botón **"Cerrar sesión"**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Nombre de las tabs | ⚠️ | Figma: "Ingresar insumos" / "Entregar insumos". Código: "Ingreso de insumos" / "Salida de insumos" — cambiar etiquetas |
| Campo "Descripción" obligatorio | ❌ | Figma marca Descripción con `*`. En código la `nota` es **opcional** — alineado con ADR 0007 pero difiere del diseño |
| Campo "Cantidad" obligatorio | ⚠️ | Figma marca Cantidad con `*` en ambos tabs. En código es opcional para entrada, obligatoria para salida — verificar si el diseño distingue los tabs |
| "Ver inventario de insumos" al final | ⚠️ | Figma muestra este link + "Cerrar sesión" fuera de la card. Verificar posición en implementación |

---

### R5 — Libro de movimientos

**Figma node:** `0:2766` _(sin captura individual — visible en overview)_  
**Archivo Vue:** `src/views/panel/MovimientosView.vue`  
**Ruta:** `/inventario/movimientos`

Del overview de Figma se puede observar:
- Barra de búsqueda con campo texto + botón **Buscar**
- Listado de movimientos agrupados por fecha con: nombre de insumo, chip ENTRADA/SALIDA, cantidad, fecha/hora
- Botón **"Corregir"** por ítem

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Búsqueda | ✅ | Implementado |
| Agrupación por fecha | ✅ | HOY / fechas anteriores |
| Edición inline | ✅ | MovimientoRow con modo editar |

---

### R6 — Crear Voluntario

**Figma node:** `0:2535`  
**Archivo Vue:** `src/views/panel/CodigosView.vue`  
**Ruta:** `/panel/codigos`

#### Diseño Figma

- Título: **"Crear Voluntario"**
- Campo: **Nombre \*** (placeholder "Jacobo")
- Campo: **Rol** (dropdown: "Puerta") — _no obligatorio_
- Botón **"Guardar Voluntario"**

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Campo "Nombre" | ⚠️ | Figma usa "Nombre" del voluntario. Código usa "etiqueta" (texto libre como "Juan – puerta"). Funcionalmente equivalente pero label distinto |
| Campo "Rol" separado | ❌ | Figma tiene un dropdown de Rol separado del nombre. En código el rol se incluye como parte libre de la etiqueta. Considerar si el "Rol" de Figma es solo descriptivo (etiqueta de posición) o si es el `rol` del sistema |

---

### R6 editar — Administrar Voluntarios

**Figma node:** `0:2656`  
**Archivo Vue:** `src/views/panel/CodigosView.vue`

#### Diseño Figma

- Título: **"Administrar Voluntarios"**
- Campo búsqueda + botón **Buscar**
- Lista de voluntarios: nombre, **Código en texto plano** (CS1293), fecha de creación
- Botones por ítem: **Eliminar** (rojo) · **Compartir** (azul)

#### Gaps

| Elemento | Estado | Detalle |
|----------|--------|---------|
| Código visible en la lista | ❌ | Figma muestra el código en texto plano en la lista. Código lo muestra solo al crear (ADR 0002). Si Figma lo muestra en lista, hay un conflicto con la decisión de seguridad — **mantener la implementación actual** |
| Botón "Compartir" | ❌ | Figma tiene botón "Compartir" (navigator.share del código). No está en la implementación actual |
| Botón "Eliminar" vs "Revocar" | ⚠️ | Figma usa "Eliminar". El código usa "Revocar" (correcto según el modelo — el código no se elimina, se revoca) |
| Búsqueda de voluntarios | ❌ | Figma tiene campo de búsqueda. No implementado |

---

### R7 — Recuperar código de centro

**Figma node:** `0:2551`  
**Archivo Vue:** No existe  
**Ruta:** Sin definir

#### Diseño Figma

- Título: **"Recuperar código de centro"**
- Campo: Teléfono de contacto *
- Campo: Rol _(dropdown: "Dueño")_
- Botón **"Solicitar Código"**

#### Estado

❌ **No implementado.** El botón "Recuperar código de centro" existe en la pantalla R2 (login) pero no hay vista de destino. Esta es la versión manual mediada por moderador (ADR 0002) — el autoservicio OTP es deseable y no mínimo.

---

## Sección 3 — Moderadores

> Las capturas individuales no pudieron obtenerse por límite de llamadas Figma. El análisis se basa en el overview de sección (`0:2875`).

---

### M1 — Login moderador

**Figma node:** `0:2876`  
**Archivo Vue:** `src/views/auth/ModeradorLoginView.vue`  
**Ruta:** `/moderador`

Del overview: pantalla de login con campo de código de voluntario (no email/password).

⚠️ **Posible inconsistencia:** El overview de Figma muestra "Inicia sesión como voluntario" con campo de código — esto podría ser la pantalla del voluntario, no del moderador. La implementación usa email + contraseña para el moderador, lo cual es correcto según el modelo de dominio. Verificar con el diseñador qué pantalla corresponde a `M1 - Login`.

---

### M1 — Panel principal del moderador

**Figma node:** `0:2971`  
**Archivo Vue:** `src/views/panel/ModeracionView.vue` _(stub vacío)_  
**Ruta:** `/moderacion`

#### Menú según Figma (lista vertical)

1. Gestionar centros de acopio
2. Gestionar duplicados
3. Reemitir / revocar código
4. Administrar categorías
5. Administrar moderadores
6. Crear / Editar centro de acopio
7. Ver métricas

#### Estado: ❌ No implementado — es un placeholder

---

### M2 — Cola de verificación (centros sin verificar)

**Figma node:** `0:2995`  
**Estado:** ❌ No implementado

Del overview: lista de centros con nombre, dirección, badge de urgencia (Urgente), fecha, insumos requeridos resaltados en rojo, botones **Verificar** / **Ocultar** / **Ver ficha** por ítem.

---

### M2 — Fusionar duplicados

**Figma node:** `0:3091`  
**Estado:** ❌ No implementado

Del overview: dos centros con sus datos, botones **Fusionar** / **No es duplicado**.

---

### M2 — Cola de reportes

**Figma node:** `0:3155`  
**Estado:** ❌ No implementado

Del overview: lista de reportes por centro con botones acción.

---

### M2 — Gestión de moderadores

**Figma node:** `0:3207` / `0:3242`  
**Estado:** ❌ No implementado

Del overview: lista de moderadores (Carmen Lopez, activa/inactiva), email, botones **Eliminar cuenta** / **Restablecer contraseña**. Vista de creación de moderador con campos nombre, email, contraseña.

---

### M2 — Crear / Editar centro (desde moderación)

**Figma node:** `0:3277`  
**Estado:** ❌ No implementado

Del overview: formulario similar a R1 pero accesible desde el panel de moderación. Los centros creados por moderador nacen `verificado` directamente.

---

### M2 — Buscar centro en directorio (vista moderador)

**Figma node:** `0:3317`  
**Estado:** ❌ No implementado

Del overview: búsqueda de centros con filtros + lista de resultados con botones Verificar/Ocultar/Ver ficha.

---

## Resumen de gaps priorizados

### Prioridad alta — afectan flujos mínimos implementados

| # | Pantalla | Gap | Archivo |
|---|----------|-----|---------|
| 1 | P1 Directorio | Campo "Horario de recepción" no existe en el modelo | `domain.ts`, backend |
| 2 | R2 Panel home | Layout lista vertical vs grilla 2×2 | `PanelCentroView.vue` |
| 3 | R2 Panel home | "Añadir necesidad" como acción separada | `PanelCentroView.vue` + nueva vista |
| 4 | R3 Ficha | "Categoría Principal" falta en el editor de ficha | `FichaEditView.vue` |
| 5 | R4 Inventario | Nombres de tabs: "Ingresar/Entregar insumos" | `InventarioView.vue` |
| 6 | R6 Voluntarios | Botón "Compartir" código faltante | `CodigosView.vue` |

### Prioridad media — copy / etiquetas

| # | Pantalla | Gap |
|---|----------|-----|
| 7 | R1, R3 | Etiqueta "Rol" → debería ser "Cargo" |
| 8 | R1 éxito | Verificar copy del subtítulo |
| 9 | R3-insumos | Urgencia "Alta" vs label `urgente` |
| 10 | P1 | Texto botón copiar reporte |

### Prioridad baja — tickets deseable / sin implementar intencionalmente

| # | Pantalla | Nota |
|---|----------|------|
| 11 | R7 Recuperar código | No implementado. Es flujo mediado por moderador — depende de ticket moderación |
| 12 | M1–M2 Moderación | Todo el panel — ver `docs/gaps/mvp-gaps.md` |
