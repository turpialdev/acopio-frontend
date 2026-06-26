<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import type { Categoria } from '@/types/domain'

const categorias = ref<Categoria[]>([])
const cargando = ref(true)
const error = ref('')
const guardando = ref(false)

const nueva = ref({ nombre: '', es_insumo: true })
const formError = ref('')
const mostrarForm = ref(false)

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    categorias.value = await mod.listarCatalogo()
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar el catálogo.'
  } finally {
    cargando.value = false
  }
}

async function toggleActiva(cat: Categoria) {
  try {
    const updated = await mod.actualizarCategoria(cat.id, { activa: !cat.activa })
    cat.activa = updated.activa
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al actualizar.')
  }
}

async function agregar() {
  formError.value = ''
  if (!nueva.value.nombre.trim()) {
    formError.value = 'El nombre es requerido.'
    return
  }
  guardando.value = true
  try {
    const cat = await mod.crearCategoria({ nombre: nueva.value.nombre.trim(), es_insumo: nueva.value.es_insumo })
    categorias.value.push(cat)
    nueva.value = { nombre: '', es_insumo: true }
    mostrarForm.value = false
  } catch (e) {
    formError.value = e instanceof ApiError ? e.firstMessage : 'Error al crear categoría.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <PageHero title="Catálogo de categorías" subtitle="Insumos y categorías del directorio" />

    <div class="content page-pad">
      <div class="toolbar">
        <AppButton size="sm" @click="mostrarForm = !mostrarForm">
          {{ mostrarForm ? 'Cancelar' : '+ Nueva categoría' }}
        </AppButton>
      </div>

      <form v-if="mostrarForm" class="form" @submit.prevent="agregar">
        <input v-model="nueva.nombre" class="field" placeholder="Nombre de la categoría" />
        <label class="check-label">
          <input v-model="nueva.es_insumo" type="checkbox" />
          Es insumo (aparece en inventario)
        </label>
        <p v-if="formError" class="err">{{ formError }}</p>
        <AppButton type="submit" :loading="guardando">Agregar</AppButton>
      </form>

      <AppSpinner v-if="cargando" label="Cargando catálogo…" />
      <p v-else-if="error" class="err">{{ error }}</p>

      <ul v-else class="lista">
        <li v-for="cat in categorias" :key="cat.id" class="item">
          <div class="item__info">
            <span class="item__nombre">{{ cat.nombre }}</span>
            <div class="item__badges">
              <AppBadge v-if="cat.es_insumo" tone="primary">Insumo</AppBadge>
              <AppBadge :tone="cat.activa ? 'success' : 'neutral'">
                {{ cat.activa ? 'Activa' : 'Inactiva' }}
              </AppBadge>
            </div>
          </div>
          <AppButton size="sm" variant="ghost" @click="toggleActiva(cat)">
            {{ cat.activa ? 'Desactivar' : 'Activar' }}
          </AppButton>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-5) var(--sp-10); display: flex; flex-direction: column; gap: var(--sp-4); }
.toolbar { display: flex; }
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.form { display: flex; flex-direction: column; gap: var(--sp-3); padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); }
.field { padding: var(--sp-2) var(--sp-3); border: 1px solid var(--c-border); border-radius: var(--r-md); font-size: var(--fs-sm); }
.check-label { display: flex; align-items: center; gap: var(--sp-2); font-size: var(--fs-sm); cursor: pointer; }
.lista { list-style: none; display: flex; flex-direction: column; gap: var(--sp-2); }
.item {
  padding: var(--sp-3) var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-md); display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3);
}
.item__info { display: flex; align-items: center; gap: var(--sp-3); flex: 1; }
.item__nombre { font-size: var(--fs-sm); font-weight: var(--fw-semibold); }
.item__badges { display: flex; gap: var(--sp-1); }
</style>
