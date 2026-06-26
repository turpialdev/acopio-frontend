<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import type { Metricas } from '@/types/domain'

const metricas = ref<Metricas | null>(null)
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    metricas.value = await mod.obtenerMetricas()
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar las métricas.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div>
    <PageHero title="Métricas" subtitle="Estado general del sistema" />

    <div class="content page-pad">
      <AppSpinner v-if="cargando" label="Cargando métricas…" />
      <p v-else-if="error" class="err">{{ error }}</p>

      <template v-else-if="metricas">
        <section class="seccion">
          <h2 class="seccion__titulo">Centros de acopio</h2>
          <div class="cards">
            <div class="card">
              <span class="card__num">{{ metricas.centros.total }}</span>
              <span class="card__label">Total</span>
            </div>
            <div class="card card--success">
              <span class="card__num">{{ metricas.centros.verificados }}</span>
              <span class="card__label">Verificados</span>
            </div>
            <div class="card card--warning">
              <span class="card__num">{{ metricas.centros.sin_verificar }}</span>
              <span class="card__label">Sin verificar</span>
            </div>
            <div class="card card--muted">
              <span class="card__num">{{ metricas.centros.ocultos }}</span>
              <span class="card__label">Ocultos</span>
            </div>
          </div>
        </section>

        <section class="seccion">
          <h2 class="seccion__titulo">Actividad</h2>
          <div class="cards">
            <div class="card card--danger">
              <span class="card__num">{{ metricas.necesidades_urgentes }}</span>
              <span class="card__label">Necesidades urgentes</span>
            </div>
            <div class="card">
              <span class="card__num">{{ metricas.movimientos_total }}</span>
              <span class="card__label">Movimientos registrados</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-5) var(--sp-10); display: flex; flex-direction: column; gap: var(--sp-6); }
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.seccion { display: flex; flex-direction: column; gap: var(--sp-3); }
.seccion__titulo { font-size: var(--fs-base); font-weight: var(--fw-semibold); color: var(--c-text-muted); text-transform: uppercase; letter-spacing: 0.04em; font-size: var(--fs-xs); }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.card {
  padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); display: flex; flex-direction: column; gap: var(--sp-1); align-items: center;
  text-align: center;
}
.card__num { font-size: 2rem; font-weight: var(--fw-bold); font-variant-numeric: tabular-nums; line-height: 1; }
.card__label { font-size: var(--fs-xs); color: var(--c-text-muted); }
.card--success .card__num { color: var(--c-success); }
.card--warning .card__num { color: var(--c-warning); }
.card--danger .card__num { color: var(--c-danger); }
.card--muted .card__num { color: var(--c-text-faint); }
</style>
