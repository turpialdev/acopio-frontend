import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

/**
 * `meta.requiere` declara qué tipo de sesión exige una ruta.
 * El guard global redirige al acceso correspondiente si no se cumple.
 */
type Requiere = 'codigo' | 'responsable' | 'moderador'

declare module 'vue-router' {
  interface RouteMeta {
    requiere?: Requiere
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/DirectorioView.vue'),
  },
  {
    path: '/acceder',
    name: 'acceder',
    component: () => import('@/views/auth/AccederView.vue'),
  },
  {
    path: '/moderador',
    name: 'moderador',
    component: () => import('@/views/auth/ModeradorLoginView.vue'),
  },
  {
    path: '/registrar',
    name: 'registrar',
    component: () => import('@/views/registro/RegistrarCentroView.vue'),
  },
  {
    path: '/panel',
    name: 'panel-centro',
    component: () => import('@/views/panel/PanelCentroView.vue'),
    meta: { requiere: 'responsable' },
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: () => import('@/views/panel/InventarioView.vue'),
    meta: { requiere: 'codigo' },
  },
  {
    path: '/moderacion',
    name: 'moderacion',
    component: () => import('@/views/panel/ModeracionView.vue'),
    meta: { requiere: 'moderador' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const req = to.meta.requiere
  if (!req) return true

  const { estaAutenticado, esResponsable, esModerador } = useAuth()
  if (!estaAutenticado.value) {
    return { name: req === 'moderador' ? 'moderador' : 'acceder' }
  }
  if (req === 'responsable' && !esResponsable.value) return { name: 'acceder' }
  if (req === 'moderador' && !esModerador.value) return { name: 'moderador' }
  return true
})

export default router
