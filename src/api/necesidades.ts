import { http } from './client'
import type { Necesidad, Urgencia } from '@/types/domain'

export interface NuevaNecesidad {
  centro_id: string
  categoria_id: string
  urgencia: Urgencia
  detalle?: string
}

export function crearNecesidad(data: NuevaNecesidad): Promise<Necesidad> {
  return http.post<Necesidad>('/api/necesidades/', data)
}
