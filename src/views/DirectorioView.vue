<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import CategoryFilter from '@/components/public/CategoryFilter.vue'
import CentroCard from '@/components/public/CentroCard.vue'
import EmergencyContacts from '@/components/public/EmergencyContacts.vue'
import IconRegistrarCentro from '@/components/icons/IconRegistrarCentro.vue'
import IconVoluntario from '@/components/icons/IconVoluntario.vue'
import IconResponsable from '@/components/icons/IconResponsable.vue'
import IconModerador from '@/components/icons/IconModerador.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconMapPin from '@/components/icons/IconMapPin.vue'
import IconBroom from '@/components/icons/IconBroom.vue'
import { catalogo, centros as centrosApi, ApiError } from '@/api'
import { ESTADOS_VENEZUELA, municipiosDe } from '@/lib/venezuela'
import type { Categoria, Centro } from '@/types/domain'

const router = useRouter()

const categorias = ref<Categoria[]>([])
const lista = ref<Centro[]>([])
const cargando = ref(true)
const error = ref('')

// Filtros del panel azul (se aplican al pulsar "Buscar").
const busqueda = ref('')
const estadoSel = ref('')
const municipioSel = ref('')
// Filtro de píldoras (se aplica de inmediato).
const categoriaSel = ref<string | null>(null)

// Municipios disponibles según el estado elegido.
const municipios = computed(() => municipiosDe(estadoSel.value))
// Al cambiar de estado, el municipio previo deja de ser válido.
watch(estadoSel, () => {
  municipioSel.value = ''
})

// Los tres accesos del diseño. El comportamiento exacto está por definir;
// voluntario y responsable canjean un código, el moderador usa email/clave.
const ACCESOS = [
  { label: 'Registrar centro', to: { name: 'registrar' }, icon: IconRegistrarCentro },
  { label: 'Voluntario', to: { name: 'acceder', query: { rol: 'voluntario' } }, icon: IconVoluntario },
  { label: 'Responsable', to: { name: 'acceder', query: { rol: 'responsable' } }, icon: IconResponsable },
  { label: 'Moderador', to: { name: 'moderador' }, icon: IconModerador },
]

let peticion = 0

async function buscar() {
  const turno = ++peticion
  cargando.value = true
  error.value = ''
  try {
    const data = await centrosApi.listarCentros({
      q: busqueda.value || undefined,
      estado: estadoSel.value || undefined,
      municipio: municipioSel.value || undefined,
      categoria: categoriaSel.value ?? undefined,
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

function limpiar() {
  busqueda.value = ''
  estadoSel.value = ''
  municipioSel.value = ''
  categoriaSel.value = null
  buscar()
}

// Las píldoras de categoría re-buscan al instante.
watch(categoriaSel, buscar)

onMounted(async () => {
  try {
    categorias.value = await catalogo.listarCategorias({ es_insumo: true, activa: true })
  } catch {
    /* el filtro de categorías es opcional */
  }
  await buscar()
})
</script>

<template>
  <div class="dir">
    <div class="content dir__col">
      <!-- Cuatro accesos en grilla 2×2 -->
      <nav class="accesos" aria-label="Acceso">
        <AppButton
          v-for="a in ACCESOS"
          :key="a.label"
          variant="primary"
          class="acceso-btn"
          @click="router.push(a.to)"
        >
          <component :is="a.icon" />
          {{ a.label }}
        </AppButton>
      </nav>

      <!-- Contactos de emergencia -->
      <EmergencyContacts />

      <!-- Panel de búsqueda -->
      <section class="panel">
        <h2 class="panel__title">Buscar centros de acopio registrados</h2>

        <div class="panel__search">
          <IconSearch class="panel__search-icon" aria-hidden="true" />
          <input
            v-model="busqueda"
            class="panel__input"
            type="search"
            placeholder="Buscar centros o ubicación…"
            aria-label="Buscar centros"
            @keyup.enter="buscar"
          />
        </div>

        <label class="panel__field">
          <span class="panel__label">Estado <span class="req">*</span></span>
          <div class="panel__select-wrap">
            <IconMapPin class="panel__select-icon" aria-hidden="true" />
            <select v-model="estadoSel" class="panel__control">
              <option value="">Selecciona un Estado</option>
              <option v-for="e in ESTADOS_VENEZUELA" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
        </label>

        <label class="panel__field">
          <span class="panel__label">Municipio <span class="req">*</span></span>
          <div class="panel__select-wrap">
            <IconMapPin class="panel__select-icon" aria-hidden="true" />
            <select v-model="municipioSel" class="panel__control" :disabled="!estadoSel">
              <option value="">
                {{ estadoSel ? 'Selecciona un Municipio' : 'Selecciona un Estado primero' }}
              </option>
              <option v-for="m in municipios" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </label>

        <div class="panel__actions">
          <AppButton variant="primary" block class="buscar-btn" @click="buscar">
            <IconSearch />
            Buscar
          </AppButton>
          <AppButton variant="secondary" block class="limpiar-btn" @click="limpiar">
            <IconBroom class="limpiar-icon" />
            Limpiar
          </AppButton>
        </div>
      </section>

      <!-- Píldoras de categoría -->
      <CategoryFilter
        v-if="categorias.length"
        v-model="categoriaSel"
        :categorias="categorias"
      />

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
          <AppButton variant="primary" @click="buscar">Reintentar</AppButton>
        </template>
      </EmptyState>

      <template v-else>
        <h2 class="dir__count">Centros Activos ({{ lista.length }})</h2>
        <EmptyState
          v-if="!lista.length"
          icon="🔍"
          title="Sin resultados"
          description="No hay centros que coincidan con los filtros aplicados."
        />
        <div v-else class="dir__list">
          <CentroCard v-for="c in lista" :key="c.id" :centro="c" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.dir {
  padding-block: var(--sp-5) var(--sp-10);
}
.dir__col {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

/* Cuatro accesos en grilla 2×2 */
.accesos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--sp-3);
}
.accesos :deep(.acceso-btn) {
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-3);
  min-height: 80px;
  font-size: var(--fs-sm);
  border-radius: var(--r-lg);
}

/* Panel de búsqueda — card blanco */
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);
  border-radius: var(--r-xl);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
}
.panel__title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.panel__search {
  position: relative;
}
.panel__search-icon {
  position: absolute;
  left: var(--sp-3);
  top: 50%;
  transform: translateY(-50%);
  color: #a6a6a6;
  pointer-events: none;
}
.panel__input {
  width: 100%;
  padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-8);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  color: var(--c-text);
}
.panel__input:focus {
  outline: 2px solid var(--c-primary-500);
  outline-offset: -1px;
  border-color: transparent;
}
.panel__field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.panel__label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--c-text);
}
.req {
  color: var(--c-danger);
}
.panel__select-wrap {
  position: relative;
}
.panel__select-icon {
  position: absolute;
  left: var(--sp-3);
  top: 50%;
  transform: translateY(-50%);
  color: #a6a6a6;
  pointer-events: none;
}
:deep(.buscar-btn) {
  background: #2563eb;
  border-color: #2563eb;
}
:deep(.buscar-btn:hover:not(:disabled)) {
  background: #1d4ed8;
  border-color: #1d4ed8;
}
:deep(.limpiar-btn) {
  background: #e6f2fe;
  border-color: transparent;
  color: #2563eb;
}
:deep(.limpiar-btn:hover:not(:disabled)) {
  background: #e6f2fe;
  border-color: #2563eb;
}
.panel__actions :deep(.btn) {
  border-radius: var(--r-lg);
}
.panel__control {
  width: 100%;
  padding: var(--sp-3) var(--sp-8) var(--sp-3) var(--sp-8);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  background: var(--c-surface);
  color: var(--c-text);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%238a93a1' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--sp-3) center;
}
.panel__control:focus {
  outline: 2px solid var(--c-primary-500);
  outline-offset: -1px;
  border-color: transparent;
}
.panel__control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.panel__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
  margin-top: var(--sp-1);
}

/* Resultados */
.dir__count {
  font-size: var(--fs-xl);
  margin-top: var(--sp-2);
}
.dir__list {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
</style>
