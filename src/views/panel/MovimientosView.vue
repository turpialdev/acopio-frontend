<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageHero from '@/components/layout/PageHero.vue'
import IconPersonAdd from '@/components/icons/IconPersonAdd.vue'
import MovimientoRow from '@/components/inventario/MovimientoRow.vue'
import { catalogo, movimientos as movApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { esHoy, fechaDia, minutosDesde } from '@/lib/format'
import type { Movimiento } from '@/types/domain'

const router = useRouter()
const { esVoluntario, esResponsable, sesion } = useAuth()

// El voluntario corrige sus registros dentro de 1 hora; el responsable, sin límite.
const VENTANA_MIN = 60

const todos = ref<Movimiento[]>([])
const catMap = ref<Record<string, string>>({})
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')

function nombreCategoria(id: string): string {
  return catMap.value[id] ?? 'Insumo'
}

function puedeCorregir(m: Movimiento): boolean {
  if (esResponsable.value) return true
  return esVoluntario.value && minutosDesde(m.registrado_en) < VENTANA_MIN
}

// Filtro de texto sobre categoría, nota y contraparte.
const filtrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return todos.value
  return todos.value.filter((m) =>
    [nombreCategoria(m.categoria_id), m.nota ?? '', m.contraparte ?? '', m.registrado_por]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
})

const deHoy = computed(() => filtrados.value.filter((m) => esHoy(m.registrado_en)))

// Movimientos anteriores agrupados por día (ya vienen ordenados desc).
const anteriores = computed(() => {
  const grupos: { fecha: string; items: Movimiento[] }[] = []
  for (const m of filtrados.value) {
    if (esHoy(m.registrado_en)) continue
    const fecha = fechaDia(m.registrado_en)
    const grupo = grupos.find((g) => g.fecha === fecha)
    if (grupo) grupo.items.push(m)
    else grupos.push({ fecha, items: [m] })
  }
  return grupos
})

const hoyLabel = computed(() => fechaDia(new Date().toISOString()))

function alActualizar(m: Movimiento) {
  const i = todos.value.findIndex((x) => x.id === m.id)
  if (i !== -1) todos.value[i] = m
}

onMounted(async () => {
  if (!sesion.centroId) {
    error.value = 'Sesión sin centro asociado.'
    cargando.value = false
    return
  }
  try {
    // Catálogo completo para mapear categoria_id → nombre.
    const [cats, movs] = await Promise.all([
      catalogo.listarCategorias(),
      movApi.listarMovimientos(sesion.centroId),
    ])
    catMap.value = Object.fromEntries(cats.map((c) => [c.id, c.nombre]))
    todos.value = movs
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudieron cargar los movimientos.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div>
    <PageHero title="Registro Inventario actual">
      <div class="search">
        <span class="search__label">Buscar insumos</span>
        <div class="search__field">
          <span class="search__icon" aria-hidden="true">⌕</span>
          <input
            v-model="busqueda"
            class="search__input"
            type="search"
            placeholder="Buscar insumo, donante o responsable…"
            aria-label="Buscar insumos"
          />
        </div>
        <AppButton variant="light" block>Buscar</AppButton>
      </div>
    </PageHero>

    <div class="content page-pad">
      <AppButton variant="outline" block @click="router.push({ name: 'inventario' })">
        ← Registrar movimiento
      </AppButton>

      <AppSpinner v-if="cargando" label="Cargando movimientos…" />

      <EmptyState
        v-else-if="error"
        icon="⚠"
        tone="error"
        title="Error"
        :description="error"
      />

      <EmptyState
        v-else-if="!filtrados.length"
        icon="📋"
        title="Sin movimientos"
        description="Aún no hay registros que coincidan."
      />

      <template v-else>
        <!-- HOY -->
        <section v-if="deHoy.length" class="group">
          <h2 class="group__title">HOY · {{ hoyLabel }}</h2>
          <MovimientoRow
            v-for="m in deHoy"
            :key="m.id"
            :movimiento="m"
            :categoria-nombre="nombreCategoria(m.categoria_id)"
            :puede-corregir="puedeCorregir(m)"
            :centro-id="sesion.centroId ?? ''"
            @updated="alActualizar"
          />
        </section>

        <!-- REGISTROS ANTERIORES -->
        <template v-if="anteriores.length">
          <div class="divider"><span>Registros anteriores</span></div>
          <section v-for="g in anteriores" :key="g.fecha" class="group">
            <h2 class="group__title">{{ g.fecha }}</h2>
            <MovimientoRow
              v-for="m in g.items"
              :key="m.id"
              :movimiento="m"
              :categoria-nombre="nombreCategoria(m.categoria_id)"
              :puede-corregir="puedeCorregir(m)"
              :centro-id="sesion.centroId ?? ''"
              @updated="alActualizar"
            />
          </section>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.search__label {
  font-size: var(--fs-sm);
  color: rgba(255, 255, 255, 0.85);
}
.search__field {
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
  border: none;
  border-radius: var(--r-md);
  background: var(--c-surface);
  color: var(--c-text);
}

.page-pad {
  padding-block: var(--sp-5) var(--sp-10);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.group {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.group__title {
  font-family: var(--font-sans);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-text-faint);
}
.divider {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-2);
  color: var(--c-text-faint);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--c-border);
}
</style>
