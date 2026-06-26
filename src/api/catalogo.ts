import { http, qs } from './client'
import type { Categoria } from '@/types/domain'

export type CatalogoFiltro = {
  es_insumo?: boolean
  activa?: boolean
}

export function listarCategorias(filtro: CatalogoFiltro = {}): Promise<Categoria[]> {
  return http.get<Categoria[]>(`/api/catalogo/${qs(filtro)}`, { auth: false })
}
