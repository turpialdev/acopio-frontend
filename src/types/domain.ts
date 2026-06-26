/**
 * Tipos de dominio — espejo de los enums y respuestas del backend.
 * Ver claude_context/FRONTEND.md (sección "Estados controlados").
 */

export type Urgencia = 'urgente' | 'media' | 'leve'
export type TipoMovimiento = 'entrada' | 'salida'
export type CargoResponsable = 'propietario' | 'socio' | 'director' | 'gerente'
export type EstadoVerificacion = 'sin_verificar' | 'verificado' | 'oculto'
export type MotivoReporte = 'duplicado' | 'falso' | 'peligroso' | 'otro'
export type Rol = 'responsable' | 'voluntario'

export interface Categoria {
  id: string
  nombre: string
  es_insumo: boolean
  activa: boolean
}

export interface Necesidad {
  id: string
  categoria_id: string
  categoria_nombre: string
  urgencia: Urgencia
  detalle?: string | null
}

export interface Centro {
  id: string
  nombre: string
  estado: string
  municipio: string
  direccion: string
  contacto?: string | null
  ubicacion_url?: string | null
  lat?: number | null
  lng?: number | null
  estado_verificacion: EstadoVerificacion
  actualizado_en: string
  urgencia_maxima?: Urgencia | null
  necesidades: Necesidad[]
  nombre_responsable?: string | null
  cargo_responsable?: CargoResponsable | null
  telefono_responsable?: string | null
  vialidad?: string | null
}

export interface ContactoEmergencia {
  id: string
  nombre: string
  tipo: string
  zona: string
  telefonos: string[]
  whatsapp_url?: string | null
}

export interface Movimiento {
  id: string
  centro_id: string
  categoria_id: string
  tipo: TipoMovimiento
  cantidad: number
  unidad: string
  nota?: string | null
  contraparte?: string | null
  registrado_por: string
  registrado_en: string
}

/** Ficha completa del centro (incluye datos internos del responsable). */
export interface Ficha extends Centro {
  vialidad?: string | null
  nombre_responsable?: string | null
  telefono_responsable?: string | null
  cargo_responsable?: CargoResponsable | null
}

/** Item editable de necesidad al guardar la ficha. */
export interface NecesidadInput {
  categoria_id: string
  urgencia: Urgencia
  detalle?: string | null
}

export interface TotalCategoria {
  categoria_id: string
  categoria_nombre: string
  entradas: number
  salidas: number
}

export interface Totales {
  nota: string
  categorias: TotalCategoria[]
}

export interface Sugerencia {
  categoria_id: string
  categoria_nombre: string
  entradas_total: number
  salidas_total: number
  urgencia_actual: Urgencia
  mensaje: string
}

export interface CodigoVoluntario {
  id: string
  etiqueta: string
  rol: 'voluntario'
  revocado_en?: string | null
}

/** Respuesta de POST /api/auth/codigo/ */
export interface SesionCodigo {
  token: string
  rol: Rol
  centro_id: string
  etiqueta?: string
}

/** Respuesta de POST /api/auth/moderador/ */
export interface SesionModerador {
  token: string
  moderador_id: string
  nombre: string
}

// ---- Tipos de moderación ----

export interface Reporte {
  id: string
  centro_id: string
  centro_nombre?: string
  motivo: MotivoReporte
  detalle?: string | null
  reportado_en: string
  resuelto: boolean
  resuelto_en?: string | null
}

export interface ModModerador {
  id: string
  nombre: string
  email: string
}

export interface ColaModeracion {
  centros_sin_verificar: Ficha[]
  reportes_pendientes: Reporte[]
}

export interface Metricas {
  centros: {
    total: number
    verificados: number
    sin_verificar: number
    ocultos: number
  }
  necesidades_urgentes: number
  movimientos_total: number
}
