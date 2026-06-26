<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import type { MotivoReporte, Reporte } from '@/types/domain'

const reportes = ref<Reporte[]>([])
const cargando = ref(true)
const error = ref('')
const resolviendoId = ref<string | null>(null)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    reportes.value = await mod.listarReportes()
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar los reportes.'
  } finally {
    cargando.value = false
  }
}

async function resolver(r: Reporte) {
  if (!confirm('¿Marcar este reporte como resuelto?')) return
  resolviendoId.value = r.id
  try {
    await mod.resolverReporte(r.id)
    reportes.value = reportes.value.filter((x) => x.id !== r.id)
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al resolver.')
  } finally {
    resolviendoId.value = null
  }
}

const motivoTone = (m: MotivoReporte) =>
  m === 'peligroso' ? 'danger' : m === 'duplicado' ? 'warning' : 'neutral'

const motivoLabel = (m: MotivoReporte) =>
  ({ duplicado: 'Duplicado', falso: 'Falso', peligroso: 'Peligroso', otro: 'Otro' })[m] ?? m

onMounted(cargar)
</script>

<template>
  <div>
    <PageHero title="Reportes pendientes" subtitle="Reportes ciudadanos de centros" />

    <div class="content page-pad">
      <AppSpinner v-if="cargando" label="Cargando reportes…" />
      <p v-else-if="error" class="err">{{ error }}</p>
      <p v-else-if="!reportes.length" class="empty">No hay reportes pendientes. ✓</p>

      <ul v-else class="lista">
        <li v-for="r in reportes" :key="r.id" class="item">
          <div class="item__header">
            <AppBadge :tone="motivoTone(r.motivo)">{{ motivoLabel(r.motivo) }}</AppBadge>
            <span class="item__fecha">{{ new Date(r.reportado_en).toLocaleDateString('es-VE') }}</span>
          </div>
          <p class="item__centro">Centro: <code>{{ r.centro_id }}</code></p>
          <p v-if="r.detalle" class="item__detalle">{{ r.detalle }}</p>
          <div class="item__acciones">
            <AppButton
              size="sm"
              variant="secondary"
              :loading="resolviendoId === r.id"
              @click="resolver(r)"
            >Resolver</AppButton>
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
.lista { list-style: none; display: flex; flex-direction: column; gap: var(--sp-3); }
.item {
  padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); display: flex; flex-direction: column; gap: var(--sp-2);
}
.item__header { display: flex; align-items: center; justify-content: space-between; }
.item__fecha { font-size: var(--fs-xs); color: var(--c-text-faint); }
.item__centro { font-size: var(--fs-xs); color: var(--c-text-muted); }
.item__detalle { font-size: var(--fs-sm); }
.item__acciones { margin-top: var(--sp-1); }
</style>
