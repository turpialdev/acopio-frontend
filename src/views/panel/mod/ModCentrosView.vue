<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import type { EstadoVerificacion, Ficha } from '@/types/domain'

const router = useRouter()

const centros = ref<Ficha[]>([])
const cargando = ref(true)
const error = ref('')
const q = ref('')
const filtroEstado = ref<EstadoVerificacion | ''>('')

const TABS: { label: string; value: EstadoVerificacion | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Sin verificar', value: 'sin_verificar' },
  { label: 'Verificados', value: 'verificado' },
  { label: 'Ocultos', value: 'oculto' },
]

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    centros.value = await mod.listarCentros({
      q: q.value || undefined,
      estado_verificacion: filtroEstado.value || undefined,
    })
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar la lista.'
  } finally {
    cargando.value = false
  }
}

async function verificar(c: Ficha) {
  try {
    const updated = await mod.verificarCentro(c.id)
    c.estado_verificacion = updated.estado_verificacion
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al verificar.')
  }
}

async function ocultar(c: Ficha) {
  if (!confirm(`¿Ocultar "${c.nombre}" del directorio público?`)) return
  try {
    const updated = await mod.ocultarCentro(c.id)
    c.estado_verificacion = updated.estado_verificacion
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al ocultar.')
  }
}

function verFicha(id: string) {
  router.push({ name: 'mod-centro', params: { id } })
}

const badgeTone = (ev: EstadoVerificacion) =>
  ev === 'verificado' ? 'success' : ev === 'oculto' ? 'danger' : 'neutral'

const badgeLabel = (ev: EstadoVerificacion) =>
  ev === 'verificado' ? 'Verificado' : ev === 'oculto' ? 'Oculto' : 'Sin verificar'

onMounted(cargar)
</script>

<template>
  <div>
    <PageHero title="Centros de acopio" subtitle="Verificar, ocultar y gestionar centros" />

    <div class="content page-pad">
      <div class="toolbar">
        <input
          v-model="q"
          class="search"
          placeholder="Buscar por nombre…"
          @keyup.enter="cargar"
        />
        <AppButton size="sm" variant="secondary" @click="cargar">Buscar</AppButton>
      </div>

      <div class="tabs">
        <button
          v-for="t in TABS"
          :key="t.value"
          class="tab"
          :class="{ 'tab--active': filtroEstado === t.value }"
          @click="filtroEstado = t.value; cargar()"
        >
          {{ t.label }}
        </button>
      </div>

      <AppSpinner v-if="cargando" label="Cargando centros…" />
      <p v-else-if="error" class="err">{{ error }}</p>
      <p v-else-if="!centros.length" class="empty">No hay centros con este filtro.</p>

      <ul v-else class="lista">
        <li v-for="c in centros" :key="c.id" class="item">
          <div class="item__header">
            <span class="item__nombre">{{ c.nombre }}</span>
            <AppBadge :tone="badgeTone(c.estado_verificacion)">
              {{ badgeLabel(c.estado_verificacion) }}
            </AppBadge>
          </div>
          <p class="item__loc">{{ c.municipio }}, {{ c.estado }}</p>
          <p class="item__dir">{{ c.direccion }}</p>
          <div class="item__acciones">
            <AppButton
              v-if="c.estado_verificacion !== 'verificado'"
              size="sm"
              @click="verificar(c)"
            >Verificar</AppButton>
            <AppButton
              v-if="c.estado_verificacion !== 'oculto'"
              size="sm"
              variant="secondary"
              @click="ocultar(c)"
            >Ocultar</AppButton>
            <AppButton size="sm" variant="outline" @click="verFicha(c.id)">Ver ficha</AppButton>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-5) var(--sp-10); display: flex; flex-direction: column; gap: var(--sp-4); }
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.empty { color: var(--c-text-muted); font-size: var(--fs-sm); }
.toolbar { display: flex; gap: var(--sp-2); }
.search {
  flex: 1; padding: var(--sp-2) var(--sp-3); border: 1px solid var(--c-border);
  border-radius: var(--r-md); font-size: var(--fs-sm); background: var(--c-surface);
}
.tabs { display: flex; gap: var(--sp-2); flex-wrap: wrap; }
.tab {
  padding: var(--sp-1) var(--sp-3); border-radius: var(--r-full);
  border: 1px solid var(--c-border); font-size: var(--fs-sm);
  background: var(--c-surface); cursor: pointer; color: var(--c-text-muted);
}
.tab--active { background: var(--c-primary-500); color: var(--c-text-invert); border-color: var(--c-primary-500); }
.lista { list-style: none; display: flex; flex-direction: column; gap: var(--sp-3); }
.item {
  padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); display: flex; flex-direction: column; gap: var(--sp-2);
}
.item__header { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-2); }
.item__nombre { font-weight: var(--fw-semibold); }
.item__loc { font-size: var(--fs-xs); color: var(--c-text-muted); }
.item__dir { font-size: var(--fs-sm); color: var(--c-text-faint); }
.item__acciones { display: flex; gap: var(--sp-2); flex-wrap: wrap; margin-top: var(--sp-1); }
</style>
