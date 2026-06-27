# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

**Acopio Venezuela** is an emergency humanitarian aid coordination system built after the earthquake of 24/06/2026. It has two purposes: a **public directory** of aid collection centers (_centros de acopio_) and a **private inventory manager** per center. The inventory is the core differentiator — the directory exists to avoid depending on third parties (`apoyo-venezuela.com`).

The full product documentation lives in `docs/Centros de Acopio/`.

### Domain vocabulary

Use these terms exactly — they are the agreed language of the project:

| Term | Meaning |
|---|---|
| **Centro de acopio** | Physical place that receives donations. The central entity. Avoid: sede, local. |
| **Directorio** | Public read-only view of centers. Avoid: listado, mapa. |
| **Ficha** | A center's public profile (name, location, needs, verification status, last updated). Edited by the Responsable. |
| **Inventario** | Private per-center log of movements. NOT a stock balance. Avoid: stock, almacén. |
| **Movimiento** | One inventory event: an entrada or salida. Avoid: transacción. |
| **Entrada** | Movement recording insumos received from a donor. Avoid: ingreso, recepción. |
| **Salida** | Movement recording insumos delivered to a government entity. Avoid: egreso. |
| **Necesidad** | What a center requests, from a controlled catalog. Has urgency (`urgente`/`media`/`leve`) + optional free text. |
| **Insumo** | A Necesidad that is a physical good (agua, alimentos…). Only insumos can have inventory movements. |
| **Catálogo** | Controlled vocabulary of Necesidad categories, managed by Moderador. Enables Directorio filtering. |
| **Reporte** | Plain-text summary of a Ficha, copyable to clipboard for WhatsApp/SMS. Must work without network. |
| **Código de gestión** | Opaque random string granting access to manage a center. Role lives on the server, not in the code. |
| **Responsable** | Holds the root code. Edits ficha, manages inventory, creates/revokes volunteer codes. |
| **Voluntario** | Holds a code created by the Responsable. Registers movements; can only correct their own recent records. |
| **Moderador** | Real account (not a code). Curates the Directorio, manages catalog, handles recovery. |

### The three surfaces

1. **Directorio público** — unauthenticated. Lists non-hidden centers with search/filter.
2. **Panel de gestión del centro** — behind a `código de gestión` (responsable or voluntario).
3. **Panel de moderación** — behind a real moderator account.

### Auth and roles

- `useAuth()` composable holds the session. The `tipo` field distinguishes `codigo` sessions (volunteers/responsables) from `moderador` sessions.
- The Vue Router guard checks `to.meta.requiere`: `'codigo'` (any volunteer with a rol), `'responsable'`, or `'moderador'`.
- Codes are opaque tokens — the role is resolved server-side on exchange. Never derive role from the code string.

### Domain model (key entities and fields)

**Centro:** `id`, `nombre`, `estado` (entidad federal), `municipio`, `direccion`, `contacto?`, `ubicacion_url?`, `vialidad?`, `estado_verificacion: sin_verificar|verificado|oculto`, `actualizado_en`. Internal (not public): `nombre_responsable`, `telefono_responsable`, `cargo_responsable: propietario|socio|director|gerente`.

**Necesidad:** `centro_id`, `categoria_id`, `urgencia: urgente|media|leve`, `detalle?`. The center's urgency **badge is derived** (max urgency across all necesidades) — it is never stored separately.

**Código de gestión:** `id`, `centro_id`, `valor` (store the **hash**, never the plaintext), `rol: responsable|voluntario`, `etiqueta`, `creado_por`, `revocado_en`.

**Movimiento:** `id`, `centro_id`, `tipo: entrada|salida`, `categoria_id`, `cantidad?` (number + free-text unit), `contraparte?`, `nota?`, `registrado_por` (code → label), `registrado_en`. Only on categories with `es_insumo = true`.

**Categoría (Catálogo):** `id`, `nombre`, `es_insumo` (bool), `activa`. Admin data, not code — Moderador manages it at runtime.

### Critical design decisions (ADRs)

- **ADR 0002 — Código de gestión:** Codes are bearer tokens. If a volunteer code leaks, the Responsable revokes it. If the root code is lost, a Moderador re-issues it. The Voluntario's destructive permissions are intentionally limited.
- **ADR 0003 — Performance budget (binding):** Directorio must work on Slow 4G / mid-range Android: ≤ ~170 KB compressed first load, FCP ≤ ~1.8 s, LCP ≤ ~2.5 s. **The Directorio must be readable/searchable even if JS fails to load.** This is non-negotiable.
- **ADR 0004 — Publish immediately, moderate reactively:** A newly registered center appears in the Directorio immediately as `sin_verificar`. There is no approval gate. Moderators work a queue reactively.
- **ADR 0005 — Human confirms needs:** The public Necesidad is always declared by the Responsable. The inventory can *suggest* updates ("more water left than arrived today") but **never auto-publishes** anything to the Ficha.
- **ADR 0006 — Controlled catalog:** Needs come from a Moderador-managed catalog so Directorio filters work. A non-good (e.g. "rescue volunteers") can be a Necesidad but cannot have inventory movements.
- **ADR 0007 — Inventory is a log, not a balance:** Totals are displayed as **"registrado"** (never "en existencia"). Quantity is optional. There is no authoritative stock count.

### Scope: mínimo vs deseable

**Mínimo** (must ship):
Directorio público (search/filter, ficha, reporte copiable, reportar centro) · Alta de centro with root code · Panel gestión (ficha + necesidades, movimientos, códigos de voluntario) · Panel moderación (verify/hide, merge duplicates, reemit root code, catalog, accounts).

**Deseable** (post-launch):
Inventory signals pushing ficha updates · Emergency contacts on home · PWA/offline Directorio · Stale-ficha warning · OTP self-service code recovery.

### Ticket order and dependencies

```
1 Esqueleto + Directorio público
├── 2 Alta de centro con código raíz
├── 3 Buscar y filtrar Directorio
│   └── 13 PWA offline (Deseable)
├── 4 Acceso por código + ficha + badge
│   ├── 5 Reporte copiable
│   ├── 6 Inventario entradas/salidas
│   │   ├── 7 Códigos de voluntario
│   │   └── 12 Señales del inventario (Deseable)
│   └── 14 Aviso frescura (Deseable)
└── 8 Reportar un centro → cola
    └── 9 Moderación — núcleo
        ├── 10 Moderación — administración
        │   └── 15 Autoservicio OTP (Deseable)
        └── 11 Contactos de emergencia (Deseable)
```

## Commands

```bash
pnpm dev            # Start Vite dev server
pnpm build          # Type-check + build for production (run-p type-check build-only)
pnpm preview        # Preview production build
pnpm test:unit      # Run all Vitest unit tests
pnpm test:unit src/path/to/file  # Run a single test file
pnpm lint           # Run oxlint then eslint (both with --fix)
pnpm format         # Prettier format on src/
```

Node requirement: `^22.18.0 || >=24.12.0`. Package manager: **pnpm**.

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend URL before starting development.

## Architecture

**Stack:** Vue 3 (Composition API / `<script setup>`) · TypeScript · Vite · Vue Router 5 · Vitest + jsdom · ESLint + Oxlint + Prettier

### Directory layout

```
src/
├── api/            # HTTP client and all endpoint calls
├── assets/         # Global CSS (design tokens, base styles) and images
├── components/     # Reusable components: ui/, layout/, icons/, public/, inventario/
├── composables/    # Vue composables — global auth state lives here
├── lib/            # Pure utilities: formatting helpers, Venezuela geography data
├── router/         # Route definitions + beforeEach navigation guard
├── types/          # TypeScript domain types (domain.ts)
└── views/          # Page-level components, organised by route group
    ├── auth/       # Login pages (codigo, moderador)
    ├── panel/      # Authenticated centro management
    │   ├── PanelCentroView.vue       # Main menu for responsable/voluntario
    │   ├── FichaEditView.vue         # Edit centro ficha + necesidades
    │   ├── InventarioView.vue        # Register entrada/salida (tabs)
    │   ├── MovimientosView.vue       # Movement history with search/filter
    │   ├── CodigosView.vue           # Admin list of volunteer codes (revocar)
    │   ├── CrearVoluntarioView.vue   # 2-step flow: form → success with code
    │   └── mod/                      # Moderator sub-views
    └── registro/   # Centro registration flow
```

### API layer (`src/api/`)

`client.ts` exports a plain-fetch HTTP client (`http.get/post/patch/delete`) that:
- Reads base URL from `import.meta.env.VITE_API_URL`
- Attaches `Authorization: Bearer <token>` from auth state (skip with `{ auth: false }`)
- Throws typed `ApiError` with `status`, `detail`, and per-field `errors` on non-OK responses
- Uses a `qs()` helper that strips `undefined`/`null` before building query strings

`index.ts` re-exports named endpoint groups (`auth`, `centros`, `necesidades`, `movimientos`, `codigos`, `catalogo`, `contactos`). All API calls go through these groups — no raw `fetch` outside `client.ts`.

### Authentication & state (`src/composables/useAuth.ts`)

Global reactive singleton (no Pinia/Vuex). Persists to localStorage under two keys:
- `acopio.token` — JWT string
- `acopio.sesion` — `{ tipo, rol, centroId, etiqueta, nombre }`

Returns `sesion` (readonly reactive), computed flags (`estaAutenticado`, `esResponsable`, `esVoluntario`, `esModerador`), and session mutation methods. Import and call `useAuth()` anywhere — it returns the same reactive instance.

### Routing & guards (`src/router/index.ts`)

A global `beforeEach` guard checks `to.meta.requiere` against auth state:
- `'codigo'` — any authenticated volunteer (with a `rol`)
- `'responsable'` — centro manager session
- `'moderador'` — moderator session

Unauthenticated access to guarded routes redirects to the appropriate login page.

### TypeScript conventions

- Path alias `@/*` → `src/*`
- `noUncheckedIndexedAccess` is enabled — always handle the `undefined` case on indexed access
- Prettier config: `semi: false`, `singleQuote: true`, `printWidth: 100`

### Testing

Tests live alongside source in `src/**/__tests__/` directories. Vitest runs in jsdom. There are currently no test files; `--passWithNoTests` keeps CI green.

### Panel views — design patterns (established in session 27/06/2026)

All panel views share the same visual language after the Figma redesign:

- **Back button:** `background: #e6f2fe; color: #2563eb; border-radius: r-lg` — always top-left, `router.back()` where destination is context-dependent, explicit `router.push` where it is always the same.
- **Cards:** `border: 1px solid var(--c-border); border-radius: var(--r-xl); box-shadow: var(--shadow-md)`.
- **Primary buttons:** `background: #2563eb; border-radius: var(--r-xl); color: #fff`.
- **Secondary/ghost buttons:** `background: #e6f2fe; color: #2563eb; border-radius: var(--r-lg)`.
- **Danger outlined buttons:** `border: 1.5px solid #dc2626; color: #dc2626; background: transparent`.
- **SVG icons:** always inline in the template as const strings (e.g. `ICON_EDITAR`). Use `fill="currentColor"` when the icon must inherit the button color; use a hardcoded fill (e.g. `fill="#585858"`) for fixed-color icons.

### Volunteer management flow

Split into two routes (both require `responsable`):

- `/panel/codigos/crear` → `CrearVoluntarioView` — step 1: form with `etiqueta` field; step 2: success screen showing the plaintext code (only available once). Has inline "Copiar" button + "Compartir Código" (`navigator.share` with clipboard fallback).
- `/panel/codigos` → `CodigosView` — admin list with search, volunteer cards showing `etiqueta` + `creado_en`. "Revocar" calls `codigos.revocarCodigo()` and dims the row. Plaintext code is NOT shown in the list (ADR 0002).

`CodigoVoluntario` has `creado_en?: string | null` (added to `domain.ts`). `CodigoCreado extends CodigoVoluntario { codigo: string }` is defined in `src/api/codigos.ts`.

### Geolocation in RegistrarCentroView

The "Link Google Maps" field has a "Mi ubicación" button that calls `navigator.geolocation.getCurrentPosition()` and fills the field with `https://www.google.com/maps?q=LAT,LNG`. The field is implemented as a custom inline block (not `TextField`) to accommodate the button alongside the input. Shows a spinner while locating and an inline error on permission denial or timeout (10 s).
