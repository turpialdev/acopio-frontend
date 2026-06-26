<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CategoryFilter from '@/components/public/CategoryFilter.vue'
import CentroCard from '@/components/public/CentroCard.vue'
import EmergencyContacts from '@/components/public/EmergencyContacts.vue'
import { catalogo, centros as centrosApi, ApiError } from '@/api'
import type { Categoria, Centro, Urgencia } from '@/types/domain'

const router = useRouter()

const categorias = ref<Categoria[]>([])
const lista = ref<Centro[]>([])
const cargando = ref(true)
const error = ref('')

// --- Filtros ---
const busqueda = ref('')
const categoriaSel = ref<string | null>(null)
const urgenciaSel = ref<Urgencia | null>(null)

const URGENCIAS: { value: Urgencia; label: string }[] = [
  { value: 'urgente', label: 'Urgente' },
  { value: 'media', label: 'Media' },
  { value: 'leve', label: 'Leve' },
]

let debounce: ReturnType<typeof setTimeout> | undefined
let peticion = 0

async function buscar() {
  const turno = ++peticion
  cargando.value = true
  error.value = ''
  try {
    const data = await centrosApi.listarCentros({
      q: busqueda.value || undefined,
      categoria: categoriaSel.value ?? undefined,
      urgencia: urgenciaSel.value ?? undefined,
    })
    if (turno !== peticion) return // descarta respuestas obsoletas
    lista.value = data
  } catch (e) {
    if (turno !== peticion) return
    error.value = e instanceof ApiError ? e.firstMessage : 'Error al cargar centros.'
  } finally {
    if (turno === peticion) cargando.value = false
  }
}

// Texto: con debounce. Pills: inmediato.
watch(busqueda, () => {
  clearTimeout(debounce)
  debounce = setTimeout(buscar, 350)
})
watch([categoriaSel, urgenciaSel], buscar)

function alternarUrgencia(u: Urgencia) {
  urgenciaSel.value = urgenciaSel.value === u ? null : u
}

onMounted(async () => {
  try {
    categorias.value = await catalogo.listarCategorias({ es_insumo: true, activa: true })
  } catch {
    /* el filtro de categorías es opcional; si falla, seguimos sin pills */
  }
  await buscar()
})
</script>

<template>
  <div class="dir">
    <!-- Hero + accesos -->
    <section class="hero">
      <div class="container hero__inner">
        <h1 class="hero__title">Directorio de centros de acopio</h1>
        <p class="hero__subtitle">
          Encuentra centros activos cerca de ti, revisa qué insumos necesitan y cómo
          contactarlos.
        </p>

        <div class="hero__access">
          <AppButton variant="primary" size="lg" @click="router.push({ name: 'registrar' })">
            Registrar un centro
          </AppButton>
          <AppButton variant="secondary" size="lg" @click="router.push({ name: 'acceder' })">
            Tengo un código de acceso
          </AppButton>
          <AppButton variant="ghost" size="lg" @click="router.push({ name: 'moderador' })">
            Soy moderador
          </AppButton>
        </div>
      </div>
    </section>

    <div class="container dir__body">
      <!-- Búsqueda y filtros -->
      <div class="filters">
        <div class="search">
          <span class="search__icon" aria-hidden="true">⌕</span>
          <input
            v-model="busqueda"
            class="search__input"
            type="search"
            placeholder="Buscar por nombre del centro…"
            aria-label="Buscar centros"
          />
        </div>

        <CategoryFilter
          v-if="categorias.length"
          v-model="categoriaSel"
          :categorias="categorias"
        />

        <div class="urg">
          <span class="urg__label">Urgencia:</span>
          <button
            v-for="u in URGENCIAS"
            :key="u.value"
            class="urg__chip"
            :class="[`urg__chip--${u.value}`, { 'is-active': urgenciaSel === u.value }]"
            @click="alternarUrgencia(u.value)"
          >
            {{ u.label }}
          </button>
        </div>
      </div>

      <EmergencyContacts class="dir__emerg" />

      <!-- Resultados -->
      <AppSpinner v-if="cargando" label="Cargando centros…" />

      <EmptyState
        v-else-if="error"
        icon="⚠"
        tone="error"
        title="No se pudieron cargar los centros"
        :description="error"
      >
        <template #action>
          <AppButton variant="secondary" @click="buscar">Reintentar</AppButton>
        </template>
      </EmptyState>

      <EmptyState
        v-else-if="!lista.length"
        icon="🔍"
        title="Sin resultados"
        description="No hay centros que coincidan con los filtros aplicados."
      />

      <template v-else>
        <p class="dir__count">{{ lista.length }} centro{{ lista.length === 1 ? '' : 's' }}</p>
        <div class="grid">
          <CentroCard v-for="c in lista" :key="c.id" :centro="c" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(180deg, var(--c-primary-50), var(--c-bg));
  border-bottom: 1px solid var(--c-border);
}
.hero__inner {
  padding-block: var(--sp-12);
  text-align: center;
}
.hero__title {
  font-size: var(--fs-3xl);
  font-weight: var(--fw-bold);
}
.hero__subtitle {
  max-width: 52ch;
  margin: var(--sp-3) auto 0;
  color: var(--c-text-muted);
  font-size: var(--fs-lg);
}
.hero__access {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--sp-3);
  margin-top: var(--sp-6);
}

.dir__body {
  padding-block: var(--sp-8);
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.search {
  position: relative;
}
.search__icon {
  position: absolute;
  left: var(--sp-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-faint);
  font-size: 1.2rem;
}
.search__input {
  width: 100%;
  padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-8);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-md);
  background: var(--c-surface);
}
.search__input:focus {
  outline: none;
  border-color: var(--c-primary-500);
}

.urg {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-2);
}
.urg__label {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.urg__chip {
  padding: var(--sp-1) var(--sp-3);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-full);
  background: var(--c-surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}
.urg__chip.is-active.urg__chip--urgente {
  background: var(--c-urgente);
  border-color: var(--c-urgente);
  color: #fff;
}
.urg__chip.is-active.urg__chip--media {
  background: var(--c-media);
  border-color: var(--c-media);
  color: #fff;
}
.urg__chip.is-active.urg__chip--leve {
  background: var(--c-leve);
  border-color: var(--c-leve);
  color: #fff;
}

.dir__count {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--sp-5);
}
</style>
