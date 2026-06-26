<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
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

// Línea: "15 kg de Leche en polvo" (cantidad + unidad, y "de {nota}" si hay nota).
const detalle = computed(() => {
  const m = props.movimiento
  const medida = [m.cantidad ?? '', m.unidad ?? '']
    .map((p) => String(p).trim())
    .filter(Boolean)
    .join(' ')
  const nota = (m.nota ?? '').trim()
  return [medida, nota ? `de ${nota}` : ''].filter(Boolean).join(' ')
})

// "Juan – Puerta" (omite el guion si no hay contraparte).
const autor = computed(() => {
  const m = props.movimiento
  return m.contraparte ? `${m.registrado_por} – ${m.contraparte}` : m.registrado_por
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
    <div class="mov__top">
      <span class="chip" :class="esEntrada ? 'chip--in' : 'chip--out'">
        {{ esEntrada ? 'ENTRADA' : 'SALIDA' }}
      </span>
      <span class="mov__cat">{{ categoriaNombre }}</span>
      <span class="mov__time">{{ horaCorta(movimiento.registrado_en) }}</span>
    </div>

    <template v-if="!editando">
      <p v-if="detalle" class="mov__detail">{{ detalle }}</p>
      <p v-if="autor" class="mov__author">{{ autor }}</p>
      <div v-if="puedeCorregir" class="mov__actions">
        <AppButton variant="outline" size="sm" @click="abrirEdicion">Corregir</AppButton>
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
        <AppButton variant="ghost" size="sm" @click="editando = false">Cancelar</AppButton>
        <AppButton type="submit" size="sm" :loading="guardando">Guardar</AppButton>
      </div>
    </form>
  </article>
</template>

<style scoped>
.mov {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
}
.mov__top {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}
.chip {
  padding: 2px var(--sp-2);
  border-radius: var(--r-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  color: #fff;
}
.chip--in {
  background: var(--c-success);
}
.chip--out {
  background: var(--c-primary-800);
}
.mov__cat {
  font-weight: var(--fw-bold);
}
.mov__time {
  margin-left: auto;
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
.mov__detail {
  font-size: var(--fs-sm);
}
.mov__author {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.mov__actions {
  display: flex;
  justify-content: flex-end;
}

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
}
.edit__input:focus {
  outline: none;
  border-color: var(--c-primary-500);
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
</style>
