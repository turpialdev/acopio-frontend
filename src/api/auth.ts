import { http } from './client'
import type { SesionCodigo, SesionModerador } from '@/types/domain'

/** Canjea un código de gestión por un JWT. */
export function loginConCodigo(codigo: string): Promise<SesionCodigo> {
  return http.post<SesionCodigo>('/api/auth/codigo/', { codigo }, { auth: false })
}

/** Login de moderador (email + password). */
export function loginModerador(
  email: string,
  password: string,
): Promise<SesionModerador> {
  return http.post<SesionModerador>(
    '/api/auth/moderador/',
    { email, password },
    { auth: false },
  )
}
