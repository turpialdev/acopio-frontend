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

/** "24/06/2026 - 10:25 AM" — formato de "ÚLTIMA ACTUALIZACIÓN". */
export function fechaHora(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hora = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return `${dd}/${mm}/${yyyy} - ${hora}`
}

/** "10:32 a. m." — hora local corta. */
export function horaCorta(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** "25 JUN 2026" — etiqueta de día en mayúsculas. */
export function fechaDia(iso: string): string {
  return new Date(iso)
    .toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace(/\./g, '')
    .toUpperCase()
}

/** ¿La fecha cae en el día local de hoy? */
export function esHoy(iso: string): boolean {
  const d = new Date(iso)
  const n = new Date()
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  )
}

/** Minutos transcurridos desde una fecha ISO. */
export function minutosDesde(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 60000
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
