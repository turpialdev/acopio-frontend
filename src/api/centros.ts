import { http, qs } from './client'
import type { Centro, CargoResponsable } from '@/types/domain'

export type CentroFiltro = {
  q?: string
  estado?: string
  municipio?: string
  categoria?: string
  urgencia?: string
}

export function listarCentros(filtro: CentroFiltro = {}): Promise<Centro[]> {
  return http.get<Centro[]>(`/api/centros/${qs(filtro)}`, { auth: false })
}

export function obtenerCentro(id: string): Promise<Centro> {
  return http.get<Centro>(`/api/centros/${id}/`, { auth: false })
}

export interface NuevoCentro {
  nombre: string
  estado: string
  municipio: string
  direccion: string
  nombre_responsable: string
  telefono_responsable: string
  cargo_responsable: CargoResponsable
}

/** El POST devuelve `codigo_raiz` UNA SOLA VEZ. */
export interface CentroCreado {
  id: string
  nombre: string
  codigo_raiz: string
}

export function crearCentro(data: NuevoCentro): Promise<CentroCreado> {
  return http.post<CentroCreado>('/api/centros/', data, { auth: false })
}
