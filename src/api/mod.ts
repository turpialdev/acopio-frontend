import { http, qs } from './client'
import type { Categoria, ContactoEmergencia, Ficha } from '@/types/domain'
import type { ColaModeracion, Metricas, ModModerador, Reporte } from '@/types/domain'

// ---- Cola ----

export function obtenerCola(): Promise<ColaModeracion> {
  return http.get<ColaModeracion>('/api/mod/cola/')
}

// ---- Centros ----

export function listarCentros(filtro: { q?: string; estado_verificacion?: string } = {}): Promise<Ficha[]> {
  return http.get<Ficha[]>(`/api/mod/centros/${qs(filtro)}`)
}

export function obtenerCentro(id: string): Promise<Ficha> {
  return http.get<Ficha>(`/api/mod/centros/${id}/`)
}

export function crearCentro(data: {
  nombre: string
  estado: string
  municipio: string
  direccion: string
  nombre_responsable: string
  telefono_responsable: string
  cargo_responsable: string
}): Promise<Ficha & { codigo_raiz: string }> {
  return http.post<Ficha & { codigo_raiz: string }>('/api/mod/centros/', data)
}

export function actualizarCentro(id: string, data: Record<string, unknown>): Promise<Ficha> {
  return http.patch<Ficha>(`/api/mod/centros/${id}/`, data)
}

export function verificarCentro(id: string): Promise<Ficha> {
  return http.post<Ficha>(`/api/mod/centros/${id}/verificar/`)
}

export function ocultarCentro(id: string): Promise<Ficha> {
  return http.post<Ficha>(`/api/mod/centros/${id}/ocultar/`)
}

export function reemitirCodigo(id: string): Promise<{ codigo_raiz: string }> {
  return http.post<{ codigo_raiz: string }>(`/api/mod/centros/${id}/reemitir-codigo/`)
}

export function fusionarCentros(
  centroA: string,
  centroB: string,
  conservar: string,
): Promise<{ conservado: Ficha; descartado_id: string }> {
  return http.post('/api/mod/centros/fusionar/', {
    centro_a: centroA,
    centro_b: centroB,
    conservar,
  })
}

// ---- Reportes ----

export function listarReportes(motivo?: string): Promise<Reporte[]> {
  const params = { estado: 'pendiente', ...(motivo ? { motivo } : {}) }
  return http.get<Reporte[]>(`/api/mod/reportes/${qs(params)}`)
}

export function resolverReporte(id: string): Promise<Reporte> {
  return http.post<Reporte>(`/api/mod/reportes/${id}/resolver/`)
}

// ---- Catálogo ----

export function listarCatalogo(): Promise<Categoria[]> {
  return http.get<Categoria[]>('/api/mod/catalogo/')
}

export function crearCategoria(data: { nombre: string; es_insumo: boolean }): Promise<Categoria> {
  return http.post<Categoria>('/api/mod/catalogo/', data)
}

export function actualizarCategoria(id: string, data: Partial<Categoria>): Promise<Categoria> {
  return http.patch<Categoria>(`/api/mod/catalogo/${id}/`, data)
}

// ---- Moderadores ----

export function listarModeradores(): Promise<ModModerador[]> {
  return http.get<ModModerador[]>('/api/mod/moderadores/')
}

export function crearModerador(data: {
  nombre: string
  email: string
  password: string
}): Promise<ModModerador> {
  return http.post<ModModerador>('/api/mod/moderadores/', data)
}

export function eliminarModerador(id: string): Promise<null> {
  return http.delete<null>(`/api/mod/moderadores/${id}/`)
}

// ---- Contactos de emergencia ----

export function listarContactos(): Promise<ContactoEmergencia[]> {
  return http.get<ContactoEmergencia[]>('/api/mod/contactos-emergencia/')
}

export function crearContacto(
  data: Omit<ContactoEmergencia, 'id'>,
): Promise<ContactoEmergencia> {
  return http.post<ContactoEmergencia>('/api/mod/contactos-emergencia/', data)
}

export function actualizarContacto(
  id: string,
  data: Partial<Omit<ContactoEmergencia, 'id'>>,
): Promise<ContactoEmergencia> {
  return http.patch<ContactoEmergencia>(`/api/mod/contactos-emergencia/${id}/`, data)
}

export function eliminarContacto(id: string): Promise<null> {
  return http.delete<null>(`/api/mod/contactos-emergencia/${id}/`)
}

// ---- Métricas ----

export function obtenerMetricas(): Promise<Metricas> {
  return http.get<Metricas>('/api/mod/metricas/')
}
