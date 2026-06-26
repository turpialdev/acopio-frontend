/**
 * Estado de sesión global (singleton). Mantiene el JWT y los datos derivados
 * en sincronía con localStorage. Lo consumen el header y los guards de ruta.
 */
import { computed, reactive, readonly } from 'vue'
import { clearToken, getToken, setToken } from '@/api/client'
import type { Rol } from '@/types/domain'

type TipoSesion = 'codigo' | 'moderador'

interface SesionState {
  token: string | null
  tipo: TipoSesion | null
  rol: Rol | null
  centroId: string | null
  etiqueta: string | null
  nombre: string | null
}

const META_KEY = 'acopio.sesion'

function cargarMeta(): Partial<SesionState> {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as Partial<SesionState>) : {}
  } catch {
    return {}
  }
}

const inicial = cargarMeta()

const state = reactive<SesionState>({
  token: getToken(),
  tipo: inicial.tipo ?? null,
  rol: inicial.rol ?? null,
  centroId: inicial.centroId ?? null,
  etiqueta: inicial.etiqueta ?? null,
  nombre: inicial.nombre ?? null,
})

function persistirMeta(): void {
  const { token: _token, ...meta } = state
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

export function useAuth() {
  function iniciarSesionCodigo(s: {
    token: string
    rol: Rol
    centroId: string
    etiqueta?: string
  }): void {
    setToken(s.token)
    state.token = s.token
    state.tipo = 'codigo'
    state.rol = s.rol
    state.centroId = s.centroId
    state.etiqueta = s.etiqueta ?? null
    state.nombre = null
    persistirMeta()
  }

  function iniciarSesionModerador(s: { token: string; nombre: string }): void {
    setToken(s.token)
    state.token = s.token
    state.tipo = 'moderador'
    state.rol = null
    state.centroId = null
    state.etiqueta = null
    state.nombre = s.nombre
    persistirMeta()
  }

  function cerrarSesion(): void {
    clearToken()
    localStorage.removeItem(META_KEY)
    state.token = null
    state.tipo = null
    state.rol = null
    state.centroId = null
    state.etiqueta = null
    state.nombre = null
  }

  return {
    sesion: readonly(state),
    estaAutenticado: computed(() => state.token !== null),
    esResponsable: computed(() => state.tipo === 'codigo' && state.rol === 'responsable'),
    esVoluntario: computed(() => state.tipo === 'codigo' && state.rol === 'voluntario'),
    esModerador: computed(() => state.tipo === 'moderador'),
    iniciarSesionCodigo,
    iniciarSesionModerador,
    cerrarSesion,
  }
}
