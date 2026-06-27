<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import { centros as centrosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { Ficha, Sugerencia } from '@/types/domain'

const router = useRouter()
const { sesion, esResponsable, cerrarSesion } = useAuth()

const ficha = ref<Ficha | null>(null)
const sugerencias = ref<Sugerencia[]>([])
const cargando = ref(true)
const error = ref('')

const subtitulo = computed(() =>
  ficha.value ? `${ficha.value.municipio}, ${ficha.value.estado}` : '',
)

const ACCIONES_RESPONSABLE = [
  {
    label: 'Editar Ficha del centro',
    to: 'panel-ficha',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-9 9A2 2 0 0 1 6 16H4v-2a2 2 0 0 1 .586-1.414l9-9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: 'Administrar insumos',
    to: 'inventario',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 4h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h2M7 12h2M11 8l1 1 2-2M11 12l1 1 2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: 'Administrar Voluntarios',
    to: 'panel-codigos',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="15" cy="14" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M15 11.5v1M15 16.5v1M12.5 14h1M17 14h1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
]

const ACCIONES_VOLUNTARIO = [
  {
    label: 'Administrar insumos',
    to: 'inventario',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 4h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h2M7 12h2M11 8l1 1 2-2M11 12l1 1 2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
]

const acciones = computed(() =>
  esResponsable.value ? ACCIONES_RESPONSABLE : ACCIONES_VOLUNTARIO,
)

function salir() {
  cerrarSesion()
  router.push({ name: 'home' })
}

onMounted(async () => {
  const id = sesion.centroId
  if (!id) {
    error.value = 'Sesión sin centro asociado.'
    cargando.value = false
    return
  }
  try {
    const [f, s] = await Promise.all([
      centrosApi.obtenerFicha(id),
      centrosApi.obtenerSugerencias(id).catch(() => ({ sugerencias: [] })),
    ])
    ficha.value = f
    sugerencias.value = s.sugerencias
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar el panel.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="panel-wrap">
    <AppSpinner v-if="cargando" label="Cargando panel…" class="spinner" />

    <template v-else>
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Card principal -->
      <div class="card">
        <!-- Nombre del centro -->
        <div class="card__head">
          <h1 class="card__title">Administrar Centro de Acopio</h1>
          <p v-if="ficha" class="card__sub">{{ ficha.nombre }} · {{ subtitulo }}</p>
        </div>

        <!-- Sugerencias (solo responsable) -->
        <div v-if="esResponsable && sugerencias.length" class="sugerencias">
          <div v-for="s in sugerencias" :key="s.categoria_id" class="sug">
            <p class="sug__cat">{{ s.categoria_nombre }}</p>
            <p class="sug__msg">{{ s.mensaje }}</p>
          </div>
        </div>

        <!-- Lista de acciones -->
        <nav class="acciones">
          <button
            v-for="a in acciones"
            :key="a.label"
            class="accion"
            @click="router.push({ name: a.to })"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="accion__icon" v-html="a.icon" />
            <span class="accion__label">{{ a.label }}</span>
          </button>
        </nav>
      </div>

      <!-- Botón reporte -->
      <button class="btn-reporte" @click="router.push({ name: 'movimientos' })">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="4" y="2" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Ver Reporte de insumos
      </button>

      <!-- Cerrar sesión -->
      <button class="btn-salir" @click="salir">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M13 15l4-4-4-4M17 11H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Cerrar sesión
      </button>
    </template>
  </div>
</template>

<style scoped>
.panel-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  max-width: var(--content);
  margin: 0 auto;
  padding: var(--sp-5) var(--sp-4) var(--sp-10);
}

.spinner {
  margin-top: var(--sp-10);
}

.error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}

/* Card */
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card__head {
  padding: var(--sp-5) var(--sp-5) var(--sp-4);
}

.card__title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}

.card__sub {
  margin-top: var(--sp-1);
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}

/* Sugerencias */
.sugerencias {
  margin: 0 var(--sp-5) var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.sug {
  padding: var(--sp-3) var(--sp-4);
  background: var(--c-warning-soft);
  border: 1px solid var(--c-warning);
  border-radius: var(--r-lg);
}

.sug__cat {
  font-weight: var(--fw-bold);
  font-size: var(--fs-sm);
  color: var(--c-warning);
}

.sug__msg {
  font-size: var(--fs-sm);
  margin-top: 2px;
}

/* Acciones */
.acciones {
  display: flex;
  flex-direction: column;
  padding: 0 var(--sp-4) var(--sp-4);
  gap: var(--sp-2);
}

.accion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  background: var(--c-bg);
  border: none;
  border-radius: var(--r-lg);
  cursor: pointer;
  transition: background 0.15s;
  color: var(--c-text);
}

.accion:hover {
  background: var(--c-surface-2);
}

.accion__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--c-text-muted);
}

.accion__label {
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  color: var(--c-text);
}

/* Botón reporte */
.btn-reporte {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: #e6f2fe;
  border: none;
  border-radius: var(--r-xl);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #2563eb;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-reporte:hover {
  background: #d0e8fd;
}

/* Botón cerrar sesión */
.btn-salir {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  width: 100%;
  padding: var(--sp-4);
  background: var(--c-surface);
  border: 1.5px solid #2563eb;
  border-radius: var(--r-xl);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #2563eb;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-salir:hover {
  background: #e6f2fe;
}
</style>
