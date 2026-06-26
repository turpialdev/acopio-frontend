/**
 * Cliente HTTP compartido. Toda llamada al backend pasa por aquí:
 * arma la URL base, inyecta el JWT, y normaliza el manejo de errores.
 */

export const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://acopio-prod-2137653306.us-east-2.elb.amazonaws.com'

const TOKEN_KEY = 'acopio.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// Mensajes de validación de Django REST Framework → español.
const DRF_ERRORS: Array<[RegExp, string]> = [
  [/Ensure this field has no more than (\d+) characters?\./i, 'No puede superar los $1 caracteres.'],
  [/Ensure this field has at least (\d+) characters?\./i, 'Debe tener al menos $1 caracteres.'],
  [/This field is required\./i, 'Este campo es requerido.'],
  [/This field may not be blank\./i, 'Este campo no puede estar vacío.'],
  [/This field may not be null\./i, 'Este campo no puede ser nulo.'],
  [/Enter a valid email address\./i, 'Ingresa un correo electrónico válido.'],
  [/A valid integer is required\./i, 'Se requiere un número entero válido.'],
  [/A valid number is required\./i, 'Se requiere un número válido.'],
  [/Ensure this value is greater than or equal to (\d+)\./i, 'El valor debe ser mayor o igual a $1.'],
  [/Ensure this value is less than or equal to (\d+)\./i, 'El valor debe ser menor o igual a $1.'],
]

function translateError(msg: string): string {
  for (const [pattern, replacement] of DRF_ERRORS) {
    if (pattern.test(msg)) return msg.replace(pattern, replacement)
  }
  return msg
}

/**
 * Error de API con el status HTTP y el cuerpo ya parseado.
 * - 400: errores de validación por campo  -> `fields`
 * - 401/403/404: error general            -> `detail`
 */
export class ApiError extends Error {
  status: number
  detail?: string
  fields?: Record<string, string[]>

  constructor(status: number, body: unknown) {
    const record = (body ?? {}) as Record<string, unknown>
    const detail =
      typeof record.detail === 'string' ? record.detail : undefined
    super(detail ?? `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    // Si no hay `detail`, asumimos errores de validación por campo.
    if (!detail && body && typeof body === 'object') {
      const raw = body as Record<string, string[]>
      this.fields = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v.map(translateError) : v]),
      )
    }
  }

  /** Primer mensaje legible para mostrar en un toast / banner. */
  get firstMessage(): string {
    if (this.detail) return this.detail
    if (this.fields) {
      const first = Object.values(this.fields)[0]
      if (Array.isArray(first) && first[0]) return first[0]
    }
    return this.message
  }
}

interface RequestOptions {
  /** Si es `false`, no envía el header Authorization aunque haya token. */
  auth?: boolean
  /** Sobrescribe el token usado (p. ej. justo después de loguear). */
  token?: string
  signal?: AbortSignal
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = opts.token ?? (opts.auth === false ? null : getToken())
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: opts.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, { detail: 'No se pudo conectar con el servidor.' })
  }

  if (!res.ok) {
    const parsed = await res.json().catch(() => null)
    throw new ApiError(res.status, parsed)
  }
  if (res.status === 204) return null as T
  return res.json() as Promise<T>
}

export const http = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>('GET', path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, body, opts),
  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, undefined, opts),
}

/** Construye un query string ignorando valores vacíos/undefined. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  )
  if (entries.length === 0) return ''
  const sp = new URLSearchParams()
  for (const [k, v] of entries) sp.append(k, String(v))
  return `?${sp.toString()}`
}
