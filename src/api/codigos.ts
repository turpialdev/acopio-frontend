import { http } from './client'
import type { CodigoVoluntario } from '@/types/domain'

export function listarCodigos(centroId: string): Promise<CodigoVoluntario[]> {
  return http.get<CodigoVoluntario[]>(`/api/centros/${centroId}/codigos/`)
}

/** El `codigo` en texto plano sólo se devuelve aquí, una vez. */
export interface CodigoCreado extends CodigoVoluntario {
  codigo: string
}

export function crearCodigo(centroId: string, etiqueta: string): Promise<CodigoCreado> {
  return http.post<CodigoCreado>(`/api/centros/${centroId}/codigos/`, { etiqueta })
}

export function revocarCodigo(centroId: string, codId: string): Promise<null> {
  return http.delete<null>(`/api/centros/${centroId}/codigos/${codId}/`)
}
