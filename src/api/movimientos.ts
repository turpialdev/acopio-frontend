import { http, qs } from './client'
import type { Movimiento, TipoMovimiento } from '@/types/domain'

/**
 * Endpoints anidados bajo el centro (ver FRONTEND.md). El `centro_id` va en la
 * URL y el backend verifica que coincida con el del JWT (check_centro).
 */

export type MovimientoFiltro = {
  tipo?: TipoMovimiento
  categoria_id?: string
}

export function listarMovimientos(
  centroId: string,
  filtro: MovimientoFiltro = {},
): Promise<Movimiento[]> {
  return http.get<Movimiento[]>(`/api/centros/${centroId}/movimientos/${qs(filtro)}`)
}

export interface NuevoMovimiento {
  categoria_id: string
  tipo: TipoMovimiento
  cantidad?: number | null
  unidad?: string | null
  nota?: string | null
  contraparte?: string | null
}

export function crearMovimiento(centroId: string, data: NuevoMovimiento): Promise<Movimiento> {
  return http.post<Movimiento>(`/api/centros/${centroId}/movimientos/`, data)
}

/** Sólo cantidad/unidad/nota son editables (centro_id, categoria_id y tipo son inmutables). */
export type CorreccionMovimiento = Partial<Pick<NuevoMovimiento, 'cantidad' | 'unidad' | 'nota'>>

export function corregirMovimiento(
  centroId: string,
  movId: string,
  data: CorreccionMovimiento,
): Promise<Movimiento> {
  return http.patch<Movimiento>(`/api/centros/${centroId}/movimientos/${movId}/`, data)
}
