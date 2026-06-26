# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
