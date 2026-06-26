# MVP Gap Analysis — Acopio Venezuela (Frontend)

Fecha: 2026-06-26  
Base: tickets en `docs/Centros de Acopio/Acopio Venezuela — Tickets/`, ADRs, ARQUITECTURA.md  
Metodología: revisión completa del árbol `src/` contra los criterios de aceptación de cada ticket mínimo.

---

## Resumen ejecutivo

De los 10 tickets del alcance mínimo, **7 están completos** en el frontend y **3 tienen gaps** que bloquean el MVP. Adicionalmente hay **2 riesgos transversales** que afectan el cumplimiento de ADRs vinculantes, independientemente del estado de los tickets.

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

1. **Cola de verificación:** Listar centros con `estado_verificacion = sin_verificar` (el endpoint `centros.listarCentros()` ya acepta filtros; verificar si el backend expone este filtro para el moderador o si hace falta un endpoint específico). Por cada centro: botón "Verificar" → PATCH `estado_verificacion: verificado`, botón "Ocultar" → PATCH `estado_verificacion: oculto`.

2. **Cola de reportes:** Requiere un endpoint backend (`GET /api/reportes/` o similar, pendiente de confirmar) para listar los reportes recibidos. UI: lista de reportes con motivo, detalle, link al centro afectado, botón "Marcar resuelto".

3. **Crear centros verificados:** Formulario equivalente al de `RegistrarCentroView.vue` pero sin el paso del código raíz y con `estado_verificacion: verificado` de nacimiento. El moderador no recibe código raíz.

4. **Editar cualquier centro:** Reutilizar o adaptar `FichaEditView.vue` permitiendo al moderador editar cualquier centro (no solo el propio), incluyendo `estado_verificacion`.

5. **Gestión de cuentas de moderador:** Listar cuentas, crear nueva (nombre + email + contraseña), desactivar. Requiere endpoints backend (pendiente de confirmar).

---

### Ticket #10 — Moderación — administración

**Estado:** Depende del #9. Mismo stub vacío.

**Criterios de aceptación incumplidos:**

- [ ] El moderador fusiona dos centros duplicados en uno.
- [ ] El moderador reemite/revoca el código raíz de un centro (ADR 0002).
- [ ] El moderador gestiona el catálogo (alta/baja de categorías, marcar `es_insumo`) sin desplegar (ADR 0006).

**Qué construir:**

1. **Fusionar duplicados:** UI para seleccionar dos centros y designar cuál es el principal. El backend resuelve la fusión; el frontend necesita un selector de búsqueda por nombre y una confirmación destructiva.

2. **Reemitir/revocar código raíz:** Formulario de búsqueda del centro, botón "Reemitir código raíz" con confirmación. El nuevo código debe mostrarse una sola vez igual que en el alta (ADR 0002). "Revocar" deja el centro sin acceso hasta que se reemita.

3. **Gestión del catálogo:** Tabla editable de categorías con columnas nombre, `es_insumo` (checkbox), `activa` (toggle). Acciones: nueva categoría (nombre + es_insumo), marcar inactiva. El endpoint `catalogo.listarCategorias()` ya existe; se necesitan endpoints de escritura en el backend (POST/PATCH/DELETE `/api/catalogo/`).

---

## Riesgos transversales

Estos puntos no son gaps de un ticket específico sino riesgos que afectan el cumplimiento de ADRs vinculantes.

---

### Riesgo 1 — Directorio legible sin JavaScript (ADR 0003, crítico)

**ADR 0003 establece como criterio vinculante:** "El Directorio se ve y se puede leer/buscar aunque el JS no cargue o falle."

**Situación actual:** El frontend es una SPA de Vue 3 compilada con Vite. Sin JS, el HTML inicial es una página vacía con solo `<div id="app"></div>`. El Directorio no es visible ni navegable sin JavaScript.

**Impacto:** Este criterio está marcado como el que "más pesa en red mala" (ADR 0003). Incumplirlo significa que en condiciones de red degradada — el contexto real de uso — el directorio puede quedar en blanco.

**Opciones para resolverlo:**
- SSR / SSG del Directorio público (Nuxt, Vite SSR, o build estático con datos sembrados).
- Renderizado en servidor del HTML de la lista desde el backend, con el SPA de Vue montado encima (hydration progresiva).
- Separar el Directorio en una ruta servida por el backend con render tradicional, dejando el SPA solo para los paneles autenticados.

**Acción requerida:** Decisión de arquitectura antes de declarar el ticket #1 y #3 completos según ADR 0003. Actualmente el frontend no cumple este criterio.

---

### Riesgo 2 — Presupuesto de rendimiento no validado (ADR 0003)

**ADR 0003 fija umbrales medibles:** ≤ ~170 KB comprimido en primera carga, FCP ≤ ~1,8 s, LCP ≤ ~2,5 s, en perfil Slow 4G / Android gama media-baja.

**Situación actual:** No existe ningún resultado de medición (Lighthouse, WebPageTest, `vite-bundle-visualizer`) en el repositorio. No se sabe si el bundle actual cumple el presupuesto.

**Acción requerida:** Ejecutar al menos una medición con Lighthouse en Slow 4G sobre la build de producción antes de declarar el MVP listo. Si el resultado supera los umbrales, revisar el bundle (fuentes, dependencias, code-splitting).

---

### Riesgo 3 — Formato del reporte copiable (Ticket #5)

**Situación:** `CentroCard.vue` tiene un botón de compartir que usa `navigator.share` con fallback a clipboard. No se ha verificado que el texto generado siga el formato exacto definido en ARQUITECTURA.md §5:

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

**Acción requerida:** Leer el bloque de generación del texto en `CentroCard.vue` y compararlo campo por campo contra la spec. Corregir si hay diferencias. Este formato es el "puente hacia quien no puede abrir el sitio" y debe ser exacto para ser útil en WhatsApp/SMS.

---

## Orden de trabajo para cerrar el MVP

```
Riesgo 1 (decisión de arquitectura — SSR/no-SSR)
│
├── si requiere refactor: refactorizar antes de continuar
│
Ticket #8 — UI de reportar centro        [~1 día, autónomo]
│
Ticket #9 — Moderación núcleo            [~3-4 días]
│   └── confirmar endpoints backend (reportes, cuentas de moderador)
│
Ticket #10 — Moderación administración   [~2-3 días]
│   └── confirmar endpoints backend (fusión, reemisión, CRUD catálogo)
│
Riesgo 2 — Medición de rendimiento       [~0.5 días, al final]
Riesgo 3 — Verificar formato reporte     [~0.5 días, autónomo]
```

Los tickets #8, Riesgo 2 y Riesgo 3 son independientes y pueden hacerse en paralelo mientras se trabaja la moderación.
