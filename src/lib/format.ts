import type { Urgencia, EstadoVerificacion } from '@/types/domain'

/** Etiqueta + color CSS por urgencia (ADR 0005). */
export const URGENCIA_META: Record<Urgencia, { label: string; varName: string }> = {
  urgente: { label: 'Urgente', varName: '--c-urgente' },
  media: { label: 'Media', varName: '--c-media' },
  leve: { label: 'Leve', varName: '--c-leve' },
}

export const VERIFICACION_META: Record<
  EstadoVerificacion,
  { label: string; tone: 'success' | 'neutral' | 'danger' }
> = {
  verificado: { label: 'Verificado', tone: 'success' },
  sin_verificar: { label: 'Sin verificar', tone: 'neutral' },
  oculto: { label: 'Oculto', tone: 'danger' },
}

/** "hace 5 min", "hace 3 h", "hace 2 días" o fecha corta. */
export function tiempoRelativo(iso: string): string {
  const fecha = new Date(iso)
  const diffMs = Date.now() - fecha.getTime()
  const min = Math.round(diffMs / 60000)
  if (min < 1) return 'hace instantes'
  if (min < 60) return `hace ${min} min`
  const horas = Math.round(min / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  if (dias <= 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  return fecha.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
