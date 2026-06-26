import { http, qs } from './client'
import type { ContactoEmergencia } from '@/types/domain'

export function listarContactosEmergencia(zona?: string): Promise<ContactoEmergencia[]> {
  return http.get<ContactoEmergencia[]>(
    `/api/contactos-emergencia/${qs({ zona })}`,
    { auth: false },
  )
}
