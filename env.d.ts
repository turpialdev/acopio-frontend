/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend. En local: http://localhost:8000 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
