<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import { centros as centrosApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import type { Ficha, Sugerencia } from '@/types/domain'

const router = useRouter()
const { sesion, esResponsable } = useAuth()

const ficha = ref<Ficha | null>(null)
const sugerencias = ref<Sugerencia[]>([])
const cargando = ref(true)
const error = ref('')

const subtitulo = computed(() =>
  ficha.value ? `${ficha.value.municipio}, ${ficha.value.estado}` : '',
)

const ACCIONES_RESPONSABLE = [
  { label: 'Editar ficha', desc: 'Datos públicos y necesidades', to: 'panel-ficha' },
  { label: 'Inventario', desc: 'Registrar entradas y salidas', to: 'inventario' },
  { label: 'Ver movimientos', desc: 'Historial del centro', to: 'movimientos' },
  { label: 'Códigos de voluntario', desc: 'Crear y revocar accesos', to: 'panel-codigos' },
]

const ACCIONES_VOLUNTARIO = [
  { label: 'Inventario', desc: 'Registrar entradas y salidas', to: 'inventario' },
  { label: 'Ver movimientos', desc: 'Historial del centro', to: 'movimientos' },
]

const acciones = computed(() =>
  esResponsable.value ? ACCIONES_RESPONSABLE : ACCIONES_VOLUNTARIO,
)

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
  <div>
    <PageHero :title="ficha?.nombre ?? 'Mi centro'" :subtitle="subtitulo">
      <template #icon>
        <IconPersonAdd />
      </template>
    </PageHero>

    <div class="content page-pad">
      <AppSpinner v-if="cargando" label="Cargando panel…" />

      <template v-else>
        <p v-if="error" class="error">{{ error }}</p>

        <!-- Sugerencias del inventario (ADR 0005) — solo para el responsable -->
        <section v-if="esResponsable && sugerencias.length" class="sugerencias">
          <h2 class="section-title">Sugerencias del inventario</h2>
          <div v-for="s in sugerencias" :key="s.categoria_id" class="sug">
            <p class="sug__cat">{{ s.categoria_nombre }}</p>
            <p class="sug__msg">{{ s.mensaje }}</p>
            <p class="sug__nums">
              Total · entradas {{ s.entradas_total }} · salidas {{ s.salidas_total }}
            </p>
          </div>
        </section>

        <!-- Acciones -->
        <section class="acciones">
          <button v-for="a in acciones" :key="a.to" class="accion" @click="router.push({ name: a.to })">
            <span class="accion__label">{{ a.label }}</span>
            <span class="accion__desc">{{ a.desc }}</span>
          </button>
        </section>

      </template>
    </div>
  </div>
</template>

<style scoped>
.page-pad {
  padding-block: var(--sp-5) var(--sp-10);
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.error {
  color: var(--c-danger);
  font-size: var(--fs-sm);
}

.section-title {
  font-size: var(--fs-lg);
  margin-bottom: var(--sp-3);
}

.sugerencias {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.sug {
  padding: var(--sp-4);
  background: var(--c-warning-soft);
  border: 1px solid var(--c-warning);
  border-radius: var(--r-md);
}

.sug__cat {
  font-weight: var(--fw-bold);
  color: var(--c-warning);
}

.sug__msg {
  font-size: var(--fs-sm);
  margin-top: var(--sp-1);
}

.sug__nums {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
  margin-top: var(--sp-2);
}

.acciones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.accion {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: var(--sp-4);
  text-align: left;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.accion:hover {
  border-color: var(--c-primary-300);
  box-shadow: var(--shadow-md);
}

.accion__label {
  font-weight: var(--fw-semibold);
  color: var(--c-primary-700);
}

.accion__desc {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}

@media (max-width: 420px) {
  .acciones {
    grid-template-columns: 1fr;
  }
}
</style>
