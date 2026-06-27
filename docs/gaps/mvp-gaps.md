# MVP Gap Analysis — Acopio Venezuela (Frontend)

Fecha: 2026-06-27 (actualizado tras sesión de rediseño Figma)
Base: tickets en `docs/Centros de Acopio/Acopio Venezuela — Tickets/`, ADRs, ARQUITECTURA.md

---

## Resumen ejecutivo

De los 10 tickets del alcance mínimo, **7 están completos** en el frontend y **3 tienen gaps** que bloquean el MVP. Adicionalmente hay **2 riesgos transversales** que afectan el cumplimiento de ADRs vinculantes.

| Ticket | Nombre | Estado |
|--------|--------|--------|
| #1 | Esqueleto + lista pública del Directorio | ✅ Completo |
| #2 | Alta de centro con devolución del código raíz | ✅ Completo |
| #3 | Buscar y filtrar el Directorio | ✅ Completo |
| #4 | Acceso por código + ficha + badge derivado | ✅ Completo |
| #5 | Reporte copiable en texto plano + compartir nativo | ⚠️ Revisar formato |
| #6 | Inventario: entradas/salidas, listado y totales | ✅ Completo |
| #7 | Códigos de voluntario + permisos del voluntario | ✅ Completo |
| #8 | Reportar un centro (público) → cola | ❌ Sin UI |
| #9 | Moderación — núcleo | ❌ Stub vacío |
| #10 | Moderación — administración | ❌ Stub vacío |

---

## Cambios en esta sesión (27/06/2026)

Las siguientes vistas fueron completamente rediseñadas para alinear con Figma:

- `TextField` y `SelectField` — nueva estética de campos del sistema
- `FichaEditView` — formato de tarjeta plana con divisores por sección
- `PanelCentroView` — iconos SVG actualizados, botón "Crear Voluntario" añadido al menú
- `InventarioView` — tabs con iconos, layout de formulario entrada/salida
- `MovimientosView` — buscador card, pills de filtro, tarjetas individuales con shadow, totales en card
- `MovimientoRow` — tarjeta individual con badge INGRESO/EGRESO, botón Corregir
- `CodigosView` — reescrito como lista admin con buscador y botón Revocar
- `CrearVoluntarioView` — nuevo (flujo 2 pasos: formulario → pantalla de éxito con código + copiar + compartir)
- `RegistrarCentroView` — botón de geolocalización en campo "Link Google Maps"
- Footer — texto cambiado a "Centros de Acopio - Comunidad Pádel"

---

## Gaps por ticket

---

### Ticket #8 — Reportar un centro (público) → cola

**Estado:** El endpoint `centros.reportarCentro(id, { motivo, detalle })` existe en `src/api/index.ts` y el tipo `MotivoReporte` está definido en `src/types/domain.ts`. No hay ningún componente que llame a este endpoint.

**Criterios de aceptación incumplidos:**

- [ ] Existe un control de reportar en la ficha/tarjeta, abierto sin auth.
- [ ] El reporte entra a una cola para moderación.
- [ ] Reportar no cambia la visibilidad del centro por sí solo.

**Qué construir:**

Agregar en `CentroCard.vue` un control de "Reportar este centro" visible sin autenticación. Al activarlo, mostrar un formulario inline o modal con:
- `motivo`: selector con los valores de `MotivoReporte` (`duplicado | falso | peligroso | otro`)
- `detalle`: textarea opcional
- Botón de confirmar que llame a `centros.reportarCentro(centro.id, { motivo, detalle })`
- Feedback de éxito ("Tu reporte fue enviado") y de error

El reporte no debe cambiar `estado_verificacion` en el cliente; eso lo decide el moderador.

---

### Ticket #9 — Moderación — núcleo

**Estado:** `ModeracionView.vue` muestra un `PanelPlaceholder` con tres items de lista. No hay ninguna llamada a la API ni lógica de moderación implementada.

El login de moderador (`ModeradorLoginView.vue`) sí está completo y la sesión de tipo `moderador` funciona con guards correctos.

**Criterios de aceptación incumplidos:**

- [ ] Hay una cola de centros `sin_verificar` y de reportes, priorizable.
- [ ] El moderador verifica u oculta un centro (ADR 0004).
- [ ] El moderador crea centros que nacen `verificado` y edita cualquier campo de cualquier centro.
- [ ] El moderador gestiona cuentas de moderador.

**Qué construir:**

1. **Cola de verificación:** Listar centros con `estado_verificacion = sin_verificar`. Por cada centro: botón "Verificar" → PATCH `estado_verificacion: verificado`, botón "Ocultar" → PATCH `estado_verificacion: oculto`.

2. **Cola de reportes:** Endpoint backend pendiente (`GET /api/reportes/`). UI: lista de reportes con motivo, detalle, link al centro afectado, botón "Marcar resuelto".

3. **Crear centros verificados:** Formulario equivalente a `RegistrarCentroView.vue` sin el paso del código raíz, con `estado_verificacion: verificado` de nacimiento.

4. **Editar cualquier centro:** Reutilizar o adaptar `FichaEditView.vue` permitiendo al moderador editar cualquier centro, incluyendo `estado_verificacion`.

5. **Gestión de cuentas de moderador:** Listar, crear (nombre + email + contraseña), desactivar. Endpoints backend pendientes.

---

### Ticket #10 — Moderación — administración

**Estado:** Depende del #9. Mismo stub vacío.

**Criterios de aceptación incumplidos:**

- [ ] El moderador fusiona dos centros duplicados en uno.
- [ ] El moderador reemite/revoca el código raíz de un centro (ADR 0002).
- [ ] El moderador gestiona el catálogo (alta/baja de categorías, marcar `es_insumo`) sin desplegar (ADR 0006).

**Qué construir:**

1. **Fusionar duplicados:** Selector de dos centros por nombre + confirmación destructiva. El backend resuelve la fusión.

2. **Reemitir/revocar código raíz:** Búsqueda del centro, botón "Reemitir código raíz" con confirmación. El nuevo código debe mostrarse una sola vez (igual que en `CrearVoluntarioView`).

3. **Gestión del catálogo:** Tabla de categorías con nombre, `es_insumo` (checkbox), `activa` (toggle). Nueva categoría, marcar inactiva. Endpoints de escritura backend pendientes (POST/PATCH/DELETE `/api/catalogo/`).

---

## Gaps visuales Figma vs implementación pendientes

Los siguientes gaps de diseño fueron identificados en `docs/gaps/figma-vs-implementacion.md` y siguen sin resolver tras la sesión de rediseño:

| # | Pantalla | Gap | Archivo |
|---|----------|-----|---------|
| 1 | P1 Directorio | Campo "Horario de recepción" no está en el modelo de datos | `domain.ts`, backend |
| 2 | R2 Panel home | Layout: Figma usa lista vertical plana; código usa grilla 2×2 de cards | `PanelCentroView.vue` |
| 3 | R2 Panel home | "Añadir necesidad" como ítem de menú separado (Figma) vs inline en FichaEdit (código) | Nueva vista pendiente |
| 4 | R3 Ficha | Campo "Categoría Principal" no está en `FichaEditView` | `FichaEditView.vue` |
| 5 | R4 Inventario | Nombres de tabs: Figma dice "Ingresar insumos" / "Entregar insumos"; código dice "Ingreso" / "Salida" | `InventarioView.vue` |
| 6 | R1, R3 | Etiqueta "Rol" (Figma) debería ser "Cargo" (modelo de dominio) | `RegistrarCentroView.vue`, `FichaEditView.vue` |
| 7 | R7 Recuperar código | Pantalla no existe; el botón en AccederView no tiene destino | Nueva vista pendiente |

**Resueltos en esta sesión:**

| # | Pantalla | Gap | Estado |
|---|----------|-----|--------|
| ✅ | R2 Panel | "Crear Voluntario" como ítem del menú | Añadido a `PanelCentroView` |
| ✅ | R2 Panel | "Administrar Voluntarios" como vista separada | `CodigosView` separado de `CrearVoluntarioView` |
| ✅ | R6 Voluntarios | Búsqueda de voluntarios | Buscador implementado en `CodigosView` |
| ✅ | R5 Movimientos | Buscador card, pills de filtro, tarjetas con shadow | `MovimientosView` rediseñado |
| ✅ | R4 Inventario | Tabs con iconos, formularios separados entrada/salida | `InventarioView` rediseñado |
| ⚠️ | R6 Voluntarios | Botón "Compartir" código | Disponible solo en pantalla de éxito al crear (ADR 0002 — no en el listado) |

---

## Riesgos transversales

---

### Riesgo 1 — Directorio legible sin JavaScript (ADR 0003, crítico)

**ADR 0003 establece:** "El Directorio se ve y se puede leer/buscar aunque el JS no cargue o falle."

**Situación:** El frontend es una SPA de Vue 3. Sin JS, el HTML inicial es `<div id="app"></div>`. El Directorio no es navegable sin JavaScript.

**Opciones:**
- SSR / SSG del Directorio público (Nuxt, Vite SSR, o build estático con datos sembrados).
- Renderizado en servidor desde el backend con hydration progresiva.
- Separar el Directorio en ruta servida por el backend, dejando el SPA solo para paneles autenticados.

**Acción requerida:** Decisión de arquitectura antes de declarar el MVP listo según ADR 0003.

---

### Riesgo 2 — Presupuesto de rendimiento no validado (ADR 0003)

**ADR 0003 fija:** ≤ ~170 KB comprimido en primera carga, FCP ≤ ~1,8 s, LCP ≤ ~2,5 s en Slow 4G / Android gama media-baja.

El bundle actual del Directorio (`DirectorioView` + `index`) es ~37 KB gzip, dentro del presupuesto. No se ha medido con Lighthouse en condiciones reales de red.

**Acción requerida:** Ejecutar Lighthouse en Slow 4G sobre la build de producción antes de declarar MVP.

---

### Riesgo 3 — Formato del reporte copiable (Ticket #5)

`CentroCard.vue` tiene un botón de compartir con `navigator.share` + fallback clipboard. No se ha verificado que el texto generado siga el formato exacto definido en ARQUITECTURA.md §5:

```
CENTRO: <nombre>
Municipio: <municipio>
Dirección: <direccion>
Contacto: <contacto?>
Ubicación: <ubicacion_url?>
Vialidad: <vialidad?>
Verificado: <Sí|No>
NECESIDADES:
- [URGENTE|MEDIA|LEVE] <categoria>: <detalle?>
Actualizado: <fecha y hora>
```

**Acción requerida:** Comparar la generación del texto en `CentroCard.vue` campo por campo contra la spec.

---

## Orden de trabajo para cerrar el MVP

```
Riesgo 1 (decisión de arquitectura — SSR/no-SSR)
│
├── si requiere refactor: refactorizar antes de continuar
│
Gap visual #3 (Añadir necesidad — vista separada)    [~0.5 días]
Gap visual #4 (Categoría Principal en FichaEdit)     [~0.5 días]
Gap visual #7 (Recuperar código — pantalla R7)       [~0.5 días]
│
Ticket #8 — UI de reportar centro                    [~1 día, autónomo]
│
Ticket #9 — Moderación núcleo                        [~3-4 días]
│   └── confirmar endpoints backend (reportes, cuentas de moderador)
│
Ticket #10 — Moderación administración               [~2-3 días]
│   └── confirmar endpoints backend (fusión, reemisión, CRUD catálogo)
│
Riesgo 2 — Medición de rendimiento                   [~0.5 días, al final]
Riesgo 3 — Verificar formato reporte                 [~0.5 días, autónomo]
```

Los tickets #8, Riesgo 2, Riesgo 3 y los gaps visuales menores son independientes y pueden hacerse en paralelo mientras se trabaja la moderación.
