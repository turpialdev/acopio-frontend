<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { codigos as codigosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { CodigoVoluntario } from '@/types/domain'

const router = useRouter()
const { sesion } = useAuth()

const lista = ref<CodigoVoluntario[]>([])
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const revocando = ref<string | null>(null)

const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return lista.value
  return lista.value.filter((c) => c.etiqueta.toLowerCase().includes(q))
})

async function eliminar(c: CodigoVoluntario) {
  const id = sesion.centroId
  if (!id) return
  revocando.value = c.id
  try {
    await codigosApi.revocarCodigo(id, c.id)
    c.revocado_en = new Date().toISOString()
  } catch {
    /* ignora */
  } finally {
    revocando.value = null
  }
}

function fechaCreacion(c: CodigoVoluntario): string {
  if (!c.creado_en) return ''
  const d = new Date(c.creado_en)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

onMounted(async () => {
  const id = sesion.centroId
  if (!id) {
    error.value = 'Sesión sin centro asociado.'
    cargando.value = false
    return
  }
  try {
    lista.value = await codigosApi.listarCodigos(id)
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudieron cargar los códigos.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="content wrap">

      <!-- Volver -->
      <button class="back" type="button" @click="router.push({ name: 'panel-centro' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        Volver
      </button>

      <h1 class="encabezado__titulo">Administrar Voluntarios</h1>

      <!-- Buscador card -->
      <div class="buscar-card">
        <div class="buscar__field">
          <svg class="buscar__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <input v-model="busqueda" class="buscar__input" type="text" placeholder="Buscar voluntarios"
            aria-label="Buscar voluntarios" />
        </div>
        <button class="btn-buscar" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Buscar
        </button>
      </div>

      <!-- Spinner / Error -->
      <AppSpinner v-if="cargando" label="Cargando voluntarios…" />

      <EmptyState v-else-if="error" icon="⚠" tone="error" title="Error" :description="error" />

      <EmptyState v-else-if="!filtrados.length" icon="👤" title="Sin voluntarios"
        description="No hay voluntarios registrados aún." />

      <!-- Lista de voluntarios -->
      <div v-else class="lista">
        <article v-for="c in filtrados" :key="c.id" class="vol-card" :class="{ 'vol-card--revocado': c.revocado_en }">
          <div class="vol__info">
            <p class="vol__nombre">{{ c.etiqueta || 'Sin etiqueta' }}</p>
            <p v-if="fechaCreacion(c)" class="vol__fecha">
              Fecha de creación: {{ fechaCreacion(c) }}
            </p>
            <p v-if="c.revocado_en" class="vol__revocado">Revocado</p>
          </div>

          <div v-if="!c.revocado_en" class="vol__acciones">
            <button class="btn-revocar" type="button" :disabled="revocando === c.id" @click="eliminar(c)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8L12.667 4"
                  stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ revocando === c.id ? '…' : 'Revocar' }}
            </button>
          </div>
        </article>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--c-surface);
}

.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding-block: var(--sp-5) var(--sp-12);
}

/* Volver */
.back {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: #e6f2fe;
  border: 1px solid transparent;
  border-radius: var(--r-lg);
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
  align-self: flex-start;
}

.back:hover {
  border-color: #2563eb;
}

/* Encabezado */
.encabezado__titulo {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}

/* Buscador card */
.buscar-card {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}

.buscar-card__titulo {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}

.buscar__field {
  position: relative;
}

.buscar__icon {
  position: absolute;
  left: var(--sp-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-faint);
  pointer-events: none;
}

.buscar__input {
  width: 100%;
  padding: var(--sp-4) var(--sp-4) var(--sp-4) calc(var(--sp-4) + 18px + var(--sp-2));
  border: none;
  border-radius: var(--r-lg);
  background: var(--c-surface-2);
  font-size: var(--fs-base);
  color: var(--c-text);
}

.buscar__input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #2563eb40;
}

.btn-buscar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  width: 100%;
  padding: var(--sp-4);
  background: #2563eb;
  border: none;
  border-radius: var(--r-xl);
  color: #fff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  cursor: pointer;
}

.btn-buscar:hover {
  background: #1d4ed8;
}

/* Lista */
.lista {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

/* Tarjeta voluntario */
.vol-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}

.vol-card--revocado {
  opacity: 0.55;
}

.vol__info {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  min-width: 0;
}

.vol__nombre {
  font-size: var(--fs-base);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}

.vol__fecha {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}

.vol__revocado {
  font-size: var(--fs-xs);
  color: var(--c-danger);
  font-weight: var(--fw-semibold);
}

.vol__acciones {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

/* Botón revocar */
.btn-revocar {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  background: transparent;
  border: 1.5px solid #dc2626;
  border-radius: var(--r-lg);
  color: #dc2626;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-revocar:hover:not(:disabled) {
  background: #fee2e2;
}

.btn-revocar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
