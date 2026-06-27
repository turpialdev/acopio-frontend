<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import MovimientoRow from '@/components/inventario/MovimientoRow.vue'
import { catalogo, centros as centrosApi, movimientos as movApi, ApiError } from '@/api'
import { useAuth } from '@/composables/useAuth'
import { minutosDesde } from '@/lib/format'
import type { Movimiento, Totales } from '@/types/domain'

const router = useRouter()
const { esVoluntario, esResponsable, sesion } = useAuth()

const VENTANA_MIN = 60

const todos = ref<Movimiento[]>([])
const catMap = ref<Record<string, string>>({})
const totales = ref<Totales | null>(null)
const cargando = ref(true)
const error = ref('')
const busqueda = ref('')
const filtroTipo = ref<'todo' | 'entrada' | 'salida'>('todo')

function nombreCategoria(id: string): string {
  return catMap.value[id] ?? 'Insumo'
}

function puedeCorregir(m: Movimiento): boolean {
  if (esResponsable.value) return true
  return esVoluntario.value && minutosDesde(m.registrado_en) < VENTANA_MIN
}

const filtrados = computed(() => {
  let result = todos.value
  if (filtroTipo.value !== 'todo')
    result = result.filter((m) => m.tipo === filtroTipo.value)
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return result
  return result.filter((m) =>
    [nombreCategoria(m.categoria_id), m.nota ?? '', m.contraparte ?? '', m.registrado_por]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
})

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
    const [cats, movs, tots] = await Promise.all([
      catalogo.listarCategorias(),
      movApi.listarMovimientos(sesion.centroId),
      centrosApi.obtenerTotales(sesion.centroId).catch(() => null),
    ])
    catMap.value = Object.fromEntries(cats.map((c) => [c.id, c.nombre]))
    todos.value = movs
    totales.value = tots
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudieron cargar los movimientos.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="content wrap">

      <!-- Volver -->
      <button class="back" type="button" @click="router.push({ name: 'inventario' })">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver
      </button>

      <!-- Buscador card -->
      <div class="buscar-card">
        <h1 class="titulo">Buscar registros</h1>
        <div class="buscar__field">
          <svg class="buscar__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            v-model="busqueda"
            class="buscar__input"
            type="text"
            placeholder="..."
            aria-label="Buscar registros"
          />
        </div>
        <button class="btn-buscar" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Buscar
        </button>
      </div>

      <!-- Filtros tipo -->
      <div class="filtros" role="tablist">
        <button
          class="filtro"
          :class="{ 'filtro--active': filtroTipo === 'todo' }"
          @click="filtroTipo = 'todo'"
        >Todo</button>
        <button
          class="filtro"
          :class="{ 'filtro--active': filtroTipo === 'entrada' }"
          @click="filtroTipo = 'entrada'"
        >Ingresos</button>
        <button
          class="filtro"
          :class="{ 'filtro--active': filtroTipo === 'salida' }"
          @click="filtroTipo = 'salida'"
        >Egresos</button>
      </div>

      <!-- Lista -->
      <AppSpinner v-if="cargando" label="Cargando registros…" />

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
        title="Sin registros"
        description="No hay movimientos que coincidan."
      />

      <div v-else class="lista">
        <MovimientoRow
          v-for="m in filtrados"
          :key="m.id"
          :movimiento="m"
          :categoria-nombre="nombreCategoria(m.categoria_id)"
          :puede-corregir="puedeCorregir(m)"
          :centro-id="sesion.centroId ?? ''"
          @updated="alActualizar"
        />
      </div>

      <!-- Totales registrados (ADR 0007) -->
      <section v-if="!cargando && totales && totales.categorias.length" class="totales totales-card">
        <h2 class="totales__title">Totales registrados</h2>
        <div class="tabla-wrap">
          <table class="tabla">
            <thead>
              <tr>
                <th>Insumo</th>
                <th class="num">Entradas</th>
                <th class="num">Salidas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in totales.categorias" :key="c.categoria_id">
                <td>{{ c.categoria_nombre }}</td>
                <td class="num">{{ c.entradas }}</td>
                <td class="num">{{ c.salidas }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

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
.back:hover { border-color: #2563eb; }

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
.titulo {
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
.buscar__input:focus { outline: none; box-shadow: 0 0 0 2px #2563eb40; }
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
.btn-buscar:hover { background: #1d4ed8; }

/* Filtros */
.filtros {
  display: flex;
  gap: var(--sp-2);
}
.filtro {
  padding: var(--sp-2) var(--sp-4);
  border: 1.5px solid #2563eb;
  border-radius: var(--r-lg);
  background: #fff;
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: all 0.15s;
}
.filtro--active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}

/* Lista */
.lista {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

/* Totales */
.totales-card {
  padding: var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}
.totales__title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--c-text);
  margin-bottom: var(--sp-3);
}
.tabla-wrap { overflow-x: auto; }
.tabla {
  width: 100%;
  border-collapse: collapse;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  overflow: hidden;
  font-size: var(--fs-sm);
}
.tabla th,
.tabla td {
  padding: var(--sp-3) var(--sp-4);
  text-align: left;
  border-bottom: 1px solid var(--c-border);
}
.tabla thead th {
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--c-text-faint);
}
.tabla tbody tr:last-child td { border-bottom: none; }
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
