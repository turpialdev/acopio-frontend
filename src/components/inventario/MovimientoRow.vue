<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { horaCorta } from '@/lib/format'
import { movimientos, ApiError } from '@/api'
import type { Movimiento } from '@/types/domain'

const props = defineProps<{
  movimiento: Movimiento
  categoriaNombre: string
  puedeCorregir: boolean
  centroId: string
}>()
const emit = defineEmits<{ updated: [m: Movimiento] }>()

const esEntrada = computed(() => props.movimiento.tipo === 'entrada')

const detalle = computed(() => {
  const m = props.movimiento
  const medida = [m.cantidad ?? '', m.unidad ?? '']
    .map((p) => String(p).trim())
    .filter(Boolean)
    .join(' ')
  const nota = (m.nota ?? '').trim()
  return [medida, nota ? `de ${nota}` : ''].filter(Boolean).join(' ')
})

const contraparteLabel = computed(() => {
  const cp = props.movimiento.contraparte?.trim()
  if (!cp) return ''
  return esEntrada.value ? `Donado por: ${cp}` : `Entregado a: ${cp}`
})

const fechaRegistro = computed(() => {
  const d = new Date(props.movimiento.registrado_en)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
})

// --- Corrección inline ---
const editando = ref(false)
const guardando = ref(false)
const bloqueado = ref('')
const edit = reactive({ cantidad: '', unidad: '', nota: '' })

function abrirEdicion() {
  edit.cantidad = props.movimiento.cantidad?.toString() ?? ''
  edit.unidad = props.movimiento.unidad ?? ''
  edit.nota = props.movimiento.nota ?? ''
  bloqueado.value = ''
  editando.value = true
}

async function guardar() {
  guardando.value = true
  try {
    const actualizado = await movimientos.corregirMovimiento(props.centroId, props.movimiento.id, {
      cantidad: edit.cantidad ? Number(edit.cantidad) : null,
      unidad: edit.unidad.trim() || null,
      nota: edit.nota.trim() || null,
    })
    emit('updated', actualizado)
    editando.value = false
  } catch (e) {
    if (e instanceof ApiError && e.status === 403) {
      bloqueado.value = e.detail ?? 'No puedes modificar este registro.'
    }
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <article class="mov">
    <!-- Vista normal -->
    <template v-if="!editando">
      <!-- Encabezado: categoría + badge -->
      <div class="mov__head">
        <span class="mov__cat">{{ categoriaNombre }}</span>
        <span class="badge" :class="esEntrada ? 'badge--in' : 'badge--out'">
          {{ esEntrada ? 'Ingreso' : 'Egreso' }}
        </span>
      </div>

      <!-- Cuerpo: info izquierda + botón corregir derecha -->
      <div class="mov__body">
        <div class="mov__info">
          <p v-if="detalle" class="mov__detalle">{{ detalle }}</p>
          <p v-if="contraparteLabel" class="mov__meta">{{ contraparteLabel }}</p>
          <p class="mov__meta">
            Fecha: {{ fechaRegistro }} - {{ horaCorta(movimiento.registrado_en) }}
          </p>
        </div>

        <button v-if="puedeCorregir" class="btn-corregir" type="button" @click="abrirEdicion">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M17.5 15.8336L17.5855 15.8376C18.0056 15.8804 18.3333 16.2355 18.3333 16.6669C18.3332 17.0982 18.0055 17.4525 17.5855 17.4954L17.5 17.5002H10C9.53985 17.5002 9.1668 17.127 9.16668 16.6669C9.16668 16.2067 9.53978 15.8336 10 15.8336H17.5ZM15.8333 4.26944C15.8333 4.02136 15.7345 3.78327 15.5591 3.60782C15.3836 3.43236 15.1456 3.33357 14.8975 3.33357C14.6493 3.33357 14.4113 3.43236 14.2359 3.60782L13.6776 4.16609L15.0008 5.48933L15.5591 4.93106C15.7345 4.75566 15.8333 4.51749 15.8333 4.26944ZM4.2269 13.6168C4.12795 13.7157 4.05542 13.8381 4.01613 13.9724L3.52948 15.6358L5.1937 15.1508H5.19451C5.32911 15.1116 5.45183 15.0391 5.55096 14.94L13.8224 6.66771L12.4992 5.34447L4.2269 13.6168ZM17.5 4.26944C17.4999 4.95951 17.2254 5.62149 16.7375 6.10945L6.72934 16.1184C6.46907 16.3787 6.15477 16.5774 5.80975 16.7019L5.66082 16.7507L3.26743 17.449C3.05238 17.5117 2.82444 17.5159 2.60744 17.4604C2.39043 17.4048 2.19214 17.2916 2.03371 17.1332C1.87527 16.9748 1.76218 16.7765 1.70656 16.5595C1.65098 16.3425 1.6545 16.1145 1.71714 15.8995L2.41619 13.5061V13.5053C2.53398 13.1021 2.75146 12.7353 3.04852 12.4384L13.0575 2.42943C13.5455 1.94142 14.2073 1.66691 14.8975 1.6669C15.5876 1.6669 16.2495 1.94141 16.7375 2.42943C17.2254 2.91744 17.5 3.57933 17.5 4.26944Z" fill="currentColor"/>
          </svg>
          Corregir
        </button>
      </div>
    </template>

    <!-- Edición inline -->
    <form v-else class="edit" @submit.prevent="guardar">
      <div class="edit__row">
        <input v-model="edit.cantidad" class="edit__input" type="number" placeholder="Cantidad" />
        <input v-model="edit.unidad" class="edit__input" placeholder="Unidad" />
      </div>
      <input v-model="edit.nota" class="edit__input" placeholder="Descripción" />
      <p v-if="bloqueado" class="edit__locked">🔒 {{ bloqueado }}</p>
      <div class="edit__actions">
        <button type="button" class="edit__btn edit__btn--cancel" @click="editando = false">
          Cancelar
        </button>
        <button type="submit" class="edit__btn edit__btn--save" :disabled="guardando">
          {{ guardando ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
  </article>
</template>

<style scoped>
.mov {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-md);
}

/* Encabezado */
.mov__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
}
.mov__cat {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}

/* Badge */
.badge {
  padding: var(--sp-1) var(--sp-4);
  border-radius: var(--r-full);
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: #fff;
  flex-shrink: 0;
}
.badge--in  { background: #16a34a; }
.badge--out { background: #dc2626; }

/* Cuerpo */
.mov__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
}
.mov__info {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  min-width: 0;
}
.mov__detalle {
  font-size: var(--fs-base);
  color: var(--c-text);
}
.mov__meta {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}

/* Botón corregir */
.btn-corregir {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: #e6f2fe;
  border: none;
  border-radius: var(--r-lg);
  color: #2563eb;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.btn-corregir:hover { background: #d0e8fd; }

/* Edición inline */
.edit {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.edit__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-2);
}
.edit__input {
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-sm);
  font-size: var(--fs-sm);
  width: 100%;
}
.edit__input:focus {
  outline: none;
  border-color: #2563eb;
}
.edit__locked {
  font-size: var(--fs-xs);
  color: var(--c-danger);
}
.edit__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-2);
}
.edit__btn {
  padding: var(--sp-1) var(--sp-4);
  border-radius: var(--r-sm);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  cursor: pointer;
}
.edit__btn--cancel {
  background: transparent;
  border: 1px solid var(--c-border-strong);
  color: var(--c-text-muted);
}
.edit__btn--cancel:hover { background: var(--c-surface-2); }
.edit__btn--save {
  background: #2563eb;
  border: none;
  color: #fff;
}
.edit__btn--save:hover:not(:disabled) { background: #1d4ed8; }
.edit__btn--save:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
