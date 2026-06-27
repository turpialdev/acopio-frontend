import { http, qs } from './client'
import type {
  Centro,
  CargoResponsable,
  Ficha,
  NecesidadInput,
  Sugerencia,
  Totales,
} from '@/types/domain'

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
  contacto?: string
  horario?: string
  ubicacion_url?: string
  vialidad?: string
  nombre_responsable: string
  telefono_responsable: string
  cargo_responsable: CargoResponsable
  necesidades?: NecesidadInput[]
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

/** Reporta un centro (público). */
export function reportarCentro(
  id: string,
  data: { motivo: string; detalle?: string },
): Promise<unknown> {
  return http.post(`/api/centros/${id}/reportar/`, data, { auth: false })
}

// ---- Panel del responsable (JWT de código) ----

export function obtenerFicha(centroId: string): Promise<Ficha> {
  return http.get<Ficha>(`/api/centros/${centroId}/ficha/`)
}

/** Campos editables de la ficha. `necesidades` reemplaza el array completo. */
export type FichaPatch = Partial<{
  nombre: string
  estado: string
  municipio: string
  direccion: string
  contacto: string | null
  horario: string | null
  ubicacion_url: string | null
  vialidad: string | null
  nombre_responsable: string | null
  telefono_responsable: string | null
  cargo_responsable: CargoResponsable | null
  necesidades: NecesidadInput[]
}>

export function actualizarFicha(centroId: string, data: FichaPatch): Promise<Ficha> {
  return http.patch<Ficha>(`/api/centros/${centroId}/ficha/`, data)
}

export function obtenerTotales(centroId: string): Promise<Totales> {
  return http.get<Totales>(`/api/centros/${centroId}/totales/`)
}

export function obtenerSugerencias(centroId: string): Promise<{ sugerencias: Sugerencia[] }> {
  return http.get<{ sugerencias: Sugerencia[] }>(`/api/centros/${centroId}/sugerencias/`)
}
