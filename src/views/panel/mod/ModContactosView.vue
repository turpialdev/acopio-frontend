<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import PageHero from '@/components/layout/PageHero.vue'
import { mod, ApiError } from '@/api'
import type { ContactoEmergencia } from '@/types/domain'

const contactos = ref<ContactoEmergencia[]>([])
const cargando = ref(true)
const error = ref('')
const eliminandoId = ref<string | null>(null)
const guardando = ref(false)
const mostrarForm = ref(false)
const formError = ref('')
const editandoId = ref<string | null>(null)

const vacio = () => ({ nombre: '', tipo: '', zona: '', telefonos: [''], whatsapp_url: '' })
const nuevo = ref(vacio())
const editForm = ref(vacio())

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    contactos.value = await mod.listarContactos()
  } catch (e) {
    error.value = e instanceof ApiError ? e.firstMessage : 'No se pudo cargar contactos.'
  } finally {
    cargando.value = false
  }
}

async function agregar() {
  formError.value = ''
  if (!nuevo.value.nombre.trim() || !nuevo.value.tipo.trim() || !nuevo.value.zona.trim()) {
    formError.value = 'Nombre, tipo y zona son requeridos.'
    return
  }
  guardando.value = true
  try {
    const telefonos = nuevo.value.telefonos.map((t) => t.trim()).filter(Boolean)
    const c = await mod.crearContacto({
      nombre: nuevo.value.nombre.trim(),
      tipo: nuevo.value.tipo.trim(),
      zona: nuevo.value.zona.trim(),
      telefonos,
      whatsapp_url: nuevo.value.whatsapp_url || null,
    })
    contactos.value.push(c)
    nuevo.value = vacio()
    mostrarForm.value = false
  } catch (e) {
    formError.value = e instanceof ApiError ? e.firstMessage : 'Error al crear contacto.'
  } finally {
    guardando.value = false
  }
}

function iniciarEdicion(c: ContactoEmergencia) {
  editandoId.value = c.id
  editForm.value = { nombre: c.nombre, tipo: c.tipo, zona: c.zona, telefonos: [...c.telefonos], whatsapp_url: c.whatsapp_url ?? '' }
}

async function guardarEdicion(c: ContactoEmergencia) {
  guardando.value = true
  try {
    const telefonos = editForm.value.telefonos.map((t) => t.trim()).filter(Boolean)
    const updated = await mod.actualizarContacto(c.id, {
      nombre: editForm.value.nombre.trim(),
      tipo: editForm.value.tipo.trim(),
      zona: editForm.value.zona.trim(),
      telefonos,
      whatsapp_url: editForm.value.whatsapp_url || null,
    })
    const idx = contactos.value.findIndex((x) => x.id === c.id)
    if (idx >= 0) contactos.value[idx] = updated
    editandoId.value = null
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al guardar.')
  } finally {
    guardando.value = false
  }
}

async function eliminar(c: ContactoEmergencia) {
  if (!confirm(`¿Eliminar "${c.nombre}"?`)) return
  eliminandoId.value = c.id
  try {
    await mod.eliminarContacto(c.id)
    contactos.value = contactos.value.filter((x) => x.id !== c.id)
  } catch (e) {
    alert(e instanceof ApiError ? e.firstMessage : 'Error al eliminar.')
  } finally {
    eliminandoId.value = null
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <PageHero title="Contactos de emergencia" subtitle="Directorio público de organismos de socorro" />

    <div class="content page-pad">
      <div class="toolbar">
        <AppButton size="sm" @click="mostrarForm = !mostrarForm">
          {{ mostrarForm ? 'Cancelar' : '+ Agregar contacto' }}
        </AppButton>
      </div>

      <form v-if="mostrarForm" class="form" @submit.prevent="agregar">
        <input v-model="nuevo.nombre" class="field" placeholder="Nombre (ej. Cruz Roja Venezuela)" />
        <input v-model="nuevo.tipo" class="field" placeholder="Tipo (ej. Emergencias nacionales)" />
        <input v-model="nuevo.zona" class="field" placeholder="Zona (ej. Nacional, Miranda)" />
        <input v-model="nuevo.telefonos[0]" class="field" placeholder="Teléfono principal" />
        <input v-model="nuevo.whatsapp_url" class="field" placeholder="URL de WhatsApp (opcional)" />
        <p v-if="formError" class="err">{{ formError }}</p>
        <AppButton type="submit" :loading="guardando">Agregar</AppButton>
      </form>

      <AppSpinner v-if="cargando" label="Cargando contactos…" />
      <p v-else-if="error" class="err">{{ error }}</p>
      <p v-else-if="!contactos.length" class="empty">No hay contactos registrados.</p>

      <ul v-else class="lista">
        <li v-for="c in contactos" :key="c.id" class="item">
          <template v-if="editandoId === c.id">
            <input v-model="editForm.nombre" class="field" />
            <input v-model="editForm.tipo" class="field" placeholder="Tipo" />
            <input v-model="editForm.zona" class="field" placeholder="Zona" />
            <input v-model="editForm.telefonos[0]" class="field" placeholder="Teléfono" />
            <input v-model="editForm.whatsapp_url" class="field" placeholder="WhatsApp URL" />
            <div class="item__acciones">
              <AppButton size="sm" :loading="guardando" @click="guardarEdicion(c)">Guardar</AppButton>
              <AppButton size="sm" variant="ghost" @click="editandoId = null">Cancelar</AppButton>
            </div>
          </template>
          <template v-else>
            <div class="item__header">
              <span class="item__nombre">{{ c.nombre }}</span>
              <span class="item__tipo">{{ c.tipo }}</span>
            </div>
            <p class="item__zona">{{ c.zona }}</p>
            <p class="item__tel">{{ c.telefonos.join(' · ') }}</p>
            <div class="item__acciones">
              <AppButton size="sm" variant="secondary" @click="iniciarEdicion(c)">Editar</AppButton>
              <AppButton size="sm" variant="danger" :loading="eliminandoId === c.id" @click="eliminar(c)">Eliminar</AppButton>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page-pad { padding-block: var(--sp-5) var(--sp-10); display: flex; flex-direction: column; gap: var(--sp-4); }
.toolbar { display: flex; }
.err { color: var(--c-danger); font-size: var(--fs-sm); }
.empty { color: var(--c-text-muted); font-size: var(--fs-sm); }
.form { display: flex; flex-direction: column; gap: var(--sp-3); padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); }
.field { padding: var(--sp-2) var(--sp-3); border: 1px solid var(--c-border); border-radius: var(--r-md); font-size: var(--fs-sm); }
.lista { list-style: none; display: flex; flex-direction: column; gap: var(--sp-3); }
.item { padding: var(--sp-4); background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); display: flex; flex-direction: column; gap: var(--sp-2); }
.item__header { display: flex; flex-direction: column; gap: var(--sp-1); }
.item__nombre { font-weight: var(--fw-semibold); font-size: var(--fs-sm); }
.item__tipo { font-size: var(--fs-xs); color: var(--c-text-muted); }
.item__zona { font-size: var(--fs-xs); color: var(--c-text-faint); }
.item__tel { font-size: var(--fs-sm); }
.item__acciones { display: flex; gap: var(--sp-2); flex-wrap: wrap; margin-top: var(--sp-1); }
</style>
